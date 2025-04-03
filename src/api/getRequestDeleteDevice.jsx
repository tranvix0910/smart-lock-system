const API_URL = 'http://localhost:4000/api'

export const getRequestDeleteDevice = async (userId, deviceId) => {
    try {
        console.log('getRequestDeleteDevice', userId, deviceId)
        const response = await fetch(`${API_URL}/devices/delete-device-request/${userId}/${deviceId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        const data = await response.json()
        if (!data.success) {
            throw new Error(data.message || 'Failed to request device deletion')
        }

        return data
    } catch (error) {
        console.error('Error requesting device deletion:', error)
        throw error
    }
}
