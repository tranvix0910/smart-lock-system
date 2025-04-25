import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
    MdClose,
    MdDelete,
    MdCheckBox,
    MdCheckBoxOutlineBlank,
    MdWarning,
    MdCreditCard,
    MdArrowForward,
    MdArrowBack,
    MdCheck,
    MdNfc
} from 'react-icons/md'
import { postRequestDeleteRFIDCard } from '../../../api/RFIDCard'
import { formatDateTime } from '../../../utils/formatters'
import socket from '../../../config/websocket'

const DeleteRFIDCardModal = ({ isOpen, onClose, card, onSuccess, showMessage }) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isConfirmChecked, setIsConfirmChecked] = useState(false)
    const [deleteStatus, setDeleteStatus] = useState({
        message: '',
        type: '',
        success: false
    })
    const [processingStatus, setProcessingStatus] = useState({
        requestRemoval: 'pending',
        deleteProcess: 'pending'
    })

    // Reference to store current request
    const currentRequestRef = useRef(null)

    // Handle RFID card deletion confirmation from socket
    const handleDeleteRFIDCardConfirm = useCallback(
        (data) => {
            if (!currentRequestRef.current) return

            console.log('RFID card deletion confirmation received:', data)
            console.log('Current request reference:', currentRequestRef.current)

            if (card && card.rfidId === data.rfidId) {
                if (data.status === 'DELETE ACCEPTED FROM CLIENT') {
                    // Success case - update status for first step
                    setProcessingStatus((prev) => ({
                        ...prev,
                        requestRemoval: 'success'
                    }))

                    setDeleteStatus({
                        message: 'Request to delete RFID card accepted by device!',
                        type: 'success',
                        success: false
                    })

                    // No longer need to proceed with actual deletion as we'll wait for the second socket event
                } else if (data.status === 'DELETE RFID CARD SUCCESS') {
                    // Second step success - RFID card has been successfully deleted
                    setProcessingStatus((prev) => ({
                        ...prev,
                        deleteProcess: 'success'
                    }))

                    setDeleteStatus({
                        message: 'RFID card was successfully deleted!',
                        type: 'success',
                        success: true
                    })

                    // Inform parent component of success
                    onSuccess(card.id)

                    // Show success message
                    showMessage('RFID card has been successfully deleted', 'success')

                    // Move to success step
                    setCurrentStep(4)

                    // No longer deleting
                    setIsDeleting(false)
                } else {
                    // Failed case
                    setProcessingStatus((prev) => ({
                        ...prev,
                        requestRemoval: data.status === 'DELETE ACCEPTED FROM CLIENT' ? 'success' : 'error',
                        deleteProcess: 'error'
                    }))

                    setDeleteStatus({
                        message: 'Request to delete RFID card failed. Please try again.',
                        type: 'error',
                        success: false
                    })

                    showMessage('RFID card deletion failed', 'error')
                    setIsDeleting(false)
                }
            }
        },
        [card, onSuccess, showMessage]
    )

    const handleRfidCardDeleted = useCallback(
        (data) => {
            if (!currentRequestRef.current) return

            console.log('RFID card deleted event received:', data)
            console.log('Current request reference:', currentRequestRef.current)

            // Verify that this event matches our current request
            if (card && data.userId === card.userId && data.deviceId === card.deviceId && data.rfidId === card.rfidId) {
                if (data.status === 'SUCCESS') {
                    // Update processing status to show completion
                    setProcessingStatus((prev) => ({
                        ...prev,
                        deleteProcess: 'success'
                    }))

                    setDeleteStatus({
                        message: 'RFID card was successfully deleted!',
                        type: 'success',
                        success: true
                    })

                    // Inform parent component of success
                    onSuccess(card.id)

                    // Show success message
                    showMessage('RFID card has been successfully deleted', 'success')

                    // Move to success step
                    setCurrentStep(4)

                    // No longer deleting
                    setIsDeleting(false)
                } else {
                    // Handle failure case
                    setProcessingStatus((prev) => ({
                        ...prev,
                        deleteProcess: 'error'
                    }))

                    setDeleteStatus({
                        message: 'Request to delete RFID card failed on server. Please try again.',
                        type: 'error',
                        success: false
                    })

                    showMessage('RFID card deletion failed', 'error')
                    setIsDeleting(false)
                }
            }
        },
        [card, onSuccess, showMessage]
    )

    // Setup socket event listeners
    useEffect(() => {
        if (!isOpen) return

        // Listen for RFID card confirmation events
        socket.on('deleteRFIDCardConfirmFromClient', handleDeleteRFIDCardConfirm)

        // Listen for RFID card deleted events
        socket.on('rfidCardDeleted', handleRfidCardDeleted)

        // Clean up
        return () => {
            socket.off('deleteRFIDCardConfirmFromClient', handleDeleteRFIDCardConfirm)
            socket.off('rfidCardDeleted', handleRfidCardDeleted)
        }
    }, [isOpen, handleDeleteRFIDCardConfirm, handleRfidCardDeleted])

    const handleDelete = async () => {
        if (!isConfirmChecked || !card) return

        try {
            // Log card data để kiểm tra
            console.log('Card data passed to modal:', card)
            console.log('rfidIdLength value:', card.rfidIdLength)

            setIsDeleting(true)
            setDeleteStatus({
                message: 'Requesting RFID card removal...',
                type: 'info',
                success: false
            })

            // Reset processing status
            setProcessingStatus({
                requestRemoval: 'pending',
                deleteProcess: 'pending'
            })

            // Move to processing step
            setCurrentStep(3)

            // Đảm bảo rfidIdLength luôn có giá trị, thay vì dùng || thì dùng bài toán đầy đủ hơn
            const rfidIdLength =
                card.rfidIdLength !== undefined && card.rfidIdLength !== null
                    ? card.rfidIdLength
                    : card.rfidId?.length || 4

            console.log('Final rfidIdLength value used:', rfidIdLength)

            // Store the current request details for matching with socket response
            currentRequestRef.current = {
                userId: card.userId,
                deviceId: card.deviceId,
                rfidId: card.rfidId,
                faceId: card.faceId,
                rfidIdLength: rfidIdLength
            }

            // First step: Request RFID card removal via API
            try {
                const requestResponse = await postRequestDeleteRFIDCard(
                    card.userId,
                    card.deviceId,
                    card.rfidId,
                    card.faceId,
                    rfidIdLength
                )

                console.log('Delete RFID card request response:', requestResponse)

                if (requestResponse.success) {
                    // Wait for socket event to confirm acceptance
                    setDeleteStatus({
                        message: 'Request sent. Waiting for device confirmation...',
                        type: 'info',
                        success: false
                    })

                    // The socket event handler will continue the process for both steps
                    // First for device acceptance and then for actual deletion
                } else {
                    // API call failed
                    setProcessingStatus((prev) => ({
                        ...prev,
                        requestRemoval: 'error'
                    }))

                    setDeleteStatus({
                        message: requestResponse.message || 'Failed to send delete request. Please try again.',
                        type: 'error',
                        success: false
                    })

                    showMessage(requestResponse.message || 'Failed to send delete request', 'error')
                    setIsDeleting(false)
                }
            } catch (error) {
                console.error('Error requesting RFID card deletion:', error)

                setProcessingStatus((prev) => ({
                    ...prev,
                    requestRemoval: 'error'
                }))

                setDeleteStatus({
                    message: error.message || 'Failed to request RFID card removal',
                    type: 'error',
                    success: false
                })

                showMessage(error.message || 'Failed to request RFID card removal', 'error')
                setIsDeleting(false)
                currentRequestRef.current = null
            }
        } catch (error) {
            console.error('Error in delete process:', error)

            setDeleteStatus({
                message: error.message || 'An unexpected error occurred',
                type: 'error',
                success: false
            })

            showMessage(error.message || 'An unexpected error occurred', 'error')
            setIsDeleting(false)
        }
    }

    const nextStep = () => {
        setCurrentStep((prev) => prev + 1)
    }

    const prevStep = () => {
        setCurrentStep((prev) => prev - 1)
    }

    const resetForm = () => {
        if (currentStep === 3 && isDeleting) {
            showMessage('The deletion process has been cancelled by the user', 'info')
        }

        // Reset các states
        setCurrentStep(1)
        setIsConfirmChecked(false)
        setIsDeleting(false)
        setDeleteStatus({
            message: '',
            type: '',
            success: false
        })
        setProcessingStatus({
            requestRemoval: 'pending',
            deleteProcess: 'pending'
        })
        currentRequestRef.current = null
        onClose()
    }

    // Cleanup on unmount or when modal closes
    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(1)
            setIsConfirmChecked(false)
            setIsDeleting(false)
            setDeleteStatus({
                message: '',
                type: '',
                success: false
            })
            setProcessingStatus({
                requestRemoval: 'pending',
                deleteProcess: 'pending'
            })
            currentRequestRef.current = null
        }
    }, [isOpen])

    if (!isOpen || !card) return null

    // Format RFID ID with colons
    const formatRfidId = (rfidId) => {
        if (!rfidId) return 'N/A'
        // Return as is since it already contains colons from the database
        return rfidId
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-5">
                        <h3 className="text-base font-medium text-gray-800 mb-3">RFID Card Deletion Process</h3>

                        <div className="relative">
                            {/* Left vertical line with gradient */}
                            <div className="absolute left-[24px] top-6 bottom-6 w-1 bg-gradient-to-b from-[#ff6b6b] via-[#ff9e9e] to-[#ffd0d0] rounded-full"></div>

                            <div className="space-y-6">
                                {/* Step 1 */}
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ff6b6b] flex items-center justify-center text-white font-bold text-md shadow-sm z-10">
                                        1
                                    </div>
                                    <div className="ml-4 bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-100 flex-1">
                                        <h4 className="font-semibold text-[#24303f] text-md">
                                            Review RFID Card Details
                                        </h4>
                                        <p className="text-gray-600 text-xs mt-1 mb-2">
                                            Verify the following information before proceeding:
                                        </p>

                                        <div className="flex items-center space-x-2">
                                            <div className="bg-white p-2 rounded-lg border border-gray-200 flex-1 h-20 flex flex-col justify-center">
                                                <ul className="list-disc ml-4 text-xs text-gray-600 space-y-1">
                                                    <li>RFID Card ID</li>
                                                    <li>User identity</li>
                                                    <li>Device ID</li>
                                                </ul>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-gray-200 flex-1 h-20 flex items-center">
                                                <div className="mx-auto text-center">
                                                    <MdCreditCard className="w-10 h-10 text-blue-300 mx-auto" />
                                                    <p className="text-xs text-gray-500 mt-1">Confirm Details</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ff9e9e] flex items-center justify-center text-white font-bold text-md shadow-sm z-10">
                                        2
                                    </div>
                                    <div className="ml-4 bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-100 flex-1">
                                        <h4 className="font-semibold text-[#24303f] text-md">Confirm Deletion</h4>

                                        <div className="bg-red-50 p-2 rounded-lg border border-red-100 mt-2 mb-2">
                                            <p className="text-red-700 text-xs font-medium flex items-center">
                                                <MdWarning className="mr-1.5 text-red-600 flex-shrink-0" />
                                                This action cannot be undone
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="bg-white p-2 rounded-lg border border-gray-200 flex-1">
                                                <p className="text-xs text-gray-600">
                                                    Check the confirmation box and click the Delete button to proceed
                                                    with RFID card removal
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ffd0d0] flex items-center justify-center text-[#24303f] font-bold text-md shadow-sm z-10">
                                        3
                                    </div>
                                    <div className="ml-4 bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-100 flex-1">
                                        <h4 className="font-semibold text-[#24303f] text-md">Complete Process</h4>

                                        <p className="text-gray-600 text-xs mt-1 mb-2">
                                            System will process the deletion request:
                                        </p>

                                        <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                                            <p className="text-xs text-gray-700">
                                                RFID card will be permanently removed from the system
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-5">
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
                    <div className="space-y-4">
                        <div className="bg-red-50 p-4 rounded-lg flex items-start">
                            <MdWarning className="text-red-500 w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-red-800 font-medium">Warning: Permanent Action</h3>
                                <p className="text-red-700 text-sm mt-1">
                                    You are about to delete an RFID card. This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-800 mb-2">RFID Card Information</h3>
                            <div className="space-y-2 text-sm">
                                <p className="flex justify-between">
                                    <span className="text-gray-500">RFID ID:</span>
                                    <span className="font-medium flex items-center">
                                        <MdNfc className="text-gray-400 mr-1" />
                                        {formatRfidId(card.rfidId)}
                                    </span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-500">User:</span>
                                    <span className="font-medium">{card.userName}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-500">Device ID:</span>
                                    <span className="font-medium">{card.deviceId}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-500">Card Type:</span>
                                    <span className="font-medium">{card.cardType || 'Standard'}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-500">Status:</span>
                                    <span className="font-medium">{card.status || 'Active'}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-500">Created At:</span>
                                    <span className="font-medium">{formatDateTime(card.createdAt)}</span>
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <button
                                onClick={() => setIsConfirmChecked(!isConfirmChecked)}
                                className="flex items-center text-gray-700 hover:text-gray-900"
                                disabled={isDeleting}
                            >
                                {isConfirmChecked ? (
                                    <MdCheckBox className="w-5 h-5 text-red-600 mr-2" />
                                ) : (
                                    <MdCheckBoxOutlineBlank className="w-5 h-5 mr-2" />
                                )}
                                I understand and want to delete this RFID card
                            </button>
                        </div>

                        {deleteStatus.message && !deleteStatus.success && (
                            <div
                                className={`p-4 rounded-lg mb-4 ${
                                    deleteStatus.type === 'error'
                                        ? 'bg-red-100 text-red-700 border border-red-200'
                                        : deleteStatus.type === 'info'
                                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                          : 'bg-green-100 text-green-700 border border-green-200'
                                }`}
                            >
                                <p className="font-medium">{deleteStatus.message}</p>
                            </div>
                        )}

                        <div className="flex justify-between gap-2 pt-4">
                            <button
                                onClick={prevStep}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-150 flex items-center"
                                disabled={isDeleting}
                            >
                                <MdArrowBack className="mr-2" />
                                Back
                            </button>
                            <button
                                onClick={handleDelete}
                                className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                                    isConfirmChecked && !isDeleting
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                                disabled={!isConfirmChecked || isDeleting}
                            >
                                {isDeleting ? (
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
                )

            case 3:
                return (
                    <div className="space-y-6">
                        <h3 className="text-base font-medium text-gray-800 mb-4">Deleting RFID Card</h3>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                            <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                                <MdCreditCard className="text-blue-400 mr-2 w-5 h-5" />
                                Processing Details
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <p className="text-gray-500 text-xs mb-1">User</p>
                                    <p className="font-medium text-gray-800 flex items-center">{card.userName}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <p className="text-gray-500 text-xs mb-1">RFID ID</p>
                                    <p className="font-medium text-gray-800 flex items-center">
                                        <span className="bg-blue-50 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs">
                                            ID
                                        </span>
                                        {formatRfidId(card.rfidId)}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <p className="text-gray-500 text-xs mb-1">Device</p>
                                    <p className="font-medium text-gray-800">{card.deviceId}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <p className="text-gray-500 text-xs mb-1">Status</p>
                                    <p className="font-medium text-blue-600 flex items-center">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                                        Processing Deletion
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Step 1: Request RFID Removal */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            processingStatus.requestRemoval === 'success'
                                                ? 'bg-green-100 text-green-600'
                                                : processingStatus.requestRemoval === 'error'
                                                  ? 'bg-red-100 text-red-600'
                                                  : 'bg-blue-50 text-blue-600'
                                        }`}
                                    >
                                        {processingStatus.requestRemoval === 'success' ? (
                                            <MdCheck className="w-5 h-5" />
                                        ) : processingStatus.requestRemoval === 'error' ? (
                                            '!'
                                        ) : (
                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800">Requesting RFID Card Removal</h4>
                                        <p className="text-sm text-gray-600">
                                            {processingStatus.requestRemoval === 'success'
                                                ? 'Request accepted by system'
                                                : processingStatus.requestRemoval === 'error'
                                                  ? 'Error requesting RFID removal'
                                                  : 'Sending removal request to system...'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Delete Process */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            processingStatus.deleteProcess === 'success'
                                                ? 'bg-green-100 text-green-600'
                                                : processingStatus.deleteProcess === 'error'
                                                  ? 'bg-red-100 text-red-600'
                                                  : processingStatus.requestRemoval === 'success'
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'bg-gray-200 text-gray-500'
                                        }`}
                                    >
                                        {processingStatus.deleteProcess === 'success' ? (
                                            <MdCheck className="w-5 h-5" />
                                        ) : processingStatus.deleteProcess === 'error' ? (
                                            '!'
                                        ) : processingStatus.requestRemoval === 'success' ? (
                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        ) : null}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800">Deleting RFID Card from System</h4>
                                        <p className="text-sm text-gray-600">
                                            {processingStatus.deleteProcess === 'success'
                                                ? 'RFID card successfully deleted'
                                                : processingStatus.deleteProcess === 'error'
                                                  ? 'Error deleting RFID card'
                                                  : processingStatus.requestRemoval === 'success'
                                                    ? 'Removing card from database and security system...'
                                                    : 'Waiting for request approval...'}
                                        </p>
                                    </div>
                                </div>
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

                        <div className="flex justify-end">
                            {processingStatus.requestRemoval === 'error' ||
                            processingStatus.deleteProcess === 'error' ? (
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
                    <div className="space-y-6">
                        <div className="mt-0 bg-white rounded-lg border border-gray-200 overflow-hidden shadow">
                            <div className="bg-gradient-to-r from-blue-400 to-blue-600 px-4 py-3 text-white">
                                <h3 className="font-medium flex items-center">
                                    <MdCreditCard className="mr-2 text-white" />
                                    RFID Card Deleted Successfully
                                </h3>
                            </div>
                            <div className="p-4">
                                <div className="mb-4">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                                            <MdDelete className="w-12 h-12 text-blue-500" />
                                        </div>
                                    </div>
                                    <div className="text-center mb-4">
                                        <h4 className="font-semibold text-lg text-gray-800">
                                            {card.userName || 'User'}
                                        </h4>
                                        <p className="text-sm text-gray-500">User ID: {card.userId || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                                        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">RFID ID</p>
                                        <p className="font-medium text-sm text-[#24303f] flex items-center">
                                            <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mr-2">
                                                <MdNfc className="w-3 h-3" />
                                            </span>
                                            {formatRfidId(card.rfidId) || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                                        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Device ID</p>
                                        <p className="font-medium text-sm text-[#24303f] truncate">
                                            {card.deviceId || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                                    <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Card Type</p>
                                    <div className="flex justify-between">
                                        <p className="font-medium text-sm text-gray-700">
                                            {card.cardType || 'Standard'}
                                        </p>
                                        <p className="text-xs text-gray-500">Status: {card.status || 'Active'}</p>
                                    </div>
                                </div>

                                <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                                    <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Face ID</p>
                                    <div className="relative">
                                        <p className="font-mono text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap">
                                            {card.faceId || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                                    <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Deleted At</p>
                                    <p className="font-medium text-sm text-gray-700">{new Date().toLocaleString()}</p>
                                </div>

                                <div className="mt-4 text-center">
                                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-50 text-red-700">
                                        <MdCheck className="w-4 h-4 mr-1.5 text-red-600" />
                                        Removed from system
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <p className="text-green-700 flex items-center">
                                <MdCheck className="w-5 h-5 mr-2 text-green-600" />
                                RFID card was successfully deleted! Please click the Close button below to continue.
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={resetForm}
                                className="px-6 py-2.5 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150 font-medium shadow-sm flex items-center"
                            >
                                <MdCheck className="mr-2" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-auto my-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#24303f]">
                        {currentStep === 1
                            ? 'Delete RFID Card'
                            : currentStep === 2
                              ? 'Delete RFID Card - Confirmation'
                              : currentStep === 3
                                ? 'Delete RFID Card - Processing'
                                : 'Delete RFID Card - Success'}
                    </h2>
                    <button
                        onClick={resetForm}
                        className={`text-gray-400 hover:text-gray-600 ${
                            currentStep === 3 && isDeleting
                                ? 'bg-red-50 p-1 rounded-full hover:bg-red-100 transition-all'
                                : ''
                        }`}
                        title={currentStep === 3 && isDeleting ? 'Hủy quá trình xóa' : 'Đóng'}
                    >
                        <MdClose className="w-6 h-6" />
                    </button>
                </div>

                {renderStepContent()}
            </div>
        </div>
    )
}

DeleteRFIDCardModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    card: PropTypes.object,
    onSuccess: PropTypes.func.isRequired,
    showMessage: PropTypes.func.isRequired
}

export default DeleteRFIDCardModal
