import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ClassList from '../components/Class/ClassList'
import getSubjectClasses from '../api/getClass'

const fetchClasses = async (subject_id) => {
    try {
        const classes = await getSubjectClasses(subject_id)
        return classes
    } catch (error) {
        console.error('Error fetching subject classes:', error)
        return []
    }
}

const Class = () => {
    const { subjectId } = useParams()
    const [classes, setClasses] = useState([])

    useEffect(() => {
        const getClasses = async () => {
            if (subjectId) {
                const fetchedClasses = await fetchClasses(subjectId)
                setClasses(fetchedClasses)
            }
        }
        getClasses()
    }, [subjectId])

    return (
        <div>
            <ClassList classes={classes} subjectId={subjectId} />
        </div>
    )
}

export default Class
