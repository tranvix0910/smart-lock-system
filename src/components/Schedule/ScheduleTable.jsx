import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import getAttendanceData from '../../api/getAttendanceStudent';

const ScheduleTable = ({ scheduleData }) => {

    console.log(scheduleData)
    
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [studentList, setStudentList] = useState([])
    const [selectedWeek, setSelectedWeek] = useState(null)
    const [allStudentData, setAllStudentData] = useState({})

    useEffect(() => {
        const fetchAllStudentData = async () => {
            const data = {};
            for (const week of scheduleData) {

                const localDate = new Date(week.date);
                const classId = week.class_id; 
                
                localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
                const formattedDate = localDate.toISOString().split('T')[0];


                if (classId && !data[formattedDate]) {
                    const students = await getAttendanceData(formattedDate, classId);
                    data[formattedDate] = students;
                }
            }
            setAllStudentData(data);
        };

        if (scheduleData.length > 0) {
            fetchAllStudentData();
        }
    }, [scheduleData]);

    const openModal = (week) => {
        setStudentList(allStudentData[week] || []);
        setSelectedWeek(week);
        setIsModalOpen(true);
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 shadow-lg rounded-lg overflow-hidden">
                <thead>
                    <tr className="bg-[#5C7285] text-neutral-200 text-center">
                        <th className="px-4 py-3 border border-[#5C7285]">Week</th>
                        <th className="px-4 py-3 border border-[#5C7285]">Date</th>
                        <th className="px-4 py-3 border border-[#5C7285]">On Time</th>
                        <th className="px-4 py-3 border border-[#5C7285]">Late</th>
                        <th className="px-4 py-3 border border-[#5C7285]">Absent</th>
                        <th className="px-4 py-3 border border-[#5C7285]">Action</th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {scheduleData.map((week, index) => {
                        const localDate = new Date(week.date);
                        localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
                        const formattedDate = localDate.toISOString().split('T')[0];

                        const students = allStudentData[formattedDate] || [];
                        const counts = students.reduce(
                            (acc, student) => {
                                if (student.status === 'onTime') acc.onTime += 1;
                                if (student.status === 'late') acc.late += 1;
                                if (student.status === 'absent') acc.absent += 1;
                                return acc;
                            },
                            { onTime: 0, late: 0, absent: 0 }
                        );

                        return (
                            <tr key={index} className="border-b hover:bg-gray-100 transition text-center">
                                <td className="px-4 py-3">{week.week}</td>
                                <td className="px-4 py-3">
                                    {new Date(week.date).toLocaleDateString('vi-VN')}
                                </td>
                                <td className={`px-4 py-3 ${counts.onTime > 0 ? 'text-green-700 font-semibold' : ''}`}>
                                    {counts.onTime}
                                </td>
                                <td className={`px-4 py-3 ${counts.late > 0 ? 'text-yellow-700 font-semibold' : ''}`}>
                                    {counts.late}
                                </td>
                                <td className={`px-4 py-3 ${counts.absent > 0 ? 'text-red-700 font-semibold' : ''}`}>
                                    {counts.absent}
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        className="px-4 py-2 text-white bg-[#5C7285] rounded-lg hover:bg-gray-700 transition"
                                        onClick={() => openModal(formattedDate)}                                                                      
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                contentLabel="Student List"
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                ariaHideApp={false}
            >
                <div className="bg-white w-3/4 max-h-[80vh] overflow-y-auto p-5 rounded-lg shadow-lg">
                    <div className="px-5 py-4 flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Danh sách sinh viên - Tuần {selectedWeek}</h2>
                        <button
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                    <table className="min-w-full border border-gray-300 shadow-lg rounded-lg">
                        <thead>
                            <tr className="bg-[#5C7285] text-neutral-200 text-center">
                                <th className="px-4 py-3 border border-[#5C7285]">Student ID</th>
                                <th className="px-4 py-3 border border-[#5C7285]">Full Name</th>
                                <th className="px-4 py-3 border border-[#5C7285]">Email</th>
                                <th className="px-4 py-3 border border-[#5C7285]">Phone</th>
                                <th className="px-4 py-3 border border-[#5C7285]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {studentList.map((student) => (
                                <tr key={student.student_id} className="border-b text-center">
                                    <td className="px-4 py-3">{student.student_id}</td>
                                    <td className="px-4 py-3">{student.full_name}</td>
                                    <td className="px-4 py-3">{student.email}</td>
                                    <td className="px-4 py-3">{student.phone_number}</td>
                                    <td className={`px-4 py-3 font-semibold ${student.status === 'absent' ? 'text-red-700 bg-red-100' : student.status === 'late' ? 'text-yellow-700 bg-yellow-100' : 'text-green-700 bg-green-100'}`}>
                                        {student.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal>
        </div>
    );
};

ScheduleTable.propTypes = {
    scheduleData: PropTypes.arrayOf(
        PropTypes.shape({
            week: PropTypes.number.isRequired,
            date: PropTypes.string.isRequired,
            onTime: PropTypes.number.isRequired,
            late: PropTypes.number.isRequired,
            absent: PropTypes.number.isRequired
        })
    ).isRequired
};

export default ScheduleTable;