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

        console.log('response: ', response)

        if (!response.ok) {
            const errorData = await response.json()
            console.log('Error data:', errorData)

            if (
                errorData &&
                errorData.success === false &&
                errorData.message === 'Cannot delete face. There are dependent components.'
            ) {
                return {
                    success: false,
                    message: errorData.message,
                    data: errorData.data,
                    dependencies: true
                }
            }

            throw new Error(errorData.message || 'Failed to delete Face ID')
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error deleting face ID:', error)
        throw error
    }
}
