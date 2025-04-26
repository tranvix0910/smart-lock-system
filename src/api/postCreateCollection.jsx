const API_URL = import.meta.env.VITE_BACKEND_URL

export const postCreateCollection = async (userId, deviceId) => {
    try {
        const response = await fetch(`${API_URL}/create-collection`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                userId,
                deviceId
            })
        })

        const data = await response.json()

        if (!response.ok && response.status !== 400) {
            throw new Error(data.message || 'Có lỗi xảy ra khi tạo collection')
        }

        return {
            success: data.success,
            message: data.message,
            data: data.data
        }
    } catch (error) {
        console.error('Lỗi khi tạo collection:', error)
        return {
            success: false,
            message: error.message || 'Có lỗi xảy ra khi tạo collection'
        }
    }
}
