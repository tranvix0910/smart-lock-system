const API_URL = import.meta.env.VITE_BACKEND_URL

const postUnlockDevice = async (userId, deviceId, faceId) => {
    try {
        const response = await fetch(`${API_URL}/devices/unlock-device/${userId}/${deviceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                faceId: faceId || null
            }),
            credentials: 'include'
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'Failed to unlock device')
        }

        return {
            success: true,
            message: data.message,
            data: data.data
        }
    } catch (error) {
        console.error('Error in postUnlockDevice:', error)
        return {
            success: false,
            message: error.message || 'Unknown error occurred while unlocking device'
        }
    }
}

export default postUnlockDevice
