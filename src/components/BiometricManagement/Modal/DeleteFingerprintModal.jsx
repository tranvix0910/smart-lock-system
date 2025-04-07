import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import { MdClose, MdDelete, MdCheckBox, MdCheckBoxOutlineBlank, MdWarning, MdFingerprint, MdArrowForward, MdArrowBack, MdCheck } from 'react-icons/md'
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
`;

const DeleteFingerprintModal = ({ 
    isOpen, 
    onClose, 
    fingerprint,
    onSuccess
}) => {
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
    
    // Reference to store current request
    const currentRequestRef = useRef(null);
    
    // Handle fingerprint confirmation from socket
    const handleDeleteFingerprintConfirm = useCallback((data) => {
        if (!currentRequestRef.current) return;
        
        console.log('Fingerprint deletion confirmation received:', data);
        console.log('Current request reference:', currentRequestRef.current);
        
        if (fingerprint && fingerprint.fingerprintId === data.fingerprintId) {
            if (data.status === 'DELETE FINGERPRINT ACCEPTED FROM CLIENT') {
                // Success case - update status for first step
                setProcessingStatus(prev => ({
                    ...prev,
                    deviceAcceptance: 'success'
                }));
                
                setDeleteStatus({ 
                    message: 'Request to delete fingerprint accepted by device!', 
                    type: 'success',
                    success: true,
                    deletionComplete: false,
                    deletedFingerprintDetails: null
                });
            } else {
                // Failed case
                setProcessingStatus(prev => ({
                    ...prev,
                    deviceAcceptance: 'error'
                }));
                
                setDeleteStatus({ 
                    message: 'Request to delete fingerprint failed. Please try again.', 
                    type: 'error',
                    success: false,
                    deletionComplete: false,
                    deletedFingerprintDetails: null
                });
            }
        }
    }, [fingerprint]);

    // Handle fingerprint deleted event
    const handleFingerprintDeleted = useCallback((data) => {
        console.log('Fingerprint deleted event received:', data);
        
        if (data.status === 'SUCCESS') {
            // Update status for second step
            setProcessingStatus(prev => ({
                ...prev,
                fingerprintDeletion: 'success'
            }));
            
            console.log('Setting successful deletion status with details');
            
            // Cập nhật thông tin chi tiết về vân tay đã xóa
            const deletedDetails = {
                fingerprintId: data.fingerprintId || fingerprint?.fingerprintId,
                userId: data.userId || fingerprint?.userId,
                userName: data.userName || fingerprint?.userName,
                deviceId: data.deviceId || fingerprint?.deviceId,
                faceId: data.faceId || fingerprint?.faceId,
                deletedAt: new Date().toISOString()
            };
            
            console.log('Deleted fingerprint details:', deletedDetails);
            
            setDeleteStatus({
                message: 'Fingerprint was successfully deleted! Please click the Close button below to continue.',
                type: 'success',
                success: true,
                deletionComplete: true,
                deletedFingerprintDetails: deletedDetails
            });
            
            // Show toast notification with animation
            setToastAnimation('animate-fade-in-down');
            setShowToast(true);
            
            // Set fade out animation after 2.5 seconds
            setTimeout(() => {
                setToastAnimation('animate-fade-out-up');
            }, 2500);
            
            // Hide toast after animation completes
            setTimeout(() => {
                setShowToast(false);
            }, 3000);
            
            // Move to success step
            setCurrentStep(4);
            
            // Call onSuccess but don't close the modal
            if (onSuccess) {
                console.log('Calling onSuccess with fingerprintId:', data.fingerprintId);
                onSuccess(data.fingerprintId);
            }
            
            // No longer need loading indicator
            setIsLoading(false);
        } else {
            // Error case
            setProcessingStatus(prev => ({
                ...prev,
                fingerprintDeletion: 'error'
            }));
            
            setDeleteStatus(prev => ({
                ...prev,
                message: 'Error deleting fingerprint. Please try again.',
                type: 'error'
            }));
            
            setIsLoading(false);
        }
    }, [fingerprint, onSuccess]);
    
    // Setup socket event listener
    useEffect(() => {
        if (!isOpen) return;
        
        // Listen for fingerprint confirmation events
        socket.on('deleteFingerprintConfirmFromClient', handleDeleteFingerprintConfirm);
        socket.on('fingerprintDeleted', handleFingerprintDeleted);
        
        // Clean up
        return () => {
            socket.off('deleteFingerprintConfirmFromClient', handleDeleteFingerprintConfirm);
            socket.off('fingerprintDeleted', handleFingerprintDeleted);
        };
    }, [isOpen, handleDeleteFingerprintConfirm, handleFingerprintDeleted]);

    const handleDelete = async () => {
        if (!isConfirmed || isLoading || !fingerprint) return;

        // Save current request for cleanup
        setIsLoading(true);
        
        // Store the current request details for matching with socket response
        currentRequestRef.current = {
            userId: fingerprint.userId,
            deviceId: fingerprint.deviceId,
            fingerprintId: fingerprint.fingerprintId,
            faceId: fingerprint.faceId
        };
        
        try {
            setDeleteStatus({ 
                message: 'Sending deletion request...', 
                type: 'info',
                success: false,
                deletionComplete: false,
                deletedFingerprintDetails: null
            });
            
            // Reset processing status
            setProcessingStatus({
                deviceAcceptance: 'pending',
                fingerprintDeletion: 'pending'
            });
            
            setCurrentStep(3);
            
            // Call API to request fingerprint deletion
            const response = await postDeleteFingerprintRequest(
                fingerprint.userId,
                fingerprint.deviceId,
                fingerprint.fingerprintId,
                fingerprint.faceId
            );
            
            console.log('Delete fingerprint response:', response);
            
            if (response.success) {
                // Wait for socket event to confirm acceptance
                setDeleteStatus({ 
                    message: 'Deletion request sent. Waiting for device confirmation...', 
                    type: 'info',
                    success: false,
                    deletionComplete: false,
                    deletedFingerprintDetails: null
                });
            } else {
                // API call failed
                setProcessingStatus(prev => ({
                    ...prev,
                    deviceAcceptance: 'error'
                }));
                
                setDeleteStatus({ 
                    message: response.message || 'Failed to send delete request. Please try again.', 
                    type: 'error',
                    success: false,
                    deletionComplete: false,
                    deletedFingerprintDetails: null
                });
                
                setIsLoading(false);
            }
            
        } catch (error) {
            console.error('Error requesting fingerprint deletion:', error);
            
            // Update error status but stay on step 3
            setProcessingStatus(prev => ({
                ...prev,
                deviceAcceptance: 'error'
            }));
            
            setDeleteStatus({ 
                message: 'An error occurred. Please try again or click Close to cancel.', 
                type: 'error',
                success: false,
                deletionComplete: false,
                deletedFingerprintDetails: null
            });
            
            setIsLoading(false);
            currentRequestRef.current = null;
        }
    };

    const resetForm = () => {
        setCurrentStep(1);
        setIsConfirmed(false);
        setIsLoading(false);
        setDeleteStatus({
            message: '',
            type: 'info',
            success: false,
            deletionComplete: false,
            deletedFingerprintDetails: null
        });
        setProcessingStatus({
            deviceAcceptance: 'pending',
            fingerprintDeletion: 'pending'
        });
        currentRequestRef.current = null;
        onClose();
    };

    // Cleanup on unmount or when modal closes
    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(1);
            setIsConfirmed(false);
            setIsLoading(false);
            setDeleteStatus({
                message: '',
                type: 'info',
                success: false,
                deletionComplete: false,
                deletedFingerprintDetails: null
            });
            setProcessingStatus({
                deviceAcceptance: 'pending',
                fingerprintDeletion: 'pending'
            });
            currentRequestRef.current = null;
        }
    }, [isOpen]);

    const nextStep = () => {
        setCurrentStep(prev => prev + 1)
    }

    const prevStep = () => {
        setCurrentStep(prev => prev - 1)
    }

    if (!isOpen || !fingerprint) return null

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-5">
                        <h3 className="text-base font-medium text-gray-800 mb-3">Fingerprint Deletion Process</h3>
                        
                        <div className="relative">
                            {/* Left vertical line with gradient */}
                            <div className="absolute left-[24px] top-6 bottom-6 w-1 bg-gradient-to-b from-[#ff6b6b] via-[#ff9e9e] to-[#ffd0d0] rounded-full"></div>
                            
                            <div className="space-y-6">
                                {/* Step 1 */}
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ff6b6b] flex items-center justify-center text-white font-bold text-md shadow-sm z-10">1</div>
                                    <div className="ml-4 bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-100 flex-1">
                                        <h4 className="font-semibold text-[#24303f] text-md">Review Fingerprint Details</h4>
                                        <p className="text-gray-600 text-xs mt-1 mb-2">Verify the following information before proceeding:</p>
                                        
                                        <div className="flex items-center space-x-2">
                                            <div className="bg-white p-2 rounded-lg border border-gray-200 flex-1 h-20 flex flex-col justify-center">
                                                <ul className="list-disc ml-4 text-xs text-gray-600 space-y-1">
                                                    <li>Fingerprint ID</li>
                                                    <li>User identity</li>
                                                    <li>Associated Face ID</li>
                                                </ul>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-gray-200 flex-1 h-20 flex items-center">
                                                <div className="mx-auto text-center">
                                                    <MdFingerprint className="w-10 h-10 text-red-300 mx-auto" />
                                                    <p className="text-xs text-gray-500 mt-1">Confirm Identity</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Step 2 */}
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ff9e9e] flex items-center justify-center text-white font-bold text-md shadow-sm z-10">2</div>
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
                                                    Check the confirmation box and click the Delete button to proceed with fingerprint removal
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Step 3 */}
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ffd0d0] flex items-center justify-center text-[#24303f] font-bold text-md shadow-sm z-10">3</div>
                                    <div className="ml-4 bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-100 flex-1">
                                        <h4 className="font-semibold text-[#24303f] text-md">Complete Process</h4>
                                        
                                        <p className="text-gray-600 text-xs mt-1 mb-2">Two-stage verification process:</p>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                                                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-1">1</div>
                                                <p className="text-xs text-gray-700">Device Acceptance</p>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                                                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-1">2</div>
                                                <p className="text-xs text-gray-700">Authentication & Deletion</p>
                                            </div>
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
                );
                
            case 2:
                return (
                    <div className="space-y-4">
                        <div className="bg-red-50 p-4 rounded-lg flex items-start">
                            <MdWarning className="text-red-500 w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-red-800 font-medium">Warning: Permanent Action</h3>
                                <p className="text-red-700 text-sm mt-1">
                                    You are about to delete a Fingerprint. This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-800 mb-2">Fingerprint Information</h3>
                            <div className="space-y-2 text-sm">
                                <p className="flex justify-between">
                                    <span className="text-gray-500">Fingerprint ID:</span>
                                    <span className="font-medium flex items-center">
                                        <MdFingerprint className="text-gray-400 mr-1" />
                                        {fingerprint.fingerprintId}
                                    </span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-500">User:</span>
                                    <span className="font-medium">{fingerprint.userName}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-500">Device ID:</span>
                                    <span className="font-medium">{fingerprint.deviceId}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-500">Face ID:</span>
                                    <span className="font-medium truncate ml-2" style={{ maxWidth: '180px' }}>
                                        {fingerprint.faceId}
                                    </span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-500">Created At:</span>
                                    <span className="font-medium">{new Date(fingerprint.createdAt).toLocaleString()}</span>
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <button
                                onClick={() => setIsConfirmed(!isConfirmed)}
                                className="flex items-center text-gray-700 hover:text-gray-900"
                                disabled={isLoading}
                            >
                                {isConfirmed ? (
                                    <MdCheckBox className="w-5 h-5 text-red-600 mr-2" />
                                ) : (
                                    <MdCheckBoxOutlineBlank className="w-5 h-5 mr-2" />
                                )}
                                I understand and want to delete this Fingerprint
                            </button>
                        </div>

                        {/* Status message display */}
                        {deleteStatus.message && (
                            <div className={`p-4 rounded-lg mb-4 ${
                                deleteStatus.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
                                deleteStatus.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
                                'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                                <p className="font-medium">{deleteStatus.message}</p>
                            </div>
                        )}

                        <div className="flex justify-between gap-2 pt-4">
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
                );
                
            case 3:
                return (
                    <div className="space-y-6">
                        <h3 className="text-base font-medium text-gray-800 mb-4">Deleting Fingerprint</h3>
                        
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
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
                                        <span className="bg-red-50 text-red-600 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs">ID</span>
                                        {fingerprint.fingerprintId}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <p className="text-gray-500 text-xs mb-1">Device</p>
                                    <p className="font-medium text-gray-800">
                                        {fingerprint.deviceId}
                                    </p>
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
                        
                        <div className="space-y-4">
                            {/* Step 1: Device Acceptance */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        processingStatus.deviceAcceptance === 'success' ? 'bg-green-100 text-green-600' :
                                        processingStatus.deviceAcceptance === 'error' ? 'bg-red-100 text-red-600' :
                                        'bg-red-50 text-red-600'
                                    }`}>
                                        {processingStatus.deviceAcceptance === 'success' ? <MdCheck className="w-5 h-5" /> :
                                         processingStatus.deviceAcceptance === 'error' ? '!' :
                                         <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800">Waiting for acceptance from {fingerprint.deviceId}</h4>
                                        <p className="text-sm text-gray-600">
                                            {processingStatus.deviceAcceptance === 'success' ? 'Device has accepted the deletion request' :
                                             processingStatus.deviceAcceptance === 'error' ? 'Error: Device could not process request' :
                                             'Sending request to device...'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Authentication & Deletion */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        processingStatus.fingerprintDeletion === 'success' ? 'bg-green-100 text-green-600' :
                                        processingStatus.fingerprintDeletion === 'error' ? 'bg-red-100 text-red-600' :
                                        'bg-gray-200 text-gray-500'
                                    }`}>
                                        {processingStatus.fingerprintDeletion === 'success' ? <MdCheck className="w-5 h-5" /> :
                                         processingStatus.fingerprintDeletion === 'error' ? '!' :
                                         processingStatus.deviceAcceptance === 'success' ? 
                                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div> :
                                            null}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800">Authentication & Delete Fingerprint</h4>
                                        <p className="text-sm text-gray-600">
                                            {processingStatus.fingerprintDeletion === 'success' ? 'Fingerprint has been successfully deleted' :
                                             processingStatus.fingerprintDeletion === 'error' ? 'Error: Could not delete fingerprint' :
                                             processingStatus.deviceAcceptance === 'success' ? 'Processing deletion...' : 
                                             'Waiting for device acceptance...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Status message display */}
                        {deleteStatus.message && (
                            <div className={`p-4 rounded-lg ${
                                deleteStatus.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
                                deleteStatus.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
                                'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                                <p className="font-medium">{deleteStatus.message}</p>
                            </div>
                        )}
                        
                        <div className="flex justify-end">
                            {processingStatus.deviceAcceptance === 'error' || processingStatus.fingerprintDeletion === 'error' ? (
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
                );
                
            case 4:
                return (
                    <div className="space-y-6">
                        <div className="mt-0 bg-white rounded-lg border border-gray-200 overflow-hidden shadow">
                            <div className="bg-gradient-to-r from-red-400 to-red-600 px-4 py-3 text-white">
                                <h3 className="font-medium flex items-center">
                                    <MdFingerprint className="mr-2 text-white" />
                                    Fingerprint Deleted Successfully
                                </h3>
                            </div>
                            <div className="p-4">
                                <div className="mb-4">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                                            <MdDelete className="w-12 h-12 text-red-500" />
                                        </div>
                                    </div>
                                    <div className="text-center mb-4">
                                        <h4 className="font-semibold text-lg text-gray-800">
                                            {deleteStatus.deletedFingerprintDetails.userName || 'User'}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            User ID: {deleteStatus.deletedFingerprintDetails.userId || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                                        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Fingerprint ID</p>
                                        <p className="font-medium text-sm text-[#24303f] flex items-center">
                                            <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center mr-2">
                                                <MdFingerprint className="w-3 h-3" />
                                            </span>
                                            {deleteStatus.deletedFingerprintDetails.fingerprintId || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                                        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Device ID</p>
                                        <p className="font-medium text-sm text-[#24303f] truncate">
                                            {deleteStatus.deletedFingerprintDetails.deviceId || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                                    <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Face ID</p>
                                    <div className="relative">
                                        <p className="font-mono text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap">
                                            {deleteStatus.deletedFingerprintDetails.faceId || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                                    <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Deleted At</p>
                                    <p className="font-medium text-sm text-gray-700">
                                        {new Date(deleteStatus.deletedFingerprintDetails.deletedAt).toLocaleString()}
                                    </p>
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
                                Fingerprint was successfully deleted! Please click the Close button below to continue.
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
                );
                
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* Inject CSS animations */}
            <style>{toastAnimationStyles}</style>
            
            {/* Toast Notification */}
            {showToast && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center ${toastAnimation}`}>
                    <MdCheck className="mr-2 w-5 h-5" />
                    <span className="font-medium">Fingerprint Deleted Successfully</span>
                </div>
            )}
            
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-auto my-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#24303f]">
                        {currentStep === 1 ? "Delete Fingerprint" : 
                        currentStep === 2 ? "Delete Fingerprint - Confirmation" : 
                        currentStep === 3 ? "Delete Fingerprint - Processing" :
                        "Delete Fingerprint - Success"}
                    </h2>
                    <button
                        onClick={resetForm}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                    >
                        <MdClose className="w-6 h-6" />
                    </button>
                </div>

                {renderStepContent()}
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
