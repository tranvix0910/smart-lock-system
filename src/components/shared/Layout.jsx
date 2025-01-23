import Header from './Header'
import Sidebar from './Sidebar'

import { Outlet } from "react-router-dom"

const Layout = () => {

    return (
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
            <div className="flex h-screen overflow-hidden">
                <Sidebar/>
                <div className="flex flex-col flex-1">
				    <Header />
				    <div className="flex-1 mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
					    <Outlet />
				    </div>
			    </div>
            </div>
        </div>
    )
}

export default Layout