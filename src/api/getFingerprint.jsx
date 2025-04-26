const API_URL = import.meta.env.VITE_BACKEND_URL

export const getFingerprint = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/fingerprint/get-fingerprint/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to fetch fingerprints')
        }

        const result = await response.json()

        if (!result.success) {
            throw new Error(result.message || 'Failed to retrieve fingerprints')
        }

        return result
    } catch (error) {
        console.error('Error fetching fingerprints:', error)
        throw error
    }
}
