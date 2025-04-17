import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import { MdClose, MdCheck, MdArrowForward, MdArrowBack, MdCreditCard } from 'react-icons/md'
import rfidScanImg from '../../../assets/images/rfidScan.gif'
import rfidInfoImg from '../../../assets/images/rfidInfo.gif'
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
`;

const AddRFIDCardModal = ({ 
    isOpen, 
    onClose, 
    onSubmit,
    userId
}) => {
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
        rfidScanning: 'pending', // pending, success, error
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
        if (!currentRequestRef.current) return;
        
        const { userId: receivedUserId, deviceId: receivedDeviceId, faceId: receivedFaceId, status } = data;
        const { userId: requestedUserId, deviceId: requestedDeviceId, faceId: requestedFaceId } = currentRequestRef.current;
        
        console.log('RFID confirmation received:', data);
        console.log('Current request:', currentRequestRef.current);
        
        if (receivedUserId === requestedUserId && 
            receivedDeviceId === requestedDeviceId && 
            receivedFaceId === requestedFaceId) {
                
            if (status === 'ADD RFID CARD ACCEPTED FROM CLIENT') {
                // Success case - Device accepted the request
                setProcessingStatus(prev => ({
                    ...prev,
                    deviceAcceptance: 'success',
                    faceAuthentication: 'pending' // Next step starts
                }));
                
                setRequestStatus({ 
                    message: 'Request accepted. Please authenticate with Face ID and scan your RFID card.', 
                    type: 'success',
                    showScanGuide: true,
                    success: true,
                    cardSaved: false,
                    cardDetails: null
                });
                
                // Auto-hide success message after 5 seconds
                setTimeout(() => {
                    setRequestStatus(prev => ({
                        ...prev,
                        message: '',
                        success: true // Keep true to maintain state but hide the message
                    }));
                }, 5000);
            } else {
                // Failed case
                setProcessingStatus(prev => ({
                    ...prev,
                    deviceAcceptance: 'error'
                }));
                
                setRequestStatus({ 
                    message: 'Device rejected the request. Please try again.', 
                    type: 'error',
                    showScanGuide: false,
                    success: false,
                    cardSaved: false,
                    cardDetails: null
                });
                
                // Request is complete (with error)
                setIsRequestingRFID(false);
            }
        } else {
            console.log('Failed');
        }
    }, []);

    // Handle RFID card saved event
    const handleRFIDSaved = useCallback((data) => {
        console.log('RFID card saved event received:', data);
        
        if (data.status === 'SUCCESS') {
            // Update face auth and RFID scan status to success
            setProcessingStatus(prev => ({
                ...prev,
                faceAuthentication: 'success',
                rfidScanning: 'success'
            }));
            
            setRequestStatus(prev => ({
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
            }));
            
            // Move to success step
            setCurrentStep(4);
            
            // Request is complete (success)
            setIsRequestingRFID(false);
            
            // Hide messages after 3 seconds
            setTimeout(() => {
                setRequestStatus(prev => ({
                    ...prev,
                    message: '',
                    showScanGuide: false
                }));
            }, 3000);
        } else if (data.status === 'ERROR') {
            // Update face auth and RFID scan status to error
            setProcessingStatus(prev => ({
                ...prev,
                rfidScanning: 'error'
            }));
            
            // Check if it's a duplicate card error
            const isDuplicateError = data.error === 'RFID_CARD_ALREADY_EXISTS';
            
            // Set toast message for duplicate error
            if (isDuplicateError) {
                setToastMessage("This RFID card is already registered in the system.\n\nPlease try using a different RFID card that is not already registered.");
                setToastType('error');
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
            }
            
            setRequestStatus({ 
                message: isDuplicateError 
                    ? 'This RFID card is already registered in the system.' 
                    : data.message || 'Failed to save RFID card. Please try again.', 
                type: 'error',
                showScanGuide: false,
                success: false,
                cardSaved: false,
                cardDetails: isDuplicateError ? {
                    userId: data.userId,
                    deviceId: data.deviceId,
                    faceId: data.faceId,
                    errorType: data.error,
                    errorDetails: 'The RFID card you tried to register is already in use.',
                    timestamp: new Date().toISOString()
                } : null
            });
            
            // Move to error step for duplicate card error
            if (isDuplicateError) {
                setCurrentStep(5);
            }
            
            // Request is complete (with error)
            setIsRequestingRFID(false);
        } else {
            console.log('Failed');
        }
    }, []);
    
    // Setup socket event listener
    useEffect(() => {
        if (!isOpen) return;
        
        // Listen for RFID confirmation events
        socket.on('addRFIDCardConfirmFromClient', handleRFIDConfirm);
        socket.on('rfidCardSaved', handleRFIDSaved);
        
        // Clean up
        return () => {
            socket.off('addRFIDCardConfirmFromClient', handleRFIDConfirm);
            socket.off('rfidCardSaved', handleRFIDSaved);
        };
    }, [isOpen, handleRFIDConfirm, handleRFIDSaved]);

    // Fetch face IDs when component mounts
    useEffect(() => {
        const loadFaceIDs = async () => {
            if (!isOpen || !userId) return;
            
            try {
                setIsLoadingFaceIDs(true);
                const response = await getFaceID(userId);
                
                if (response.success && response.data) {
                    setFaceIDs(response.data);
                    console.log('Face IDs loaded:', response.data);
                } else {
                    console.warn('No Face IDs found or invalid response format');
                    setFaceIDs([]);
                }
            } catch (error) {
                console.error('Error loading Face IDs:', error);
                setFaceIDs([]);
            } finally {
                setIsLoadingFaceIDs(false);
            }
        };

        loadFaceIDs();
    }, [userId, isOpen]);

    // Fetch devices when modal opens
    useEffect(() => {
        const loadDevices = async () => {
            if (!isOpen || !userId) return;
            
            try {
                setIsLoadingDevices(true);
                const deviceList = await getDeviceByUserId(userId);
                console.log('Devices received:', deviceList);
                if (deviceList && Array.isArray(deviceList)) {
                    setDevices(deviceList);
                } else {
                    console.warn('No devices found or invalid response format');
                    setDevices([]);
                }
            } catch (error) {
                console.error('Error loading devices:', error);
                setDevices([]);
            } finally {
                setIsLoadingDevices(false);
            }
        };

        loadDevices();
    }, [userId, isOpen]);

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
        if (!newCard.deviceId || !newCard.faceId) return;
        
        try {
            setIsRequestingRFID(true);
            setProcessingStatus({
                deviceAcceptance: 'pending',
                faceAuthentication: 'pending',
                rfidScanning: 'pending'
            });
            
            setRequestStatus({ 
                message: '', 
                type: 'info', 
                showScanGuide: false, 
                success: false,
                cardSaved: false,
                cardDetails: null
            });
            
            const targetUserId = newCard.faceId ? 
                faceIDs.find(face => face.faceId === newCard.faceId)?.userId : 
                userId;
            
            // Store the current request details for matching with socket response
            currentRequestRef.current = {
                userId: targetUserId,
                deviceId: newCard.deviceId,
                faceId: newCard.faceId
            };
            
            // Send the request
            const response = await postRequestAddRFIDCard(
                targetUserId, 
                newCard.deviceId, 
                newCard.faceId
            );
            console.log('Request sent:', response);
            
            if (!response.success) {
                // If API call failed, we clear the waiting state
                setIsRequestingRFID(false);
                currentRequestRef.current = null;
                setProcessingStatus(prev => ({
                    ...prev,
                    deviceAcceptance: 'error'
                }));
                
                setRequestStatus({ 
                    message: response.message || 'Failed to send request. Please try again.', 
                    type: 'error',
                    showScanGuide: false,
                    success: false,
                    cardSaved: false,
                    cardDetails: null
                });
            }
            // If success, we wait for socket response in handleRFIDConfirm
            
        } catch (error) {
            console.error('Error requesting add RFID card:', error);
            setIsRequestingRFID(false);
            currentRequestRef.current = null;
            setProcessingStatus(prev => ({
                ...prev,
                deviceAcceptance: 'error'
            }));
            
            setRequestStatus({ 
                message: 'An error occurred. Please try again.', 
                type: 'error',
                showScanGuide: false,
                success: false,
                cardSaved: false,
                cardDetails: null
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        setCurrentStep(3)
        handleRequestAddRFID()
    }

    const handleSave = () => {
        if (!requestStatus.cardDetails) return;
        
        const rfidCardData = {
            cardId: requestStatus.cardDetails.cardId,
            deviceId: requestStatus.cardDetails.deviceId,
            faceId: requestStatus.cardDetails.faceId,
            userId: requestStatus.cardDetails.userId,
            userName: requestStatus.cardDetails.userName,
            status: 'Active',
            createdAt: new Date().toISOString()
        };
        
        onSubmit(rfidCardData);
        onClose(); // Only close when user clicks Finish
    };

    const resetForm = () => {
        setCurrentStep(1);
        setNewCard({
            deviceId: '',
            faceId: '',
            userName: '',
            status: 'Active'
        });
        setRequestStatus({
            message: '',
            type: 'info',
            showScanGuide: false,
            success: false,
            cardSaved: false,
            cardDetails: null
        });
        setIsRequestingRFID(false);
        currentRequestRef.current = null;
    };

    const handleCancel = () => {
        // Force cancel even if currently requesting
        setIsRequestingRFID(false);
        currentRequestRef.current = null;
        resetForm();
        onClose();
    }

    const nextStep = () => {
        setCurrentStep(prev => prev + 1)
    }

    const prevStep = () => {
        setCurrentStep(prev => prev - 1)
    }

    if (!isOpen) return null

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h3 className="text-base font-medium text-gray-800 mb-4">Instructions for adding a new RFID card</h3>
                        
                        <div className="relative">
                            {/* Left vertical line with gradient */}
                            <div className="absolute left-[24px] top-6 bottom-6 w-1 bg-gradient-to-b from-[#ebf45d] via-[#5dbfeb] to-green-400 rounded-full"></div>
                            
                            <div className="space-y-8">
                                {/* Step 1 */}
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#ebf45d] flex items-center justify-center text-[#24303f] font-bold text-lg shadow-md z-10">1</div>
                                    <div className="ml-4 bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-100 flex-1">
                                        <h4 className="font-semibold text-[#24303f] text-lg mb-2">Select Device and Face ID</h4>
                                        
                                        <div className="flex flex-row items-start gap-3">
                                            {/* Instructions on left */}
                                            <div className="w-3/5 flex flex-col justify-center h-full">
                                                <p className="text-gray-600 text-sm">
                                                    1. Choose the device for card registration
                                                </p>
                                                <p className="text-gray-600 text-sm mt-1">
                                                    2. Select the associated Face ID
                                                </p>
                                                <p className="text-gray-600 text-sm mt-1">
                                                    3. Enter user information and notes
                                                </p>
                                            </div>
                                            
                                            {/* Image on right */}
                                            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm w-2/5 flex items-center justify-center bg-white">
                                                <img 
                                                    src={rfidScanImg}
                                                    alt="RFID Card Registration" 
                                                    className="w-full h-[180px] object-contain p-0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Step 2 */}
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#5dbfeb] flex items-center justify-center text-white font-bold text-lg shadow-md z-10">2</div>
                                    <div className="ml-4 bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-100 flex-1">
                                        <h4 className="font-semibold text-[#24303f] text-lg mb-1">Scan RFID Card</h4>
                                        
                                        <div className="flex flex-row items-start gap-3">
                                            {/* Instructions on left */}
                                            <div className="w-3/5">
                                                <p className="text-gray-600 text-sm">
                                                    After entering the information, scan the RFID card on the selected device.
                                                </p>
                                                <div className="mt-2 bg-white p-2 rounded-lg border border-gray-200">
                                                    <p className="text-xs font-medium text-gray-700">Required steps:</p>
                                                    <ul className="list-disc ml-4 text-xs text-gray-600 mt-1">
                                                        <li>Place card on reader</li>
                                                        <li>Wait for confirmation beep</li>
                                                        <li>Check device display</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            
                                            {/* Image on right */}
                                            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm w-2/5 flex items-center justify-center bg-white">
                                                <img 
                                                    src={rfidInfoImg}
                                                    alt="RFID Card Information" 
                                                    className="w-full h-[180px] object-contain p-0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Step 3 */}
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-400 flex items-center justify-center text-white font-bold text-lg shadow-md z-10">3</div>
                                    <div className="ml-4 bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-100 flex-1">
                                        <h4 className="font-semibold text-[#24303f] text-lg mb-1">Confirm and Complete</h4>
                                        <p className="text-gray-600 text-sm">
                                            Review the information and submit to complete the RFID card registration.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleCancel}
                                className="px-5 py-2.5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-150 flex items-center mr-3 text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={nextStep}
                                className="px-5 py-2.5 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150 flex items-center font-medium shadow-sm"
                            >
                                Next
                                <MdArrowForward className="ml-2" />
                            </button>
                        </div>
                    </div>
                )
            case 2:
                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Device <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d] bg-white"
                                value={newCard.deviceId}
                                onChange={(e) => setNewCard(prev => ({ ...prev, deviceId: e.target.value }))}
                                disabled={isLoadingDevices}
                                required
                            >
                                <option value="">Select a device</option>
                                {devices && devices.length > 0 ? (
                                    devices.map(device => (
                                        <option key={device.deviceId} value={device.deviceId}>
                                            {device.deviceId} - {device.deviceName}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No devices available</option>
                                )}
                            </select>
                            {isLoadingDevices ? (
                                <p className="text-sm text-gray-500 mt-1">Loading device list...</p>
                            ) : devices.length === 0 && !isLoadingDevices ? (
                                <p className="text-sm text-red-500 mt-1">No devices found. Please check your connection.</p>
                            ) : null}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Face ID <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d] bg-white"
                                value={newCard.faceId}
                                onChange={(e) => {
                                    const selectedFace = faceIDs.find(face => face.faceId === e.target.value);
                                    setNewCard(prev => ({ 
                                        ...prev, 
                                        faceId: e.target.value,
                                        userName: selectedFace ? selectedFace.userName : ''
                                    }));
                                }}
                                disabled={isLoadingFaceIDs}
                                required
                            >
                                <option value="">Select a Face ID</option>
                                {faceIDs && faceIDs.length > 0 ? (
                                    faceIDs.map(face => (
                                        <option key={face.faceId} value={face.faceId}>
                                            {face.deviceId} - {face.userName}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No Face IDs available</option>
                                )}
                            </select>
                            {isLoadingFaceIDs ? (
                                <p className="text-sm text-gray-500 mt-1">Loading Face ID list...</p>
                            ) : faceIDs.length === 0 && !isLoadingFaceIDs ? (
                                <p className="text-sm text-red-500 mt-1">No Face IDs found. Please add a Face ID first.</p>
                            ) : null}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                User Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter the card holder's name"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                                value={newCard.userName}
                                onChange={(e) => setNewCard(prev => ({ ...prev, userName: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="flex justify-between gap-2 mt-6">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-5 py-2.5 border border-gray-200 rounded-lg hover:border-[#ebf45d] transition-colors duration-150 flex items-center"
                            >
                                <MdArrowBack className="mr-2" />
                                Back
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150 flex items-center"
                                disabled={!newCard.deviceId || !newCard.faceId || !newCard.userName}
                            >
                                Send Request
                            </button>
                        </div>
                    </form>
                )
            case 3:
                return (
                    <div className="space-y-6">
                        <h3 className="text-base font-medium text-gray-800 mb-4">RFID Card Registration</h3>
                        
                        {/* Status message */}
                        {requestStatus.message && (
                            <div className={`p-4 rounded-lg mb-6 ${
                                requestStatus.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
                                requestStatus.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
                                'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                                <p className="font-medium">{requestStatus.message}</p>
                            </div>
                        )}
                        
                        {/* Processing Steps */}
                        <div className="space-y-4">
                            {/* Step 1: Smart Lock Response */}
                            <div className="flex items-center bg-gray-50 rounded-lg p-4 border border-gray-100 shadow-sm">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                                    processingStatus.deviceAcceptance === 'success' ? 'bg-green-100 text-green-600' :
                                    processingStatus.deviceAcceptance === 'error' ? 'bg-red-100 text-red-600' :
                                    'bg-blue-50 text-blue-600'
                                }`}>
                                    {processingStatus.deviceAcceptance === 'success' ? (
                                        <MdCheck className="w-6 h-6" />
                                    ) : processingStatus.deviceAcceptance === 'error' ? (
                                        <span className="text-xl font-bold">!</span>
                                    ) : (
                                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-800">Smart Lock Response</h4>
                                    <p className="text-sm text-gray-600">
                                        {processingStatus.deviceAcceptance === 'success' 
                                            ? 'Smart Lock accepted the request' 
                                            : processingStatus.deviceAcceptance === 'error'
                                            ? 'Smart Lock failed to respond'
                                            : `Waiting for response from ${newCard.deviceId}`}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Step 2: Face ID Authentication & RFID Scanning */}
                            <div className={`flex items-center bg-gray-50 rounded-lg p-4 border border-gray-100 shadow-sm ${
                                processingStatus.deviceAcceptance !== 'success' ? 'opacity-50' : ''
                            }`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                                    processingStatus.faceAuthentication === 'success' && processingStatus.rfidScanning === 'success' ? 'bg-green-100 text-green-600' :
                                    processingStatus.faceAuthentication === 'error' || processingStatus.rfidScanning === 'error' ? 'bg-red-100 text-red-600' :
                                    processingStatus.deviceAcceptance === 'success' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'
                                }`}>
                                    {processingStatus.faceAuthentication === 'success' && processingStatus.rfidScanning === 'success' ? (
                                        <MdCheck className="w-6 h-6" />
                                    ) : processingStatus.faceAuthentication === 'error' || processingStatus.rfidScanning === 'error' ? (
                                        <span className="text-xl font-bold">!</span>
                                    ) : processingStatus.deviceAcceptance === 'success' ? (
                                        <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <span className="text-xl">2</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-800">Face ID Authentication & Scan RFID Card</h4>
                                    <p className="text-sm text-gray-600">
                                        {processingStatus.faceAuthentication === 'success' && processingStatus.rfidScanning === 'success'
                                            ? 'Authentication successful and RFID card registered' 
                                            : processingStatus.faceAuthentication === 'error'
                                            ? 'Face authentication failed'
                                            : processingStatus.rfidScanning === 'error'
                                            ? 'RFID card scanning failed'
                                            : processingStatus.deviceAcceptance === 'success'
                                            ? 'Please authenticate with your face and scan the RFID card'
                                            : 'Waiting for device response'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Note about cancelling */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600 mb-3">
                                You can cancel this operation at any time by clicking the button below
                            </p>
                            <button
                                onClick={handleCancel}
                                className={`px-5 py-2.5 ${isRequestingRFID ? 'bg-red-100 border-red-300 text-red-700' : 'bg-gray-100 border-gray-300 text-gray-700'} border rounded-lg hover:bg-gray-200 transition-colors duration-150 font-medium shadow-sm`}
                            >
                                {isRequestingRFID ? 'Cancel Request' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                )
            case 4:
                return (
                    <div className="space-y-6">
                        <h3 className="text-base font-medium text-gray-800 mb-4">Registration Complete</h3>
                        
                        {/* Success message */}
                        {requestStatus.message && (
                            <div className="p-4 rounded-lg bg-green-100 text-green-700 border border-green-200 mb-6 animate-fade-in">
                                <p className="font-medium flex items-center">
                                    <MdCheck className="w-5 h-5 mr-2 text-green-600" />
                                    {requestStatus.message}
                                </p>
                            </div>
                        )}
                        
                        {/* RFID Card Details */}
                        {requestStatus.cardDetails && (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow">
                                <div className="bg-gradient-to-r from-green-500 to-blue-500 px-4 py-3 text-white">
                                    <h3 className="font-medium flex items-center">
                                        <MdCreditCard className="mr-2 text-white" />
                                        RFID Card Registered Successfully
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <div className="mb-4">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                                                <MdCreditCard className="w-12 h-12 text-blue-500" />
                                            </div>
                                        </div>
                                        <div className="text-center mb-4">
                                            <h4 className="font-semibold text-lg text-gray-800">
                                                {requestStatus.cardDetails.userName}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                User ID: {requestStatus.cardDetails.userId}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                                            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">RFID ID</p>
                                            <p className="font-medium text-sm text-[#24303f] flex items-center">
                                                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mr-2">
                                                    <MdCreditCard className="w-3 h-3" />
                                                </span>
                                                {requestStatus.cardDetails.rfidId}
                                            </p>
                                            {requestStatus.cardDetails.rfidIdLength && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Length: {requestStatus.cardDetails.rfidIdLength}
                                                </p>
                                            )}
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                                            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Device ID</p>
                                            <p className="font-medium text-sm text-[#24303f] truncate">
                                                {requestStatus.cardDetails.deviceId}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                                        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Face ID</p>
                                        <div className="relative">
                                            <p className="font-mono text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap">
                                                {requestStatus.cardDetails.faceId}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 text-center">
                                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700">
                                            <MdCheck className="w-4 h-4 mr-1.5 text-green-600" />
                                            Ready to use
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex justify-end">
                            <button
                                onClick={handleSave}
                                className="px-5 py-2.5 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150"
                            >
                                Finish
                            </button>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6">
                        <div className="mt-0 bg-white rounded-lg border border-gray-200 overflow-hidden shadow">
                            <div className="bg-gradient-to-r from-red-400 to-red-600 px-4 py-3 text-white">
                                <h3 className="font-medium flex items-center">
                                    <MdCreditCard className="mr-2 text-white" />
                                    RFID Card Registration Failed
                                </h3>
                            </div>
                            <div className="p-4">
                                <div className="mb-4">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                                            <MdCreditCard className="w-12 h-12 text-red-500" />
                                        </div>
                                    </div>
                                    <div className="text-center mb-4">
                                        <h4 className="font-semibold text-lg text-gray-800">
                                            RFID Card Already Exists
                                        </h4>
                                        <p className="text-sm text-red-600 font-medium">
                                            This card is already registered in the system
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                                        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">User ID</p>
                                        <p className="font-medium text-sm text-[#24303f] flex items-center">
                                            <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center mr-2">
                                                ID
                                            </span>
                                            {requestStatus.cardDetails?.userId || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                                        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Device ID</p>
                                        <p className="font-medium text-sm text-[#24303f] truncate">
                                            {requestStatus.cardDetails?.deviceId || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                                    <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Face ID</p>
                                    <div className="relative">
                                        <p className="font-mono text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap">
                                            {requestStatus.cardDetails?.faceId || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="mt-3 bg-red-50 rounded-lg p-3 border border-red-100 shadow-sm">
                                    <p className="text-xs uppercase text-red-500 font-semibold mb-1">Error Details</p>
                                    <p className="font-medium text-sm text-red-700">
                                        {requestStatus.cardDetails?.errorDetails || 'An error occurred during RFID card registration.'}
                                    </p>
                                </div>
                                
                                <div className="mt-4 text-center">
                                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-50 text-red-700">
                                        <span className="w-4 h-4 mr-1.5 text-red-600 flex items-center justify-center font-bold">!</span>
                                        Registration Failed
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                            <p className="text-red-700 flex items-center">
                                <span className="w-5 h-5 mr-2 text-red-600 bg-red-200 rounded-full flex items-center justify-center font-bold">!</span>
                                {requestStatus.message}
                            </p>
                            <p className="text-red-600 text-sm mt-2">
                                Please try using a different RFID card that is not already registered.
                            </p>
                        </div>
                        
                        <div className="flex justify-end">
                            <button
                                onClick={resetForm}
                                className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-150 font-medium shadow-sm flex items-center"
                            >
                                <MdClose className="mr-2" />
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
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] ${
                    toastType === 'error' 
                        ? 'bg-red-500 text-white' 
                        : toastType === 'success' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-500 text-white'
                } px-6 py-3 rounded-lg shadow-lg flex items-start max-w-md ${toastAnimation}`}>
                    {toastType === 'error' && <span className="w-5 h-5 mr-2 bg-white text-red-500 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5">!</span>}
                    {toastType === 'success' && <MdCheck className="mr-2 w-5 h-5 flex-shrink-0 mt-0.5" />}
                    <span className="font-medium whitespace-pre-line">{toastMessage}</span>
                </div>
            )}
            
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-auto my-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-[#24303f]">
                        {currentStep === 1 ? "Add New RFID Card" : 
                         currentStep === 2 ? "Enter Card Information" : 
                         currentStep === 3 ? "RFID Card Registration" :
                         currentStep === 4 ? "Registration Complete" : "RFID Card Registration Failed"}
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600 font-medium"
                    >
                        <MdClose className="w-6 h-6" />
                    </button>
                </div>

                {renderStepContent()}
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
