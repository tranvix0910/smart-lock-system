import getStudents from '../api/getStudent'
import StudentList from '../components/Student/StudentList'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const fetchStudents = async (class_id, subject_id) => {
    try {
        const students = await getStudents(class_id, subject_id)
        return students
    } catch (error) {
        console.error('Error fetching students:', error)
        return []
    }
}

const Student = () => {
    const { subjectId, classId } = useParams()
    const [students, setStudents] = useState([])

    useEffect(() => {
        const getStudentData = async () => {
            if (classId && subjectId) {
                const fetchedStudents = await fetchStudents(classId, subjectId)
                setStudents(fetchedStudents)
            }
        }
        getStudentData()
    }, [classId, subjectId])

    return (
        <div>
            <StudentList students={students} />
        </div>
    )
}

export default Student
