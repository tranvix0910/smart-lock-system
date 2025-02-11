import SubjectList from '../components/Subjects/SubjectList'

const subjects = [
    { subject_id: 'MATH101', name: 'Mathematics' },
    { subject_id: 'SCI202', name: 'Science' },
    { subject_id: 'ENG303', name: 'English Literature' },
    { subject_id: 'HIST404', name: 'History' },
    { subject_id: 'MUSIC505', name: 'Music' }
]

const Subject = () => {
    return (
        <div>
            <SubjectList subjects={subjects} />
        </div>
    )
}

export default Subject
