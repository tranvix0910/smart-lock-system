import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { MdClose, MdVisibility, MdVisibilityOff, MdCheck, MdArrowForward, MdArrowBack } from 'react-icons/md'
import wifiConfigImg from '../../assets/images/wifiConfig.png'
import deviceInfoImg from '../../assets/images/deviceInfo.png'

const AddDeviceModal = ({ 
    isOpen, 
    onClose, 
    onSubmit
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
        }
    }, [isOpen])

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
                        <h3 className="text-sm font-medium text-gray-800">Instructions for adding a new device</h3>
                        <div className="space-y-6">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#ebf45d] rounded-full flex items-center justify-center text-[#24303f] font-semibold">1</div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800">Connect Wifi For Device</h4>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Open browser and access the IP displayed on the screen and connect Wifi for the device.
                                    </p>
                                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                        <img 
                                            src={wifiConfigImg}
                                            alt="Wifi Configuration Interface" 
                                            className="w-full h-auto max-h-[300px] object-contain bg-white p-2"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#ebf45d] rounded-full flex items-center justify-center text-[#24303f] font-semibold">2</div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-800">Enter Device Information</h4>
                                    <p className="text-sm text-gray-600 mb-3">After connecting Wifi, the information will be displayed below, please fill it in the form after clicking Next!</p>
                                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                        <img 
                                            src={deviceInfoImg}
                                            alt="Device Information Interface" 
                                            className="w-full h-auto max-h-[300px] object-contain bg-white p-2"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#ebf45d] rounded-full flex items-center justify-center text-[#24303f] font-semibold">3</div>
                                <div>
                                    <h4 className="font-medium text-gray-800">Confirm and complete</h4>
                                    <p className="text-sm text-gray-600">The system will automatically create a collection and set up the device</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={nextStep}
                                className="px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150 flex items-center"
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
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:border-[#ebf45d] transition-colors duration-150 flex items-center"
                            >
                                <MdArrowBack className="mr-2" />
                                Back
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150 flex items-center"
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
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        setupStatus.collection === 'success' ? 'bg-green-100 text-green-600' :
                                        setupStatus.collection === 'error' ? 'bg-red-100 text-red-600' :
                                        'bg-[#ebf45d] text-[#24303f]'
                                    }`}>
                                        {setupStatus.collection === 'success' ? <MdCheck className="w-5 h-5" /> :
                                         setupStatus.collection === 'error' ? '!' :
                                         <div className="w-4 h-4 border-2 border-[#24303f] border-t-transparent rounded-full animate-spin"></div>}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800">Create Collection</h4>
                                        <p className="text-sm text-gray-600">
                                            {setupStatus.collection === 'success' ? 'Successfully created collection' :
                                             setupStatus.collection === 'error' ? 'Error creating collection' :
                                             'Creating collection...'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        setupStatus.device === 'success' ? 'bg-green-100 text-green-600' :
                                        setupStatus.device === 'error' ? 'bg-red-100 text-red-600' :
                                        'bg-[#ebf45d] text-[#24303f]'
                                    }`}>
                                        {setupStatus.device === 'success' ? <MdCheck className="w-5 h-5" /> :
                                         setupStatus.device === 'error' ? '!' :
                                         <div className="w-4 h-4 border-2 border-[#24303f] border-t-transparent rounded-full animate-spin"></div>}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800">Setting up device</h4>
                                        <p className="text-sm text-gray-600">
                                            {setupStatus.device === 'success' ? 'Successfully set up device' :
                                             setupStatus.device === 'error' ? 'Error setting up device' :
                                             'Setting up device...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150"
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
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
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
    isSubmitting: PropTypes.bool.isRequired
}

export default AddDeviceModal
