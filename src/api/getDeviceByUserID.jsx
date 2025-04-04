const API_URL = 'http://localhost:4000/api'

export const getDeviceByUserId = async (userId) => {
    try {
        console.log('Starting to fetch devices...')
        console.log('API URL:', `${API_URL}/devices/${userId}`)
        
        const response = await fetch(`${API_URL}/devices/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include' // Thêm credentials để gửi cookies nếu cần
        })

        console.log('Response status:', response.status)
        console.log('Response headers:', response.headers)

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Error response:', errorText)
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseData = await response.json()
        console.log('Raw API Response:', responseData)
        
        if (!responseData) {
            throw new Error('Empty response from server')
        }

        if (!responseData.success) {
            throw new Error(responseData.message || 'Request failed')
        }

        if (!Array.isArray(responseData.data)) {
            console.error('Expected array of devices, got:', responseData.data)
            return []
        }

        const devices = responseData.data.map(device => ({
            deviceId: device.deviceId,
            deviceName: device.deviceName,
            location: device.location,
            status: device.status,
            lockState: device.lockState,
            batteryLevel: device.batteryLevel
        }))

        console.log('Processed devices:', devices)
        return devices
    } catch (error) {
        console.error('Error in getDeviceByUserId:', error)
        throw error
    }
}