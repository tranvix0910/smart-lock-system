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

        const responseData = await response.json()
        console.log('API Response:', responseData)
        
        if (responseData && responseData.success && Array.isArray(responseData.data)) {
            return responseData.data.map(device => ({
                deviceId: device.deviceId,
                deviceName: device.deviceName,
                macAddress: device.macAddress,
                location: device.location,
                status: device.status,
                lockState: device.lockState,
                batteryLevel: device.batteryLevel
            }))
        }

        console.error('Invalid response format:', responseData)
        return []
    } catch (error) {
        console.error('Error fetching devices:', error)
        throw error
    }
}