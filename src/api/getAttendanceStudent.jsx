import axios from 'axios'

const API_URL = 'http://localhost:4000/attendance'

const getAttendanceData = async ( week_day, classId ) => {
    try {
        const url = `${API_URL}/${week_day}/${classId}`
        const response = await axios.post(url, {}, { headers: { 'Content-Type': 'application/json' } })
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error('Error fetching schedule:', error.response?.data || error.message)
        throw error
    }
}

export default getAttendanceData
