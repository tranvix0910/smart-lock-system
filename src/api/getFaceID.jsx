const API_URL = 'http://localhost:4000/api'

export const getFaceID = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/face-id/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })

        if (!response.ok) {
            throw new Error('Failed to fetch Face ID')
        }

        const result = await response.json()

        if (!result.success) {
            throw new Error(result.message || 'Failed to get Face ID data')
        }

        return {
            success: true,
            data: {
                userName: result.data.userName,
                userId: result.data.userId,
                deviceId: result.data.deviceId,
                s3Url: result.data.s3Url,
                faceId: result.data.faceId,
                createdAt: result.data.createdAt
            }
        }
    } catch (error) {
        console.error('Error fetching Face ID:', error)
        return {
            success: false,
            message: error.message
        }
    }
}


