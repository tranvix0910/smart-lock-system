const API_URL = 'http://localhost:4000/api'

export const getPresignUrl = async (key) => {
    try {
        const response = await fetch(`${API_URL}/s3/get-presigned-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ key })
        })

        console.log('Presign URL request:', {
            url: `${API_URL}/s3/get-presigned-url`,
            key,
            status: response.status
        })

        if (!response.ok) {
            throw new Error(`Failed to get presigned URL: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()
        console.log('Presign URL response:', result)

        if (!result.success) {
            throw new Error(result.message || 'Failed to get presigned URL')
        }

        return {
            success: true,
            data: result.data
        }
    } catch (error) {
        console.error('Error getting presigned URL:', error)
        return {
            success: false,
            message: error.message
        }
    }
}
