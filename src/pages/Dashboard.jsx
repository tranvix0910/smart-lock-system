import DashboardStats from '../components/DashboardStats'
import TransactionChart from '../components/TransactionChart'
import BuyerProfilePieChart from '../components/BuyerProfilePieChart'
import RecentAttended from '../components/RecentAttended'
import PopularProducts from '../components/PopularProducts'

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