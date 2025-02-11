import ClassList from "../components/Class/ClassList"
import { useParams } from "react-router-dom"

const classes = [
    { class_id: "D22CQCI01-N", name: "Internet Vạn Vật", students: 30, schedule: "Monday & Wednesday, 10:00 AM - 12:00 PM" },
    { class_id: "D22CQAI02-M", name: "Trí Tuệ Nhân Tạo", students: 25, schedule: "Tuesday & Thursday, 2:00 PM - 4:00 PM" },
    { class_id: "D22CQWEB03-A", name: "Lập Trình Web", students: 40, schedule: "Friday, 8:00 AM - 10:00 AM" }
]

const Class = () => {

    const { subjectId } = useParams()

    return (
        <div>
            <ClassList classes={classes} subjectId={subjectId} />
        </div>
    )
}

export default Class