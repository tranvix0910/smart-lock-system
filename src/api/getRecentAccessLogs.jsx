const API_URL = 'http://localhost:4000/api'

export const getRecentAccessLogs = async () => {
    try {
        const response = await fetch(`${API_URL}/recent-access-logs`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return {
            success: true,
            data: data
        }
    } catch (error) {
        console.error('Error fetching recent access logs:', error)
        return {
            success: false,
            error: error.message || 'Failed to fetch recent access logs'
        }
    }
}
