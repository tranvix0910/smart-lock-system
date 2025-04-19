import { useState, useEffect, useCallback } from 'react'
import { 
    MdDevices, 
    MdSearch, 
    MdAdd, 
    MdRefresh, 
    MdLock, 
    MdLockOpen, 
    MdLocationOn, 
    MdBatteryFull, 
    MdEdit, 
    MdDelete,
    MdCheckCircle,
    MdInfo,
    MdError,
    MdWarning
} from 'react-icons/md'
import useUserAttributes from '../hooks/useUserAttributes'
import { getDeviceByUserId } from '../api/getDeviceByUserID'
import { postCreateCollection } from '../api/postCreateCollection'
import { postCreateDevice } from '../api/postCreateDevice'
import { putUpdateDevice } from '../api/putUpdateDevice'
import { getRequestDeleteDevice } from '../api/getRequestDeleteDevice'
import { deleteDeleteDevice } from '../api/deleteDeleteDevice'
import postUnlockDevice from '../api/postUnlockDevice'
import socket from '../config/websocket'
import AddDeviceModal from '../components/DeviceModal/AddDeviceModal'
import UpdateDeviceModal from '../components/DeviceModal/UpdateDeviceModal'
import DeleteDeviceModal from '../components/DeviceModal/DeleteDeviceModal'
import UnlockDeviceModal from '../components/DeviceModal/UnlockDeviceModal'

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

const DevicesManagement = () => {
    const [devices, setDevices] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedDevice, setSelectedDevice] = useState(null)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [isDeletingDevice, setIsDeletingDevice] = useState(false)
    const [deleteResponse, setDeleteResponse] = useState(null)
    const [addDeviceError, setAddDeviceError] = useState('')
    const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false)
    const [isUnlockingSystem, setIsUnlockingSystem] = useState(false)

    const userAttributes = useUserAttributes()
    const userId = userAttributes?.sub
    const userName = userAttributes?.preferred_username

    const showMessage = (msg, type) => {
        setMessage(msg)
        setMessageType(type)
        
        setTimeout(() => {
            setMessage('')
            setMessageType('')
        }, 3000)
    }

    const fetchDevices = useCallback(async () => {
        if (!userId) {
            setIsLoading(false)
            return
        }
        try {
            setIsLoading(true)
            const data = await getDeviceByUserId(userId)
            console.log('Fetched devices data in DevicesManagement:', data)
            setDevices(data || [])
        } catch (error) {
            console.error('Error fetching devices:', error)
            showMessage('No devices found', 'info')
        } finally {
            setIsLoading(false)
        }
    }, [userId])

    useEffect(() => {
        fetchDevices()
    }, [fetchDevices])

    useEffect(() => {
        if (deleteResponse && isDeletingDevice) {
            proceedWithDeletion()
        }
    }, [deleteResponse])

    const handleWebSocketMessage = useCallback((data) => {
        try {
            if (data.type === 'DEVICE_UPDATE') {
                setDevices(prevDevices => prevDevices.map(device => 
                    device.deviceId === data.deviceId 
                        ? { ...device, ...data.updates }
                        : device
                ))
            } else if (data.userId === userId && 
                      data.status === 'DELETE ACCEPTED FROM CLIENT') {
                setDeleteResponse({
                    deviceId: data.deviceId,
                    status: data.status,
                    timestamp: data.timestamp
                })
            }
        } catch (error) {
            console.error('Error processing WebSocket message:', error)
        }
    }, [userId])

    const handleSystemLockedChange = useCallback((data) => {
        console.log('Received system locked event:', data)
        
        if (data.mode === 'SYSTEM LOCKED' && data.systemLocked === true) {
            // Update device in state
            setDevices(prevDevices => 
                prevDevices.map(device => device.deviceId === data.deviceId
                    ? { 
                        ...device, 
                        systemLocked: true,
                        systemLockedAt: data.timestamp 
                    }
                    : device
                )
            )
            
            // Show notification to user
            const device = devices.find(d => d.deviceId === data.deviceId);
            const deviceName = device ? device.deviceName : data.deviceId;
            showMessage(`${deviceName} has been system locked!`, 'error');
        }
    }, [devices])

    const handleSystemUnlockedChange = useCallback((data) => {
        console.log('Received system unlocked event:', data)
        
        if (data.mode === 'SYSTEM UNLOCKED' && data.systemLocked === false) {
            // Update device in state
            setDevices(prevDevices => 
                prevDevices.map(device => device.deviceId === data.deviceId
                    ? { 
                        ...device, 
                        systemLocked: false,
                        systemLockedAt: null 
                    }
                    : device
                )
            )
            
            const device = devices.find(d => d.deviceId === data.deviceId);
            const deviceName = device ? device.deviceName : data.deviceId;
            showMessage(`${deviceName} has been system unlocked`, 'success');
        }
    }, [devices])

    useEffect(() => {
        socket.on('deviceDeleteConfirmFromClient', handleWebSocketMessage)
        socket.on('systemLocked', handleSystemLockedChange)
        socket.on('systemUnlocked', handleSystemUnlockedChange)
        
        return () => {
            socket.off('deviceDeleteConfirmFromClient', handleWebSocketMessage)
            socket.off('systemLocked', handleSystemLockedChange)
            socket.off('systemUnlocked', handleSystemUnlockedChange)
        }
    }, [handleWebSocketMessage, handleSystemLockedChange, handleSystemUnlockedChange])

    const filteredDevices = devices.filter(device => {
        const matchesSearch = device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            device.location.toLowerCase().includes(searchTerm.toLowerCase())
        
        if (filterStatus === 'all') return matchesSearch
        return matchesSearch && device.status === filterStatus.toUpperCase()
    })

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

    const handleAddDevice = async (newDevice) => {
        if (!newDevice.deviceName || !newDevice.location || !newDevice.deviceId || !newDevice.macAddress || !newDevice.secretKey) {
            showMessage('Please fill in all device information', 'error')
            return
        }

        if (!userId) {
            showMessage('User not authenticated', 'error')
            return
        }

        try {
            setIsSubmitting(true)
            setAddDeviceError('') // Reset error
            
            const deviceId = newDevice.deviceId
            
            const collectionResult = await postCreateCollection(userId, deviceId)
            if (!collectionResult.success) {
                throw new Error(collectionResult.message)
            }

            const deviceSetupData = {
                ...newDevice,
                userId: userId
            }
            
            console.log('Sending device data:', deviceSetupData)
            const response = await setupDevice(deviceSetupData)
            
            if (!response.success) {
                throw new Error(response.message || 'Could not create device')
            }

            showMessage('Device added successfully', 'success')
            setIsAddModalOpen(false)
            fetchDevices()
        } catch (error) {
            console.error('Error adding device:', error)
            
            let errorMessage = error.message || 'An error occurred while adding the device';
            
            if (error.message.includes('deviceId already exists')) {
                errorMessage = 'Device with this ID already exists';
                setAddDeviceError(errorMessage);
            } else if (error.message.includes('MAC address already exists')) {
                errorMessage = 'Device with this MAC address already exists';
                setAddDeviceError(errorMessage);
            } else if (error.message.includes('userId, deviceId, macAddress, and secret are required')) {
                errorMessage = 'Missing required information: user ID, device ID, MAC address, or secret key';
                setAddDeviceError(errorMessage);
            } else {
                setAddDeviceError(errorMessage);
            }
            
            showMessage(errorMessage, 'error');
        } finally {
            setIsSubmitting(false)
        }
    }

    const setupDevice = async (deviceData) => {
        try {
            console.log('Setting up device with data:', {
                deviceId: deviceData.deviceId,
                userId: deviceData.userId,
                macAddress: deviceData.macAddress,
                deviceName: deviceData.deviceName,
                userName,
                location: deviceData.location
            })
            
            const response = await postCreateDevice(deviceData)
            console.log('Device setup response:', response)
            return response
        } catch (error) {
            console.error('Error setting up device:', error)
            throw error
        }
    };

    const handleEditDevice = (device) => {
        if (device.systemLocked) {
            showMessage('Cannot edit a system locked device', 'error');
            return;
        }
        setSelectedDevice(device)
        setIsUpdateModalOpen(true)
    }

    const handleDeleteDevice = (device) => {
        if (device.systemLocked) {
            showMessage('Cannot delete a system locked device', 'error');
            return;
        }
        setSelectedDevice(device)
        setIsDeleteConfirmOpen(true)
    }

    const handleNextStep = async () => {
        setIsDeletingDevice(true)
        try {
            await getRequestDeleteDevice(userId, selectedDevice.deviceId)
        } catch (error) {
            console.error('Error requesting device deletion:', error)
            showMessage('Failed to initiate device deletion', 'error')
            setIsDeletingDevice(false)
        }
    }

    const proceedWithDeletion = async () => {
        try {
            await deleteDeleteDevice(userId, selectedDevice.deviceId)
            setDevices(prevDevices => prevDevices.filter(d => d.deviceId !== selectedDevice.deviceId))
            showMessage(`Device ${selectedDevice.deviceName} deleted successfully`, 'success')
            closeDeleteModal()
        } catch (error) {
            console.error('Error deleting device:', error)
            showMessage(`Error deleting device: ${error.message}`, 'error')
        }
    }

    const closeDeleteModal = () => {
        setIsDeleteConfirmOpen(false)
        setSelectedDevice(null)
    }

    const handleUpdateDevice = async (updatedDevice) => {
        if (!updatedDevice.deviceName || !updatedDevice.location) {
            showMessage('Please fill in device name and location', 'error')
            return
        }

        try {
            setIsSubmitting(true)
            
            const updateData = {
                deviceName: updatedDevice.deviceName,
                location: updatedDevice.location
            }
            
            const result = await putUpdateDevice(userId, updatedDevice.deviceId, updateData)
            
            if (!result.success) {
                throw new Error(result.message || 'Could not update device')
            }

            setDevices(prevDevices => prevDevices.map(d => 
                d.deviceId === updatedDevice.deviceId 
                    ? {...d, ...updateData}
                    : d
            ))

            showMessage('Device updated successfully', 'success')
            setIsUpdateModalOpen(false)
            setSelectedDevice(null)
        } catch (error) {
            console.error('Error updating device:', error)
            showMessage(`Error updating device: ${error.message}`, 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUnlockSystem = async (deviceId, faceId) => {
        setIsUnlockingSystem(true)
        try {
            console.log(`Unlocking system for device ${deviceId} with Face ID: ${faceId || 'Not provided'}`);
            
            const result = await postUnlockDevice(userId, deviceId, faceId);
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to send unlock request');
            }
            
            // Hiển thị thông báo thành công nhưng không đóng modal
            // để người dùng có thể theo dõi quá trình xác thực từ thiết bị
            showMessage(`Unlock request sent for ${selectedDevice.deviceName}`, 'success');
            
            // Đặt lại trạng thái unlocking (để nút không còn disabled)
            // nhưng không đóng modal
            setIsUnlockingSystem(false);
            
            return result; // Trả về kết quả để component con có thể sử dụng
        } catch (error) {
            console.error('Error unlocking system:', error);
            showMessage(`Error unlocking system: ${error.message}`, 'error');
            
            // Trong trường hợp lỗi, đóng modal
            setIsUnlockingSystem(false);
            setIsUnlockModalOpen(false);
            setSelectedDevice(null);
            
            // Ném lỗi để component con có thể xử lý
            throw error;
        }
    }

    const openUnlockModal = (device) => {
        // Ensure device has userId for Face ID loading
        if (!device.userId && userId) {
            device = { ...device, userId };
            console.log('Added userId to device for unlocking:', device);
        }
        setSelectedDevice(device);
        setIsUnlockModalOpen(true);
    }

    return (
        <div className="p-6">
            {/* Inject CSS animations */}
            <style>{animationStyles}</style>
            
            {/* Thông báo kiểu mới - giống Fingerprint và FaceID */}
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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MdDevices className="w-8 h-8 text-gray-600" />
                        <h1 className="text-2xl font-semibold text-gray-800">Devices Management</h1>
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150"
                    >
                        <MdAdd className="w-5 h-5 mr-2" />
                        Add New Device
                    </button>
                </div>
                <p className="text-gray-500 mt-1">Manage and monitor all your smart lock devices</p>
            </div>

                {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-1 w-full">
                        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search devices by name, ID or location..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {/* Filters */}
                    <div className="flex gap-2">
                        <select
                            className="px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </select>
                        <button 
                            onClick={fetchDevices}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                            disabled={isLoading}
                        >
                            <MdRefresh className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Devices Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredDevices.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <MdDevices className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No devices found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter to find what you are looking for.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDevices.map((device) => (
                        <div 
                            key={device.deviceId}
                            className={`bg-white rounded-xl p-6 border transition-all duration-300 ${
                                device.systemLocked 
                                    ? 'border-orange-300 bg-orange-50' 
                                    : 'border-gray-200 hover:border-blue-300'
                            }`}
                        >
                            {/* Device Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-lg mb-1">{device.deviceName}</h3>
                                    <p className="text-sm text-gray-500">{device.deviceId}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={getStatusBadge(device.status)}>
                                        {device.status}
                                    </span>
                                    {device.systemLocked && (
                                        <span className={getSystemLockBadge()}>
                                            SYSTEM LOCKED
                                        </span>
                                    )}
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => handleEditDevice(device)}
                                            disabled={device.systemLocked}
                                            className={`p-1.5 rounded-full transition-colors ${
                                                device.systemLocked 
                                                ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                            }`}
                                            title={device.systemLocked ? "Cannot edit system locked device" : "Edit device"}
                                        >
                                            <MdEdit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteDevice(device)}
                                            disabled={device.systemLocked}
                                            className={`p-1.5 rounded-full transition-colors ${
                                                device.systemLocked 
                                                ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                                : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                                            }`}
                                            title={device.systemLocked ? "Cannot delete system locked device" : "Delete device"}
                                        >
                                            <MdDelete className="w-4 h-4" />
                                        </button>
                                    </div>
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
                                                This device was locked by the system on {new Date(device.systemLockedAt).toLocaleString()}
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

                            {/* Status and Battery */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center">
                                    {device.lockState === 'LOCK' ? (
                                        <div className="flex items-center text-red-600">
                                            <MdLock className="w-5 h-5 mr-2" />
                                            <span className="font-medium">Locked</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-green-600">
                                            <MdLockOpen className="w-5 h-5 mr-2" />
                                            <span className="font-medium">Unlocked</span>
                                        </div>
                                    )}
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

            {/* Add Device Modal */}
            <AddDeviceModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setAddDeviceError('');
                }}
                onSubmit={handleAddDevice}
                isSubmitting={isSubmitting}
                error={addDeviceError}
            />

            {/* Update Device Modal */}
            <UpdateDeviceModal 
                isOpen={isUpdateModalOpen}
                onClose={() => {
                    setIsUpdateModalOpen(false)
                    setSelectedDevice(null)
                }}
                onSubmit={handleUpdateDevice}
                isSubmitting={isSubmitting}
                device={selectedDevice}
            />

            {/* Delete Confirmation Modal */}
            <DeleteDeviceModal 
                isOpen={isDeleteConfirmOpen}
                onClose={closeDeleteModal}
                device={selectedDevice}
                onConfirm={handleNextStep}
                isDeleting={isDeletingDevice}
                deleteResponse={deleteResponse}
            />

            {/* Unlock System Modal */}
            <UnlockDeviceModal 
                isOpen={isUnlockModalOpen}
                onClose={() => {
                    setIsUnlockModalOpen(false);
                    setSelectedDevice(null);
                }}
                device={selectedDevice}
                onConfirm={(faceId) => selectedDevice && handleUnlockSystem(selectedDevice.deviceId, faceId)}
                isUnlocking={isUnlockingSystem}
            />
        </div>
    )
}

export default DevicesManagement
