const API_URL = import.meta.env.VITE_BACKEND_URL

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

export const getRFIDCard = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/rfid/get-rfid/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) {
            throw new Error('Network response was not ok')
        }
        const data = await response.json()
        console.log(data)
        return data
    } catch (error) {
        console.error('Error getting RFID card:', error)
        throw error
    }
}

export const postRequestDeleteRFIDCard = async (userId, deviceId, rfidId, faceId, rfidIdLength) => {
    try {
        const response = await fetch(`${API_URL}/rfid/request-delete-rfid/${userId}/${deviceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rfidId: rfidId,
                faceId: faceId,
                rfidIdLength: rfidIdLength
            })
        })

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error deleting RFID card:', error)
        throw error
    }
}

export const getUsernameByRFIDCard = async (rfidId) => {
    if (!rfidId) {
        console.error('getUsernameByRFIDCard called with no rfidId')
        return { success: false, error: 'No RFID ID provided' }
    }

    try {
        console.log('Sending request to get username for RFID:', rfidId)

        const response = await fetch(`${API_URL}/rfid/get-username-by-rfid`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rfidId })
        })

        if (!response.ok) {
            console.error(`API response not OK: ${response.status} ${response.statusText}`)
            throw new Error('Network response was not ok')
        }

        const data = await response.json()
        console.log('API response data:', data)
        return data
    } catch (error) {
        console.error('Error getting username by RFID card:', error)
        throw error
    }
}
