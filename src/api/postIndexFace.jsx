const API_URL = 'http://localhost:4000/api'

export const postIndexFace = async (userId, deviceId, userName, imageFile) => {
    try {
        const formData = new FormData()
        formData.append('userName', userName)
        formData.append('image', imageFile)

        console.log('Sending formData:', {
            userName,
            imageFile: {
                name: imageFile.name,
                type: imageFile.type,
                size: imageFile.size
            }
        });

        const response = await fetch(`${API_URL}/rekognition/index-face/${userId}/${deviceId}`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Upload failed')
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error in postIndexFace:', error)
        throw error
    }
}
