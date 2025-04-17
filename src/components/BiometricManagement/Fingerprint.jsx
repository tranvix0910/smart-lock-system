import { useState, useEffect } from 'react'
import { 
    MdFingerprint, 
    MdPersonAdd, 
    MdDelete, 
    MdRefresh,
    MdSearch,
    MdCheckCircle,
    MdInfo,
    MdError
} from 'react-icons/md'
import useUserAttributes from '../../hooks/useUserAttributes'
import AddFingerprintModal from './Modal/AddFingerprintModal'
import DeleteFingerprintModal from './Modal/DeleteFingerprintModal'
import { getFingerprint } from '../../api/getFingerprint'
import { formatId, formatDateTime } from '../../utils/formatters'

// CSS Animation styles
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
`;

const Fingerprint = () => {
    const [fingerprints, setFingerprints] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [fingerprintToDelete, setFingerprintToDelete] = useState(null)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    const userAttributes = useUserAttributes()
    const currentUserId = userAttributes?.sub

    const showMessage = (msg, type) => {
        setMessage(msg)
        setMessageType(type)
        setTimeout(() => {
            setMessage('')
            setMessageType('')
        }, 3000)
    }

    // Fetch fingerprints from API
    const fetchFingerprints = async () => {
        if (!currentUserId) return

        setIsLoading(true)
        try {
            const result = await getFingerprint(currentUserId)
            if (result.success && result.data) {
                // Map API data to component format
                const formattedData = result.data.map(item => ({
                    ...item,
                    id: item.fingerprintId, // Use fingerprintId as the id
                }))
                setFingerprints(formattedData)
                
                // Thông báo nếu không tìm thấy vân tay
                if (formattedData.length === 0) {
                    showMessage('No fingerprints found for this user', 'info')
                }
            } else {
                showMessage('No fingerprints found', 'info')
                setFingerprints([])
            }
        } catch (error) {
            console.error('Error fetching fingerprints:', error)
            // Thay đổi loại thông báo từ 'error' thành 'info' cho các thông báo không tìm thấy
            if (error.message && error.message.toLowerCase().includes('not found')) {
                showMessage('No fingerprints found for this user', 'info')
            } else {
                showMessage(error.message || 'Failed to load fingerprints', 'error')
            }
            setFingerprints([])
        } finally {
            setIsLoading(false)
        }
    }

    // Load fingerprints when component mounts
    useEffect(() => {
        fetchFingerprints()
    }, [currentUserId])

    const handleAddFingerprint = (newFingerprint) => {
        setFingerprints(prev => [...prev, {
            ...newFingerprint,
            id: newFingerprint.fingerprintId
        }])
        showMessage('Fingerprint added successfully', 'success')
    }

    const handleOpenDeleteModal = (fingerprint) => {
        setFingerprintToDelete(fingerprint)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteFingerprint = (id) => {
        // Here you would call an API to delete the fingerprint
        // For now, just update the UI
        setFingerprints(prev => prev.filter(fp => fp.id !== id))
        showMessage('Fingerprint deleted successfully', 'success')
        // Không tự đóng modal để người dùng có thể xem thông tin chi tiết
        // setIsDeleteModalOpen(false)
    }

    const handleRefresh = () => {
        fetchFingerprints()
        showMessage('Refreshing fingerprint data', 'info')
    }

    const filteredFingerprints = fingerprints.filter(fp => 
        (fp.userName && fp.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (fp.fingerprintId && fp.fingerprintId.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    // Format the template to show only first part
    const formatTemplate = (template) => {
        if (!template) return 'N/A';
        return template.length > 15 ? `${template.substring(0, 15)}...` : template;
    }

    return (
        <div className="p-6">
            {/* Inject CSS animations */}
            <style>{animationStyles}</style>
            
            {/* Thông báo kiểu mới - giống RFID.jsx */}
            {message && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] px-6 py-3 rounded-lg shadow-lg flex items-center animate-fade-in-down ${
                    messageType === 'error' ? 'bg-red-500 text-white' : 
                    messageType === 'info' ? 'bg-blue-500 text-white' :
                    'bg-green-500 text-white'
                }`}>
                    {messageType === 'error' && <MdError className="mr-2 w-5 h-5" />}
                    {messageType === 'info' && <MdInfo className="mr-2 w-5 h-5" />}
                    {messageType === 'success' && <MdCheckCircle className="mr-2 w-5 h-5" />}
                    {message}
                </div>
            )}
            
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <MdFingerprint className="w-8 h-8 text-[#24303f]" />
                    <h1 className="text-2xl font-semibold text-[#24303f]">Fingerprint Management</h1>
                </div>
                <p className="text-gray-500 mt-1">Manage and monitor all registered fingerprints</p>
            </div>

            {/* Actions Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full">
                        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or fingerprint ID..."
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
                            onClick={handleRefresh}
                            disabled={isLoading}
                        >
                            <MdRefresh className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Fingerprints Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#24303f]"></div>
                            <p className="ml-3 text-gray-600">Loading fingerprints...</p>
                        </div>
                    ) : fingerprints.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <MdFingerprint className="w-16 h-16 text-gray-300 mb-3" />
                            <p className="text-lg">No fingerprints found</p>
                            <p className="text-sm text-gray-400 mt-1">Add your first fingerprint by clicking the &quot;Add New&quot; button</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fingerprint ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Face ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredFingerprints.map((fingerprint) => (
                                    <tr key={fingerprint.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="w-8 h-8 flex items-center justify-center text-gray-400 mr-2">
                                                    <MdFingerprint className="w-6 h-6" />
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {fingerprint.fingerprintId}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{fingerprint.userName}</div>
                                            <div className="text-sm text-gray-500">
                                                ID: {fingerprint.userId ? formatId(fingerprint.userId) : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-700">
                                                {fingerprint.faceId ? formatId(fingerprint.faceId) : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {fingerprint.fingerprintTemplate ? (
                                                <div className="bg-gray-50 px-3 py-1.5 rounded text-xs font-mono text-gray-700 relative group cursor-pointer">
                                                    <div className="w-32 overflow-hidden text-ellipsis">
                                                        {formatTemplate(fingerprint.fingerprintTemplate)}
                                                    </div>
                                                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded py-2 px-3 -left-1/2 bottom-full mb-1 max-w-xs z-20">
                                                        <div className="font-bold text-[#ebf45d] mb-1">TEMPLATE</div>
                                                        <div className="max-h-40 overflow-y-auto break-all">
                                                            {fingerprint.fingerprintTemplate}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="px-3 py-1 text-xs text-gray-500">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {fingerprint.createdAt ? formatDateTime(fingerprint.createdAt) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2 justify-center">
                                                <button
                                                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                                                    onClick={() => handleOpenDeleteModal(fingerprint)}
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

            {/* Add Fingerprint Modal */}
            <AddFingerprintModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                userId={currentUserId}
                onSuccess={handleAddFingerprint}
            />

            {/* Delete Fingerprint Modal */}
            <DeleteFingerprintModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                fingerprint={fingerprintToDelete}
                onSuccess={handleDeleteFingerprint}
            />
        </div>
    )
}

export default Fingerprint
