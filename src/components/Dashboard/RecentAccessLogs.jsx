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
    MdCheckCircle,
    MdInfo,
    MdError,
    MdMoreVert
} from 'react-icons/md'
import { useState, useEffect } from 'react'
import { getRecentAccessLogs } from '../../api/getRecentAccessLogs'
import { formatDateTime } from '../../utils/formatters'
import { getPresignUrl } from '../../api/postPresignUrl'
import ImagePreviewModal from '../BiometricManagement/Modal/ImagePreviewModal'

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

@media (max-width: 768px) {
    .table-container {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }
}
`

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
    const [expandedRow, setExpandedRow] = useState(null)

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
        const iconClass = 'w-5 h-5 mr-2 text-[#24303f]'
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
        console.log('handleImageClick called with access:', access)

        try {
            if (!access) {
                showMessage('Cannot load image: Missing access log data', 'error')
                return
            }

            setSelectedAccess(access)

            // Kiểm tra nếu có filePath
            if (access.filePath) {
                showMessage('Loading image...', 'info')
                const response = await getPresignUrl(access.filePath)

                if (response.success && response.data && response.data.presignedUrl) {
                    setSelectedImage(response.data.presignedUrl)
                    showMessage('Image loaded successfully', 'success')
                    return
                }
            }

            // Fallback cho trường hợp không có filePath
            const imageIdentifier = access?.imageName || access?.image
            const userId = access?.userId || 'unknown'
            const deviceId = access?.deviceId || 'unknown'

            if (!imageIdentifier) {
                if (access.createdAt) {
                    const timestamp = new Date(access.createdAt)
                    const formattedTimestamp = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}_${String(timestamp.getHours()).padStart(2, '0')}-${String(timestamp.getMinutes()).padStart(2, '0')}-${String(timestamp.getSeconds()).padStart(2, '0')}`
                    access.imageName = `${formattedTimestamp}.jpg`
                } else {
                    showMessage('Cannot load image: Missing filename information', 'error')
                    return
                }
            }

            const createdAt = new Date(access.createdAt)
            const formattedDate = `${String(createdAt.getDate()).padStart(2, '0')}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${createdAt.getFullYear()}`
            const filename = imageIdentifier || access.imageName

            // Tạo key cho presigned URL
            const key = `history/${userId}/${deviceId}/${formattedDate}/${filename}`

            showMessage('Loading image...', 'info')
            const response = await getPresignUrl(key)

            if (response.success && response.data && response.data.presignedUrl) {
                setSelectedImage(response.data.presignedUrl)
                showMessage('Image loaded successfully', 'success')
            } else {
                // Thử tìm key thay thế
                if (response.message && response.message.includes('not found')) {
                    const alternativeKey = `users/${userId}/faces/${deviceId}/${filename}`
                    const alternativeResponse = await getPresignUrl(alternativeKey)

                    if (
                        alternativeResponse.success &&
                        alternativeResponse.data &&
                        alternativeResponse.data.presignedUrl
                    ) {
                        setSelectedImage(alternativeResponse.data.presignedUrl)
                        showMessage('Image loaded successfully', 'success')
                        return
                    }
                }

                showMessage('Could not load image: ' + (response.message || 'Unknown error'), 'error')
            }
        } catch (error) {
            console.error('Error getting presigned URL:', error)
            showMessage('Error loading image: ' + error.message, 'error')
        }
    }

    const toggleRowExpanded = (id) => {
        if (expandedRow === id) {
            setExpandedRow(null)
        } else {
            setExpandedRow(id)
        }
    }

    if (loading) {
        return (
            <div className="bg-white px-4 sm:px-6 pt-4 pb-6 rounded-lg border border-gray-200 flex-1 shadow-sm">
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
            <div className="bg-white px-4 sm:px-6 pt-4 pb-6 rounded-lg border border-gray-200 flex-1 shadow-sm">
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
        <div className="bg-white px-4 sm:px-6 pt-4 pb-6 rounded-lg border border-gray-200 flex-1 shadow-sm w-full">
            <style>{animationStyles}</style>

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

            {/* Image Preview Modal */}
            <ImagePreviewModal
                isOpen={!!selectedImage}
                onClose={() => {
                    setSelectedImage(null)
                    setSelectedAccess(null)
                }}
                imageUrl={selectedImage}
                data={selectedAccess}
                type="access"
            />

            <div className="flex justify-between items-center mb-6 mt-2">
                <div className="flex items-center gap-2">
                    <MdAccessTime className="w-6 h-6 text-[#24303f]" />
                    <strong className="text-gray-800 font-semibold text-lg truncate">Recent Logs</strong>
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
                        className="flex items-center justify-center w-8 h-8 text-[#24303f] bg-[#ebf45d] rounded-full sm:rounded-lg sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 hover:bg-[#d9e154] transition-colors duration-150"
                    >
                        <span className="hidden sm:inline text-sm font-medium mr-1">View All</span>
                        <MdChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {accessLogs.length > 0 ? (
                <>
                    {/* Desktop View - Table */}
                    <div className="hidden md:block rounded-lg mt-3 overflow-hidden border border-gray-100">
                        <div className="table-container">
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
                                                        <div className="font-medium text-gray-900">
                                                            {access.deviceName || access.deviceId}
                                                        </div>
                                                        {access.deviceName && (
                                                            <div className="text-xs text-gray-500">
                                                                {formatId(access.deviceId)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {access.accessType === 'FINGERPRINT' ? (
                                                        <>
                                                            <MdFingerprint className="w-5 h-5 mr-2 text-gray-400" />
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {access.userName}
                                                                </div>
                                                                <div className="text-xs text-gray-500">Fingerprint ID</div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MdPerson className="w-5 h-5 mr-2 text-gray-400" />
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {access.userName}
                                                                </div>
                                                                <div
                                                                    className="text-xs text-gray-500 cursor-help"
                                                                    title={access.userId}
                                                                >
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
                                                        {access.accessType ? access.accessType.replace('_', ' ') : 'Unknown'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={getStatusBadge(access.status)}>{access.status}</span>
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
                                                            handleImageClick(access)
                                                        }}
                                                        className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-150"
                                                        title="View face image"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="w-5 h-5 text-gray-600"
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                        >
                                                            <path d="M0 0h24v24H0z" fill="none" />
                                                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
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
                    </div>

                    {/* Mobile View - Card Layout */}
                    <div className="md:hidden mt-3 space-y-3 w-full">
                        {accessLogs.map((access) => (
                            <div key={access._id} className="border border-gray-100 rounded-lg overflow-hidden bg-white shadow-sm">
                                <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <MdAccessTime className="w-5 h-5 text-gray-500" />
                                        <span className="text-sm font-medium">{formatDateTime(access.createdAt)}</span>
                                    </div>
                                    <div>
                                        <span className={getStatusBadge(access.status)}>{access.status}</span>
                                    </div>
                                </div>
                                
                                <div className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-gray-100 p-2 rounded-full">
                                                <MdDevices className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Device</div>
                                                <div className="font-medium">
                                                    {access.deviceName || access.deviceId}
                                                </div>
                                                {access.deviceName && (
                                                    <div className="text-xs text-gray-500">{formatId(access.deviceId)}</div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <button 
                                            className="p-2"
                                            onClick={() => toggleRowExpanded(access._id)}
                                        >
                                            <MdMoreVert className="w-5 h-5 text-gray-500" />
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-start gap-3">
                                        <div className="bg-gray-100 p-2 rounded-full">
                                            <MdPerson className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">User</div>
                                            <div className="font-medium">{access.userName}</div>
                                            <div className="text-xs text-gray-500">{formatId(access.userId)}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3">
                                        <div className="bg-gray-100 p-2 rounded-full">
                                            {getMethodIcon(access.accessType)}
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Access Method</div>
                                            <div className="font-medium">
                                                {access.accessType ? access.accessType.replace('_', ' ') : 'Unknown'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {expandedRow === access._id && (
                                        <>
                                            {access.notes && (
                                                <div className="pt-2 border-t border-gray-100">
                                                    <div className="text-sm text-gray-500">Notes</div>
                                                    <div className="text-sm">{access.notes}</div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                
                                {(access.accessType === 'FACE_ID' || access.accessType === 'FACE ID') && (
                                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                                        <button
                                            onClick={() => handleImageClick(access)}
                                            className="w-full flex items-center justify-center gap-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-150"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-5 h-5 text-gray-600"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M0 0h24v24H0z" fill="none" />
                                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                            </svg>
                                            <span className="text-sm font-medium">View Face Image</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="py-10 px-4 sm:px-6 flex flex-col items-center justify-center text-center border border-gray-100 rounded-lg bg-gray-50 w-full">
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
