import { useState, useEffect } from 'react'
import { 
    MdSearch, 
    MdAccessTime, 
    MdPerson, 
    MdDevices, 
    MdLocationOn, 
    MdFingerprint, 
    MdKey, 
    MdSmartphone,
    MdFace,
    MdImage,
    MdClose,
    MdDownload,
    MdChevronLeft,
    MdChevronRight,
    MdCalendarToday
} from 'react-icons/md'

import { getRecentAccessLogs } from '../api/getRecentAccessLogs'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { CSVLink } from 'react-csv'
import { formatDateTime, formatId } from '../utils/formatters.jsx'

const RecentAccessLogs = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [accessLogs, setAccessLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const itemsPerPage = 10

    useEffect(() => {
        const fetchAccessLogs = async () => {
            try {
                const response = await getRecentAccessLogs()
                if (response.success) {
                    setAccessLogs(response.data)
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

    const filteredLogs = accessLogs.filter(log => {
        const matchesSearch = 
            log.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.location.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = filterStatus === 'all' || log.status === filterStatus.toUpperCase()

        const logDate = new Date(log.createdAt)
        const matchesDateRange = (!startDate || logDate >= startDate) && 
                               (!endDate || logDate <= endDate)

        return matchesSearch && matchesStatus && matchesDateRange
    })

    // Phân trang
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // Dữ liệu cho export CSV
    const csvData = filteredLogs.map(log => ({
        Time: formatDateTime(log.createdAt),
        Device: log.deviceName,
        'Device ID': log.deviceId,
        User: log.userName,
        'User ID': log.userId,
        Location: log.location,
        Method: log.accessType,
        Status: log.status
    }))

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
                return <MdFingerprint className={iconClass} title="Fingerprint Authentication" />
            case 'RFID':
                return <MdKey className={iconClass} title="RFID Card" />
            case 'WEB APP':
                return <MdSmartphone className={iconClass} title="Web App Access" />
            case 'FACE ID':
                return <MdFace className={iconClass} title="Face Recognition" />    
            default:
                return <MdKey className={iconClass} title="Other Method" />
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ebf45d]"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    Error: {error}
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            {selectedImage && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                    onClick={() => setSelectedImage(null)}
                >
                    <div 
                        className="bg-white p-4 rounded-lg max-w-4xl relative"
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
                            alt="Access Log" 
                            className="max-h-[80vh] rounded-lg"
                        />
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <MdAccessTime className="w-8 h-8 text-[#24303f]" />
                    <h1 className="text-2xl font-semibold text-[#24303f]">Recent Access Logs</h1>
                </div>
                <p className="text-gray-500 mt-1">View and monitor all access attempts</p>
            </div>

            {/* Search, Filter, and Export Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full">
                        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo thiết bị, người dùng hoặc địa điểm..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <MdCalendarToday className="text-gray-400" />
                            <DatePicker
                                selected={startDate}
                                onChange={date => setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                placeholderText="Từ ngày"
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                                dateFormat="dd/MM/yyyy"
                            />
                            <DatePicker
                                selected={endDate}
                                onChange={date => setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                placeholderText="Đến ngày"
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                                dateFormat="dd/MM/yyyy"
                            />
                        </div>

                        <select
                            className="px-4 py-2 bg-transparent border border-transparent hover:border-[#ebf45d] rounded-lg focus:outline-none focus:border-[#ebf45d] transition-all duration-150"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Tất cả</option>
                            <option value="success">Thành công</option>
                            <option value="failed">Thất bại</option>
                        </select>

                        <CSVLink 
                            data={csvData}
                            filename={`access-logs-${new Date().toISOString()}.csv`}
                            className="flex items-center gap-2 px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150"
                        >
                            <MdDownload className="w-5 h-5" />
                            <span>Xuất CSV</span>
                        </CSVLink>
                    </div>
                </div>
            </div>

            {/* Access Logs Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedLogs.map((log) => (
                                <tr key={log._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <MdAccessTime className="w-5 h-5 mr-2 text-gray-400" />
                                            <span className="text-sm text-gray-900">{formatDateTime(log.createdAt)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <MdDevices className="w-5 h-5 mr-2 text-gray-400" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{log.deviceName}</div>
                                                <div className="text-sm text-gray-500 cursor-help" title={log.deviceId}>
                                                    {log.deviceId}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <MdPerson className="w-5 h-5 mr-2 text-gray-400" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                                                <div className="text-sm text-gray-500 cursor-help" title={log.userId}>
                                                    {formatId(log.userId)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <MdLocationOn className="w-5 h-5 mr-2 text-gray-400" />
                                            <span className="text-sm text-gray-900">{log.location}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getMethodIcon(log.accessType)}
                                            <span className="text-sm text-gray-900">{log.accessType}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={getStatusBadge(log.status)}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {log.imageUrl ? (
                                            <button 
                                                onClick={() => setSelectedImage(log.imageUrl)}
                                                className="text-[#24303f] hover:text-[#ebf45d] transition-colors duration-150"
                                            >
                                                <MdImage className="w-6 h-6" />
                                            </button>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, filteredLogs.length)} trong tổng số {filteredLogs.length} bản ghi
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#ebf45d]"
                        >
                            <MdChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#ebf45d]"
                        >
                            <MdChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RecentAccessLogs
