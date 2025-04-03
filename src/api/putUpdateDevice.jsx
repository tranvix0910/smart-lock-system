const API_URL = 'http://localhost:4000/api'

export const putUpdateDevice = async (userId, deviceId, updatedDevice) => {
    try {
        const response = await fetch(`${API_URL}/devices/${userId}/${deviceId}/update`, {
                method: 'PUT',
                headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedDevice)
        })

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        const responseData = await response.json()
        
        if (!responseData.success) {
            throw new Error(responseData.message || 'Failed to update device')
        }

        return responseData
    } catch (error) {
        console.error('Error updating device:', error)
        throw error
    }
}   

