import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
    MdClose,
    MdDelete,
    MdCheckBox,
    MdCheckBoxOutlineBlank,
    MdWarning,
    MdFingerprint,
    MdArrowForward,
    MdArrowBack,
    MdCheck,
    MdShield,
    MdError
} from 'react-icons/md'
import { postDeleteFingerprintRequest } from '../../../api/postDeleteFingerprintRequest'
import socket from '../../../config/websocket'

// CSS Animation styles
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

const DeleteFingerprintModal = ({ isOpen, onClose, fingerprint, onSuccess }) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [isConfirmed, setIsConfirmed] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [deleteStatus, setDeleteStatus] = useState({
        message: '',
        type: 'info',
        success: false,
        deletionComplete: false,
        deletedFingerprintDetails: null
    })
    const [processingStatus, setProcessingStatus] = useState({
        deviceAcceptance: 'pending', // pending, success, error
        fingerprintDeletion: 'pending' // pending, success, error
    })
    const [showToast, setShowToast] = useState(false)
    const [toastAnimation, setToastAnimation] = useState('animate-fade-in-down')

    const currentRequestRef = useRef(null)

    // Handle fingerprint confirmation from socket
    const handleDeleteFingerprintConfirm = useCallback(
        (data) => {
            if (!currentRequestRef.current) return

            console.log('Fingerprint deletion confirmation received:', data)
            console.log('Current request reference:', currentRequestRef.current)

            if (fingerprint && fingerprint.fingerprintId === data.fingerprintId) {
                if (data.status === 'DELETE FINGERPRINT ACCEPTED FROM CLIENT') {
                    // Success case - update status for first step
                    setProcessingStatus((prev) => ({
                        ...prev,
                        deviceAcceptance: 'success'
                    }))

                    setDeleteStatus({
                        message: 'Request to delete fingerprint accepted by device!',
                        type: 'success',
                        success: true,
                        deletionComplete: false,
                        deletedFingerprintDetails: null
                    })
                } else {
                    // Failed case
                    setProcessingStatus((prev) => ({
                        ...prev,
                        deviceAcceptance: 'error'
                    }))

                    setDeleteStatus({
                        message: 'Request to delete fingerprint failed. Please try again.',
                        type: 'error',
                        success: false,
                        deletionComplete: false,
                        deletedFingerprintDetails: null
                    })
                }
            }
        },
        [fingerprint]
    )

    // Handle fingerprint deleted event
    const handleFingerprintDeleted = useCallback(
        (data) => {
            console.log('Fingerprint deleted event received:', data)

            if (data.status === 'SUCCESS') {
                // Update status for second step
                setProcessingStatus((prev) => ({
                    ...prev,
                    fingerprintDeletion: 'success'
                }))

                console.log('Setting successful deletion status with details')

                // Cập nhật thông tin chi tiết về vân tay đã xóa
                const deletedDetails = {
                    fingerprintId: data.fingerprintId || fingerprint?.fingerprintId,
                    userId: data.userId || fingerprint?.userId,
                    userName: data.userName || fingerprint?.userName,
                    deviceId: data.deviceId || fingerprint?.deviceId,
                    faceId: data.faceId || fingerprint?.faceId,
                    deletedAt: new Date().toISOString()
                }

                console.log('Deleted fingerprint details:', deletedDetails)

                setDeleteStatus({
                    message: 'Fingerprint was successfully deleted! Please click the Close button below to continue.',
                    type: 'success',
                    success: true,
                    deletionComplete: true,
                    deletedFingerprintDetails: deletedDetails
                })

                // Show toast notification with animation
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

                // Move to success step
                setCurrentStep(4)

                // Call onSuccess but don't close the modal
                if (onSuccess) {
                    console.log('Calling onSuccess with fingerprintId:', data.fingerprintId)
                    onSuccess(data.fingerprintId)
                }

                // No longer need loading indicator
                setIsLoading(false)
            } else {
                // Error case
                setProcessingStatus((prev) => ({
                    ...prev,
                    fingerprintDeletion: 'error'
                }))

                setDeleteStatus((prev) => ({
                    ...prev,
                    message: 'Error deleting fingerprint. Please try again.',
                    type: 'error'
                }))

                setIsLoading(false)
            }
        },
        [fingerprint, onSuccess]
    )

    // Setup socket event listener
    useEffect(() => {
        if (!isOpen) return

        // Listen for fingerprint confirmation events
        socket.on('deleteFingerprintConfirmFromClient', handleDeleteFingerprintConfirm)
        socket.on('fingerprintDeleted', handleFingerprintDeleted)

        // Clean up
        return () => {
            socket.off('deleteFingerprintConfirmFromClient', handleDeleteFingerprintConfirm)
            socket.off('fingerprintDeleted', handleFingerprintDeleted)
        }
    }, [isOpen, handleDeleteFingerprintConfirm, handleFingerprintDeleted])

    const handleDelete = async () => {
        if (!isConfirmed || isLoading || !fingerprint) return

        // Save current request for cleanup
        setIsLoading(true)

        // Store the current request details for matching with socket response
        currentRequestRef.current = {
            userId: fingerprint.userId,
            deviceId: fingerprint.deviceId,
            fingerprintId: fingerprint.fingerprintId,
            faceId: fingerprint.faceId
        }

        try {
            setDeleteStatus({
                message: 'Sending deletion request...',
                type: 'info',
                success: false,
                deletionComplete: false,
                deletedFingerprintDetails: null
            })

            // Reset processing status
            setProcessingStatus({
                deviceAcceptance: 'pending',
                fingerprintDeletion: 'pending'
            })

            setCurrentStep(3)

            // Call API to request fingerprint deletion
            const response = await postDeleteFingerprintRequest(
                fingerprint.userId,
                fingerprint.deviceId,
                fingerprint.fingerprintId,
                fingerprint.faceId
            )

            console.log('Delete fingerprint response:', response)

            if (response.success) {
                // Wait for socket event to confirm acceptance
                setDeleteStatus({
                    message: 'Deletion request sent. Waiting for device confirmation...',
                    type: 'info',
                    success: false,
                    deletionComplete: false,
                    deletedFingerprintDetails: null
                })
            } else {
                // API call failed
                setProcessingStatus((prev) => ({
                    ...prev,
                    deviceAcceptance: 'error'
                }))

                setDeleteStatus({
                    message: response.message || 'Failed to send delete request. Please try again.',
                    type: 'error',
                    success: false,
                    deletionComplete: false,
                    deletedFingerprintDetails: null
                })

                setIsLoading(false)
            }
        } catch (error) {
            console.error('Error requesting fingerprint deletion:', error)

            // Update error status but stay on step 3
            setProcessingStatus((prev) => ({
                ...prev,
                deviceAcceptance: 'error'
            }))

            setDeleteStatus({
                message: 'An error occurred. Please try again or click Close to cancel.',
                type: 'error',
                success: false,
                deletionComplete: false,
                deletedFingerprintDetails: null
            })

            setIsLoading(false)
            currentRequestRef.current = null
        }
    }

    const resetForm = () => {
        // If we're in processing step and still loading, indicate the cancellation
        if (currentStep === 3 && isLoading) {
            console.log('Fingerprint deletion process was cancelled by the user')
        }

        // Reset state
        setCurrentStep(1)
        setIsConfirmed(false)
        setIsLoading(false)
        setDeleteStatus({
            message: '',
            type: 'info',
            success: false,
            deletionComplete: false,
            deletedFingerprintDetails: null
        })
        setProcessingStatus({
            deviceAcceptance: 'pending',
            fingerprintDeletion: 'pending'
        })
        currentRequestRef.current = null
        onClose()
    }

    // Cleanup on unmount or when modal closes
    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(1)
            setIsConfirmed(false)
            setIsLoading(false)
            setDeleteStatus({
                message: '',
                type: 'info',
                success: false,
                deletionComplete: false,
                deletedFingerprintDetails: null
            })
            setProcessingStatus({
                deviceAcceptance: 'pending',
                fingerprintDeletion: 'pending'
            })
            currentRequestRef.current = null
        }
    }, [isOpen])

    const nextStep = () => {
        setCurrentStep((prev) => prev + 1)
    }

    const prevStep = () => {
        setCurrentStep((prev) => prev - 1)
    }

    if (!isOpen || !fingerprint) return null

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-4">
                        <h3 className="text-base font-medium text-gray-800 mb-4">Fingerprint Deletion Process</h3>

                        <div className="space-y-4">
                            {/* Step explanation card */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center mb-3">
                                    <MdFingerprint className="text-red-500 w-5 h-5 mr-2 flex-shrink-0" />
                                    <h4 className="font-medium text-gray-800">Overview</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                    This process will permanently delete the fingerprint from the smart lock system.
                                    Please review the information below before proceeding.
                                </p>

                                <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                    <p className="text-red-700 text-xs font-medium flex items-center">
                                        <MdWarning className="mr-1.5 text-red-600 flex-shrink-0" />
                                        This action cannot be undone
                                    </p>
                                </div>
                            </div>

                            {/* Process steps */}
                            <div className="relative">
                                {/* Left vertical line with gradient */}
                                <div className="absolute left-[24px] top-6 bottom-6 w-1 bg-gradient-to-b from-red-500 via-red-400 to-red-300 rounded-full"></div>

                                <div className="space-y-5">
                                    {/* Step 1 */}
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-md shadow-sm z-10">
                                            1
                                        </div>
                                        <div className="ml-4 bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex-1">
                                            <h4 className="font-medium text-gray-800 text-md flex items-center">
                                                <span className="bg-red-100 p-1 rounded-md mr-2">
                                                    <MdFingerprint className="text-red-600 w-4 h-4" />
                                                </span>
                                                Review Fingerprint Details
                                            </h4>
                                            <p className="text-gray-600 text-sm mt-1 mb-2">
                                                Verify the following information:
                                            </p>

                                            <ul className="list-disc ml-8 text-sm text-gray-600 space-y-1">
                                                <li>
                                                    Fingerprint ID:{' '}
                                                    <span className="font-medium">{fingerprint.fingerprintId}</span>
                                                </li>
                                                <li>
                                                    User: <span className="font-medium">{fingerprint.userName}</span>
                                                </li>
                                                <li>
                                                    Device ID:{' '}
                                                    <span className="font-medium">{fingerprint.deviceId}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-400 flex items-center justify-center text-white font-bold text-md shadow-sm z-10">
                                            2
                                        </div>
                                        <div className="ml-4 bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex-1">
                                            <h4 className="font-medium text-gray-800 text-md flex items-center">
                                                <span className="bg-red-100 p-1 rounded-md mr-2">
                                                    <MdCheckBox className="text-red-600 w-4 h-4" />
                                                </span>
                                                Confirm Deletion
                                            </h4>
                                            <p className="text-gray-600 text-sm mt-1">
                                                Check the confirmation box and click Delete to permanently remove this
                                                fingerprint
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-300 flex items-center justify-center text-white font-bold text-md shadow-sm z-10">
                                            3
                                        </div>
                                        <div className="ml-4 bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex-1">
                                            <h4 className="font-medium text-gray-800 text-md flex items-center">
                                                <span className="bg-red-100 p-1 rounded-md mr-2">
                                                    <MdShield className="text-red-600 w-4 h-4" />
                                                </span>
                                                Complete Process
                                            </h4>

                                            <p className="text-gray-600 text-sm mt-1 mb-2">
                                                Two-stage verification process:
                                            </p>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 text-center">
                                                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-1">
                                                        1
                                                    </div>
                                                    <p className="text-xs text-gray-700">Device Acceptance</p>
                                                </div>
                                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 text-center">
                                                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-1">
                                                        2
                                                    </div>
                                                    <p className="text-xs text-gray-700">Authentication & Deletion</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end mt-5 pt-4 border-t border-gray-200">
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-150 flex items-center mr-3 text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={nextStep}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-150 flex items-center font-medium shadow-sm"
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
                            <div className="bg-red-50 p-4 rounded-lg flex items-start border border-red-200">
                                <MdWarning className="text-red-500 w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-red-800 font-medium">Warning: Permanent Action</h3>
                                    <p className="text-red-700 text-sm mt-1">
                                        You are about to delete a fingerprint. This action cannot be undone.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                                    <MdFingerprint className="text-red-500 mr-2 w-5 h-5" />
                                    Fingerprint Information
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <p className="text-gray-500 text-xs mb-1">Fingerprint ID</p>
                                        <p className="font-medium text-gray-800 flex items-center">
                                            <span className="bg-red-50 text-red-600 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs">
                                                ID
                                            </span>
                                            {fingerprint.fingerprintId}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <p className="text-gray-500 text-xs mb-1">User</p>
                                        <p className="font-medium text-gray-800">{fingerprint.userName}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <p className="text-gray-500 text-xs mb-1">Device ID</p>
                                        <p className="font-medium text-gray-800">{fingerprint.deviceId}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <p className="text-gray-500 text-xs mb-1">Created At</p>
                                        <p className="font-medium text-gray-800">
                                            {new Date(fingerprint.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200 shadow-sm">
                                    <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Face ID</p>
                                    <div className="relative">
                                        <p className="font-mono text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap">
                                            {fingerprint.faceId}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <button
                                        onClick={() => setIsConfirmed(!isConfirmed)}
                                        className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 w-full justify-center transition-colors hover:bg-gray-100"
                                        disabled={isLoading}
                                    >
                                        {isConfirmed ? (
                                            <MdCheckBox className="w-5 h-5 text-red-600 mr-2" />
                                        ) : (
                                            <MdCheckBoxOutlineBlank className="w-5 h-5 mr-2" />
                                        )}
                                        I understand and want to delete this fingerprint
                                    </button>
                                </div>
                            </div>

                            {/* Status message display */}
                            {deleteStatus.message && (
                                <div
                                    className={`p-4 rounded-lg ${
                                        deleteStatus.type === 'success'
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : deleteStatus.type === 'error'
                                              ? 'bg-red-100 text-red-700 border border-red-200'
                                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                                    }`}
                                >
                                    <p className="font-medium">{deleteStatus.message}</p>
                                </div>
                            )}

                            <div className="flex justify-between gap-2 pt-4 border-t border-gray-200">
                                <button
                                    onClick={prevStep}
                                    className="px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-150 flex items-center"
                                    disabled={isLoading}
                                >
                                    <MdArrowBack className="mr-2" />
                                    Back
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                                        isConfirmed && !isLoading
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                    disabled={!isConfirmed || isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <MdDelete className="w-5 h-5 mr-1" />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div className="px-4 sm:px-8 py-4 sm:py-6">
                        {/* Status message */}
                        {deleteStatus.message && (
                            <div
                                className={`p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 ${
                                    deleteStatus.type === 'success'
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : deleteStatus.type === 'error'
                                          ? 'bg-red-50 text-red-700 border border-red-200'
                                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                            >
                                <p className="font-medium text-sm sm:text-base">{deleteStatus.message}</p>
                            </div>
                        )}

                        {/* Device details card */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm mb-6">
                            <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                                <MdFingerprint className="text-red-400 mr-2 w-5 h-5" />
                                Processing Details
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <p className="text-gray-500 text-xs mb-1">User</p>
                                    <p className="font-medium text-gray-800 flex items-center">
                                        {fingerprint.userName}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <p className="text-gray-500 text-xs mb-1">Fingerprint ID</p>
                                    <p className="font-medium text-gray-800 flex items-center">
                                        <span className="bg-red-50 text-red-600 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs">
                                            ID
                                        </span>
                                        {fingerprint.fingerprintId}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <p className="text-gray-500 text-xs mb-1">Device</p>
                                    <p className="font-medium text-gray-800">{fingerprint.deviceId}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <p className="text-gray-500 text-xs mb-1">Status</p>
                                    <p className="font-medium text-red-600 flex items-center">
                                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                                        Pending Deletion
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
                                                  : 'bg-red-50 text-red-600'
                                        }`}
                                    >
                                        {processingStatus.deviceAcceptance === 'success' ? (
                                            <MdCheck className="w-7 h-7" />
                                        ) : processingStatus.deviceAcceptance === 'error' ? (
                                            <MdError className="w-7 h-7" />
                                        ) : (
                                            <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
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
                                            ? 'Device has accepted the deletion request. Proceeding to fingerprint removal.'
                                            : processingStatus.deviceAcceptance === 'error'
                                              ? 'Device could not process the request. Please try again later.'
                                              : 'Sending request to the device. Waiting for confirmation...'}
                                    </p>
                                </div>
                            </div>

                            {/* Step 2: Authentication & Deletion */}
                            <div
                                className={`flex flex-col bg-white rounded-lg p-4 sm:p-5 border border-gray-200 shadow-sm ${
                                    processingStatus.deviceAcceptance !== 'success' ? 'opacity-50' : ''
                                }`}
                            >
                                <div className="flex items-center mb-4">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                                            processingStatus.fingerprintDeletion === 'success'
                                                ? 'bg-green-100 text-green-600'
                                                : processingStatus.fingerprintDeletion === 'error'
                                                  ? 'bg-red-100 text-red-600'
                                                  : processingStatus.deviceAcceptance === 'success'
                                                    ? 'bg-yellow-100 text-yellow-600'
                                                    : 'bg-gray-100 text-gray-400'
                                        }`}
                                    >
                                        {processingStatus.fingerprintDeletion === 'success' ? (
                                            <MdCheck className="w-7 h-7" />
                                        ) : processingStatus.fingerprintDeletion === 'error' ? (
                                            <MdError className="w-7 h-7" />
                                        ) : processingStatus.deviceAcceptance === 'success' ? (
                                            <div className="w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <MdFingerprint className="w-7 h-7" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800 text-lg">Fingerprint Deletion</h4>
                                        <p className="text-sm text-gray-600">Remove fingerprint data</p>
                                    </div>
                                </div>
                                <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200 flex-1">
                                    <p className="text-sm text-gray-700">
                                        {processingStatus.fingerprintDeletion === 'success'
                                            ? 'Fingerprint has been successfully deleted from the device and system.'
                                            : processingStatus.fingerprintDeletion === 'error'
                                              ? 'Error deleting fingerprint. Please try again or contact support.'
                                              : processingStatus.deviceAcceptance === 'success'
                                                ? 'Processing fingerprint deletion. This may take a moment...'
                                                : 'Waiting for device acceptance before processing deletion.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Note */}
                        <div className="mt-6 text-center text-xs sm:text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p>Please wait while the system processes your request. This may take a few moments.</p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                            {processingStatus.deviceAcceptance === 'error' ||
                            processingStatus.fingerprintDeletion === 'error' ? (
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-150"
                                >
                                    Back
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
                                >
                                    Processing...
                                </button>
                            )}
                        </div>
                    </div>
                )

            case 4:
                return (
                    <div className="px-4 sm:px-8 py-4 sm:py-6">
                        <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-4 sm:mb-6 flex items-center">
                            <MdCheck className="w-5 sm:w-6 h-5 sm:h-6 mr-2 text-green-600" />
                            Fingerprint Successfully Deleted
                        </h3>

                        {/* Device details - responsive grid */}
                        {deleteStatus.deletedFingerprintDetails && (
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                                {/* Left column */}
                                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3">
                                        <div className="flex items-center">
                                            <MdFingerprint className="w-5 h-5 mr-2" />
                                            <h4 className="font-medium">Fingerprint Information</h4>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex justify-center my-4">
                                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                                                <MdDelete className="w-10 h-10 text-red-500" />
                                            </div>
                                        </div>

                                        <div className="text-center mb-5">
                                            <h5 className="text-lg font-semibold text-gray-800">
                                                {deleteStatus.deletedFingerprintDetails.userName}
                                            </h5>
                                            <p className="text-sm text-gray-500">
                                                User ID: {deleteStatus.deletedFingerprintDetails.userId}
                                            </p>
                                        </div>

                                        <div className="mt-4 bg-green-50 p-3 rounded-lg border border-green-100">
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                                                <p className="text-sm font-medium text-green-800">
                                                    Deletion Complete - Fingerprint Removed
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right column */}
                                <div className="lg:col-span-3 flex flex-col">
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-full">
                                        <h4 className="font-medium text-gray-800 text-lg mb-4 border-b pb-2">
                                            Deletion Details
                                        </h4>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                                    Fingerprint ID
                                                </p>
                                                <div className="flex items-center">
                                                    <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center mr-2">
                                                        <MdFingerprint className="w-3 h-3" />
                                                    </span>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {deleteStatus.deletedFingerprintDetails.fingerprintId}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                                    Device ID
                                                </p>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {deleteStatus.deletedFingerprintDetails.deviceId}
                                                </p>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                                    Face ID
                                                </p>
                                                <div className="relative">
                                                    <p className="font-mono text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap">
                                                        {deleteStatus.deletedFingerprintDetails.faceId}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                                    Deleted At
                                                </p>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {new Date(
                                                        deleteStatus.deletedFingerprintDetails.deletedAt
                                                    ).toLocaleString()}
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
                                Fingerprint was successfully deleted from the system.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                            <button
                                onClick={resetForm}
                                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-150 text-sm font-medium"
                            >
                                <MdCheck className="inline mr-2 w-4 h-4" />
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
                    className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center ${toastAnimation}`}
                >
                    <MdCheck className="mr-2 w-5 h-5" />
                    <span className="font-medium">Fingerprint Deleted Successfully</span>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative overflow-hidden max-h-[95vh] flex flex-col">
                {/* Header - Redesigned to match UnlockDeviceModal */}
                <div className="bg-gradient-to-r from-red-100 to-orange-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-red-500 rounded-full p-2 sm:p-2.5 mr-2 sm:mr-3 shadow-sm">
                                <MdDelete className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                                    Step {currentStep} of 4
                                </p>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                    {currentStep === 1
                                        ? 'Fingerprint Deletion'
                                        : currentStep === 2
                                          ? 'Confirmation'
                                          : currentStep === 3
                                            ? 'Processing'
                                            : 'Deletion Complete'}
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

                {/* Content area with overflow scroll */}
                <div className="flex-1 overflow-y-auto">{renderStepContent()}</div>
            </div>
        </div>
    )
}

DeleteFingerprintModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    fingerprint: PropTypes.object,
    onSuccess: PropTypes.func.isRequired
}

export default DeleteFingerprintModal
