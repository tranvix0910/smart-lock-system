import { useState, useEffect } from 'react'
import {
    MdFace,
    MdPersonAdd,
    MdDelete,
    MdRefresh,
    MdSearch,
    MdImage,
    MdCheckCircle,
    MdInfo,
    MdError
} from 'react-icons/md'
import { getDeviceByUserId } from '../../api/getDeviceByUserID'
import { getFaceID } from '../../api/getFaceID'
import { getPresignUrl } from '../../api/postPresignUrl'
import useUserAttributes from '../../hooks/useUserAttributes'
import { MESSAGES } from '../../utils/constants'
import { formatId } from '../../utils/formatters'
import AddFaceIDModal from './Modal/AddFaceIDModal'
import DeleteFaceIDModal from './Modal/DeleteFaceIDModal'
import ImagePreviewModal from './Modal/ImagePreviewModal'

const animationStyles = `
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

.animate-fade-in-down {
    animation: fadeInDown 0.3s ease-out;
}
`

const FaceID = () => {
    const [faceIds, setFaceIds] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [devices, setDevices] = useState([])
    const [isLoadingDevices, setIsLoadingDevices] = useState(true)
    const [isLoadingFaces, setIsLoadingFaces] = useState(true)
    const [selectedFaceForDelete, setSelectedFaceForDelete] = useState(null)
    const [selectedFace, setSelectedFace] = useState(null)

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
                    const formattedFaceIDs = faceIDArray.map((face) => {
                        return {
                            id: face.faceId,
                            userId: face.userId,
                            userName: face.userName,
                            deviceId: face.deviceId,
                            faceId: face.faceId,
                            createdAt: face.createdAt,
                            imageName: face.imageName
                        }
                    })
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

    const filteredFaceIds = faceIds.filter(
        (face) =>
            (face.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (face.deviceId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )

    const handleDeleteClick = (face) => {
        setSelectedFaceForDelete(face)
    }

    const handleDeleteSuccess = async () => {
        await loadFaceIDs()
        showMessage('Face ID has been deleted successfully!', 'success')
    }

    const handleAddFaceID = async () => {
        await loadFaceIDs()
        showMessage('Face ID has been added successfully!', 'success')
    }

    const handleReload = async () => {
        if (!userId) return

        try {
            setIsLoadingDevices(true)

            const deviceList = await getDeviceByUserId(userId)
            if (deviceList && Array.isArray(deviceList)) {
                setDevices(deviceList)
            }

            await loadFaceIDs()

            showMessage('Data refreshed successfully', 'success')
        } catch (error) {
            console.error('Error reloading data:', error)
            showMessage(MESSAGES.ERROR.NETWORK_ERROR, 'error')
        } finally {
            setIsLoadingDevices(false)
        }
    }

    const handleImageClick = async (face) => {
        if (!face) return

        try {
            const key = `users/${face.userId}/faces/${face.deviceId}/${face.imageName}`

            console.log('Generated key for presigned URL:', key)

            const response = await getPresignUrl(key)

            if (response.success && response.data && response.data.presignedUrl) {
                setSelectedImage(response.data.presignedUrl)
                setSelectedFace(face)
            } else {
                showMessage('Could not load image: ' + (response.message || 'Unknown error'), 'error')
            }
        } catch (error) {
            console.error('Error getting presigned URL:', error)
            showMessage('Error loading image: ' + error.message, 'error')
        } finally {
            setIsLoadingFaces(false)
        }
    }

    const loadFaceIDs = async () => {
        if (!userId) return

        try {
            setIsLoadingFaces(true)
            const response = await getFaceID(userId)
            if (response.success) {
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    const formattedFaceIDs = response.data.map((face) => {
                        return {
                            id: face.faceId,
                            userId: face.userId,
                            userName: face.userName,
                            deviceId: face.deviceId,
                            faceId: face.faceId,
                            createdAt: face.createdAt,
                            imageName: face.imageName
                        }
                    })
                    setFaceIds(formattedFaceIDs)
                } else {
                    setFaceIds([])
                }
            } else {
                console.error('Error from API:', response.message)
                showMessage(response.message || MESSAGES.ERROR.NETWORK_ERROR, 'error')
                setFaceIds([])
            }
        } catch (error) {
            console.error('Error loading Face IDs:', error)
            showMessage(MESSAGES.ERROR.NETWORK_ERROR, 'error')
            setFaceIds([])
        } finally {
            setIsLoadingFaces(false)
        }
    }

    return (
        <div className="p-6">
            {/* Inject CSS animations */}
            <style>{animationStyles}</style>

            {/* Thông báo kiểu mới - giống Fingerprint.jsx */}
            {message && (
                <div
                    className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] px-6 py-3 rounded-lg shadow-lg flex items-center animate-fade-in-down ${
                        messageType === 'error'
                            ? 'bg-red-500 text-white'
                            : messageType === 'info'
                              ? 'bg-blue-500 text-white'
                              : 'bg-green-500 text-white'
                    }`}
                >
                    {messageType === 'error' && <MdError className="mr-2 w-5 h-5" />}
                    {messageType === 'info' && <MdInfo className="mr-2 w-5 h-5" />}
                    {messageType === 'success' && <MdCheckCircle className="mr-2 w-5 h-5" />}
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
                            disabled={isLoadingFaces}
                        >
                            <MdRefresh className={`w-5 h-5 ${isLoadingFaces ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoadingFaces ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#24303f]"></div>
                            <p className="ml-3 text-gray-600">Loading Face IDs...</p>
                        </div>
                    ) : faceIds.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <MdFace className="w-16 h-16 text-gray-300 mb-3" />
                            <h3 className="text-lg">No Face IDs Found</h3>
                            <p className="text-sm text-gray-400 mt-1">Get started by creating a new Face ID.</p>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Device ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Preview
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Created At
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
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
                                            <div className="text-sm text-gray-500">{formatId(face.faceId)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleImageClick(face)}
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
                                                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                                                    onClick={() => handleDeleteClick(face)}
                                                    title="Delete"
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

            {/* Add Face ID Modal */}
            <AddFaceIDModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                userId={userId}
                devices={devices}
                isLoadingDevices={isLoadingDevices}
                onSuccess={handleAddFaceID}
                showMessage={showMessage}
            />

            {/* Delete Face ID Modal */}
            <DeleteFaceIDModal
                isOpen={selectedFaceForDelete !== null}
                onClose={() => setSelectedFaceForDelete(null)}
                face={selectedFaceForDelete}
                onSuccess={handleDeleteSuccess}
                showMessage={showMessage}
            />

            {/* Image Preview Modal */}
            <ImagePreviewModal
                isOpen={!!selectedImage}
                onClose={() => {
                    setSelectedImage(null)
                    setSelectedFace(null)
                }}
                imageUrl={selectedImage}
                data={selectedFace}
                type="face"
            />
        </div>
    )
}

export default FaceID
