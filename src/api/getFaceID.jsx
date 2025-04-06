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

        if (response.status === 404) {
            return {
                success: true,
                data: []
            }
        }

        if (!response.ok) {
            throw new Error('Failed to fetch Face ID')
        }

        const result = await response.json()

        if (!result.success) {
            if (result.message && result.message.includes('No Face IDs found')) {
                return {
                    success: true,
                    data: []
                }
            }
            throw new Error(result.message || 'Failed to get Face ID data')
        }

        return {
            success: true,
            data: result.data
        }
    } catch (error) {
        console.error('Error fetching Face ID:', error)
        return {
            success: false,
            message: error.message
        }
    }
}


