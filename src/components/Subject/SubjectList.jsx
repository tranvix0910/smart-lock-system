import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { PiStudent, PiFlask, PiBookOpen, PiCalculator, PiGlobe, PiMusicNote } from 'react-icons/pi'

const icons = [PiStudent, PiFlask, PiBookOpen, PiCalculator, PiGlobe, PiMusicNote]
const colors = ['#22c55e', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']

const subjectsWithAttributes = (subjects) => {
    return subjects.map((subject, index) => ({
        ...subject,
        icon: icons[index % icons.length],
        color: colors[index % colors.length]
    }))
}

const SubjectCard = ({ subject }) => {
    
    const navigate = useNavigate()
    const IconComponent = subject.icon || PiStudent

    return (
        <div className="bg-white rounded-2xl p-4 shadow-lg flex flex-col justify-between w-70 h-[220px] relative overflow-hidden">
            <div className="absolute bottom-0 right-0 text-[180px] opacity-10" style={{ color: subject.color }}>
                <IconComponent />
            </div>

            <div
                className="flex items-center justify-center rounded-full h-12 w-12"
                style={{ backgroundColor: subject.color }}
            >
                <IconComponent className="text-2xl text-white" />
            </div>

            <div className="mt-4 relative z-10 text-neutral-600">
                <h3 className="text-lg font-semibold">{subject.name}</h3>
                <p className="text-sm">{subject.subject_id}</p>
            </div>

            <button
                className="w-1/3 relative z-10 mt-4 px-4 py-2 border border-neutral-700 rounded-lg hover:bg-green-100 transition"
                onClick={() => navigate(`/subject/${subject.subject_id}`)}
            >
                Class List
            </button>
        </div>
    )
}

const SubjectList = ({ subjects }) => {
    const enhancedSubjects = subjectsWithAttributes(subjects)
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {enhancedSubjects.map((subject) => (
                <SubjectCard key={subject.subject_id} subject={subject} />
            ))}
        </div>
    )
}

SubjectCard.propTypes = {
    subject: PropTypes.shape({
        subject_id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        schedule: PropTypes.string.isRequired,
        start_day: PropTypes.string.isRequired,
        end_day: PropTypes.string.isRequired,
        icon: PropTypes.elementType.isRequired,
        color: PropTypes.string.isRequired
    }).isRequired
}

SubjectList.propTypes = {
    subjects: PropTypes.arrayOf(
        PropTypes.shape({
            subject_id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired
        })
    ).isRequired
}

export default SubjectList
