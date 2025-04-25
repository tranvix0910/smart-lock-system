import { useState, useEffect, useCallback } from 'react'
import {
    MdLockOpen,
    MdLock,
    MdLocationOn,
    MdBatteryFull,
    MdChevronRight,
    MdRefresh,
    MdCheckCircle,
    MdInfo,
    MdError,
    MdWarning
} from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

import useUserAttributes from '../../hooks/useUserAttributes'
import { getDeviceByUserId } from '../../api/getDeviceByUserID'
import { changeDeviceState } from '../../api/putChangeDeviceState'
import postUnlockDevice from '../../api/postUnlockDevice'
import socket from '../../config/websocket'
import UnlockDeviceModal from '../DeviceModal/UnlockDeviceModal'

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

const DeviceManagement = () => {
    const navigate = useNavigate()
    const [devices, setDevices] = useState([])
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isReloading, setIsReloading] = useState(false)
    const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false)
    const [selectedDevice, setSelectedDevice] = useState(null)
    const [isUnlocking, setIsUnlocking] = useState(false)

    const userAttributes = useUserAttributes()
    const userId = userAttributes?.sub

    const handleDeviceStateChange = useCallback(async (data) => {
        console.log('Received device state change:', data)

        setDevices((prevDevices) =>
            prevDevices.map((device) =>
                device.deviceId === data.deviceId ? { ...device, lockState: data.lockState } : device
            )
        )

        setMessage(`${data.deviceName || data.deviceId} has been ${data.lockState.toLowerCase()}ed`)
        setMessageType(data.lockState === 'LOCK' ? 'error' : 'success')
        setTimeout(() => {
            setMessage('')
            setMessageType('')
        }, 3000)
    }, [])

    const handleSystemLockedChange = useCallback(
        (data) => {
            console.log('Received system locked event:', data)

            if (data.mode === 'SYSTEM LOCKED' && data.systemLocked === true) {
                // Update device in state
                setDevices((prevDevices) =>
                    prevDevices.map((device) =>
                        device.deviceId === data.deviceId
                            ? {
                                  ...device,
                                  systemLocked: true,
                                  systemLockedAt: data.timestamp
                              }
                            : device
                    )
                )

                // Show notification to user
                const device = devices.find((d) => d.deviceId === data.deviceId)
                const deviceName = device ? device.deviceName : data.deviceId
                setMessage(`${deviceName} has been system locked!`)
                setMessageType('error')
                setTimeout(() => {
                    setMessage('')
                    setMessageType('')
                }, 3000)
            }
        },
        [devices]
    )

    const handleSystemUnlockedChange = useCallback(
        (data) => {
            console.log('Received system unlocked event:', data)

            if (data.mode === 'SYSTEM UNLOCKED' && data.systemLocked === false) {
                // Update device in state
                setDevices((prevDevices) =>
                    prevDevices.map((device) =>
                        device.deviceId === data.deviceId
                            ? {
                                  ...device,
                                  systemLocked: false,
                                  systemLockedAt: null
                              }
                            : device
                    )
                )

                // Show notification for unlock
                const device = devices.find((d) => d.deviceId === data.deviceId)
                const deviceName = device ? device.deviceName : data.deviceId
                setMessage(`${deviceName} has been system unlocked`)
                setMessageType('success')
                setTimeout(() => {
                    setMessage('')
                    setMessageType('')
                }, 3000)
            }
        },
        [devices]
    )

    useEffect(() => {
        socket.on('deviceStateChange', handleDeviceStateChange)
        socket.on('systemLocked', handleSystemLockedChange)
        socket.on('systemUnlocked', handleSystemUnlockedChange)

        return () => {
            socket.off('deviceStateChange', handleDeviceStateChange)
            socket.off('systemLocked', handleSystemLockedChange)
            socket.off('systemUnlocked', handleSystemUnlockedChange)
        }
    }, [handleDeviceStateChange, handleSystemLockedChange, handleSystemUnlockedChange])

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
                console.log('Fetched devices data:', devicesData)
                if (devicesData && devicesData.length > 0) {
                    devicesData.forEach((device) => {
                        console.log(`Device ${device.deviceId} systemLocked status:`, device.systemLocked)
                    })
                }

                setDevices(devicesData || [])
            } catch (error) {
                console.error('Error fetching devices:', error)
                setMessage('No devices found')
                setMessageType('info')
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

    const handleReload = async () => {
        if (!userId) return
        setIsReloading(true)
        try {
            const devicesData = await getDeviceByUserId(userId)
            setDevices(devicesData || [])
            setMessage('Device list updated successfully')
            setMessageType('success')
        } catch (error) {
            console.error('Error reloading devices:', error)
            setMessage('Failed to reload device list')
            setMessageType('error')
        } finally {
            setIsReloading(false)
            setTimeout(() => {
                setMessage('')
                setMessageType('')
            }, 3000)
        }
    }

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

    const getSystemLockBadge = () => {
        return `px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200`
    }

    const toggleLock = async (deviceId, newLockState) => {
        const device = devices.find((d) => d.deviceId === deviceId)

        if (device.status === 'OFFLINE') {
            setMessage(`Cannot change lock status: ${device.deviceName} is offline`)
            setMessageType('error')
            setTimeout(() => {
                setMessage('')
                setMessageType('')
            }, 3000)
            return
        }

        if (device.systemLocked) {
            setMessage(`Cannot change lock status: ${device.deviceName} is system locked`)
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

            setDevices(
                devices.map((d) =>
                    d.deviceId === deviceId && d.status === 'ONLINE' ? { ...d, lockState: newLockState } : d
                )
            )

            setMessage(`${device.deviceName} has been ${newLockState.toLowerCase()}ed`)
            setMessageType(newLockState === 'LOCK' ? 'info' : 'success')
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

    const handleUnlockSystem = async (deviceId, faceId) => {
        setIsUnlocking(true)
        try {
            console.log(`Unlocking system for device ${deviceId} with Face ID: ${faceId || 'Not provided'}`)

            // Gọi API để mở khóa hệ thống
            const result = await postUnlockDevice(userId, deviceId, faceId)

            if (!result.success) {
                throw new Error(result.message || 'Failed to send unlock request')
            }

            // Hiển thị thông báo thành công nhưng KHÔNG đóng modal
            // (Để người dùng có thể theo dõi quá trình xác thực từ thiết bị)
            setMessage(`Unlock request sent for ${selectedDevice.deviceName}`)
            setMessageType('success')
            setTimeout(() => {
                setMessage('')
                setMessageType('')
            }, 3000)

            // Đặt lại trạng thái unlocking (để nút không còn disabled)
            // nhưng KHÔNG đóng modal hay đặt lại selectedDevice
            setIsUnlocking(false)

            return result // Trả về kết quả để component con có thể sử dụng
        } catch (error) {
            console.error('Error unlocking system:', error)
            setMessage(`Error unlocking system: ${error.message}`)
            setMessageType('error')
            setTimeout(() => {
                setMessage('')
                setMessageType('')
            }, 3000)

            // Trong trường hợp lỗi, đóng modal
            setIsUnlockModalOpen(false)
            setSelectedDevice(null)
            setIsUnlocking(false)

            // Ném lỗi để component con có thể xử lý
            throw error
        }
    }

    const openUnlockModal = (device) => {
        // Ensure device has userId for Face ID loading
        if (!device.userId && userId) {
            device = { ...device, userId }
            console.log('Added userId to device for unlocking:', device)
        }
        setSelectedDevice(device)
        setIsUnlockModalOpen(true)
    }

    return (
        <div className="bg-white px-6 pt-4 pb-6 rounded-lg border border-gray-200 flex-1 shadow-sm">
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

            {/* Unlock Device Modal */}
            <UnlockDeviceModal
                isOpen={isUnlockModalOpen}
                onClose={() => {
                    setIsUnlockModalOpen(false)
                    setSelectedDevice(null)
                }}
                device={selectedDevice}
                onConfirm={(faceId) => selectedDevice && handleUnlockSystem(selectedDevice.deviceId, faceId)}
                isUnlocking={isUnlocking}
            />

            <div className="flex justify-between items-center mb-6 mt-2">
                <strong className="text-gray-800 font-semibold text-lg">Device Management</strong>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReload}
                        disabled={isReloading}
                        className={`flex items-center justify-center w-10 h-10 rounded-lg text-[#24303f] bg-transparent border border-transparent hover:border-[#ebf45d] transition-colors duration-150 ${isReloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <MdRefresh className={`w-5 h-5 ${isReloading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/devices-management')}
                        className="flex items-center gap-2 px-4 py-2 text-[#24303f] bg-transparent border border-transparent hover:border-[#ebf45d] rounded-lg transition-colors duration-150"
                    >
                        <span className="font-medium">More Devices</span>
                        <MdChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : devices.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No devices found</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devices.map((device) => (
                        <div
                            key={device.deviceId}
                            className={`bg-gray-50 rounded-xl p-6 border transition-all duration-300 ${
                                device.systemLocked
                                    ? 'border-orange-300 bg-orange-50'
                                    : 'border-gray-200 hover:border-blue-300'
                            } relative group`}
                        >
                            {/* Header with Status */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-lg mb-1">{device.deviceName}</h3>
                                    <p className="text-sm text-gray-500">{device.deviceId}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={getStatusBadge(device.status)}>{device.status}</span>
                                    {device.systemLocked && <span className={getSystemLockBadge()}>SYSTEM LOCKED</span>}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-center text-gray-600 mb-4">
                                <MdLocationOn className="w-5 h-5 mr-2" />
                                <span>{device.location}</span>
                            </div>

                            {/* System Lock Warning */}
                            {device.systemLocked && (
                                <div className="mb-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
                                    <div className="flex items-start">
                                        <MdWarning className="w-5 h-5 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-orange-700">System Locked</p>
                                            <p className="text-xs text-orange-600 mt-1">
                                                This device was locked by the system on{' '}
                                                {new Date(device.systemLockedAt).toLocaleString()}
                                            </p>
                                            <button
                                                onClick={() => openUnlockModal(device)}
                                                className="mt-2 flex items-center px-3 py-1.5 bg-orange-200 text-orange-800 rounded hover:bg-orange-300 transition-colors text-xs font-medium"
                                            >
                                                <MdLockOpen className="w-4 h-4 mr-1" />
                                                Unlock System
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Lock Status and Battery */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleLock(device.deviceId, 'LOCK')}
                                        disabled={
                                            device.status === 'OFFLINE' ||
                                            device.lockState === 'LOCK' ||
                                            device.systemLocked
                                        }
                                        className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-150
                                            ${
                                                device.status === 'OFFLINE' ||
                                                device.lockState === 'LOCK' ||
                                                device.systemLocked
                                                    ? 'opacity-50 cursor-not-allowed bg-gray-100'
                                                    : 'bg-red-100 hover:bg-red-200'
                                            }`}
                                        title={
                                            device.systemLocked
                                                ? 'Cannot lock system locked device'
                                                : device.status === 'OFFLINE'
                                                  ? 'Device is offline'
                                                  : device.lockState === 'LOCK'
                                                    ? 'Device is already locked'
                                                    : 'Lock device'
                                        }
                                    >
                                        <MdLock className="w-6 h-6 mr-2 text-red-600" />
                                        <span className="font-medium text-red-600">LOCK</span>
                                    </button>
                                    <button
                                        onClick={() => toggleLock(device.deviceId, 'UNLOCK')}
                                        disabled={
                                            device.status === 'OFFLINE' ||
                                            device.lockState === 'UNLOCK' ||
                                            device.systemLocked
                                        }
                                        className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-150
                                            ${
                                                device.status === 'OFFLINE' ||
                                                device.lockState === 'UNLOCK' ||
                                                device.systemLocked
                                                    ? 'opacity-50 cursor-not-allowed bg-gray-100'
                                                    : 'bg-green-100 hover:bg-green-200'
                                            }`}
                                        title={
                                            device.systemLocked
                                                ? 'Cannot unlock system locked device'
                                                : device.status === 'OFFLINE'
                                                  ? 'Device is offline'
                                                  : device.lockState === 'UNLOCK'
                                                    ? 'Device is already unlocked'
                                                    : 'Unlock device'
                                        }
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default DeviceManagement
