import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ScheduleTable from '../components/Schedule/ScheduleTable'
import getScheduleData from '../api/getSchedule'

const Schedule = () => {
    const { subjectId, classId } = useParams()
    const [scheduleData, setScheduleData] = useState([])

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                if (subjectId) {
                    const fetchedSchedule = await getScheduleData(subjectId, classId)
                    setScheduleData(fetchedSchedule)
                }
            } catch (error) {
                console.error('Error fetching schedule:', error)
            }
        }

        fetchSchedule()
    }, [subjectId, classId])

    return (
        <div>
            <ScheduleTable scheduleData={scheduleData}/>
        </div>
    )
}

export default Schedule