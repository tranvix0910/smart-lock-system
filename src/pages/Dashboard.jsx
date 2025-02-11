import DashboardStats from '../components/Dashboard/DashboardStats'
import TransactionChart from '../components/Dashboard/TransactionChart'
import BuyerProfilePieChart from '../components/Dashboard/BuyerProfilePieChart'
import RecentAttended from '../components/Dashboard/RecentAttended'
import PopularProducts from '../components/Dashboard/PopularProducts'

const Dashboard = () => {
    return (
        <div className="flex flex-col gap-4">
            <DashboardStats />
            <div className="flex flex-row gap-4 w-full">
                <TransactionChart />
                <BuyerProfilePieChart />
            </div>
            <div className="flex flex-row gap-4 w-full">
                <RecentAttended />
                <PopularProducts />
            </div>
        </div>
    )
}

export default Dashboard
