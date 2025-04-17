import { useNavigate } from 'react-router-dom'
import { 
    MdAccessTime, 
    MdPerson, 
    MdDevices, 
    MdFingerprint, 
    MdKey, 
    MdSmartphone,
    MdFace,
    MdChevronRight,
    MdRefresh,
    MdOutlineWarning,
    MdImage,
    MdClose
} from 'react-icons/md'
import { useState, useEffect } from 'react'
import { getRecentAccessLogs } from '../../api/getRecentAccessLogs'
import { formatDateTime } from '../../utils/formatters'
import { getPresignUrl } from '../../api/postPresignUrl'

export default function RecentAccess() {
    const navigate = useNavigate()
    const [accessLogs, setAccessLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    
    const formatId = (id) => {
        if (!id) return 'N/A'
        return id.substring(0, 8) + '...'
    }

    const fetchAccessLogs = async () => {
        setIsRefreshing(true)
        try {
            const response = await getRecentAccessLogs()
            if (response.success) {
                // Sort logs by createdAt in descending order (newest first)
                const sortedLogs = response.data
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5)
                setAccessLogs(sortedLogs)
            } else {
                setError(response.error)
            }
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchAccessLogs()
    }, [])

    const getStatusBadge = (status) => {
        const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium'
        if (status === 'SUCCESS' || status === 'UNLOCK' || status === 'AUTHENTICATION SUCCESS') {
            return `${baseClasses} bg-green-100 text-green-800 border border-green-200`
        } else if (status === 'LOCK') {
            return `${baseClasses} bg-blue-100 text-blue-700 border border-blue-200`
        } else if (status === 'AUTHENTICATION FAIL' || status === 'FAILED') {
            return `${baseClasses} bg-red-100 text-red-700 border border-red-200`
        }
        return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`
    }

    const getMethodIcon = (method) => {
        const iconClass = "w-5 h-5 mr-2 text-[#24303f]"
        switch (method) {
            case 'FINGERPRINT':
                return <MdFingerprint className={iconClass} title="Fingerprint Authentication" />
            case 'RFID':
                return <MdKey className={iconClass} title="RFID Card" />
            case 'WEB_APP':
            case 'WEB APP':
                return <MdSmartphone className={iconClass} title="Web App Access" />
            case 'FACE_ID':
            case 'FACE ID':
                return <MdFace className={iconClass} title="Face Recognition" />    
            default:
                return <MdKey className={iconClass} title="Other Method" />
        }
    }

    const handleImageClick = async (access) => {
        if (!access || !access.imageName || !access.userId || !access.deviceId) return;
        
        try {
            const key = `users/${access.userId}/faces/${access.deviceId}/${access.imageName}`;
            
            console.log('Generated key for presigned URL:', key);
                        
            const response = await getPresignUrl(key);
            
            if (response.success && response.data && response.data.presignedUrl) {
                setSelectedImage(response.data.presignedUrl);
            } else {
                console.error('Could not load image:', response.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error getting presigned URL:', error);
        }
    }

    if (loading) {
        return (
            <div className="bg-white px-6 pt-4 pb-6 rounded-lg border border-gray-200 flex-1 shadow-sm">
                <div className="flex justify-between items-center mb-6 mt-2">
                    <div className="flex items-center gap-2">
                        <MdAccessTime className="w-6 h-6 text-[#24303f]" />
                        <strong className="text-gray-800 font-semibold text-lg">Recent Access Logs</strong>
                    </div>
                </div>
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ebf45d]"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white px-6 pt-4 pb-6 rounded-lg border border-gray-200 flex-1 shadow-sm">
                <div className="flex justify-between items-center mb-6 mt-2">
                    <div className="flex items-center gap-2">
                        <MdAccessTime className="w-6 h-6 text-[#24303f]" />
                        <strong className="text-gray-800 font-semibold text-lg">Recent Access Logs</strong>
                    </div>
                </div>
                <div className="flex flex-col justify-center items-center h-32">
                    <MdOutlineWarning className="w-10 h-10 text-red-500 mb-2" />
                    <div className="text-red-500 font-medium">Error loading access logs</div>
                    <button 
                        onClick={fetchAccessLogs}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150 text-sm font-medium"
                    >
                        <MdRefresh className="w-4 h-4" />
                        <span>Retry</span>
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white px-6 pt-4 pb-6 rounded-lg border border-gray-200 flex-1 shadow-sm">
            {/* Image Preview Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div 
                        className="bg-white rounded-lg p-6 max-w-3xl relative overflow-hidden"
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
                                alt="Access Image" 
                                className="max-h-[70vh] w-auto object-contain mx-auto rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6 mt-2">
                <div className="flex items-center gap-2">
                    <MdAccessTime className="w-6 h-6 text-[#24303f]" />
                    <strong className="text-gray-800 font-semibold text-lg">Recent Access Logs</strong>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchAccessLogs}
                        disabled={isRefreshing}
                        title="Refresh data"
                        className="flex items-center justify-center p-2 text-gray-600 hover:text-[#24303f] bg-transparent hover:bg-gray-100 rounded-full transition-colors duration-150"
                    >
                        <MdRefresh className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/recent-access-logs')}
                        className="flex items-center gap-2 px-4 py-2 text-[#24303f] bg-transparent border border-transparent hover:border-[#ebf45d] rounded-lg transition-colors duration-150"
                    >
                        <span className="font-medium">View All</span>
                        <MdChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            {accessLogs.length > 0 ? (
                <div className="rounded-lg mt-3 overflow-hidden border border-gray-100">
                    <table className="w-full border-collapse">
                        <thead className="rounded-t-lg bg-gray-50 text-gray-600">
                            <tr className="text-xs font-medium uppercase tracking-wider">
                                <th className="px-4 py-3 text-left">Time</th>
                                <th className="px-4 py-3 text-left">Device</th>
                                <th className="px-4 py-3 text-left">User</th>
                                <th className="px-4 py-3 text-left">Method</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Notes</th>
                                <th className="px-4 py-3 text-left">Image</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 divide-y divide-gray-100">
                            {accessLogs.map((access) => (
                                <tr key={access._id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <MdAccessTime className="w-5 h-5 mr-2 text-gray-400" />
                                            <span className="text-sm text-gray-900">
                                                {formatDateTime(access.createdAt)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <MdDevices className="w-5 h-5 mr-2 text-gray-400" />
                                            <div>
                                                <div className="font-medium text-gray-900">{access.deviceName || access.deviceId}</div>
                                                {access.deviceName && <div className="text-xs text-gray-500">{formatId(access.deviceId)}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {access.accessType === 'FINGERPRINT' ? (
                                                <>
                                                    <MdFingerprint className="w-5 h-5 mr-2 text-gray-400" />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{access.userName}</div>
                                                        <div className="text-xs text-gray-500">Fingerprint ID</div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <MdPerson className="w-5 h-5 mr-2 text-gray-400" />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{access.userName}</div>
                                                        <div className="text-xs text-gray-500 cursor-help" title={access.userId}>
                                                            {formatId(access.userId)}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getMethodIcon(access.accessType)}
                                            <span className="text-sm text-gray-900">
                                                {access.accessType.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={getStatusBadge(access.status)}>
                                            {access.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap max-w-[150px] truncate">
                                        <span className="text-xs text-gray-600" title={access.notes || 'No notes'}>
                                            {access.notes || '—'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {access.accessType === 'FACE_ID' || access.accessType === 'FACE ID' ? (
                                            <button
                                                onClick={() => handleImageClick(access)}
                                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-150"
                                                title="View face image"
                                            >
                                                <MdImage className="w-4 h-4 text-gray-600" />
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="py-10 px-6 flex flex-col items-center justify-center text-center border border-gray-100 rounded-lg bg-gray-50">
                    <div className="bg-gray-100 rounded-full p-3 mb-3">
                        <MdAccessTime className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900 mb-1">No recent access logs</h3>
                    <p className="text-gray-500 max-w-md mb-4 text-sm">
                        Access logs will appear here once users begin interacting with devices.
                    </p>
                    <button
                        onClick={fetchAccessLogs}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150 disabled:opacity-70 text-sm font-medium"
                    >
                        <MdRefresh className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            )}
        </div>
    )
}
