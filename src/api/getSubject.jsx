import axios from 'axios'

const API_URL = 'https://zyje4nluna.execute-api.ap-southeast-1.amazonaws.com/dev'

const getTeacherSubjects = async (sub) => {
    try {
        const response = await axios.post(
            `${API_URL}/subject`,
            { sub },
            { headers: { 'Content-Type': 'application/json' } }
        )
        return response.data
    } catch (error) {
        console.error('Error fetching teacher subjects:', error.response?.data || error.message)
        throw error
    }
}

export default getTeacherSubjects
