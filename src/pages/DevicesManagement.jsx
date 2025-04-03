import { useState, useEffect, useCallback } from 'react'
import { MdDevices, MdSearch, MdAdd, MdRefresh, MdLock, MdLockOpen, MdLocationOn, MdBatteryFull, MdEdit, MdDelete } from 'react-icons/md'
import useUserAttributes from '../hooks/useUserAttributes'
import { getDeviceByUserId } from '../api/getDeviceByUserID'
import { postCreateCollection } from '../api/postCreateCollection'
import { postCreateDevice } from '../api/postCreateDevice'
import { putUpdateDevice } from '../api/putUpdateDevice'
import { getRequestDeleteDevice } from '../api/getRequestDeleteDevice'
import { deleteDeleteDevice } from '../api/deleteDeleteDevice'
import socket from '../config/websocket'
import AddDeviceModal from '../components/DeviceModal/AddDeviceModal'
import UpdateDeviceModal from '../components/DeviceModal/UpdateDeviceModal'
import DeleteDeviceModal from '../components/DeviceModal/DeleteDeviceModal'

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

    const userAttributes = useUserAttributes()
    const userId = userAttributes?.sub

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
            setDevices(data || [])
        } catch (error) {
            console.error('Error fetching devices:', error)
            showMessage('Failed to load devices', 'error')
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

    useEffect(() => {
        socket.on('deviceDeleteConfirmFromClient', handleWebSocketMessage)
        return () => {
            socket.off('deviceDeleteConfirmFromClient', handleWebSocketMessage)
        }
    }, [handleWebSocketMessage])

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
            
            if (error.message.includes('deviceId already exists')) {
                showMessage('Device with this ID already exists', 'error')
            } else if (error.message.includes('MAC address already exists')) {
                showMessage('Device with this MAC address already exists', 'error')
            } else if (error.message.includes('userId, deviceId, macAddress, and secret are required')) {
                showMessage('Missing required information: user ID, device ID, MAC address, or secret key', 'error')
            } else {
                showMessage(error.message || 'An error occurred while adding the device', 'error')
            }
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

    const handleDeleteDevice = (device) => {
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

    const handleEditDevice = (device) => {
        setSelectedDevice(device)
        setIsUpdateModalOpen(true)
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

    return (
        <div className="p-6">
            {message && (
                <div className={`mb-4 p-4 rounded-lg ${messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
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
                        >
                            <MdRefresh className="w-6 h-6" />
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
                            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-300"
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
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => handleEditDevice(device)}
                                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        >
                                            <MdEdit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteDevice(device)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
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
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddDevice}
                isSubmitting={isSubmitting}
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
        </div>
    )
}

export default DevicesManagement
