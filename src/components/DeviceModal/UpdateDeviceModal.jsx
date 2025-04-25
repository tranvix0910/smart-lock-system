import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { MdClose, MdLocationOn, MdDevices, MdEdit, MdCheck } from 'react-icons/md'

const UpdateDeviceModal = ({ isOpen, onClose, onSubmit, isSubmitting, device }) => {
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[95vh] relative overflow-hidden flex flex-col">
                {/* Header - Gradient style */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-blue-500 rounded-full p-2 sm:p-2.5 mr-2 sm:mr-3 shadow-sm">
                                <MdEdit className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                                    Device Update
                                </p>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Edit Device Details</h2>
                            </div>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full transition-colors"
                        >
                            <MdClose className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content area with overflow scroll */}
                <div className="flex-1 overflow-y-auto">
                    {/* Device Info Card */}
                    <div className="px-4 sm:px-6 pt-4 sm:pt-5">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <MdDevices className="w-6 h-6 text-gray-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900">Device ID: {device.deviceId}</p>
                                    <p className="text-sm text-gray-500">MAC: {device.macAddress}</p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter device name"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                    value={updatedDevice.deviceName}
                                    onChange={(e) =>
                                        setUpdatedDevice((prev) => ({ ...prev, deviceName: e.target.value }))
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <div className="relative">
                                    <MdLocationOn className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Enter device location"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                        value={updatedDevice.location}
                                        onChange={(e) =>
                                            setUpdatedDevice((prev) => ({ ...prev, location: e.target.value }))
                                        }
                                        required
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-4 sm:px-6 py-4 bg-gray-50">
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-150 flex items-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <MdCheck className="w-4 h-4 mr-2" />
                                    Save changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
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
