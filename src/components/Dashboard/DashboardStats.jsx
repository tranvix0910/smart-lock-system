import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { MdLockOpen, MdLock, MdDeviceHub, MdHistory, MdRefresh, MdCheckCircle, MdInfo, MdError } from 'react-icons/md'

const animationStyles = `
@keyframes fadeInDown {
    0% {
        opacity: 0;
        transform: translate(-50%, -20px);
    }
    100% {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}

.animate-fade-in-down {
    animation: fadeInDown 0.3s ease-out;
}
`

export default function DashboardStatsGrid() {
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [stats, setStats] = useState({
        totalDevices: 12,
        unlockedToday: 45,
        lockedNow: 8,
        totalAccessLogs: 156
    })

    const showMessage = (msg, type) => {
        setMessage(msg)
        setMessageType(type)
        setTimeout(() => {
            setMessage('')
            setMessageType('')
        }, 3000)
    }

    const refreshStats = () => {
        setIsLoading(true)
        // Simulated refresh - in a real app, this would fetch data from an API
        setTimeout(() => {
            setStats({
                totalDevices: Math.floor(Math.random() * 5) + 10,
                unlockedToday: Math.floor(Math.random() * 20) + 40,
                lockedNow: Math.floor(Math.random() * 5) + 5,
                totalAccessLogs: Math.floor(Math.random() * 50) + 140
            })
            showMessage('Dashboard statistics updated', 'success')
            setIsLoading(false)
        }, 1000)
    }

    useEffect(() => {
        // Initial load
        refreshStats()
    }, [])

    return (
        <div className="relative">
            {/* Inject CSS animations */}
            <style>{animationStyles}</style>

            {/* Thông báo kiểu mới - giống Fingerprint.jsx */}
            {message && (
                <div
                    className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] px-6 py-3 rounded-lg shadow-lg flex items-center animate-fade-in-down ${
                        messageType === 'error'
                            ? 'bg-red-500 text-white'
                            : messageType === 'info'
                              ? 'bg-blue-500 text-white'
                              : 'bg-green-500 text-white'
                    }`}
                >
                    {messageType === 'error' && <MdError className="mr-2 w-5 h-5" />}
                    {messageType === 'info' && <MdInfo className="mr-2 w-5 h-5" />}
                    {messageType === 'success' && <MdCheckCircle className="mr-2 w-5 h-5" />}
                    {message}
                </div>
            )}

            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-semibold text-[#24303f] truncate">Dashboard Stats</h2>
                <button
                    onClick={refreshStats}
                    disabled={isLoading}
                    className="p-2 text-[#24303f] border border-gray-200 rounded-lg hover:border-[#ebf45d] transition-colors duration-150 flex-shrink-0"
                >
                    <MdRefresh className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
                <BoxWrapper>
                    <div className="mb-4 flex rounded-full h-11 w-11 flex items-center justify-center bg-blue-500">
                        <MdDeviceHub className="text-2xl text-white" />
                    </div>
                    <div className="mt-4 flex items-end justify-between text-neutral-700">
                        <div>
                            <h4 className="text-title-md font-bold">{stats.totalDevices}</h4>
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
                            <h4 className="text-title-md font-bold">{stats.unlockedToday}</h4>
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
                            <h4 className="text-title-md font-bold">{stats.lockedNow}</h4>
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
                            <h4 className="text-title-md font-bold">{stats.totalAccessLogs}</h4>
                            <span className="text-sm font-medium">Total Access Logs</span>
                        </div>
                        <span className="flex items-center gap-1 text-sm font-medium text-meta-3">Today</span>
                    </div>
                </BoxWrapper>
            </div>
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
