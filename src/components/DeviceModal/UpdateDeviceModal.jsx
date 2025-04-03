import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { MdClose, MdLocationOn, MdDevices } from 'react-icons/md'

const UpdateDeviceModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    isSubmitting,
    device
}) => {
    const [updatedDevice, setUpdatedDevice] = useState({
        deviceName: '',
        location: ''
    })

    useEffect(() => {
        if (!isOpen || !device) {
            setUpdatedDevice({
                deviceName: '',
                location: ''
            })
        } else {
            setUpdatedDevice({
                deviceName: device.deviceName || '',
                location: device.location || ''
            })
        }
    }, [isOpen, device])

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit({
            ...updatedDevice,
            deviceId: device.deviceId
        })
    }

    const handleCancel = () => {
        onClose()
    }

    if (!isOpen || !device) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#24303f]">Update Device</h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <MdClose className="w-6 h-6" />
                    </button>
                </div>

                <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                        <MdDevices className="text-gray-600 w-5 h-5 mr-2" />
                        <span className="text-gray-600 font-medium">Device ID:</span>
                        <span className="ml-2 text-gray-800">{device.deviceId}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="text-gray-600 font-medium">MAC Address:</span>
                        <span className="ml-2 text-gray-800">{device.macAddress}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Device Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter device name"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                            value={updatedDevice.deviceName}
                            onChange={(e) => setUpdatedDevice(prev => ({ ...prev, deviceName: e.target.value }))}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                        </label>
                        <div className="relative">
                            <MdLocationOn className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Enter device location"
                                className="w-full px-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                                value={updatedDevice.location}
                                onChange={(e) => setUpdatedDevice(prev => ({ ...prev, location: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-200 rounded-lg hover:border-[#ebf45d] transition-colors duration-150"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150 flex items-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                'Save changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

UpdateDeviceModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    device: PropTypes.object
}

export default UpdateDeviceModal
