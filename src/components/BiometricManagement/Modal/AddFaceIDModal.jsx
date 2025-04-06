import { useState } from 'react'
import { MdClose, MdCloudUpload } from 'react-icons/md'
import { MESSAGES } from '../../../utils/constants'
import { postIndexFace } from '../../../api/postIndexFace'
import PropTypes from 'prop-types'

const AddFaceIDModal = ({ 
    isOpen, 
    onClose, 
    userId, 
    devices, 
    isLoadingDevices, 
    onSuccess, 
    showMessage 
}) => {
    const [isUploading, setIsUploading] = useState(false)
    const [newFaceId, setNewFaceId] = useState({
        username: '',
        deviceId: '',
        image: null
    })

    const handleUsernameChange = (e) => {
        setNewFaceId(prev => ({
            ...prev,
            username: e.target.value,
            deviceId: ''
        }))
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            setNewFaceId(prev => ({
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
            const response = await postIndexFace(
                userId,
                newFaceId.deviceId,
                newFaceId.username,
                newFaceId.image
            )

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#24303f]">Add New Face ID</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <MdClose className="w-6 h-6" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="Enter username"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                            value={newFaceId.username}
                            onChange={handleUsernameChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Device
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                            value={newFaceId.deviceId}
                            onChange={(e) => setNewFaceId(prev => ({ ...prev, deviceId: e.target.value }))}
                            disabled={isLoadingDevices}
                        >
                            <option value="">Select device</option>
                            {devices.map(device => (
                                <option 
                                    key={device.deviceId} 
                                    value={device.deviceId}
                                    className="bg-white"
                                >
                                    {device.deviceName} - {device.location}
                                </option>
                            ))}
                        </select>
                        {isLoadingDevices && (
                            <p className="text-sm text-gray-500 mt-1">Loading device list...</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Upload Face Image
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="face-image-upload"
                            />
                            <label 
                                htmlFor="face-image-upload"
                                className="cursor-pointer"
                            >
                                {newFaceId.image ? (
                                    <div className="space-y-2">
                                        <img 
                                            src={URL.createObjectURL(newFaceId.image)} 
                                            alt="Preview" 
                                            className="max-h-40 mx-auto rounded-lg"
                                        />
                                        <p className="text-sm text-gray-500">Click to change image</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <MdCloudUpload className="w-16 h-16 mx-auto text-gray-400" />
                                        <p className="text-sm text-gray-500">
                                            Click to upload face image
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Supported: JPG, PNG
                                        </p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-200 rounded-lg hover:border-[#ebf45d] transition-colors duration-150"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150"
                            disabled={isUploading || !newFaceId.username || !newFaceId.deviceId || !newFaceId.image}
                        >
                            {isUploading ? 'Uploading...' : 'Save'}
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
