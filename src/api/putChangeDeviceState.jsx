const API_URL = import.meta.env.VITE_BACKEND_URL

export const changeDeviceState = async (deviceId, lockState) => {
    try {
        if (!['LOCK', 'UNLOCK'].includes(lockState)) {
            throw new Error('Invalid state. Only LOCK or UNLOCK is allowed')
        }

        const response = await fetch(`${API_URL}/devices/${deviceId}/state`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lockState })
        })

        const data = await response.json()

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Device not found')
            } else if (response.status === 400) {
                throw new Error(data.message || 'Device is offline, cannot change state')
            } else {
                throw new Error(data.message || 'Server error when changing device state')
            }
        }

        return {
            success: true,
            message: data.message,
            device: data.device
        }
    } catch (error) {
        console.error('Error when changing device state:', error)
        return {
            success: false,
            message: error.message
        }
    }
}
