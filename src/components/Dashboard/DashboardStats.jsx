import PropTypes from 'prop-types'
import { MdLockOpen, MdLock, MdDeviceHub, MdHistory } from 'react-icons/md'

export default function DashboardStatsGrid() {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
            <BoxWrapper>
                <div className="mb-4 flex rounded-full h-11 w-11 flex items-center justify-center bg-blue-500">
                    <MdDeviceHub className="text-2xl text-white" />
                </div>
                <div className="mt-4 flex items-end justify-between text-neutral-700">
                    <div>
                        <h4 className="text-title-md font-bold">12</h4>
                        <span className="text-sm font-medium">Total Devices</span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-medium text-meta-3">Active</span>
                </div>
            </BoxWrapper>
            <BoxWrapper>
                <div className="mb-4 flex rounded-full h-11 w-11 flex items-center justify-center bg-green-500">
                    <MdLockOpen className="text-2xl text-white" />
                </div>
                <div className="mt-4 flex items-end justify-between text-neutral-700">
                    <div>
                        <h4 className="text-title-md font-bold">45</h4>
                        <span className="text-sm font-medium">Unlocked Today</span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-medium text-meta-3">+12%</span>
                </div>
            </BoxWrapper>
            <BoxWrapper>
                <div className="mb-4 flex rounded-full h-11 w-11 flex items-center justify-center bg-yellow-500">
                    <MdLock className="text-2xl text-white" />
                </div>
                <div className="mt-4 flex items-end justify-between text-neutral-700">
                    <div>
                        <h4 className="text-title-md font-bold">8</h4>
                        <span className="text-sm font-medium">Locked Now</span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-medium text-meta-3">Secure</span>
                </div>
            </BoxWrapper>
            <BoxWrapper>
                <div className="mb-4 flex rounded-full h-11 w-11 flex items-center justify-center bg-purple-500">
                    <MdHistory className="text-2xl text-white" />
                </div>
                <div className="mt-4 flex items-end justify-between text-neutral-700">
                    <div>
                        <h4 className="text-title-md font-bold">156</h4>
                        <span className="text-sm font-medium">Total Access Logs</span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-medium text-meta-3">Today</span>
                </div>
            </BoxWrapper>
        </div>
    )
}

function BoxWrapper({ children }) {
    return (
        <div className="p-4 flex-1 rounded-sm border border-stroke bg-white py-7.5 px-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            {children}
        </div>
    )
}

BoxWrapper.propTypes = {
    children: PropTypes.node.isRequired
}
