import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { 
    MdAccessTime, 
    MdPerson, 
    MdDevices, 
    MdFingerprint, 
    MdKey, 
    MdSmartphone,
    MdFace,
    MdChevronRight
} from 'react-icons/md'
import { useState, useEffect } from 'react'
import { getRecentAccessLogs } from '../../api/getRecentAccessLogs'

export default function RecentAccess() {
    const navigate = useNavigate()
    const [accessLogs, setAccessLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const formatId = (id) => {
        return id.substring(0, 8) + '...'
    }

    useEffect(() => {
        const fetchAccessLogs = async () => {
            try {
                const response = await getRecentAccessLogs()
                if (response.success) {
                    setAccessLogs(response.data.slice(0, 5))
                } else {
                    setError(response.error)
                }
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }   
        fetchAccessLogs()
    }, [])

    const getStatusBadge = (status) => {
        const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium'
        if (status === 'SUCCESS') {
            return `${baseClasses} bg-[#ebf45d] text-[#24303f] border border-[#d9e154]`
        }
        return `${baseClasses} bg-red-100 text-red-700 border border-red-200`
    }

    const getMethodIcon = (method) => {
        const iconClass = "w-5 h-5 mr-2 text-[#24303f]"
        switch (method) {
            case 'FINGERPRINT':
                return <MdFingerprint className={iconClass} title="Fingerprint" />
            case 'RFID':
                return <MdKey className={iconClass} title="RFID Card" />
            case 'WEB APP':
                return <MdSmartphone className={iconClass} title="Web App" />
            case 'FACE ID':
                return <MdFace className={iconClass} title="Face Recognition" />    
            default:
                return <MdKey className={iconClass} title="Other Method" />
        }
    }

    if (loading) {
        return (
            <div className="bg-white px-6 pt-4 pb-6 rounded-lg border border-gray-200 flex-1 shadow-sm">
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ebf45d]"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white px-6 pt-4 pb-6 rounded-lg border border-gray-200 flex-1 shadow-sm">
                <div className="flex justify-center items-center h-32">
                    <div className="text-red-500">Error loading access logs</div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white px-6 pt-4 pb-6 rounded-lg border border-gray-200 flex-1 shadow-sm">
            <div className="flex justify-between items-center mb-6 mt-2">
                <div className="flex items-center gap-2">
                    <MdAccessTime className="w-6 h-6 text-[#24303f]" />
                    <strong className="text-gray-800 font-semibold text-lg">Recent Access Logs</strong>
                </div>
                <button
                    onClick={() => navigate('/dashboard/recent-access-logs')}
                    className="flex items-center gap-2 px-4 py-2 text-[#24303f] bg-transparent border border-transparent hover:border-[#ebf45d] rounded-lg transition-colors duration-150"
                >
                    <span className="font-medium">View All</span>
                    <MdChevronRight className="w-5 h-5" />
                </button>
            </div>
            <div className="rounded-lg mt-3">
                <table className="w-full border-collapse">
                    <thead className="rounded-lg bg-gray-50 text-gray-600">
                        <tr className="text-sm font-medium uppercase">
                            <th className="p-4 text-left">Device</th>
                            <th className="p-4 text-left">User</th>
                            <th className="p-4 text-left">Method</th>
                            <th className="p-4 text-left">Time</th>
                            <th className="p-4 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        {accessLogs.map((access) => (
                            <tr key={access._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-4 py-3">
                                    <div className="flex items-center">
                                        <MdDevices className="w-5 h-5 mr-2 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-gray-900">{access.deviceName}</div>
                                            <div className="text-sm text-gray-500">{access.deviceId}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center">
                                        <MdPerson className="w-5 h-5 mr-2 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-gray-900">{access.userName}</div>
                                            <div className="text-sm text-gray-500">{formatId(access.userId)}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center">
                                        {getMethodIcon(access.accessType)}
                                        <span className="text-sm text-gray-900">{access.accessType}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center">
                                        <MdAccessTime className="w-5 h-5 mr-2 text-gray-400" />
                                        <span className="text-sm text-gray-900">
                                            {format(new Date(access.createdAt), 'HH:mm - dd/MM/yyyy')}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={getStatusBadge(access.status)}>
                                        {access.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
