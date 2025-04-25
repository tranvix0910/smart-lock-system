import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
    MdClose,
    MdCheck,
    MdArrowForward,
    MdArrowBack,
    MdCreditCard,
    MdError,
    MdShield,
    MdWarning,
    MdFingerprint
} from 'react-icons/md'
import rfidScanImg from '../../../assets/images/rfidScan.gif'
// import rfidInfoImg from '../../../assets/images/rfidInfo.gif'
import { getDeviceByUserId } from '../../../api/getDeviceByUserID'
import { getFaceID } from '../../../api/getFaceID'
import { postRequestAddRFIDCard } from '../../../api/RFIDCard'
import socket from '../../../config/websocket'

// CSS Animation styles for toast notification
const toastAnimationStyles = `
@keyframes fadeInDown {
    0% {
        opacity: 0;
        transform: translate(-50%, -20px);
    }
    100% {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}

@keyframes fadeOutUp {
    0% {
        opacity: 1;
        transform: translate(-50%, 0);
    }
    100% {
        opacity: 0;
        transform: translate(-50%, -20px);
    }
}

.animate-fade-in-down {
    animation: fadeInDown 0.3s ease-out;
}

.animate-fade-out-up {
    animation: fadeOutUp 0.3s ease-in forwards;
}
`

const AddRFIDCardModal = ({ isOpen, onClose, onSubmit, userId }) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [newCard, setNewCard] = useState({
        deviceId: '',
        faceId: '',
        userName: '',
        status: 'Active'
    })
    // isRequestingRFID tracks the request state for visual feedback in the UI
    const [isRequestingRFID, setIsRequestingRFID] = useState(false)
    const [processingStatus, setProcessingStatus] = useState({
        deviceAcceptance: 'pending', // pending, success, error
        faceAuthentication: 'pending', // pending, success, error
        rfidScanning: 'pending' // pending, success, error
    })
    const [requestStatus, setRequestStatus] = useState({
        message: '',
        type: 'info',
        showScanGuide: false,
        success: false,
        cardSaved: false,
        cardDetails: null
    })
    const [showToast, setShowToast] = useState(false)
    const [toastAnimation, setToastAnimation] = useState('animate-fade-in-down')
    const [toastMessage, setToastMessage] = useState('')
    const [toastType, setToastType] = useState('info') // 'success', 'error', 'info'

    // Reference to store current request
    const currentRequestRef = useRef(null)

    // State for devices and face IDs
    const [devices, setDevices] = useState([])
    const [isLoadingDevices, setIsLoadingDevices] = useState(false)
    const [faceIDs, setFaceIDs] = useState([])
    const [isLoadingFaceIDs, setIsLoadingFaceIDs] = useState(false)

    // Handle RFID card confirmation from socket
    const handleRFIDConfirm = useCallback((data) => {
        if (!currentRequestRef.current) return

        const { userId: receivedUserId, deviceId: receivedDeviceId, faceId: receivedFaceId, status } = data
        const {
            userId: requestedUserId,
            deviceId: requestedDeviceId,
            faceId: requestedFaceId
        } = currentRequestRef.current

        console.log('RFID confirmation received:', data)
        console.log('Current request:', currentRequestRef.current)

        if (
            receivedUserId === requestedUserId &&
            receivedDeviceId === requestedDeviceId &&
            receivedFaceId === requestedFaceId
        ) {
            if (status === 'ADD RFID CARD ACCEPTED FROM CLIENT') {
                // Success case - Device accepted the request
                setProcessingStatus((prev) => ({
                    ...prev,
                    deviceAcceptance: 'success',
                    faceAuthentication: 'pending' // Next step starts
                }))

                setRequestStatus({
                    message: 'Request accepted. Please authenticate with Face ID and scan your RFID card.',
                    type: 'success',
                    showScanGuide: true,
                    success: true,
                    cardSaved: false,
                    cardDetails: null
                })

                // Auto-hide success message after 5 seconds
                setTimeout(() => {
                    setRequestStatus((prev) => ({
                        ...prev,
                        message: '',
                        success: true // Keep true to maintain state but hide the message
                    }))
                }, 5000)
            } else {
                // Failed case
                setProcessingStatus((prev) => ({
                    ...prev,
                    deviceAcceptance: 'error'
                }))

                setRequestStatus({
                    message: 'Device rejected the request. Please try again.',
                    type: 'error',
                    showScanGuide: false,
                    success: false,
                    cardSaved: false,
                    cardDetails: null
                })

                // Request is complete (with error)
                setIsRequestingRFID(false)
            }
        } else {
            console.log('Failed')
        }
    }, [])

    // Handle RFID card saved event
    const handleRFIDSaved = useCallback((data) => {
        console.log('RFID card saved event received:', data)

        if (data.status === 'SUCCESS') {
            // Update face auth and RFID scan status to success
            setProcessingStatus((prev) => ({
                ...prev,
                faceAuthentication: 'success',
                rfidScanning: 'success'
            }))

            setRequestStatus((prev) => ({
                ...prev,
                message: 'RFID card was successfully registered with the smart lock!',
                type: 'success',
                cardSaved: true,
                cardDetails: {
                    cardId: data.rfidId,
                    userId: data.userId,
                    userName: data.userName,
                    deviceId: data.deviceId,
                    faceId: data.faceId,
                    rfidId: data.rfidId,
                    rfidIdLength: data.rfidIdLength
                }
            }))

            // Move to success step
            setCurrentStep(4)

            // Request is complete (success)
            setIsRequestingRFID(false)

            // Hide messages after 3 seconds
            setTimeout(() => {
                setRequestStatus((prev) => ({
                    ...prev,
                    message: '',
                    showScanGuide: false
                }))
            }, 3000)
        } else if (data.status === 'ERROR') {
            // Update face auth and RFID scan status to error
            setProcessingStatus((prev) => ({
                ...prev,
                rfidScanning: 'error'
            }))

            // Check if it's a duplicate card error
            const isDuplicateError = data.error === 'RFID_CARD_ALREADY_EXISTS'

            // Set toast message for duplicate error
            if (isDuplicateError) {
                setToastMessage(
                    'This RFID card is already registered in the system.\n\nPlease try using a different RFID card that is not already registered.'
                )
                setToastType('error')
                setToastAnimation('animate-fade-in-down')
                setShowToast(true)

                // Set fade out animation after 2.5 seconds
                setTimeout(() => {
                    setToastAnimation('animate-fade-out-up')
                }, 2500)

                // Hide toast after animation completes
                setTimeout(() => {
                    setShowToast(false)
                }, 3000)
            }

            setRequestStatus({
                message: isDuplicateError
                    ? 'This RFID card is already registered in the system.'
                    : data.message || 'Failed to save RFID card. Please try again.',
                type: 'error',
                showScanGuide: false,
                success: false,
                cardSaved: false,
                cardDetails: isDuplicateError
                    ? {
                          userId: data.userId,
                          deviceId: data.deviceId,
                          faceId: data.faceId,
                          errorType: data.error,
                          errorDetails: 'The RFID card you tried to register is already in use.',
                          timestamp: new Date().toISOString()
                      }
                    : null
            })

            // Move to error step for duplicate card error
            if (isDuplicateError) {
                setCurrentStep(5)
            }

            // Request is complete (with error)
            setIsRequestingRFID(false)
        } else {
            console.log('Failed')
        }
    }, [])

    // Setup socket event listener
    useEffect(() => {
        if (!isOpen) return

        // Listen for RFID confirmation events
        socket.on('addRFIDCardConfirmFromClient', handleRFIDConfirm)
        socket.on('rfidCardSaved', handleRFIDSaved)

        // Clean up
        return () => {
            socket.off('addRFIDCardConfirmFromClient', handleRFIDConfirm)
            socket.off('rfidCardSaved', handleRFIDSaved)
        }
    }, [isOpen, handleRFIDConfirm, handleRFIDSaved])

    // Fetch face IDs when component mounts
    useEffect(() => {
        const loadFaceIDs = async () => {
            if (!isOpen || !userId) return

            try {
                setIsLoadingFaceIDs(true)
                const response = await getFaceID(userId)

                if (response.success && response.data) {
                    setFaceIDs(response.data)
                    console.log('Face IDs loaded:', response.data)
                } else {
                    console.warn('No Face IDs found or invalid response format')
                    setFaceIDs([])
                }
            } catch (error) {
                console.error('Error loading Face IDs:', error)
                setFaceIDs([])
            } finally {
                setIsLoadingFaceIDs(false)
            }
        }

        loadFaceIDs()
    }, [userId, isOpen])

    // Fetch devices when modal opens
    useEffect(() => {
        const loadDevices = async () => {
            if (!isOpen || !userId) return

            try {
                setIsLoadingDevices(true)
                const deviceList = await getDeviceByUserId(userId)
                console.log('Devices received:', deviceList)
                if (deviceList && Array.isArray(deviceList)) {
                    setDevices(deviceList)
                } else {
                    console.warn('No devices found or invalid response format')
                    setDevices([])
                }
            } catch (error) {
                console.error('Error loading devices:', error)
                setDevices([])
            } finally {
                setIsLoadingDevices(false)
            }
        }

        loadDevices()
    }, [userId, isOpen])

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(1)
            setNewCard({
                deviceId: '',
                faceId: '',
                userName: '',
                status: 'Active'
            })
            setProcessingStatus({
                deviceAcceptance: 'pending',
                faceAuthentication: 'pending',
                rfidScanning: 'pending'
            })
            setRequestStatus({
                message: '',
                type: 'info',
                showScanGuide: false,
                success: false,
                cardSaved: false,
                cardDetails: null
            })
            setIsRequestingRFID(false)
            currentRequestRef.current = null
        }
    }, [isOpen])

    const handleRequestAddRFID = async () => {
        if (!newCard.deviceId || !newCard.faceId) return

        try {
            setIsRequestingRFID(true)
            setProcessingStatus({
                deviceAcceptance: 'pending',
                faceAuthentication: 'pending',
                rfidScanning: 'pending'
            })

            setRequestStatus({
                message: '',
                type: 'info',
                showScanGuide: false,
                success: false,
                cardSaved: false,
                cardDetails: null
            })

            const targetUserId = newCard.faceId
                ? faceIDs.find((face) => face.faceId === newCard.faceId)?.userId
                : userId

            // Store the current request details for matching with socket response
            currentRequestRef.current = {
                userId: targetUserId,
                deviceId: newCard.deviceId,
                faceId: newCard.faceId
            }

            // Send the request
            const response = await postRequestAddRFIDCard(targetUserId, newCard.deviceId, newCard.faceId)
            console.log('Request sent:', response)

            if (!response.success) {
                // If API call failed, we clear the waiting state
                setIsRequestingRFID(false)
                currentRequestRef.current = null
                setProcessingStatus((prev) => ({
                    ...prev,
                    deviceAcceptance: 'error'
                }))

                setRequestStatus({
                    message: response.message || 'Failed to send request. Please try again.',
                    type: 'error',
                    showScanGuide: false,
                    success: false,
                    cardSaved: false,
                    cardDetails: null
                })
            }
            // If success, we wait for socket response in handleRFIDConfirm
        } catch (error) {
            console.error('Error requesting add RFID card:', error)
            setIsRequestingRFID(false)
            currentRequestRef.current = null
            setProcessingStatus((prev) => ({
                ...prev,
                deviceAcceptance: 'error'
            }))

            setRequestStatus({
                message: 'An error occurred. Please try again.',
                type: 'error',
                showScanGuide: false,
                success: false,
                cardSaved: false,
                cardDetails: null
            })
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setCurrentStep(3)
        handleRequestAddRFID()
    }

    const handleSave = () => {
        if (!requestStatus.cardDetails) return

        const rfidCardData = {
            cardId: requestStatus.cardDetails.cardId,
            deviceId: requestStatus.cardDetails.deviceId,
            faceId: requestStatus.cardDetails.faceId,
            userId: requestStatus.cardDetails.userId,
            userName: requestStatus.cardDetails.userName,
            status: 'Active',
            createdAt: new Date().toISOString()
        }

        onSubmit(rfidCardData)
        onClose() // Only close when user clicks Finish
    }

    const resetForm = () => {
        setCurrentStep(1)
        setNewCard({
            deviceId: '',
            faceId: '',
            userName: '',
            status: 'Active'
        })
        setRequestStatus({
            message: '',
            type: 'info',
            showScanGuide: false,
            success: false,
            cardSaved: false,
            cardDetails: null
        })
        setIsRequestingRFID(false)
        currentRequestRef.current = null
    }

    const handleCancel = () => {
        // Force cancel even if currently requesting
        setIsRequestingRFID(false)
        currentRequestRef.current = null
        resetForm()
        onClose()
    }

    const nextStep = () => {
        setCurrentStep((prev) => prev + 1)
    }

    const prevStep = () => {
        setCurrentStep((prev) => prev - 1)
    }

    if (!isOpen) return null

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-4">
                        <h3 className="text-base font-medium text-gray-800 mb-4">RFID Card Registration Process</h3>

                        <div className="space-y-4">
                            {/* Step explanation card */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center mb-3">
                                    <MdCreditCard className="text-yellow-500 w-5 h-5 mr-2 flex-shrink-0" />
                                    <h4 className="font-medium text-gray-800">Overview</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                    This process will register a new RFID card with the smart lock system. Follow the
                                    steps below to complete the registration.
                                </p>
                            </div>

                            {/* Process steps */}
                            <div className="relative">
                                {/* Left vertical line with gradient */}
                                <div className="absolute left-[24px] top-6 bottom-6 w-1 bg-gradient-to-b from-yellow-400 via-blue-400 to-green-400 rounded-full"></div>

                                <div className="space-y-5">
                                    {/* Step 1 */}
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold text-md shadow-sm z-10">
                                            1
                                        </div>
                                        <div className="ml-4 bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex-1">
                                            <h4 className="font-medium text-gray-800 text-md flex items-center">
                                                <span className="bg-yellow-100 p-1 rounded-md mr-2">
                                                    <MdCreditCard className="text-yellow-600 w-4 h-4" />
                                                </span>
                                                Select Device and Face ID
                                            </h4>
                                            <p className="text-gray-600 text-sm mt-1 mb-2">
                                                Choose the device and Face ID:
                                            </p>

                                            <div className="flex flex-row items-start gap-3">
                                                <div className="w-3/5">
                                                    <ul className="list-disc ml-8 text-sm text-gray-600 space-y-1">
                                                        <li>Choose the device for card registration</li>
                                                        <li>Select the associated Face ID</li>
                                                        <li>Enter user information</li>
                                                    </ul>
                                                </div>
                                                <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm w-2/5 bg-white">
                                                    <img
                                                        src={rfidScanImg}
                                                        alt="RFID Card Registration"
                                                        className="w-full h-[100px] object-contain p-0"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold text-md shadow-sm z-10">
                                            2
                                        </div>
                                        <div className="ml-4 bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex-1">
                                            <h4 className="font-medium text-gray-800 text-md flex items-center">
                                                <span className="bg-blue-100 p-1 rounded-md mr-2">
                                                    <MdShield className="text-blue-600 w-4 h-4" />
                                                </span>
                                                Scan RFID Card
                                            </h4>
                                            <p className="text-gray-600 text-sm mt-1">
                                                After entering information, scan the RFID card on the selected device
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-white font-bold text-md shadow-sm z-10">
                                            3
                                        </div>
                                        <div className="ml-4 bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex-1">
                                            <h4 className="font-medium text-gray-800 text-md flex items-center">
                                                <span className="bg-green-100 p-1 rounded-md mr-2">
                                                    <MdCheck className="text-green-600 w-4 h-4" />
                                                </span>
                                                Complete Registration
                                            </h4>
                                            <p className="text-gray-600 text-sm mt-1">
                                                Review the information and submit to complete the RFID card registration
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end mt-5 pt-4 border-t border-gray-200">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-150 flex items-center mr-3 text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={nextStep}
                                className="px-4 py-2 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-500 transition-colors duration-150 flex items-center font-medium shadow-sm"
                            >
                                Next
                                <MdArrowForward className="ml-2" />
                            </button>
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-4">
                        <div className="space-y-4">
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <div className="flex items-start">
                                    <MdCreditCard className="text-yellow-500 w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-yellow-800 font-medium">RFID Card Information</h3>
                                        <p className="text-yellow-700 text-sm mt-1">
                                            Please select a device and face ID to register a new RFID card.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                                    <span className="bg-blue-50 p-1.5 rounded-md mr-2">
                                        <MdShield className="text-blue-500 w-4 h-4" />
                                    </span>
                                    Device Selection
                                </h3>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Device <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                                        value={newCard.deviceId}
                                        onChange={(e) => setNewCard((prev) => ({ ...prev, deviceId: e.target.value }))}
                                        disabled={isLoadingDevices}
                                        required
                                    >
                                        <option value="">Select a device</option>
                                        {devices && devices.length > 0 ? (
                                            devices.map((device) => (
                                                <option key={device.deviceId} value={device.deviceId}>
                                                    {device.deviceId} - {device.deviceName}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>
                                                No devices available
                                            </option>
                                        )}
                                    </select>
                                    {isLoadingDevices ? (
                                        <p className="text-sm text-gray-500 mt-1 flex items-center">
                                            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Loading device list...
                                        </p>
                                    ) : devices.length === 0 && !isLoadingDevices ? (
                                        <p className="text-sm text-red-500 mt-1 flex items-center">
                                            <MdError className="w-4 h-4 mr-1" />
                                            No devices found. Please check your connection.
                                        </p>
                                    ) : null}
                                </div>

                                <h3 className="font-medium text-gray-800 mb-3 flex items-center mt-5">
                                    <span className="bg-green-50 p-1.5 rounded-md mr-2">
                                        <MdFingerprint className="text-green-500 w-4 h-4" />
                                    </span>
                                    Authentication Details
                                </h3>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Face ID <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                                        value={newCard.faceId}
                                        onChange={(e) => {
                                            const selectedFace = faceIDs.find((face) => face.faceId === e.target.value)
                                            setNewCard((prev) => ({
                                                ...prev,
                                                faceId: e.target.value,
                                                userName: selectedFace ? selectedFace.userName : ''
                                            }))
                                        }}
                                        disabled={isLoadingFaceIDs}
                                        required
                                    >
                                        <option value="">Select a Face ID</option>
                                        {faceIDs && faceIDs.length > 0 ? (
                                            faceIDs.map((face) => (
                                                <option key={face.faceId} value={face.faceId}>
                                                    {face.deviceId} - {face.userName}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>
                                                No Face IDs available
                                            </option>
                                        )}
                                    </select>
                                    {isLoadingFaceIDs ? (
                                        <p className="text-sm text-gray-500 mt-1 flex items-center">
                                            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Loading Face ID list...
                                        </p>
                                    ) : faceIDs.length === 0 && !isLoadingFaceIDs ? (
                                        <p className="text-sm text-red-500 mt-1 flex items-center">
                                            <MdError className="w-4 h-4 mr-1" />
                                            No Face IDs found. Please add a Face ID first.
                                        </p>
                                    ) : null}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        User Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter the card holder's name"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        value={newCard.userName}
                                        onChange={(e) => setNewCard((prev) => ({ ...prev, userName: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <MdWarning className="text-yellow-500 w-5 h-5 mr-2" />
                                    <p className="text-sm text-gray-600">
                                        Make sure your device is ready to accept an RFID card registration request.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between gap-2 mt-5 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-150 flex items-center"
                            >
                                <MdArrowBack className="mr-2" />
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                className={`px-4 py-2 rounded-lg flex items-center ${
                                    !newCard.deviceId || !newCard.faceId || !newCard.userName
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-yellow-400 text-gray-800 hover:bg-yellow-500'
                                }`}
                                disabled={!newCard.deviceId || !newCard.faceId || !newCard.userName}
                            >
                                Next
                                <MdArrowForward className="ml-2" />
                            </button>
                        </div>
                    </div>
                )
            case 3:
                return (
                    <div className="px-4 sm:px-8 py-4 sm:py-6">
                        {/* Status message */}
                        {requestStatus.message && (
                            <div
                                className={`p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 ${
                                    requestStatus.type === 'success'
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : requestStatus.type === 'error'
                                          ? 'bg-red-50 text-red-700 border border-red-200'
                                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                            >
                                <p className="font-medium text-sm sm:text-base">{requestStatus.message}</p>
                            </div>
                        )}

                        {/* Device details card */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm mb-6">
                            <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                                <MdCreditCard className="text-yellow-400 mr-2 w-5 h-5" />
                                Processing Details
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <p className="text-gray-500 text-xs mb-1">User</p>
                                    <p className="font-medium text-gray-800 flex items-center">
                                        {newCard.userName || 'Not specified'}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <p className="text-gray-500 text-xs mb-1">Device ID</p>
                                    <p className="font-medium text-gray-800 flex items-center">
                                        <span className="bg-blue-50 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs">
                                            ID
                                        </span>
                                        {newCard.deviceId}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-200 col-span-2">
                                    <p className="text-gray-500 text-xs mb-1">Face ID</p>
                                    <p className="font-medium text-gray-800 font-mono text-xs truncate">
                                        {newCard.faceId}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Processing steps grid - responsive */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            {/* Step 1: Device Acceptance */}
                            <div className="flex flex-col bg-white rounded-lg p-4 sm:p-5 border border-gray-200 shadow-sm">
                                <div className="flex items-center mb-4">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                                            processingStatus.deviceAcceptance === 'success'
                                                ? 'bg-green-100 text-green-600'
                                                : processingStatus.deviceAcceptance === 'error'
                                                  ? 'bg-red-100 text-red-600'
                                                  : 'bg-yellow-50 text-yellow-600'
                                        }`}
                                    >
                                        {processingStatus.deviceAcceptance === 'success' ? (
                                            <MdCheck className="w-7 h-7" />
                                        ) : processingStatus.deviceAcceptance === 'error' ? (
                                            <MdError className="w-7 h-7" />
                                        ) : (
                                            <div className="w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800 text-lg">Device Acceptance</h4>
                                        <p className="text-sm text-gray-600">Waiting for device confirmation</p>
                                    </div>
                                </div>
                                <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200 flex-1">
                                    <p className="text-sm text-gray-700">
                                        {processingStatus.deviceAcceptance === 'success'
                                            ? 'Device has accepted the request. Proceeding to authentication and card scanning.'
                                            : processingStatus.deviceAcceptance === 'error'
                                              ? 'Device could not process the request. Please try again later.'
                                              : 'Sending request to the device. Waiting for confirmation...'}
                                    </p>
                                </div>
                            </div>

                            {/* Step 2: Face Authentication & RFID Scanning */}
                            <div
                                className={`flex flex-col bg-white rounded-lg p-4 sm:p-5 border border-gray-200 shadow-sm ${
                                    processingStatus.deviceAcceptance !== 'success' ? 'opacity-50' : ''
                                }`}
                            >
                                <div className="flex items-center mb-4">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                                            processingStatus.faceAuthentication === 'success' &&
                                            processingStatus.rfidScanning === 'success'
                                                ? 'bg-green-100 text-green-600'
                                                : processingStatus.faceAuthentication === 'error' ||
                                                    processingStatus.rfidScanning === 'error'
                                                  ? 'bg-red-100 text-red-600'
                                                  : processingStatus.deviceAcceptance === 'success'
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-gray-100 text-gray-400'
                                        }`}
                                    >
                                        {processingStatus.faceAuthentication === 'success' &&
                                        processingStatus.rfidScanning === 'success' ? (
                                            <MdCheck className="w-7 h-7" />
                                        ) : processingStatus.faceAuthentication === 'error' ||
                                          processingStatus.rfidScanning === 'error' ? (
                                            <MdError className="w-7 h-7" />
                                        ) : processingStatus.deviceAcceptance === 'success' ? (
                                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <MdCreditCard className="w-7 h-7" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800 text-lg">Face Auth & RFID Scan</h4>
                                        <p className="text-sm text-gray-600">Authentication and card registration</p>
                                    </div>
                                </div>
                                <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200 flex-1">
                                    <p className="text-sm text-gray-700">
                                        {processingStatus.faceAuthentication === 'success' &&
                                        processingStatus.rfidScanning === 'success'
                                            ? 'Authentication and RFID card registration completed successfully.'
                                            : processingStatus.faceAuthentication === 'error'
                                              ? 'Face authentication failed. Please try again or contact support.'
                                              : processingStatus.rfidScanning === 'error'
                                                ? 'RFID card scanning failed. The card may already be registered.'
                                                : processingStatus.deviceAcceptance === 'success'
                                                  ? 'Please authenticate with your face and scan your RFID card on the device.'
                                                  : 'Waiting for device acceptance before starting authentication.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RFID Scan Guide */}
                        {requestStatus.showScanGuide && processingStatus.deviceAcceptance === 'success' && (
                            <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                                    <MdCreditCard className="mr-2" />
                                    How to Scan Your RFID Card
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                                        <div className="text-center text-blue-700 mb-1 font-medium">Step 1</div>
                                        <p className="text-gray-600 text-xs text-center">
                                            Authenticate with your face on the device
                                        </p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                                        <div className="text-center text-blue-700 mb-1 font-medium">Step 2</div>
                                        <p className="text-gray-600 text-xs text-center">
                                            Place RFID card on the reader
                                        </p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                                        <div className="text-center text-blue-700 mb-1 font-medium">Step 3</div>
                                        <p className="text-gray-600 text-xs text-center">
                                            Wait for confirmation beep and green light
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Note */}
                        <div className="mt-6 text-center text-xs sm:text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p>Please wait while the system processes your request. This may take a few moments.</p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-center mt-6 pt-4 border-t border-gray-200">
                            <button
                                onClick={handleCancel}
                                className={`px-4 py-2 ${isRequestingRFID ? 'bg-red-100 text-red-700 border-red-300' : 'bg-gray-200 text-gray-700'} border rounded-lg hover:bg-gray-300 transition-colors duration-150`}
                            >
                                {isRequestingRFID ? 'Cancel Request' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                )
            case 4:
                return (
                    <div className="px-4 sm:px-8 py-4 sm:py-6">
                        <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-4 sm:mb-6 flex items-center">
                            <MdCheck className="w-5 sm:w-6 h-5 sm:h-6 mr-2 text-green-600" />
                            RFID Card Successfully Registered
                        </h3>

                        {/* Success message */}
                        {requestStatus.message && (
                            <div className="p-4 rounded-lg bg-green-50 text-green-700 border border-green-200 mb-6">
                                <p className="font-medium flex items-center">
                                    <MdCheck className="w-5 h-5 mr-2 text-green-600" />
                                    {requestStatus.message}
                                </p>
                            </div>
                        )}

                        {/* Card details - responsive grid */}
                        {requestStatus.cardDetails && (
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                                {/* Left column */}
                                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-3">
                                        <div className="flex items-center">
                                            <MdCreditCard className="w-5 h-5 mr-2" />
                                            <h4 className="font-medium">RFID Card Information</h4>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex justify-center my-4">
                                            <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center">
                                                <MdCreditCard className="w-10 h-10 text-yellow-500" />
                                            </div>
                                        </div>

                                        <div className="text-center mb-5">
                                            <h5 className="text-lg font-semibold text-gray-800">
                                                {requestStatus.cardDetails.userName}
                                            </h5>
                                            <p className="text-sm text-gray-500">
                                                User ID: {requestStatus.cardDetails.userId}
                                            </p>
                                        </div>

                                        <div className="mt-4 bg-green-50 p-3 rounded-lg border border-green-100">
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                                                <p className="text-sm font-medium text-green-800">
                                                    Registration Complete - Card Ready to Use
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right column */}
                                <div className="lg:col-span-3 flex flex-col">
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-full">
                                        <h4 className="font-medium text-gray-800 text-lg mb-4 border-b pb-2">
                                            Registration Details
                                        </h4>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                                    RFID Card ID
                                                </p>
                                                <div className="flex items-center">
                                                    <span className="flex-shrink-0 w-5 h-5 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mr-2">
                                                        <MdCreditCard className="w-3 h-3" />
                                                    </span>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {requestStatus.cardDetails.rfidId}
                                                    </p>
                                                </div>
                                                {requestStatus.cardDetails.rfidIdLength && (
                                                    <p className="text-xs text-gray-500 mt-1 ml-7">
                                                        Length: {requestStatus.cardDetails.rfidIdLength} characters
                                                    </p>
                                                )}
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                                    Device ID
                                                </p>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {requestStatus.cardDetails.deviceId}
                                                </p>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                                    Face ID
                                                </p>
                                                <div className="relative">
                                                    <p className="font-mono text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap">
                                                        {requestStatus.cardDetails.faceId}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                <p className="text-xs font-semibold text-blue-600 uppercase mb-1">
                                                    Security Advisory
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    Your RFID card is now registered and can be used to unlock the smart
                                                    lock system. Keep your card secure and report any loss immediately.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-100">
                            <p className="text-green-700 flex items-center">
                                <MdCheck className="w-5 h-5 mr-2 text-green-600" />
                                RFID card was successfully registered with the system.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                            <button
                                onClick={handleSave}
                                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-500 transition-colors duration-150 text-sm font-medium"
                            >
                                <MdCheck className="inline mr-2 w-4 h-4" />
                                Finish
                            </button>
                        </div>
                    </div>
                )
            case 5:
                return (
                    <div className="px-4 sm:px-8 py-4 sm:py-6">
                        <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-4 sm:mb-6 flex items-center">
                            <MdError className="w-5 sm:w-6 h-5 sm:h-6 mr-2 text-red-600" />
                            RFID Card Registration Failed
                        </h3>

                        {/* Error message */}
                        {requestStatus.message && (
                            <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 mb-6">
                                <p className="font-medium flex items-center">
                                    <MdError className="w-5 h-5 mr-2 text-red-600" />
                                    {requestStatus.message}
                                </p>
                            </div>
                        )}

                        {/* Error details - responsive grid */}
                        {requestStatus.cardDetails && (
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                                {/* Left column */}
                                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3">
                                        <div className="flex items-center">
                                            <MdCreditCard className="w-5 h-5 mr-2" />
                                            <h4 className="font-medium">RFID Card Error</h4>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex justify-center my-4">
                                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                                                <MdCreditCard className="w-10 h-10 text-red-500" />
                                            </div>
                                        </div>

                                        <div className="text-center mb-5">
                                            <h5 className="text-lg font-semibold text-gray-800">
                                                RFID Card Already Exists
                                            </h5>
                                            <p className="text-sm text-red-600 font-medium">
                                                This card is already registered in the system
                                            </p>
                                        </div>

                                        <div className="mt-4 bg-red-50 p-3 rounded-lg border border-red-100">
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                                                <p className="text-sm font-medium text-red-800">
                                                    Registration Failed - Card Already In Use
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right column */}
                                <div className="lg:col-span-3 flex flex-col">
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-full">
                                        <h4 className="font-medium text-gray-800 text-lg mb-4 border-b pb-2">
                                            Error Details
                                        </h4>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                                    User ID
                                                </p>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {requestStatus.cardDetails.userId || 'N/A'}
                                                </p>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                                    Device ID
                                                </p>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {requestStatus.cardDetails.deviceId || 'N/A'}
                                                </p>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                                    Face ID
                                                </p>
                                                <div className="relative">
                                                    <p className="font-mono text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap">
                                                        {requestStatus.cardDetails.faceId || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                                <p className="text-xs font-semibold text-red-500 uppercase mb-1">
                                                    Error Information
                                                </p>
                                                <p className="text-sm font-medium text-red-700">
                                                    {requestStatus.cardDetails.errorDetails ||
                                                        'An error occurred during RFID card registration.'}
                                                </p>
                                                <p className="text-sm text-red-600 mt-2">
                                                    This RFID card is already registered in the system. Please try using
                                                    a different card.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                            <div className="flex items-start">
                                <MdWarning className="text-yellow-500 w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-yellow-800 font-medium">What to do next:</p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Please try again with a different RFID card that has not been previously
                                        registered in the system.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                            <button
                                onClick={resetForm}
                                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-150 text-sm font-medium"
                            >
                                <MdClose className="inline mr-2 w-4 h-4" />
                                Close
                            </button>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            {/* Inject CSS animations */}
            <style>{toastAnimationStyles}</style>

            {/* Toast Notification */}
            {showToast && (
                <div
                    className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] ${
                        toastType === 'error'
                            ? 'bg-red-500 text-white'
                            : toastType === 'success'
                              ? 'bg-green-500 text-white'
                              : 'bg-blue-500 text-white'
                    } px-6 py-3 rounded-lg shadow-lg flex items-start max-w-md ${toastAnimation}`}
                >
                    {toastType === 'error' && (
                        <span className="w-5 h-5 mr-2 bg-white text-red-500 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                            !
                        </span>
                    )}
                    {toastType === 'success' && <MdCheck className="mr-2 w-5 h-5 flex-shrink-0 mt-0.5" />}
                    <span className="font-medium whitespace-pre-line">{toastMessage}</span>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl relative overflow-hidden max-h-[95vh] flex flex-col">
                {/* Header - Redesigned to match DeleteFingerprintModal */}
                <div className="bg-gradient-to-r from-yellow-100 to-blue-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-yellow-400 rounded-full p-2 sm:p-2.5 mr-2 sm:mr-3 shadow-sm">
                                <MdCreditCard className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                                    Step {currentStep} of 5
                                </p>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                    {currentStep === 1
                                        ? 'RFID Card Registration'
                                        : currentStep === 2
                                          ? 'Card Information'
                                          : currentStep === 3
                                            ? 'Processing'
                                            : currentStep === 4
                                              ? 'Registration Complete'
                                              : 'Registration Failed'}
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full transition-colors"
                        >
                            <MdClose className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content area with overflow scroll */}
                <div className="flex-1 overflow-y-auto">{renderStepContent()}</div>
            </div>
        </div>
    )
}

AddRFIDCardModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired
}

export default AddRFIDCardModal
