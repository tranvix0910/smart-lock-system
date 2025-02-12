import axios from 'axios'

const API_URL = 'http://localhost:4000/subject/:subject_id/:class_id'

const getStudents = async (class_id, subject_id) => {
    try {
        const response = await axios.post(
            API_URL,
            {
                class_id,
                subject_id
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        return response.data
    } catch (error) {
        console.error('Error fetching teacher subjects:', error.response?.data || error.message)
        throw error
    }
}

export default getStudents
