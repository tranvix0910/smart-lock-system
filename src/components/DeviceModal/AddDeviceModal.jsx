import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { MdClose, MdVisibility, MdVisibilityOff, MdCheck, MdArrowForward, MdArrowBack, MdError } from 'react-icons/md'
import wifiConfigImg from '../../assets/images/wifiConfig.png'
import deviceInfoImg from '../../assets/images/deviceInfo.png'

const AddDeviceModal = ({ 
    isOpen, 
    onClose, 
    onSubmit,
    isSubmitting,
    error
}) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [newDevice, setNewDevice] = useState({
        deviceName: '',
        location: '',
        deviceId: '',
        macAddress: '',
        secretKey: ''
    })
    const [showSecretKey, setShowSecretKey] = useState(false)
    const [setupStatus, setSetupStatus] = useState({
        collection: 'pending',
        device: 'pending'
    })
    const [modalError, setModalError] = useState(null)

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(1)
            setNewDevice({
                deviceName: '',
                location: '',
                deviceId: '',
                macAddress: '',
                secretKey: ''
            })
            setShowSecretKey(false)
            setSetupStatus({
                collection: 'pending',
                device: 'pending'
            })
            setModalError(null)
        }
    }, [isOpen])

    // Automatically close modal when error occurs
    useEffect(() => {
        if (error) {
            // Check if error is about deviceId already existing
            if (error.includes('deviceId already exists')) {
                // Set custom error message only in modal
                setModalError('Device with this ID already exists')
                
                // Immediately show error indicators
                setSetupStatus({
                    collection: 'error',
                    device: 'error'
                });
                
                // Auto close after delay
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                // For other errors, use the original error message
                setModalError(error)
                setSetupStatus({
                    collection: 'error',
                    device: 'error'
                });
            }
        }
    }, [error, onClose]);

    const handleSubmit = (e) => {
        e.preventDefault()
        setCurrentStep(3)
        onSubmit(newDevice)
    }

    const handleCancel = () => {
        onClose()
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
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Instructions for adding a new device</h3>
                        
                        <div className="relative">
                            {/* Left vertical line with gradient */}
                            <div className="absolute left-[24px] top-6 bottom-6 w-1 bg-gradient-to-b from-[#ebf45d] via-[#5dbfeb] to-green-400 rounded-full"></div>
                            
                            <div className="space-y-8">
                                {/* Step 1 */}
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#ebf45d] flex items-center justify-center text-[#24303f] font-bold text-lg shadow-md z-10">1</div>
                                    <div className="ml-4 bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-100 flex-1">
                                        <h4 className="font-semibold text-[#24303f] text-lg mb-2">Connect WiFi For Device</h4>
                                        
                                        <div className="flex flex-row items-start gap-3">
                                            {/* Instructions on left */}
                                            <div className="w-3/5 flex flex-col justify-center h-full">
                                                <p className="text-gray-600 text-sm">
                                                    1. Open browser on your computer
                                                </p>
                                                <p className="text-gray-600 text-sm mt-1">
                                                    2. Access the IP address shown on the device screen
                                                </p>
                                                <p className="text-gray-600 text-sm mt-1">
                                                    3. Enter the WiFi credentials for your network
                                                </p>
                                                <p className="text-gray-600 text-sm mt-1">
                                                    4. Click &quot;Save config&quot; to connect
                                                </p>
                                            </div>
                                            
                                            {/* Image on right */}
                                            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm w-2/5 flex items-center justify-center bg-white">
                                                <img 
                                                    src={wifiConfigImg}
                                                    alt="Wifi Configuration Interface" 
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
                                        <h4 className="font-semibold text-[#24303f] text-lg mb-1">Enter Device Information</h4>
                                        
                                        <div className="flex flex-row items-start gap-3">
                                            {/* Instructions on left */}
                                            <div className="w-3/5">
                                                <p className="text-gray-600 text-sm">
                                                    After connecting WiFi, the device will display its information.
                                                </p>
                                                <div className="mt-2 bg-white p-2 rounded-lg border border-gray-200">
                                                    <p className="text-xs font-medium text-gray-700">Required information:</p>
                                                    <ul className="list-disc ml-4 text-xs text-gray-600 mt-1">
                                                        <li>Device ID</li>
                                                        <li>MAC Address</li>
                                                        <li>Secret Key</li>
                                                    </ul>
                                                </div>
                                                <p className="text-gray-600 text-xs mt-2 italic">
                                                    Note these details for the next step
                                                </p>
                                            </div>
                                            
                                            {/* Image on right */}
                                            <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm w-2/5 flex items-center justify-center bg-white">
                                                <img 
                                                    src={deviceInfoImg}
                                                    alt="Device Information Interface" 
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
                                            Fill in the device details on the next screen and submit to complete setup.
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
                                Device Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter the device name"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                                value={newDevice.deviceName}
                                onChange={(e) => setNewDevice(prev => ({ ...prev, deviceName: e.target.value }))}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                            </label>
                            <input
                                type="text"
                                placeholder="Enter the device location"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                                value={newDevice.location}
                                onChange={(e) => setNewDevice(prev => ({ ...prev, location: e.target.value }))}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Device ID
                            </label>
                            <input
                                type="text"
                                placeholder="Enter the device ID"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                                value={newDevice.deviceId}
                                onChange={(e) => setNewDevice(prev => ({ ...prev, deviceId: e.target.value }))}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                MAC Address
                            </label>
                            <input
                                type="text"
                                placeholder="XX:XX:XX:XX:XX:XX"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                                value={newDevice.macAddress}
                                onChange={(e) => setNewDevice(prev => ({ ...prev, macAddress: e.target.value }))}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Secret Key
                            </label>
                            <div className="relative">
                                <input
                                    type={showSecretKey ? "text" : "password"}
                                    placeholder="Enter the secret key"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d] pr-10"
                                    value={newDevice.secretKey}
                                    onChange={(e) => setNewDevice(prev => ({ ...prev, secretKey: e.target.value }))}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowSecretKey(!showSecretKey)}
                                >
                                    {showSecretKey ? (
                                        <MdVisibilityOff className="h-5 w-5" />
                                    ) : (
                                        <MdVisibility className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
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
                            >
                                Next
                                <MdArrowForward className="ml-2" />
                            </button>
                        </div>
                    </form>
                )
            case 3:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-800">Setting up device</h3>
                        
                        {/* Show error message if exists - Improved design */}
                        {modalError && (
                            <div className="p-5 bg-red-50 text-red-700 border border-red-200 rounded-lg shadow-sm">
                                <div className="flex items-start">
                                    <div className="bg-red-100 rounded-full p-2 mr-3 flex-shrink-0">
                                        <MdError className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-red-700 text-lg mb-1">Error Setting Up Device</h4>
                                        <p className="text-red-600 mb-2">{modalError}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        setupStatus.collection === 'success' ? 'bg-green-100 text-green-600' :
                                        setupStatus.collection === 'error' ? 'bg-red-100 text-red-600' :
                                        'bg-[#ebf45d] text-[#24303f]'
                                    }`}>
                                        {setupStatus.collection === 'success' ? <MdCheck className="w-6 h-6" /> :
                                         setupStatus.collection === 'error' ? <MdClose className="w-6 h-6" /> :
                                         <div className="w-5 h-5 border-2 border-[#24303f] border-t-transparent rounded-full animate-spin"></div>}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800 text-base">Create Collection</h4>
                                        <p className="text-sm text-gray-600">
                                            {setupStatus.collection === 'success' ? 'Successfully created collection' :
                                             setupStatus.collection === 'error' && modalError === 'Device with this ID already exists' ? 'Failed: Device ID already exists in collection' :
                                             setupStatus.collection === 'error' ? 'Error creating collection' :
                                             'Creating collection...'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        setupStatus.device === 'success' ? 'bg-green-100 text-green-600' :
                                        setupStatus.device === 'error' ? 'bg-red-100 text-red-600' :
                                        'bg-[#ebf45d] text-[#24303f]'
                                    }`}>
                                        {setupStatus.device === 'success' ? <MdCheck className="w-6 h-6" /> :
                                         setupStatus.device === 'error' ? <MdClose className="w-6 h-6" /> :
                                         <div className="w-5 h-5 border-2 border-[#24303f] border-t-transparent rounded-full animate-spin"></div>}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800 text-base">Setting up device</h4>
                                        <p className="text-sm text-gray-600">
                                            {setupStatus.device === 'success' ? 'Successfully set up device' :
                                             setupStatus.device === 'error' && modalError === 'Device with this ID already exists' ? 'Failed: Device with this ID is already registered' :
                                             setupStatus.device === 'error' ? 'Error setting up device' :
                                             isSubmitting ? 'Setting up device...' : 'Waiting for setup to begin...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleCancel}
                                className="px-5 py-2.5 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150 font-medium"
                                disabled={isSubmitting && !modalError}
                            >
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
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-auto my-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-[#24303f]">Add New Device</h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <MdClose className="w-6 h-6" />
                    </button>
                </div>

                {renderStepContent()}
            </div>
        </div>
    )
}

AddDeviceModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    error: PropTypes.string
}

export default AddDeviceModal
