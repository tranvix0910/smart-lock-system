import StudentList from '../components/Student/StudentList';

const students = [
    { student_id: 'S001', email: 'john.doe@example.com', full_name: 'John Doe', birthday: '1998-05-15', phone_number: '123-456-7890', attended: true },
    { student_id: 'S002', email: 'jane.smith@example.com', full_name: 'Jane Smith', birthday: '1999-08-22', phone_number: '234-567-8901', attended: false },
    { student_id: 'S003', email: 'mark.lee@example.com', full_name: 'Mark Lee', birthday: '2000-12-10', phone_number: '345-678-9012', attended: true },
];

const Student = () => {
    return (
        <div>
            <StudentList students={students} />
        </div>
    );
};

export default Student;