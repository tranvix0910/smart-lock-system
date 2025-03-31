import { useState } from 'react'
import { 
    MdFace,
    MdPersonAdd, 
    MdDelete, 
    MdRefresh,
    MdSearch,
    MdEdit,
    MdClose,
    MdCamera,
    MdImage
} from 'react-icons/md'

const FaceID = () => {
    const [faceIds, setFaceIds] = useState([
        { id: 1, userId: 'USER001', userName: 'John Doe', faceId: 'FACE001', status: 'Active', createdAt: '2024-03-20T08:30:00', imageUrl: 'https://example.com/face1.jpg' },
        { id: 2, userId: 'USER002', userName: 'Jane Smith', faceId: 'FACE002', status: 'Active', createdAt: '2024-03-20T09:15:00', imageUrl: 'https://example.com/face2.jpg' },
        { id: 3, userId: 'USER003', userName: 'Mike Johnson', faceId: 'FACE003', status: 'Inactive', createdAt: '2024-03-19T14:20:00', imageUrl: 'https://example.com/face3.jpg' }
    ])
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)

    const filteredFaceIds = faceIds.filter(face => 
        face.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        face.faceId.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this Face ID?')) {
            setFaceIds(prev => prev.filter(face => face.id !== id))
        }
    }

    const handleStatusToggle = (id) => {
        setFaceIds(prev => prev.map(face => 
            face.id === id 
                ? { ...face, status: face.status === 'Active' ? 'Inactive' : 'Active' }
                : face
        ))
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <MdFace className="w-8 h-8 text-[#24303f]" />
                    <h1 className="text-2xl font-semibold text-[#24303f]">Face ID Management</h1>
                </div>
                <p className="text-gray-500 mt-1">Manage and monitor all registered Face IDs</p>
            </div>

            {/* Actions Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full">
                        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or Face ID..."
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
                            onClick={() => window.location.reload()}
                        >
                            <MdRefresh className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Face IDs Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Face ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
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
                                                {face.faceId}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{face.userName}</div>
                                        <div className="text-sm text-gray-500">{face.userId}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => setSelectedImage(face.imageUrl)}
                                            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                        >
                                            <MdImage className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleStatusToggle(face.id)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                face.status === 'Active'
                                                    ? 'bg-[#ebf45d] text-[#24303f] border border-[#d9e154]'
                                                    : 'bg-red-100 text-red-700 border border-red-200'
                                            }`}
                                        >
                                            {face.status}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(face.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="p-1 text-blue-600 hover:text-blue-800"
                                                onClick={() => console.log('Edit', face.id)}
                                            >
                                                <MdEdit className="w-5 h-5" />
                                            </button>
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
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-[#24303f]">Add New Face ID</h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <MdClose className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    User
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]">
                                    <option value="">Select User</option>
                                    <option value="1">John Doe</option>
                                    <option value="2">Jane Smith</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Face Camera
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <MdCamera className="w-16 h-16 mx-auto text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">
                                        Position your face in front of the camera
                                    </p>
                                    <button className="mt-4 px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150">
                                        Capture
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg hover:border-[#ebf45d] transition-colors duration-150"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        // Handle save
                                        setIsAddModalOpen(false)
                                    }}
                                    className="px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150"
                                >
                                    Save
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
