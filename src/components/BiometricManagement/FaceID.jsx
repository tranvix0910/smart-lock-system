import { useState, useEffect } from 'react'
import { 
    MdFace,
    MdPersonAdd, 
    MdDelete, 
    MdRefresh,
    MdSearch,
    MdClose,
    MdImage,
    MdCloudUpload
} from 'react-icons/md'
import { postIndexFace } from '../../api/postIndexFace'
import { getDeviceByUserId } from '../../api/getDeviceByUserID'
import { getFaceID } from '../../api/getFaceID'
import useUserAttributes from '../../hooks/useUserAttributes'
import { MESSAGES } from '../../utils/constants'
import { formatId } from '../../utils/formatters'

const FaceID = () => {
    const [faceIds, setFaceIds] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [devices, setDevices] = useState([])
    const [isLoadingDevices, setIsLoadingDevices] = useState(false)
    const [isLoadingFaces, setIsLoadingFaces] = useState(false)
    const [newFaceId, setNewFaceId] = useState({
        username: '',
        deviceId: '',
        image: null
    })

    const userAttributes = useUserAttributes()
    const userId = userAttributes?.sub

    const showMessage = (msg, type) => {
        setMessage(msg)
        setMessageType(type)
        setTimeout(() => {
            setMessage('')
            setMessageType('')
        }, 3000)
    }

    useEffect(() => {
        const loadData = async () => {
            if (!userId) return

            try {
                setIsLoadingDevices(true)
                const deviceList = await getDeviceByUserId(userId)
                if (deviceList && Array.isArray(deviceList)) {
                    setDevices(deviceList)
                }
            } catch (error) {
                console.error('Error loading devices:', error)
                showMessage(MESSAGES.ERROR.NETWORK_ERROR, 'error')
            } finally {
                setIsLoadingDevices(false)
            }

            try {
                setIsLoadingFaces(true)
                const response = await getFaceID(userId)
                
                if (response.success && response.data) {
                    const faceIDArray = Array.isArray(response.data) ? response.data : [response.data]
                    const formattedFaceIDs = faceIDArray.map(face => ({
                        id: face.faceId,
                        userId: face.userId,
                        userName: face.userName,
                        deviceId: face.deviceId,
                        status: 'Active',
                        createdAt: face.createdAt,
                        imageUrl: face.s3Url
                    }))
                    setFaceIds(formattedFaceIDs)
                }
            } catch (error) {
                console.error('Error loading Face IDs:', error)
                showMessage(MESSAGES.ERROR.NETWORK_ERROR, 'error')
            } finally {
                setIsLoadingFaces(false)
            }
        }

        loadData()
    }, [userId])

    const handleUsernameChange = (e) => {
        setNewFaceId(prev => ({
            ...prev,
            username: e.target.value,
            deviceId: ''
        }))
    }

    const filteredFaceIds = faceIds.filter(face => 
        face.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        face.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this Face ID?')) {
            setFaceIds(prev => prev.filter(face => face.id !== id))
        }
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

            setFaceIds(prev => [...prev, {
                id: Date.now(),
                userId: newFaceId.username,
                userName: newFaceId.username,
                deviceId: newFaceId.deviceId,
                status: 'Active',
                createdAt: new Date().toISOString(),
                imageUrl: URL.createObjectURL(newFaceId.image)
            }])

            setIsAddModalOpen(false)
            setNewFaceId({ username: '', deviceId: '', image: null })
            showMessage(MESSAGES.SUCCESS.CREATED, 'success')
        } catch (error) {
            showMessage(error.message || MESSAGES.ERROR.NETWORK_ERROR, 'error')
        } finally {
            setIsUploading(false)
        }
    }

    const handleReload = async () => {
        if (!userId) return;
        
        try {
            setIsLoadingDevices(true);
            setIsLoadingFaces(true);
            
            // Load devices
            const deviceList = await getDeviceByUserId(userId);
            if (deviceList && Array.isArray(deviceList)) {
                setDevices(deviceList);
            }
            
            // Load face IDs
            const response = await getFaceID(userId);
            if (response.success && response.data) {
                const faceIDArray = Array.isArray(response.data) ? response.data : [response.data];
                const formattedFaceIDs = faceIDArray.map(face => ({
                    id: face.faceId,
                    userId: face.userId,
                    userName: face.userName,
                    deviceId: face.deviceId,
                    status: 'Active',
                    createdAt: face.createdAt,
                    imageUrl: face.s3Url
                }));
                setFaceIds(formattedFaceIDs);
            }
            
            showMessage('Data refreshed successfully', 'success');
        } catch (error) {
            console.error('Error reloading data:', error);
            showMessage(MESSAGES.ERROR.NETWORK_ERROR, 'error');
        } finally {
            setIsLoadingDevices(false);
            setIsLoadingFaces(false);
        }
    };

    return (
        <div className="p-6">
            {message && (
                <div className={`mb-4 p-4 rounded-lg ${messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <MdFace className="w-8 h-8 text-[#24303f]" />
                    <h1 className="text-2xl font-semibold text-[#24303f]">Face ID Management</h1>
                </div>
                <p className="text-gray-500 mt-1">Manage and monitor all registered Face IDs</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full">
                        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or Device ID..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150"
                        >
                            <MdPersonAdd className="w-5 h-5" />
                            <span>Add New</span>
                        </button>
                        <button
                            className="p-2 text-[#24303f] border border-gray-200 rounded-lg hover:border-[#ebf45d] transition-colors duration-150"
                            onClick={handleReload}
                        >
                            <MdRefresh className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoadingFaces ? (
                        <div className="flex justify-center items-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#24303f]"></div>
                        </div>
                    ) : faceIds.length === 0 ? (
                        <div className="text-center p-8">
                            <MdFace className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No Face IDs</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new Face ID.</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-[#24303f] bg-[#ebf45d] hover:bg-[#d9e154] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ebf45d]"
                                >
                                    <MdPersonAdd className="-ml-1 mr-2 h-5 w-5" />
                                    Add New Face ID
                                </button>
                            </div>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredFaceIds.map((face) => (
                                    <tr key={face.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <MdFace className="w-5 h-5 mr-2 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {face.deviceId}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{face.userName}</div>
                                            <div className="text-sm text-gray-500">{formatId(face.userId)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => setSelectedImage(face.imageUrl)}
                                                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                            >
                                                <MdImage className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(face.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="p-1 text-red-600 hover:text-red-800"
                                                    onClick={() => handleDelete(face.id)}
                                                >
                                                    <MdDelete className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-[#24303f]">Add New Face ID</h2>
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false)
                                    setNewFaceId({ username: '', deviceId: '', image: null })
                                }}
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
                                    onClick={() => {
                                        setIsAddModalOpen(false)
                                        setNewFaceId({ username: '', deviceId: '', image: null })
                                    }}
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
            )}

            {/* Image Preview Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setSelectedImage(null)}
                >
                    <div 
                        className="bg-white p-4 rounded-lg max-w-xl relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            onClick={() => setSelectedImage(null)}
                        >
                            <MdClose className="w-6 h-6" />
                        </button>
                        <img 
                            src={selectedImage} 
                            alt="Face ID Preview" 
                            className="max-h-[60vh] rounded-lg"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default FaceID
