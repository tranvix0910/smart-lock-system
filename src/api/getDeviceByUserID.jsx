const API_URL = 'http://localhost:4000/api'

export const getDeviceByUserId = async (userId) => {
    try {
        console.log('Starting to fetch devices...')
        console.log('API URL:', `${API_URL}/devices/${userId}`)

        const response = await fetch(`${API_URL}/devices/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
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

        // Log full device objects to see all available properties
        console.log('Raw device objects:', JSON.stringify(responseData.data, null, 2))

        const devices = responseData.data.map((device) => {
            console.log(`Device ${device.deviceId} systemLocked:`, device.systemLocked)
            console.log(`Device ${device.deviceId} systemLockedAt:`, device.systemLockedAt)

            return {
                deviceId: device.deviceId,
                deviceName: device.deviceName,
                location: device.location,
                status: device.status,
                lockState: device.lockState,
                batteryLevel: device.batteryLevel,
                systemLocked: device.systemLocked || false,
                systemLockedAt: device.systemLockedAt || null
            }
        })

        console.log('Processed devices:', devices)
        return devices
    } catch (error) {
        console.error('Error in getDeviceByUserId:', error)
        throw error
    }
}
