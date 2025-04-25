import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
    MdClose,
    MdFingerprint,
    MdArrowBack,
    MdArrowForward,
    MdCheckCircle,
    MdWarning,
    MdError,
    MdCheck
} from 'react-icons/md'
import { getRequestAddFingerprint } from '../../../api/postRequestAddFingerprint'
import { getDeviceByUserId } from '../../../api/getDeviceByUserID'
import { getFaceID } from '../../../api/getFaceID'
import socket from '../../../config/websocket'

const AddFingerprintModal = ({ isOpen, onClose, userId, onSuccess }) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [fingerprintId, setFingerprintId] = useState('')
    const [selectedDevice, setSelectedDevice] = useState('')
    const [devices, setDevices] = useState([])
    const [isLoadingDevices, setIsLoadingDevices] = useState(false)
    const [faceIDs, setFaceIDs] = useState([])
    const [isLoadingFaceIDs, setIsLoadingFaceIDs] = useState(false)
    const [selectedFaceID, setSelectedFaceID] = useState('')
    const [isRequestingFingerprint, setIsRequestingFingerprint] = useState(false)
    const [requestStatus, setRequestStatus] = useState({
        message: '',
        type: 'info',
        showFingerplaceGuide: false,
        success: false,
        fingerSaved: false,
        fingerprintDetails: null
    })

    // Reference to store current request
    const currentRequestRef = useRef(null)

    // Handle fingerprint confirmation from socket
    const handleFingerprintConfirm = useCallback((data) => {
        if (!currentRequestRef.current) return

        const { userId: receivedUserId, deviceId: receivedDeviceId, faceId: receivedFaceId, status } = data
        const {
            userId: requestedUserId,
            deviceId: requestedDeviceId,
            faceId: requestedFaceId
        } = currentRequestRef.current

        console.log('Fingerprint confirmation received:', data)
        console.log('Current request:', currentRequestRef.current)

        if (
            receivedUserId === requestedUserId &&
            receivedDeviceId === requestedDeviceId &&
            receivedFaceId === requestedFaceId
        ) {
            if (status === 'ADD FINGERPRINT ACCEPTED FROM CLIENT') {
                // Success case
                setFingerprintId(`FP${Date.now().toString().slice(-6)}`) // Generate a temporary fingerprint ID
                setRequestStatus({
                    message: 'Request fingerprint successfully registered!',
                    type: 'success',
                    showFingerplaceGuide: true,
                    success: true,
                    fingerSaved: false,
                    fingerprintDetails: null
                })

                // Auto-hide success message after 3 seconds
                setTimeout(() => {
                    setRequestStatus((prev) => ({
                        ...prev,
                        message: '',
                        success: true // Keep true to maintain state but hide the message
                    }))
                }, 3000)
            } else {
                // Failed case
                setRequestStatus({
                    message: 'Request fingerprint failed. Please try again.',
                    type: 'error',
                    showFingerplaceGuide: false,
                    success: false,
                    fingerSaved: false,
                    fingerprintDetails: null
                })
            }

            // Request is complete
            setIsRequestingFingerprint(false)
            currentRequestRef.current = null
        }
    }, [])

    // Handle fingerprint saved event
    const handleFingerprintSaved = useCallback((data) => {
        console.log('Fingerprint saved event received:', data)

        if (data.status === 'SUCCESS') {
            setFingerprintId(data.fingerprintId)
            setRequestStatus((prev) => ({
                ...prev,
                fingerSaved: true,
                fingerprintDetails: {
                    fingerprintId: data.fingerprintId,
                    userId: data.userId,
                    userName: data.userName,
                    deviceId: data.deviceId,
                    faceId: data.faceId,
                    fingerprintTemplate: data.fingerprintTemplate
                }
            }))

            // Hide messages after 3 seconds
            setTimeout(() => {
                setRequestStatus((prev) => ({
                    ...prev,
                    message: '',
                    showFingerplaceGuide: false
                }))
            }, 3000)
        }
    }, [])

    // Setup socket event listener
    useEffect(() => {
        if (!isOpen) return

        // Listen for fingerprint confirmation events
        socket.on('addFingerprintConfirmFromClient', handleFingerprintConfirm)
        socket.on('fingerprintSaved', handleFingerprintSaved)

        // Clean up
        return () => {
            socket.off('addFingerprintConfirmFromClient', handleFingerprintConfirm)
            socket.off('fingerprintSaved', handleFingerprintSaved)
        }
    }, [isOpen, handleFingerprintConfirm, handleFingerprintSaved])

    // Fetch face IDs when component mounts
    useEffect(() => {
        const loadFaceIDs = async () => {
            if (!isOpen) return

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

    const handleSave = () => {
        if (!selectedDevice || !selectedFaceID || !fingerprintId) return

        const selectedFace = faceIDs.find((face) => face.faceId === selectedFaceID)

        const newFingerprint = {
            id: Date.now(), // ID tạm thời
            userId: selectedFace?.userId || userId,
            userName: selectedFace?.userName || '',
            fingerprintId: fingerprintId,
            deviceId: selectedDevice,
            faceId: selectedFaceID,
            status: 'Active',
            createdAt: new Date().toISOString()
        }

        onSuccess(newFingerprint)
        resetForm()
    }

    const handleRequestAddFingerprint = async () => {
        if (!selectedDevice || !selectedFaceID) return

        try {
            setIsRequestingFingerprint(true)
            setRequestStatus({ message: '', type: 'info', showFingerplaceGuide: false, success: false })

            const targetUserId = selectedFaceID
                ? faceIDs.find((face) => face.faceId === selectedFaceID)?.userId
                : userId

            // Store the current request details for matching with socket response
            currentRequestRef.current = {
                userId: targetUserId,
                deviceId: selectedDevice,
                faceId: selectedFaceID
            }

            // Send the request
            const response = await getRequestAddFingerprint(targetUserId, selectedDevice, selectedFaceID)
            console.log('Request sent:', response)

            if (!response.success) {
                // If API call failed, we clear the waiting state
                setIsRequestingFingerprint(false)
                currentRequestRef.current = null
                setRequestStatus({
                    message: response.message || 'Failed to send request. Please try again.',
                    type: 'error',
                    showFingerplaceGuide: false,
                    success: false
                })
            }
            // If success, we wait for socket response in handleFingerprintConfirm
        } catch (error) {
            console.error('Error requesting add fingerprint:', error)
            setIsRequestingFingerprint(false)
            currentRequestRef.current = null
            setRequestStatus({
                message: 'An error occurred. Please try again.',
                type: 'error',
                showFingerplaceGuide: false,
                success: false
            })
        }
    }

    const resetForm = () => {
        setCurrentStep(1)
        setFingerprintId('')
        setSelectedDevice('')
        setSelectedFaceID('')
        setRequestStatus({ message: '', type: 'info', showFingerplaceGuide: false, success: false })
        setIsRequestingFingerprint(false)
        currentRequestRef.current = null
        onClose()
    }

    // Cleanup on unmount or when modal closes
    useEffect(() => {
        if (!isOpen) {
            resetForm()
        }
    }, [isOpen])

    const goToNextStep = () => {
        if (currentStep === 1) {
            setCurrentStep(2)
        } else if (currentStep === 2) {
            setCurrentStep(3)
        }
    }

    const goToPreviousStep = () => {
        if (currentStep === 3) {
            setCurrentStep(2)
        } else if (currentStep === 2) {
            setCurrentStep(1)
        }
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-4">
                            {/* Instructions */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mr-4">
                                        <MdFingerprint className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">Add New Fingerprint</h3>
                                        <p className="text-sm text-gray-500">
                                            Follow these steps to register a new fingerprint
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Step 1 */}
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                            <span className="text-blue-600 font-medium">1</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                Select Device and Face ID
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Choose the device and face ID to associate with this fingerprint.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                            <span className="text-blue-600 font-medium">2</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                Face Authentication & Scanning
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Complete face verification and place your finger on the scanner when
                                                prompted.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                            <span className="text-blue-600 font-medium">3</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-gray-900">Save and Complete</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Review fingerprint details and confirm to complete the process.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Warning Message */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <MdWarning className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-medium text-yellow-800">Important Note</h4>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            You must have at least one registered Face ID before adding fingerprints.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-end space-x-3 bg-gray-50">
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={goToNextStep}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 flex items-center"
                            >
                                Next
                                <MdArrowForward className="ml-2" />
                            </button>
                        </div>
                    </>
                )

            case 2:
                return (
                    <>
                        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-4">
                            {/* Device and Face ID Selection */}
                            <div className="space-y-6">
                                {/* Face ID Selection */}
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Face ID</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedFaceID}
                                        onChange={(e) => setSelectedFaceID(e.target.value)}
                                        disabled={isLoadingFaceIDs}
                                    >
                                        <option value="">Select Face ID</option>
                                        {faceIDs.map((face) => (
                                            <option key={face.faceId} value={face.faceId}>
                                                {face.userName || 'Unknown User'} - {face.faceId}
                                            </option>
                                        ))}
                                    </select>
                                    {isLoadingFaceIDs && (
                                        <p className="text-sm text-gray-500 mt-2">Loading Face IDs...</p>
                                    )}
                                </div>

                                {/* Device Selection */}
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Device</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedDevice}
                                        onChange={(e) => setSelectedDevice(e.target.value)}
                                        disabled={isLoadingDevices}
                                    >
                                        <option value="">Select device</option>
                                        {devices.map((device) => (
                                            <option key={device.deviceId} value={device.deviceId}>
                                                {device.deviceName || device.deviceId}
                                            </option>
                                        ))}
                                    </select>
                                    {isLoadingDevices && (
                                        <p className="text-sm text-gray-500 mt-2">Loading devices...</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between bg-gray-50">
                            <button
                                onClick={goToPreviousStep}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 flex items-center"
                            >
                                <MdArrowBack className="mr-2" />
                                Back
                            </button>
                            <button
                                onClick={async () => {
                                    await handleRequestAddFingerprint()
                                    goToNextStep()
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150"
                                disabled={!selectedDevice || !selectedFaceID || isRequestingFingerprint}
                            >
                                {isRequestingFingerprint ? 'Sending Request...' : 'Send Request'}
                            </button>
                        </div>
                    </>
                )

            case 3:
                return (
                    <>
                        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-4">
                            {/* Status Messages */}
                            <div className="space-y-6">
                                {/* Loading/Processing Status */}
                                {isRequestingFingerprint && (
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                Processing Request
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Please wait while we process your request...
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Success Message */}
                                {requestStatus.success && requestStatus.message && !requestStatus.fingerSaved && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <MdCheck className="w-5 h-5 text-green-500 mr-3" />
                                            <p className="text-sm text-green-700">{requestStatus.message}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Error Message */}
                                {requestStatus.message &&
                                    !requestStatus.success &&
                                    !isRequestingFingerprint &&
                                    !requestStatus.showFingerplaceGuide && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <MdError className="w-5 h-5 text-red-500 mr-3" />
                                                <p className="text-sm text-red-700">{requestStatus.message}</p>
                                            </div>
                                        </div>
                                    )}

                                {/* Fingerprint Guide */}
                                {requestStatus.showFingerplaceGuide && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                                <MdFingerprint className="w-8 h-8 text-blue-500" />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Scan</h3>
                                            <p className="text-sm text-gray-500">
                                                Please complete face authentication and place your finger on the
                                                fingerprint sensor.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Fingerprint Details */}
                                {requestStatus.fingerSaved && requestStatus.fingerprintDetails && (
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                                                <MdCheckCircle className="w-8 h-8 text-green-500" />
                                            </div>
                                        </div>
                                        <div className="text-center mb-6">
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                Fingerprint Registered Successfully
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                The fingerprint has been successfully registered to the system.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs text-gray-500">Fingerprint ID</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {requestStatus.fingerprintDetails.fingerprintId}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs text-gray-500">Device ID</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {requestStatus.fingerprintDetails.deviceId}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between bg-gray-50">
                            {!requestStatus.fingerSaved && (
                                <button
                                    onClick={goToPreviousStep}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 flex items-center"
                                >
                                    <MdArrowBack className="mr-2" />
                                    Back
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 ${requestStatus.fingerSaved ? 'ml-auto' : ''}`}
                                disabled={!requestStatus.fingerSaved}
                            >
                                Finish
                            </button>
                        </div>
                    </>
                )

            default:
                return null
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative overflow-hidden max-h-[95vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-100 to-blue-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-blue-500 rounded-full p-2 sm:p-2.5 mr-2 sm:mr-3 shadow-sm">
                                <MdFingerprint className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                                    Step {currentStep} of 3
                                </p>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                    {currentStep === 1
                                        ? 'Add Fingerprint'
                                        : currentStep === 2
                                          ? 'Select Information'
                                          : 'Capture Fingerprint'}
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={resetForm}
                            className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full transition-colors"
                        >
                            <MdClose className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">{renderStepContent()}</div>
            </div>
        </div>
    )
}

AddFingerprintModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    onSuccess: PropTypes.func.isRequired
}

export default AddFingerprintModal
