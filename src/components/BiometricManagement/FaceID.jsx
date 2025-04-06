import { useState, useEffect } from 'react'
import { 
    MdFace,
    MdPersonAdd, 
    MdDelete, 
    MdRefresh,
    MdSearch,
    MdClose,
    MdImage
} from 'react-icons/md'
import { getDeviceByUserId } from '../../api/getDeviceByUserID'
import { getFaceID } from '../../api/getFaceID'
import { getPresignUrl } from '../../api/postPresignUrl'
import useUserAttributes from '../../hooks/useUserAttributes'
import { MESSAGES } from '../../utils/constants'
import { formatId } from '../../utils/formatters'
import AddFaceIDModal from './Modal/AddFaceIDModal'
import DeleteFaceIDModal from './Modal/DeleteFaceIDModal'

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
                    const formattedFaceIDs = faceIDArray.map(face => {
                        return {
                            id: face.faceId,
                            userId: face.userId,
                            userName: face.userName,
                            deviceId: face.deviceId,
                            faceId: face.faceId,
                            createdAt: face.createdAt,
                            imageName: face.imageName,
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

    const filteredFaceIds = faceIds.filter(face => 
        (face.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (face.deviceId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )

    const handleDeleteClick = (face) => {
        setSelectedFaceForDelete(face)
    }

    const handleDeleteSuccess = async () => {
        await loadFaceIDs()
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
        if (!face) return;
        
        try {
            const key = `users/${face.userId}/faces/${face.deviceId}/${face.imageName}`;
            
            console.log('Generated key for presigned URL:', key);
                        
            const response = await getPresignUrl(key);
            
            if (response.success && response.data && response.data.presignedUrl) {
                setSelectedImage(response.data.presignedUrl);
            } else {
                showMessage('Could not load image: ' + (response.message || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Error getting presigned URL:', error);
            showMessage('Error loading image: ' + error.message, 'error');
        } finally {
            setIsLoadingFaces(false);
        }
    }

    const loadFaceIDs = async () => {
        if (!userId) return;
        
        try {
            setIsLoadingFaces(true);
            const response = await getFaceID(userId);
            if (response.success) {
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    const formattedFaceIDs = response.data.map(face => {
                        return {
                            id: face.faceId,
                            userId: face.userId,
                            userName: face.userName,
                            deviceId: face.deviceId,
                            faceId: face.faceId,
                            createdAt: face.createdAt,
                            imageName: face.imageName,
                        };
                    });
                    setFaceIds(formattedFaceIDs);
                } else {
                    setFaceIds([]);
                }
            } else {
                console.error('Error from API:', response.message);
                showMessage(response.message || MESSAGES.ERROR.NETWORK_ERROR, 'error');
                setFaceIds([]);
            }
        } catch (error) {
            console.error('Error loading Face IDs:', error);
            showMessage(MESSAGES.ERROR.NETWORK_ERROR, 'error');
            setFaceIds([]);
        } finally {
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
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#24303f]"></div>
                            <p className="ml-3 text-gray-600">Loading Face IDs...</p>
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
                                                    className="p-1 text-red-600 hover:text-red-800"
                                                    onClick={() => handleDeleteClick(face)}
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
            {selectedImage && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div 
                        className="bg-white rounded-lg p-10 max-w-3xl relative overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-2 right-2 z-10 w-8 h-8 bg-white rounded-full text-gray-500 hover:text-gray-700 flex items-center justify-center shadow-md"
                            onClick={() => setSelectedImage(null)}
                        >
                            <MdClose className="w-6 h-6" />
                        </button>
                        
                        <div className="pt-4">
                            <img 
                                src={selectedImage} 
                                alt="Face ID Preview" 
                                className="max-h-[70vh] w-auto object-contain mx-auto rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FaceID
