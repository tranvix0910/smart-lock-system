const API_URL = import.meta.env.VITE_BACKEND_URL

export const postCreateDevice = async (deviceData) => {
    const response = await fetch(`${API_URL}/create-device`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(deviceData)
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create device')
    }

    return response.json()
}
