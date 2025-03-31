import { useState, useEffect, useCallback } from 'react'
import { MdLockOpen, MdLock, MdEdit, MdDelete, MdRefresh, MdLocationOn, MdBatteryFull, MdChevronRight } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

import useUserAttributes from '../../hooks/useUserAttributes'
import { getDeviceByUserId } from '../../api/getDeviceByUserID'
import { changeDeviceState } from '../../api/putChangeDeviceState'
import socket from '../../config/websocket'

export default function DeviceManagement() {
    const navigate = useNavigate()
    const [devices, setDevices] = useState([])
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    const userAttributes = useUserAttributes()
    const userId = userAttributes?.sub

    // Hàm xử lý sự kiện deviceStateChanged
    const handleDeviceStateChange = useCallback(async (data) => {

        console.log('Received device state change:', data)
        
        // Cập nhật trạng thái thiết bị trong state
        setDevices(prevDevices => 
            prevDevices.map(device => device.deviceId === data.deviceId
                ? { ...device, lockState: data.lockState }
                : device
            )
        )

        // Hiển thị thông báo
        setMessage(`${data.deviceName || data.deviceId} has been ${data.lockState.toLowerCase()}ed`)
        setMessageType(data.lockState === 'LOCK' ? 'locked' : 'success')
        setTimeout(() => {
            setMessage('')
            setMessageType('')
        }, 3000)
    }, [])

    useEffect(() => {

        socket.on('deviceStateChange', handleDeviceStateChange)

        return () => {
            socket.off('deviceStateChange', handleDeviceStateChange)
        }
    }, [handleDeviceStateChange])

    // Fetch devices khi component mount hoặc userId thay đổi
    useEffect(() => {
        const fetchDevices = async () => {
            if (!userId) {
                console.log('User ID is not defined')
                setIsLoading(false)
                return
            }
            try {
                setIsLoading(true)
                const devicesData = await getDeviceByUserId(userId)
                setDevices(devicesData || [])
            } catch (error) {
                console.error('Error fetching devices:', error)
                setMessage('Cannot load device list')
                setMessageType('error')
                setTimeout(() => {
                    setMessage('')
                    setMessageType('')
                }, 3000)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDevices()
    }, [userId])

    const getBatteryColor = (level) => {
        if (level > 60) return 'text-green-600'
        if (level > 20) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getStatusBadge = (status) => {
        const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium'
        if (status === 'ONLINE') {
            return `${baseClasses} bg-green-100 text-green-700 border border-green-200`
        }
        return `${baseClasses} bg-red-100 text-red-700 border border-red-200`
    }

    const toggleLock = async (deviceId, newLockState) => {
        const device = devices.find(d => d.deviceId === deviceId)
        
        if (device.status === 'OFFLINE') {
            setMessage(`Cannot change lock status: ${device.deviceName} is offline`)
            setMessageType('error')
            setTimeout(() => {
                setMessage('')
                setMessageType('')
            }, 3000)
            return
        }

        try {
            const result = await changeDeviceState(deviceId, newLockState)
            if (!result.success) {
                throw new Error(result.message)
            }
            
            setDevices(devices.map(d => 
                d.deviceId === deviceId && d.status === 'ONLINE'
                    ? {...d, lockState: newLockState}
                    : d
            ))

            setMessage(`${device.deviceName} has been ${newLockState.toLowerCase()}ed`)
            setMessageType(newLockState === 'LOCK' ? 'locked' : 'success')
        } catch (error) {
            console.error('Error changing device state:', error)
            setMessage(`Error changing device state: ${error.message}`)
            setMessageType('error')
        } finally {
            setTimeout(() => {
                setMessage('')
                setMessageType('')
            }, 3000)
        }
    }

    const getMessageStyle = () => {
        switch(messageType) {
            case 'error':
                return 'bg-red-100 text-red-700 border border-red-200'
            case 'locked':
                return 'bg-red-100 text-red-700 border border-red-200'
            case 'success':
                return 'bg-green-100 text-green-700 border border-green-200'
            default:
                return 'bg-gray-100 text-gray-700 border border-gray-200'
        }
    }

    return (
        <div className="bg-white px-6 pt-4 pb-6 rounded-lg border border-gray-200 flex-1 shadow-sm">
            <div className="flex justify-between items-center mb-6 mt-2">
                <strong className="text-gray-800 font-semibold text-lg">Device Management</strong>
                <button
                    onClick={() => navigate('/dashboard/devices-management')}
                    className="flex items-center gap-2 px-4 py-2 text-[#24303f] bg-transparent border border-transparent hover:border-[#ebf45d] rounded-lg transition-colors duration-150"
                >
                    <span className="font-medium">More Devices</span>
                    <MdChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Message Toast */}
            {message && (
                <div className={`mb-6 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${getMessageStyle()}`}>
                    <div className="flex items-center justify-center">
                        {messageType === 'locked' && <MdLock className="w-5 h-5 mr-2" />}
                        {messageType === 'success' && <MdLockOpen className="w-5 h-5 mr-2" />}
                        {message}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : devices.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    No devices found
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devices.map((device) => (
                        <div 
                            key={device.deviceId} 
                            className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-300 relative group"
                        >
                            {/* Header with Status */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-lg mb-1">{device.deviceName}</h3>
                                    <p className="text-sm text-gray-500">{device.deviceId}</p>
                                </div>
                                <span className={getStatusBadge(device.status)}>
                                    {device.status}
                                </span>
                            </div>

                            {/* Location */}
                            <div className="flex items-center text-gray-600 mb-4">
                                <MdLocationOn className="w-5 h-5 mr-2" />
                                <span>{device.location}</span>
                            </div>

                            {/* Lock Status and Battery */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => toggleLock(device.deviceId, 'LOCK')}
                                        disabled={device.status === 'OFFLINE' || device.lockState === 'LOCK'}
                                        className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-150
                                            ${device.status === 'OFFLINE' || device.lockState === 'LOCK'
                                                ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                                                : 'bg-red-100 hover:bg-red-200'
                                            }`}
                                    >
                                        <MdLock className="w-6 h-6 mr-2 text-red-600" />
                                        <span className="font-medium text-red-600">LOCK</span>
                                    </button>
                                    <button 
                                        onClick={() => toggleLock(device.deviceId, 'UNLOCK')}
                                        disabled={device.status === 'OFFLINE' || device.lockState === 'UNLOCK'}
                                        className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-150
                                            ${device.status === 'OFFLINE' || device.lockState === 'UNLOCK'
                                                ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                                                : 'bg-green-100 hover:bg-green-200'
                                            }`}
                                    >
                                        <MdLockOpen className="w-6 h-6 mr-2 text-green-600" />
                                        <span className="font-medium text-green-600">UNLOCK</span>
                                    </button>
                                </div>
                                <div className="flex items-center">
                                    <MdBatteryFull className={`w-5 h-5 mr-1 ${getBatteryColor(device.batteryLevel)}`} />
                                    <span className={`font-medium ${getBatteryColor(device.batteryLevel)}`}>
                                        {device.batteryLevel}%
                                    </span>
                                </div>
                            </div>

                            {/* Last Maintenance */}
                            <div className="text-sm text-gray-500 mb-4">
                                Last Maintenance: {device.lastMaintenance}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-150">
                                    <MdEdit className="w-5 h-5 text-blue-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-150">
                                    <MdRefresh className="w-5 h-5 text-green-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-150">
                                    <MdDelete className="w-5 h-5 text-red-600" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
} 