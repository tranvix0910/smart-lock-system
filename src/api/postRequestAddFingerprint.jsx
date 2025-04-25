const API_URL = 'http://localhost:4000/api'

export const getRequestAddFingerprint = async (userId, deviceId, faceId) => {
    try {
        const response = await fetch(`${API_URL}/fingerprint/request-add-fingerid/${userId}/${deviceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                faceId
            })
        })
        return response.json()
    } catch (error) {
        console.error('Error fetching request add fingerprint:', error)
        throw error
    }
}
