const API_URL = 'http://localhost:4000/api'

export const postRequestAddRFIDCard = async (userId, deviceId, faceId) => {
    try {
        const response = await fetch(`${API_URL}/rfid/request-add-rfid/${userId}/${deviceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({          
                faceId: faceId
            })
        })

        console.log(response)

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        const data = await response.json()
        if (!data.success) {
            throw new Error(data.message || 'Failed to add RFID card')
        }

        return data
    } catch (error) {
        console.error('Error adding RFID card:', error)
        throw error
    }
}
