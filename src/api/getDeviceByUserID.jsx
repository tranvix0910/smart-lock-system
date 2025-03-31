const API_URL = 'http://localhost:4000/api'

export const getDeviceByUserId = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/devices/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        const data = await response.json()
        console.log('API Response:', data)

        if (!Array.isArray(data)) {
            console.error('Data is not an array:', data)
            return []
        }

        return data.map(device => ({
            deviceId: device.deviceId,
            deviceName: device.deviceName,
            location: device.location,
            status: device.status,
            lockState: device.lockState,
            lastMaintenance: device.lastMaintenance,
            batteryLevel: device.batteryLevel
        }))
    } catch (error) {
        console.error('Error fetching devices:', error)
        throw error
    }
}