import { useState, useEffect, useRef, useCallback } from 'react'
import {
    MdLockOpen,
    MdClose,
    MdSecurity,
    MdFace,
    MdCheck,
    MdError,
    MdChevronRight,
    MdShield,
    MdTimer
} from 'react-icons/md'
import PropTypes from 'prop-types'
import { getFaceID } from '../../api/getFaceID'
import socket from '../../config/websocket'

const UnlockDeviceModal = ({ isOpen, onClose, device, onConfirm, isUnlocking = false }) => {
    const [faceIds, setFaceIds] = useState([])
    const [selectedFaceId, setSelectedFaceId] = useState(null)
    const [isLoadingFaceIds, setIsLoadingFaceIds] = useState(false)
    const [faceIdError, setFaceIdError] = useState(null)
    const [currentStep, setCurrentStep] = useState(1)

    const [processingStatus, setProcessingStatus] = useState({
        apiCall: 'pending', // pending, success, error
        faceAuthentication: 'pending' // pending, success, error
    })

    // Status message for user feedback
    const [statusMessage, setStatusMessage] = useState('')

    // Track unlock result data from socket
    const [unlockResult, setUnlockResult] = useState(null)

    // Reference to store the current unlock request
    const currentUnlockRef = useRef(null)

    useEffect(() => {
        if (isOpen && device) {
            console.log('Device info for Face ID loading:', device)
            if (device.userId) {
                console.log('Loading Face IDs for userId:', device.userId)
                loadFaceIds()
            } else {
                console.warn('No userId found in device object', device)
                setFaceIdError('User ID not available for this device')
            }

            // Reset state when modal opens
            setCurrentStep(1)
            setProcessingStatus({
                apiCall: 'pending',
                faceAuthentication: 'pending'
            })
            setStatusMessage('')
            setUnlockResult(null)
        }
    }, [isOpen, device])

    // Handle system unlocked socket event
    const handleSystemUnlocked = useCallback(
        (data) => {
            console.log('Received system unlocked event:', data)

            if (!currentUnlockRef.current) return

            // Check if this event matches our request
            if (
                data.deviceId === currentUnlockRef.current.deviceId &&
                data.userId === currentUnlockRef.current.userId &&
                data.mode === 'SYSTEM UNLOCKED' &&
                data.systemLocked === false
            ) {
                // Update status and message
                setProcessingStatus((prev) => ({
                    ...prev,
                    faceAuthentication: 'success'
                }))

                setStatusMessage('System unlocked successfully!')

                // Store unlock result data
                setUnlockResult({
                    deviceId: data.deviceId,
                    deviceName: device.deviceName,
                    userId: data.userId,
                    unlockTime: data.timestamp || new Date(),
                    faceId: currentUnlockRef.current.faceId
                })

                // Move to success step after a short delay
                setTimeout(() => {
                    setCurrentStep(3)
                }, 1000)
            }
        },
        [device]
    )

    // Set up socket listeners
    useEffect(() => {
        if (!isOpen) return

        socket.on('systemUnlocked', handleSystemUnlocked)

        return () => {
            socket.off('systemUnlocked', handleSystemUnlocked)
        }
    }, [isOpen, handleSystemUnlocked])

    const loadFaceIds = async () => {
        if (!device || !device.userId) {
            console.warn('Device or userId is missing, cannot load Face IDs')
            setFaceIdError('User ID not available for this device')
            return
        }

        setIsLoadingFaceIds(true)
        setFaceIdError(null)

        try {
            console.log('Calling getFaceID API with userId:', device.userId)
            const response = await getFaceID(device.userId)
            console.log('API response from getFaceID:', response)

            if (response && response.success) {
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    console.log('Face IDs loaded successfully:', response.data)
                    setFaceIds(response.data)
                    setSelectedFaceId(response.data[0].faceId)
                } else {
                    console.warn('No Face IDs found in response data:', response)
                    setFaceIds([])
                    setFaceIdError(null) // No error, just empty data
                }
            } else {
                console.warn('API returned unsuccessful response:', response)
                setFaceIdError(response.message || 'Could not load Face IDs for this user')
                setFaceIds([])
            }
        } catch (error) {
            console.error('Error loading Face IDs:', error)
            setFaceIdError(error.message || 'Failed to load Face IDs')
            setFaceIds([])
        } finally {
            setIsLoadingFaceIds(false)
        }
    }

    const handleConfirm = async () => {
        if (!selectedFaceId) return

        // Move to processing step
        setCurrentStep(2)

        // Store the current unlock request details
        currentUnlockRef.current = {
            deviceId: device.deviceId,
            userId: device.userId,
            faceId: selectedFaceId
        }

        // Update processing status to indicate we're calling the API
        setProcessingStatus((prev) => ({
            ...prev,
            apiCall: 'pending'
        }))
        setStatusMessage('Sending unlock request to device...')

        try {
            // Call the parent's onConfirm with the selected faceId
            // This should return the API response or throw an error
            const result = await onConfirm(selectedFaceId)

            // If we get here, the API call was successful
            setProcessingStatus((prev) => ({
                ...prev,
                apiCall: 'success'
            }))
            setStatusMessage('Unlock request sent. Waiting for face authentication...')

            console.log('API call successful, waiting for device authentication', result)
        } catch (error) {
            // If there was an error calling the API
            console.error('Error calling unlock API:', error)
            setProcessingStatus((prev) => ({
                ...prev,
                apiCall: 'error'
            }))
            setStatusMessage(`Error: ${error.message || 'Failed to send unlock request'}`)

            // No need to close modal here - user can close it if they want
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString(undefined, {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    const handleModalClose = () => {
        // Reset state when modal closes
        setCurrentStep(1)
        setProcessingStatus({
            apiCall: 'pending',
            faceAuthentication: 'pending'
        })
        setStatusMessage('')
        setSelectedFaceId(null)
        currentUnlockRef.current = null

        // Call parent's onClose
        onClose()
    }

    if (!isOpen || !device) return null

    // Render different content based on current step
    const renderStepContent = () => {
        switch (currentStep) {
            case 1: // Step 1: Face ID Selection
                return (
                    <>
                        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-4">
                            {/* Device Info - Compact */}
                            <div className="flex items-center mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <MdSecurity className="text-indigo-500 w-5 h-5 mr-2 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-medium text-gray-800 mb-0.5 text-sm sm:text-base">
                                        {device.deviceName}
                                    </h3>
                                    <p className="text-xs text-gray-500 truncate">ID: {device.deviceId}</p>
                                    <p className="text-xs text-gray-500">
                                        Locked since: {formatDate(device.systemLockedAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Face ID Selection - Refined */}
                            <div className="pb-3">
                                <div className="mt-4 border-t pt-3">
                                    <div className="flex items-center mb-1">
                                        <MdFace className="mr-2 text-blue-500" size={20} />
                                        <span className="font-medium">Select Face ID for Authentication</span>
                                    </div>

                                    {/* Loading State */}
                                    {isLoadingFaceIds && (
                                        <div className="flex items-center justify-center py-4">
                                            <div className="rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 animate-spin"></div>
                                            <span className="ml-2 text-gray-600">Loading your Face IDs...</span>
                                        </div>
                                    )}

                                    {/* Error State */}
                                    {faceIdError && (
                                        <div className="py-2 text-red-500 flex items-center">
                                            <MdError className="mr-1" />
                                            <span>{faceIdError}</span>
                                        </div>
                                    )}

                                    {/* No Face IDs */}
                                    {!isLoadingFaceIds && faceIds.length === 0 && !faceIdError && (
                                        <div className="py-2 text-gray-500">
                                            No Face IDs found for this user. Please register a Face ID first.
                                        </div>
                                    )}

                                    {/* Face ID List */}
                                    {!isLoadingFaceIds && faceIds.length > 0 && !faceIdError && (
                                        <div className="mt-2 max-h-40 overflow-y-auto">
                                            {faceIds.map((faceId) => (
                                                <div
                                                    key={faceId.faceId}
                                                    className={`p-2 mb-1 border rounded-md cursor-pointer flex items-center ${
                                                        selectedFaceId === faceId.faceId
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'hover:bg-gray-50'
                                                    }`}
                                                    onClick={() => setSelectedFaceId(faceId.faceId)}
                                                >
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">
                                                            {faceId.userName ? (
                                                                <span className="text-blue-600">{faceId.userName}</span>
                                                            ) : (
                                                                <span>Unknown User</span>
                                                            )}
                                                        </div>
                                                        <div
                                                            className="text-xs text-gray-500 truncate"
                                                            title={faceId.faceId}
                                                        >
                                                            ID: {faceId.faceId.substring(0, 10)}...
                                                        </div>
                                                    </div>
                                                    {selectedFaceId === faceId.faceId && (
                                                        <MdCheck className="text-blue-500" size={20} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer - Clean and professional */}
                        <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-end space-x-3 bg-gray-50">
                            <button
                                onClick={handleModalClose}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isUnlocking || (faceIds.length > 0 && !selectedFaceId)}
                                className={`flex items-center px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg transition-colors duration-150 text-sm font-medium ${
                                    isUnlocking || (faceIds.length > 0 && !selectedFaceId)
                                        ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300 focus:outline-none'
                                }`}
                            >
                                <MdChevronRight className="w-4 h-4 mr-2" />
                                Continue
                            </button>
                        </div>
                    </>
                )

            case 2: // Step 2: Processing with loading indicators
                return (
                    <>
                        <div className="px-4 sm:px-8 py-4 sm:py-6">
                            {/* Status message */}
                            {statusMessage && (
                                <div
                                    className={`p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 ${
                                        processingStatus.apiCall === 'error' ||
                                        processingStatus.faceAuthentication === 'error'
                                            ? 'bg-red-50 text-red-700 border border-red-200'
                                            : processingStatus.apiCall === 'success' &&
                                                processingStatus.faceAuthentication === 'success'
                                              ? 'bg-green-50 text-green-700 border border-green-200'
                                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                                    }`}
                                >
                                    <p className="font-medium text-sm sm:text-base">{statusMessage}</p>
                                </div>
                            )}

                            {/* Processing steps grid - responsive */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                {/* Step 1: API Call */}
                                <div className="flex flex-col bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-100">
                                    <div className="flex items-center mb-4">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                                                processingStatus.apiCall === 'success'
                                                    ? 'bg-green-100 text-green-600'
                                                    : processingStatus.apiCall === 'error'
                                                      ? 'bg-red-100 text-red-600'
                                                      : 'bg-blue-50 text-blue-600'
                                            }`}
                                        >
                                            {processingStatus.apiCall === 'success' ? (
                                                <MdCheck className="w-7 h-7" />
                                            ) : processingStatus.apiCall === 'error' ? (
                                                <MdError className="w-7 h-7" />
                                            ) : (
                                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-800 text-lg">Unlocking System</h4>
                                            <p className="text-sm text-gray-600">Sending unlock command</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 bg-white p-3 rounded-lg border border-gray-200 flex-1">
                                        <p className="text-sm text-gray-700">
                                            {processingStatus.apiCall === 'success'
                                                ? 'Successfully sent unlock request to the Smart Lock server. The server has received your request and is processing it.'
                                                : processingStatus.apiCall === 'error'
                                                  ? 'There was an error sending your unlock request to the server. Please try again later.'
                                                  : 'Sending unlock request to the Smart Lock server. This should only take a moment...'}
                                        </p>
                                    </div>
                                </div>

                                {/* Step 2: Face Authentication */}
                                <div
                                    className={`flex flex-col bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-100 ${
                                        processingStatus.apiCall !== 'success' ? 'opacity-50' : ''
                                    }`}
                                >
                                    <div className="flex items-center mb-4">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                                                processingStatus.faceAuthentication === 'success'
                                                    ? 'bg-green-100 text-green-600'
                                                    : processingStatus.faceAuthentication === 'error'
                                                      ? 'bg-red-100 text-red-600'
                                                      : processingStatus.apiCall === 'success'
                                                        ? 'bg-yellow-100 text-yellow-600'
                                                        : 'bg-gray-100 text-gray-400'
                                            }`}
                                        >
                                            {processingStatus.faceAuthentication === 'success' ? (
                                                <MdCheck className="w-7 h-7" />
                                            ) : processingStatus.faceAuthentication === 'error' ? (
                                                <MdError className="w-7 h-7" />
                                            ) : processingStatus.apiCall === 'success' ? (
                                                <div className="w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <MdFace className="w-7 h-7" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-800 text-lg">Device Authentication</h4>
                                            <p className="text-sm text-gray-600">Face verification required</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 bg-white p-3 rounded-lg border border-gray-200 flex-1">
                                        <p className="text-sm text-gray-700">
                                            {processingStatus.faceAuthentication === 'success'
                                                ? 'Face authentication successful! Your identity has been confirmed and the system is now unlocked.'
                                                : processingStatus.faceAuthentication === 'error'
                                                  ? 'Face authentication failed. Please try again or contact support if this problem persists.'
                                                  : processingStatus.apiCall === 'success'
                                                    ? 'Please check your Smart Lock device. The device is waiting for face authentication before proceeding with the unlock.'
                                                    : 'Waiting for server request to complete before starting device authentication.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick note */}
                            <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p>
                                    Please ensure you are physically at the smart lock device to complete face
                                    authentication.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 px-4 sm:px-8 py-3 sm:py-4 flex justify-end bg-gray-50">
                            <button
                                onClick={handleModalClose}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </>
                )

            case 3: // Step 3: Success view with device details
                return (
                    <>
                        <div className="px-4 sm:px-8 py-4 sm:py-6">
                            <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-4 sm:mb-6 flex items-center">
                                <MdCheck className="w-5 sm:w-6 h-5 sm:h-6 mr-2 text-green-600" />
                                System Successfully Unlocked
                            </h3>

                            {/* Device details - responsive grid */}
                            {unlockResult && (
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                                    {/* Left column */}
                                    <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-4 py-3">
                                            <div className="flex items-center">
                                                <MdShield className="w-5 h-5 mr-2" />
                                                <h4 className="font-medium">Device Information</h4>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex justify-center my-4">
                                                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
                                                    <MdLockOpen className="w-10 h-10 text-indigo-500" />
                                                </div>
                                            </div>

                                            <div className="text-center mb-5">
                                                <h5 className="text-lg font-semibold text-gray-800">
                                                    {unlockResult.deviceName}
                                                </h5>
                                                <p className="text-sm text-gray-500">{unlockResult.deviceId}</p>
                                            </div>

                                            <div className="mt-4 bg-green-50 p-3 rounded-lg border border-green-100">
                                                <div className="flex items-center">
                                                    <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                                                    <p className="text-sm font-medium text-green-800">
                                                        System Unlocked - Device Operational
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right column */}
                                    <div className="lg:col-span-3 flex flex-col">
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-full">
                                            <h4 className="font-medium text-gray-800 text-lg mb-4 border-b pb-2">
                                                Unlock Details
                                            </h4>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                                        Unlock Time
                                                    </p>
                                                    <div className="flex items-center">
                                                        <MdTimer className="w-5 h-5 text-indigo-500 mr-2" />
                                                        <p className="text-sm font-medium text-gray-800">
                                                            {formatDate(unlockResult.unlockTime)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                                        Face ID Used
                                                    </p>
                                                    <div className="flex items-center mb-1">
                                                        <MdFace className="w-5 h-5 text-indigo-500 mr-2" />
                                                        <p className="text-sm text-gray-800">
                                                            <span className="text-blue-600 font-medium">
                                                                {faceIds.find((f) => f.faceId === unlockResult.faceId)
                                                                    ?.userName || 'Unknown User'}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center ml-7">
                                                        <p
                                                            className="text-xs text-gray-500 truncate"
                                                            title={unlockResult.faceId}
                                                        >
                                                            ID: {unlockResult.faceId.substring(0, 20)}...
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 ml-7 mt-1">
                                                        This Face ID was verified at the device to unlock the system
                                                    </p>
                                                </div>

                                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">
                                                        Security Advisory
                                                    </p>
                                                    <p className="text-sm text-gray-700">
                                                        The system has been unlocked and is now operational. For
                                                        security reasons, the system will automatically lock again if no
                                                        activity is detected for an extended period.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 px-4 sm:px-8 py-3 sm:py-4 flex justify-end bg-gray-50">
                            <button
                                onClick={handleModalClose}
                                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-150 text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </>
                )

            default:
                return null
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative overflow-hidden max-h-[95vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Simplified and elegant */}
                <div className="bg-gradient-to-r from-indigo-100 to-blue-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-indigo-500 rounded-full p-2 sm:p-2.5 mr-2 sm:mr-3 shadow-sm">
                                <MdLockOpen className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                                    Step {currentStep} of 3
                                </p>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                    {currentStep === 1
                                        ? 'System Unlock'
                                        : currentStep === 2
                                          ? 'Processing'
                                          : 'Unlock Complete'}
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={handleModalClose}
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

UnlockDeviceModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    device: PropTypes.shape({
        deviceId: PropTypes.string.isRequired,
        deviceName: PropTypes.string.isRequired,
        systemLockedAt: PropTypes.string.isRequired,
        userId: PropTypes.string
    }),
    onConfirm: PropTypes.func.isRequired,
    isUnlocking: PropTypes.bool
}

export default UnlockDeviceModal
