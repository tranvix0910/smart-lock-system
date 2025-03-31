import DashboardStats from '../components/Dashboard/DashboardStats'
import RecentAttended from '../components/Dashboard/RecentAccessLogs'
import DeviceManagement from '../components/Dashboard/DeviceManagement'

const Dashboard = () => {
    return (
        <div className="flex flex-col gap-4">
            <DashboardStats />
            <DeviceManagement />
            <div className="flex flex-row gap-4 w-full">
                <RecentAttended />  
            </div>
        </div>
    )
}

export default Dashboard
