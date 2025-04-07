const API_URL = 'http://localhost:4000/api'

export const postDeleteFingerprintRequest = async (userId, deviceId, fingerprintId, faceId) => {

    console.log("userId: ", userId)
    console.log("deviceId: ", deviceId)
    console.log("fingerprintId: ", fingerprintId)
    console.log("faceId: ", faceId)

    const response = await fetch(`${API_URL}/fingerprint/delete-fingerprint-request/${userId}/${deviceId}/${fingerprintId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            faceId: faceId
        })
    })

    if (!response.ok) {
        throw new Error('Failed to delete fingerprint')
    }

    const data = await response.json()
    if (!data.success) {
        throw new Error(data.message || 'Failed to delete fingerprint')
    }

    return data
}
