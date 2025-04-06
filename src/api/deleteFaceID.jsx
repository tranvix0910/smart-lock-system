const API_URL = 'http://localhost:4000/api'

export const deleteFaceID = async (userId, deviceId, faceId) => {
    try {
        const response = await fetch(`${API_URL}/rekognition/delete-face/${userId}/${deviceId}`, {
                method: 'DELETE',
                headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ faceId })
        })

        console.log("response", response)

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error deleting face ID:', error)
        throw error
    }
}
