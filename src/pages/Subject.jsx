import { useState, useEffect } from 'react'
import SubjectList from '../components/Subject/SubjectList'
import getTeacherSubjects from '../api/getSubject'
import useUserAttributes from '../hooks/useUserAttributes'

const fetchSubjects = async (teacher_id) => {
    try {
        const subjects = await getTeacherSubjects(teacher_id)
        return subjects
    } catch (error) {
        console.error('Error fetching teacher subjects:', error)
        return []
    }
}

const Subject = () => {
    const [subjects, setSubjects] = useState([])
    const userAttributes = useUserAttributes()

    useEffect(() => {
        const getSubjects = async () => {
            if (userAttributes?.sub) {
                const fetchedSubjects = await fetchSubjects(userAttributes.sub)
                setSubjects(fetchedSubjects)
            }
        }

        getSubjects()
    }, [userAttributes])

    return (
        <div>
            <SubjectList subjects={subjects} />
        </div>
    )
}

export default Subject
