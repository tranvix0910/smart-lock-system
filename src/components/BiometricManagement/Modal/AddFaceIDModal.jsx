import { useState } from 'react'
import { MdClose, MdCloudUpload, MdFace, MdCheck } from 'react-icons/md'
import { MESSAGES } from '../../../utils/constants'
import { postIndexFace } from '../../../api/postIndexFace'
import PropTypes from 'prop-types'

const AddFaceIDModal = ({ isOpen, onClose, userId, devices, isLoadingDevices, onSuccess, showMessage }) => {
    const [isUploading, setIsUploading] = useState(false)
    const [newFaceId, setNewFaceId] = useState({
        username: '',
        deviceId: '',
        image: null
    })

    const handleUsernameChange = (e) => {
        setNewFaceId((prev) => ({
            ...prev,
            username: e.target.value,
            deviceId: ''
        }))
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            setNewFaceId((prev) => ({
                ...prev,
                image: file
            }))
        }
    }

    const handleSave = async () => {
        if (!newFaceId.username || !newFaceId.deviceId || !newFaceId.image) {
            showMessage(MESSAGES.ERROR.REQUIRED_FIELDS, 'error')
            return
        }

        try {
            setIsUploading(true)
            const response = await postIndexFace(userId, newFaceId.deviceId, newFaceId.username, newFaceId.image)

            if (!response.success) {
                throw new Error(response.message || MESSAGES.ERROR.NETWORK_ERROR)
            }

            const newFace = {
                id: Date.now(),
                userId: newFaceId.username,
                userName: newFaceId.username,
                deviceId: newFaceId.deviceId,
                createdAt: new Date().toISOString(),
                imageUrl: URL.createObjectURL(newFaceId.image)
            }

            onSuccess(newFace)
            handleClose()
            showMessage(MESSAGES.SUCCESS.CREATED, 'success')
        } catch (error) {
            showMessage(error.message || MESSAGES.ERROR.NETWORK_ERROR, 'error')
        } finally {
            setIsUploading(false)
        }
    }

    const handleClose = () => {
        setNewFaceId({ username: '', deviceId: '', image: null })
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[95vh] relative overflow-hidden flex flex-col">
                {/* Header - Gradient style */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-blue-500 rounded-full p-2 sm:p-2.5 mr-2 sm:mr-3 shadow-sm">
                                <MdFace className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                                    Face ID Registration
                                </p>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Add New Face ID</h2>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full transition-colors"
                        >
                            <MdClose className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content area with overflow scroll */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                placeholder="Enter username"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                value={newFaceId.username}
                                onChange={handleUsernameChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Device</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                value={newFaceId.deviceId}
                                onChange={(e) => setNewFaceId((prev) => ({ ...prev, deviceId: e.target.value }))}
                                disabled={isLoadingDevices}
                            >
                                <option value="">Select device</option>
                                {devices.map((device) => (
                                    <option key={device.deviceId} value={device.deviceId} className="bg-white">
                                        {device.deviceName} - {device.location}
                                    </option>
                                ))}
                            </select>
                            {isLoadingDevices && (
                                <div className="flex items-center mt-2 text-sm text-gray-500">
                                    <div className="w-4 h-4 mr-2 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                                    Loading device list...
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Face Image</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 transition-colors hover:border-blue-400">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="face-image-upload"
                                />
                                <label htmlFor="face-image-upload" className="cursor-pointer block">
                                    {newFaceId.image ? (
                                        <div className="space-y-3">
                                            <img
                                                src={URL.createObjectURL(newFaceId.image)}
                                                alt="Preview"
                                                className="max-h-48 mx-auto rounded-lg shadow-sm"
                                            />
                                            <div className="flex items-center justify-center text-sm text-gray-500">
                                                <MdCloudUpload className="w-5 h-5 mr-1" />
                                                Click to change image
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 text-center">
                                            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center">
                                                <MdCloudUpload className="w-8 h-8 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    Click to upload face image
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Supported formats: JPG, PNG
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-4 sm:px-6 py-4 bg-gray-50">
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isUploading || !newFaceId.username || !newFaceId.deviceId || !newFaceId.image}
                            className={`px-4 py-2 text-sm rounded-lg flex items-center transition-colors duration-150 ${
                                isUploading || !newFaceId.username || !newFaceId.deviceId || !newFaceId.image
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                        >
                            {isUploading ? (
                                <>
                                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <MdCheck className="w-4 h-4 mr-2" />
                                    Save
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

AddFaceIDModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    devices: PropTypes.array.isRequired,
    isLoadingDevices: PropTypes.bool.isRequired,
    onSuccess: PropTypes.func.isRequired,
    showMessage: PropTypes.func.isRequired
}

export default AddFaceIDModal
