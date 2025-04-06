const API_URL = 'http://localhost:4000/api'

export const deleteDeleteFingerprint = async (userId, fingerprintId) => {
    const response = await fetch(`${API_URL}/fingerprint/delete-fingerprint/${userId}/${fingerprintId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    const data = await response.json()
    return data
}
