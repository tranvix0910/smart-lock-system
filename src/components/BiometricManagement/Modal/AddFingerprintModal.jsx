import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import { MdClose, MdFingerprint, MdArrowBack, MdArrowForward, MdCheckCircle } from 'react-icons/md'
import { getRequestAddFingerprint } from '../../../api/postRequestAddFingerprint'
import { getDeviceByUserId } from '../../../api/getDeviceByUserID'
import { getFaceID } from '../../../api/getFaceID'
import socket from '../../../config/websocket'

const AddFingerprintModal = ({ 
    isOpen, 
    onClose, 
    userId,
    onSuccess
}) => {
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
    const currentRequestRef = useRef(null);
    
    // Handle fingerprint confirmation from socket
    const handleFingerprintConfirm = useCallback((data) => {
        if (!currentRequestRef.current) return;
        
        const { userId: receivedUserId, deviceId: receivedDeviceId, faceId: receivedFaceId, status } = data;
        const { userId: requestedUserId, deviceId: requestedDeviceId, faceId: requestedFaceId } = currentRequestRef.current;
        
        console.log('Fingerprint confirmation received:', data);
        console.log('Current request:', currentRequestRef.current);
        
        if (receivedUserId === requestedUserId && 
            receivedDeviceId === requestedDeviceId && 
            receivedFaceId === requestedFaceId) {
            
            if (status === 'ADD FINGERPRINT ACCEPTED FROM CLIENT') {
                // Success case
                setFingerprintId(`FP${Date.now().toString().slice(-6)}`); // Generate a temporary fingerprint ID
                setRequestStatus({ 
                    message: 'Request fingerprint successfully registered!', 
                    type: 'success',
                    showFingerplaceGuide: true,
                    success: true,
                    fingerSaved: false,
                    fingerprintDetails: null
                });
                
                // Auto-hide success message after 3 seconds
                setTimeout(() => {
                    setRequestStatus(prev => ({
                        ...prev,
                        message: '',
                        success: true // Keep true to maintain state but hide the message
                    }));
                }, 3000);
            } else {
                // Failed case
                setRequestStatus({ 
                    message: 'Request fingerprint failed. Please try again.', 
                    type: 'error',
                    showFingerplaceGuide: false,
                    success: false,
                    fingerSaved: false,
                    fingerprintDetails: null
                });
            }
            
            // Request is complete
            setIsRequestingFingerprint(false);
            currentRequestRef.current = null;
        }
    }, []);

    // Handle fingerprint saved event
    const handleFingerprintSaved = useCallback((data) => {
        console.log('Fingerprint saved event received:', data);
        
        if (data.status === 'SUCCESS') {
            setFingerprintId(data.fingerprintId);
            setRequestStatus(prev => ({
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
            }));
            
            // Hide messages after 3 seconds
            setTimeout(() => {
                setRequestStatus(prev => ({
                    ...prev,
                    message: '',
                    showFingerplaceGuide: false
                }));
            }, 3000);
        }
    }, []);
    
    // Setup socket event listener
    useEffect(() => {
        if (!isOpen) return;
        
        // Listen for fingerprint confirmation events
        socket.on('addFingerprintConfirmFromClient', handleFingerprintConfirm);
        socket.on('fingerprintSaved', handleFingerprintSaved);
        
        // Clean up
        return () => {
            socket.off('addFingerprintConfirmFromClient', handleFingerprintConfirm);
            socket.off('fingerprintSaved', handleFingerprintSaved);
        };
    }, [isOpen, handleFingerprintConfirm, handleFingerprintSaved]);

    // Fetch face IDs when component mounts
    useEffect(() => {
        const loadFaceIDs = async () => {
            if (!isOpen) return;
            
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

    const handleSave = () => {
        if (!selectedDevice || !selectedFaceID || !fingerprintId) return;
        
        const selectedFace = faceIDs.find(face => face.faceId === selectedFaceID);
        
        const newFingerprint = {
            id: Date.now(), // ID tạm thời
            userId: selectedFace?.userId || userId,
            userName: selectedFace?.userName || '',
            fingerprintId: fingerprintId,
            deviceId: selectedDevice,
            faceId: selectedFaceID,
            status: 'Active',
            createdAt: new Date().toISOString()
        };
        
        onSuccess(newFingerprint);
        resetForm();
    };

    const handleRequestAddFingerprint = async () => {
        if (!selectedDevice || !selectedFaceID) return;
        
        try {
            setIsRequestingFingerprint(true);
            setRequestStatus({ message: '', type: 'info', showFingerplaceGuide: false, success: false });
            
            const targetUserId = selectedFaceID ? 
                faceIDs.find(face => face.faceId === selectedFaceID)?.userId : 
                userId;
            
            // Store the current request details for matching with socket response
            currentRequestRef.current = {
                userId: targetUserId,
                deviceId: selectedDevice,
                faceId: selectedFaceID
            };
            
            // Send the request
            const response = await getRequestAddFingerprint(targetUserId, selectedDevice, selectedFaceID);
            console.log('Request sent:', response);
            
            if (!response.success) {
                // If API call failed, we clear the waiting state
                setIsRequestingFingerprint(false);
                currentRequestRef.current = null;
                setRequestStatus({ 
                    message: response.message || 'Failed to send request. Please try again.', 
                    type: 'error',
                    showFingerplaceGuide: false,
                    success: false 
                });
            }
            // If success, we wait for socket response in handleFingerprintConfirm
            
        } catch (error) {
            console.error('Error requesting add fingerprint:', error);
            setIsRequestingFingerprint(false);
            currentRequestRef.current = null;
            setRequestStatus({ 
                message: 'An error occurred. Please try again.', 
                type: 'error',
                showFingerplaceGuide: false,
                success: false 
            });
        }
    };

    const resetForm = () => {
        setCurrentStep(1);
        setFingerprintId('');
        setSelectedDevice('');
        setSelectedFaceID('');
        setRequestStatus({ message: '', type: 'info', showFingerplaceGuide: false, success: false });
        setIsRequestingFingerprint(false);
        currentRequestRef.current = null;
        onClose();
    };

    // Cleanup on unmount or when modal closes
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const goToNextStep = () => {
        if (currentStep === 1) {
            setCurrentStep(2);
        } else if (currentStep === 2) {
            setCurrentStep(3);
        }
    }

    const goToPreviousStep = () => {
        if (currentStep === 3) {
            setCurrentStep(2);
        } else if (currentStep === 2) {
            setCurrentStep(1);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#24303f]">
                        {currentStep === 1 ? "Add New Fingerprint" : currentStep === 2 ? "Select Information" : "Capture Fingerprint"}
                    </h2>
                    <button
                        onClick={resetForm}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <MdClose className="w-6 h-6" />
                    </button>
                </div>

                {currentStep === 1 ? (
                    // Step 1: Instruction
                    <div className="space-y-6">
                        <h3 className="text-sm font-medium text-gray-800">Instructions for adding a new fingerprint</h3>
                        <div className="space-y-6">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#ebf45d] rounded-full flex items-center justify-center text-[#24303f] font-semibold">1</div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-800">Select Device and Face ID</h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Select a device and Face ID to associate with this fingerprint.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#ebf45d] rounded-full flex items-center justify-center text-[#24303f] font-semibold">2</div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-800">Scan Fingerprint</h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Place the user&apos;s finger on the scanner to capture the fingerprint.
                                    </p>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <div className="w-full max-w-[200px] mx-auto">
                                            <MdFingerprint className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">
                                                Place your finger on the scanner
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#ebf45d] rounded-full flex items-center justify-center text-[#24303f] font-semibold">3</div>
                                <div>
                                    <h4 className="font-medium text-gray-800">Save and Complete</h4>
                                    <p className="text-sm text-gray-600">
                                        Verify the fingerprint information and save to complete the process.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end">
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:border-[#ebf45d] transition-colors duration-150 flex items-center mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={goToNextStep}
                                className="px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150 flex items-center"
                            >
                                Next
                                <MdArrowForward className="ml-2" />
                            </button>
                        </div>
                    </div>
                ) : currentStep === 2 ? (
                    // Step 2: Input Information
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Face ID
                            </label>
                            <select 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                                value={selectedFaceID}
                                onChange={(e) => setSelectedFaceID(e.target.value)}
                                disabled={isLoadingFaceIDs}
                            >
                                <option value="">Select Face ID</option>
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
                                Device
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                                value={selectedDevice}
                                onChange={(e) => setSelectedDevice(e.target.value)}
                                disabled={isLoadingDevices}
                            >
                                <option value="">Select device</option>
                                {devices && devices.length > 0 ? (
                                    devices.map(device => (
                                        <option 
                                            key={device.deviceId} 
                                            value={device.deviceId}
                                            className="bg-white"
                                        >
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
                        
                        <div className="flex justify-between gap-2 mt-6">
                            <button
                                onClick={goToPreviousStep}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:border-[#ebf45d] transition-colors duration-150 flex items-center"
                            >
                                <MdArrowBack className="mr-2" />
                                Back
                            </button>
                            <button
                                onClick={async () => {
                                    await handleRequestAddFingerprint();
                                    goToNextStep();
                                }}
                                className="px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150"
                                disabled={!selectedDevice || !selectedFaceID || isRequestingFingerprint}
                            >
                                Send Request
                            </button>
                        </div>
                    </div>
                ) : (
                    // Step 3: Fingerprint Scanner and Messages
                    <div className="space-y-4">
                        {/* Loading indicator and status message */}
                        {isRequestingFingerprint && (
                            <div className="flex items-center justify-center bg-gray-50 border border-gray-100 rounded-md p-3 shadow-sm">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#24303f] mr-3"></div>
                                <p className="text-gray-700 text-sm font-medium">
                                    Waiting for response from Smart Lock - {selectedDevice}
                                </p>
                            </div>
                        )}
                        
                        {/* Success message */}
                        {requestStatus.success && requestStatus.message && !requestStatus.fingerSaved && (
                            <div className="p-4 rounded-lg bg-green-100 text-green-700 border border-green-200">
                                <p className="font-medium">{requestStatus.message}</p>
                            </div>
                        )}
                        
                        {/* Error message - Only show if there's an error and we're not showing the success message */}
                        {requestStatus.message && !requestStatus.success && !isRequestingFingerprint && !requestStatus.showFingerplaceGuide && (
                            <div className={`p-4 rounded-lg ${
                                (() => {
                                    switch (requestStatus.type) {
                                        case 'error':
                                            return 'bg-red-100 text-red-700 border border-red-200';
                                        case 'warning':
                                            return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
                                        default:
                                            return 'bg-gray-100 text-gray-700 border border-gray-200';
                                    }
                                })()
                            }`}>
                                <p className="font-medium">{requestStatus.message}</p>
                                {requestStatus.additionalMessage && (
                                    <p className="mt-1 font-normal italic">{requestStatus.additionalMessage}</p>
                                )}
                            </div>
                        )}
                        
                        {/* Fingerplace guide with spinner or checkmark */}
                        {requestStatus.showFingerplaceGuide && (
                            <div className={`flex items-center justify-center ${
                                requestStatus.fingerSaved 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            } rounded-lg p-4 shadow-sm`}>
                                
                                {requestStatus.fingerSaved ? (
                                    <MdCheckCircle className="h-5 w-5 text-green-700 mr-3" />
                                ) : (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"></div>
                                )}
                                
                                <p className="text-sm font-medium">
                                    Please place your finger on the fingerprint sensor.
                                </p>
                            </div>
                        )}
                        
                        {/* Fingerprint Details */}
                        {requestStatus.fingerSaved && requestStatus.fingerprintDetails && (
                            <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden shadow">
                                <div className="bg-gradient-to-r from-green-500 to-blue-500 px-4 py-3 text-white">
                                    <h3 className="font-medium flex items-center">
                                        <MdFingerprint className="mr-2 text-white" />
                                        Fingerprint Registered Successfully
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <div className="mb-4">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                                                <MdFingerprint className="w-12 h-12 text-blue-500" />
                                            </div>
                                        </div>
                                        <div className="text-center mb-4">
                                            <h4 className="font-semibold text-lg text-gray-800">
                                                {requestStatus.fingerprintDetails.userName}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                User ID: {requestStatus.fingerprintDetails.userId}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                                            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Fingerprint ID</p>
                                            <p className="font-medium text-sm text-[#24303f] flex items-center">
                                                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mr-2">
                                                    <MdFingerprint className="w-3 h-3" />
                                                </span>
                                                {requestStatus.fingerprintDetails.fingerprintId}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                                            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Device ID</p>
                                            <p className="font-medium text-sm text-[#24303f] truncate">
                                                {requestStatus.fingerprintDetails.deviceId}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
                                        <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Face ID</p>
                                        <div className="relative">
                                            <p className="font-mono text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap">
                                                {requestStatus.fingerprintDetails.faceId}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {requestStatus.fingerprintDetails.fingerprintTemplate && (
                                        <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                                            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Template Hash</p>
                                            <div className="relative">
                                                <p className="font-mono text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap">
                                                    {requestStatus.fingerprintDetails.fingerprintTemplate.length > 40 
                                                        ? requestStatus.fingerprintDetails.fingerprintTemplate.substring(0, 40) + '...' 
                                                        : requestStatus.fingerprintDetails.fingerprintTemplate}
                                                </p>
                                                <span className="absolute right-2 top-2 text-xs text-blue-500">
                                                    Hash verified
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="mt-4 text-center">
                                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700">
                                            <MdCheckCircle className="w-4 h-4 mr-1.5 text-green-600" />
                                            Ready to use
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between gap-2 mt-6">
                            {!requestStatus.fingerSaved && (
                                <button
                                    onClick={goToPreviousStep}
                                    className="px-4 py-2 border border-gray-200 rounded-lg hover:border-[#ebf45d] transition-colors duration-150 flex items-center"
                                >
                                    <MdArrowBack className="mr-2" />
                                    Back
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                className={`px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150 ${requestStatus.fingerSaved ? "ml-auto" : ""}`}
                                disabled={!requestStatus.fingerSaved}
                            >
                                Finish
                            </button>
                        </div>
                    </div>
                )}
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
