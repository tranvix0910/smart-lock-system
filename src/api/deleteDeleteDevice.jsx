const API_URL = 'http://localhost:4000/api'

export const deleteDeleteDevice = async (userId, deviceId) => {
    try {
        const response = await fetch(`${API_URL}/devices/delete-device/${userId}/${deviceId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        const data = await response.json()
        if (!data.success) {
            throw new Error(data.message || 'Failed to delete device')
        }

        return data
    } catch (error) {
        console.error('Error deleting device:', error)
        throw error
    }
}
