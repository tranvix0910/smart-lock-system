import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const location = useLocation()

    // Close sidebar when route changes (mobile)
    useEffect(() => {
        setIsSidebarOpen(false)
    }, [location])

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    return (
        <div className="bg-neutral-100 h-screen w-screen overflow-hidden flex flex-col lg:flex-row">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="flex flex-col flex-1 max-h-screen overflow-hidden relative">
                <Header toggleSidebar={toggleSidebar} />
                <div className="flex-1 p-2 sm:p-4 min-h-0 overflow-auto bg-gray-50">
                    <Outlet />
                </div>
            </div>

            {/* Overlay for mobile when sidebar is open */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    )
}

export default Layout
