import PropTypes from 'prop-types';

const StudentList = ({ students }) => {

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 border border-gray-300">Student ID</th>
                        <th className="px-4 py-2 border border-gray-300">Email</th>
                        <th className="px-4 py-2 border border-gray-300">Full Name</th>
                        <th className="px-4 py-2 border border-gray-300">Birthday</th>
                        <th className="px-4 py-2 border border-gray-300">Phone Number</th>
                        <th className="px-4 py-2 border border-gray-300">Attended</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => (
                        <tr key={student.student_id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border border-gray-300">{student.student_id}</td>
                            <td className="px-4 py-2 border border-gray-300">{student.email}</td>
                            <td className="px-4 py-2 border border-gray-300">{student.full_name}</td>
                            <td className="px-4 py-2 border border-gray-300">{student.birthday}</td>
                            <td className="px-4 py-2 border border-gray-300">{student.phone_number}</td>
                            <td className="px-4 py-2 border border-gray-300 text-center">
                                <input
                                    type="checkbox"
                                    checked={student.attended}
                                    className={`w-5 h-5 ${student.attended ? 'bg-blue-500' : 'bg-gray-200'} border-2 border-gray-400 rounded-md`}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

StudentList.propTypes = {
    students: PropTypes.arrayOf(
        PropTypes.shape({
            student_id: PropTypes.string.isRequired,
            email: PropTypes.string.isRequired,
            full_name: PropTypes.string.isRequired,
            birthday: PropTypes.string.isRequired,
            phone_number: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default StudentList;