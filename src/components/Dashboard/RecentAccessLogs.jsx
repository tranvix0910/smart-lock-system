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
    MdClose,
    MdCheckCircle,
    MdInfo,
    MdError
} from 'react-icons/md'
import { useState, useEffect } from 'react'
import { getRecentAccessLogs } from '../../api/getRecentAccessLogs'
import { formatDateTime } from '../../utils/formatters'
import { getPresignUrl } from '../../api/postPresignUrl'

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

export default function RecentAccess() {
    const navigate = useNavigate()
    const [accessLogs, setAccessLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    const [selectedAccess, setSelectedAccess] = useState(null)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    
    const formatId = (id) => {
        if (!id) return 'N/A'
        return id.substring(0, 8) + '...'
    }

    const showMessage = (msg, type) => {
        setMessage(msg)
        setMessageType(type)
        setTimeout(() => {
            setMessage('')
            setMessageType('')
        }, 3000)
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
                if (sortedLogs.length === 0) {
                    showMessage('No access logs found', 'info')
                } else {
                    showMessage('Access logs loaded successfully', 'success')
                }
            } else {
                setError(response.error)
                showMessage(response.error || 'Failed to load access logs', 'error')
            }
        } catch (error) {
            setError(error.message)
            showMessage(error.message || 'An error occurred while loading access logs', 'error')
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
        console.log('handleImageClick called with access:', access);
        
        try {
            if (!access) {
                showMessage('Cannot load image: Missing access log data', 'error');
                return;
            }

            setSelectedAccess(access);

            // Kiểm tra nếu có filePath
            if (access.filePath) {
                showMessage('Loading image...', 'info');
                const response = await getPresignUrl(access.filePath);
                
                if (response.success && response.data && response.data.presignedUrl) {
                    setSelectedImage(response.data.presignedUrl);
                    showMessage('Image loaded successfully', 'success');
                    return;
                }
            }

            // Fallback cho trường hợp không có filePath
            const imageIdentifier = access?.imageName || access?.image;
            const userId = access?.userId || 'unknown';
            const deviceId = access?.deviceId || 'unknown';
            
            if (!imageIdentifier) {
                if (access.createdAt) {
                    const timestamp = new Date(access.createdAt);
                    const formattedTimestamp = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}_${String(timestamp.getHours()).padStart(2, '0')}-${String(timestamp.getMinutes()).padStart(2, '0')}-${String(timestamp.getSeconds()).padStart(2, '0')}`;
                    access.imageName = `${formattedTimestamp}.jpg`;
                } else {
                    showMessage('Cannot load image: Missing filename information', 'error');
                    return;
                }
            }
            
            const createdAt = new Date(access.createdAt);
            const formattedDate = `${String(createdAt.getDate()).padStart(2, '0')}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${createdAt.getFullYear()}`;
            const filename = imageIdentifier || access.imageName;
            
            // Tạo key cho presigned URL
            const key = `history/${userId}/${deviceId}/${formattedDate}/${filename}`;
            
            showMessage('Loading image...', 'info');
            const response = await getPresignUrl(key);
            
            if (response.success && response.data && response.data.presignedUrl) {
                setSelectedImage(response.data.presignedUrl);
                showMessage('Image loaded successfully', 'success');
            } else {
                // Thử tìm key thay thế
                if (response.message && response.message.includes('not found')) {
                    const alternativeKey = `users/${userId}/faces/${deviceId}/${filename}`;
                    const alternativeResponse = await getPresignUrl(alternativeKey);
                    
                    if (alternativeResponse.success && alternativeResponse.data && alternativeResponse.data.presignedUrl) {
                        setSelectedImage(alternativeResponse.data.presignedUrl);
                        showMessage('Image loaded successfully', 'success');
                        return;
                    }
                }
                
                showMessage('Could not load image: ' + (response.message || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Error getting presigned URL:', error);
            showMessage('Error loading image: ' + error.message, 'error');
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
            
            <style>{animationStyles}</style>
            
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
            
            {/* Image Preview Modal */}
            {selectedImage && selectedAccess && (
                <div 
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                    onClick={() => {
                        setSelectedImage(null);
                        setSelectedAccess(null);
                    }}
                >
                    <div 
                        className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl relative flex"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Left Side - Information */}
                        <div className="w-1/3 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
                            <div className="space-y-6">
                                {/* Header */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Face Authentication Details</h3>
                                    <p className="text-sm text-gray-500 mt-1">Captured at {selectedAccess.createdAt ? formatDateTime(selectedAccess.createdAt) : 'Unknown time'}</p>
                                </div>

                                {/* Device Info */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Device Information</h4>
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center mb-3">
                                            <MdDevices className="w-5 h-5 text-gray-400 mr-2" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{selectedAccess.deviceName || 'Device'}</p>
                                                <p className="text-xs text-gray-500">{selectedAccess.deviceId || 'Unknown ID'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className={`w-2 h-2 rounded-full ${selectedAccess.status === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                                            <span className="text-sm text-gray-600">{selectedAccess.status || 'Unknown status'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* User Info */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">User Information</h4>
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center">
                                            <MdPerson className="w-5 h-5 text-gray-400 mr-2" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{selectedAccess.userName || 'Unknown User'}</p>
                                                <p className="text-xs text-gray-500">{selectedAccess.userId ? formatId(selectedAccess.userId) : 'No ID'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Authentication Method */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Authentication Method</h4>
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center">
                                            <MdFace className="w-5 h-5 text-blue-500 mr-2" />
                                            <span className="text-sm text-gray-600">Face Recognition</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes if any */}
                                {selectedAccess.notes && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Notes</h4>
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <p className="text-sm text-gray-600">{selectedAccess.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side - Image */}
                        <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
                            <div className="relative w-full aspect-square flex items-center justify-center p-4">
                                <img 
                                    src={selectedImage} 
                                    alt="Access Image" 
                                    className="max-w-full max-h-full object-contain transform rotate-90"
                                />
                            </div>

                            {/* Close Button */}
                            <button
                                className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full text-white flex items-center justify-center transition-colors duration-200"
                                onClick={() => {
                                    setSelectedImage(null);
                                    setSelectedAccess(null);
                                }}
                            >
                                <MdClose className="w-6 h-6" />
                            </button>
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
                                                type="button"
                                                onClick={() => {
                                                    console.log('Image button clicked for access:', access);
                                                    handleImageClick(access);
                                                }}
                                                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-150"
                                                title="View face image"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M0 0h24v24H0z" fill="none"/>
                                                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                                </svg>
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
