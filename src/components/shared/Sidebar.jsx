import classNames from 'classnames'
import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'
import { MdLockPerson } from 'react-icons/md'
import { HiOutlineLogout } from 'react-icons/hi'
import { DASHBOARD_SIDEBAR_LINKS, DASHBOARD_SIDEBAR_BOTTOM_LINKS } from '../../lib/constants/Sidebar'
import { Authenticator } from '@aws-amplify/ui-react'

const linkClass =
    'flex items-center gap-3 font-medium px-4 py-3 hover:bg-[#2a3b4f] hover:no-underline active:bg-[#2a3b4f] rounded-lg text-base transition-all duration-200 ease-in-out'

export default function Sidebar() {
    return (
        <div className="bg-[#24303f] w-80 p-4 flex flex-col h-screen">
            <div className="flex items-center gap-3 px-4 py-4 font-bold text-neutral-300 border-b border-[#2a3b4f]">
                <div className="bg-[#ebf45d] p-2 rounded-lg">
                    <MdLockPerson fontSize={24} className="text-[#24303f]" />
                </div>
                <span className="text-neutral-200 text-xl">Smart Lock System</span>
            </div>
            <div className="py-8 flex flex-1 flex-col gap-2">
                {DASHBOARD_SIDEBAR_LINKS.map((link) => (
                    <SidebarLink key={link.key} link={link} />
                ))}
            </div>
            <div className="flex flex-col gap-2 pt-4 border-t border-[#2a3b4f]">
                {DASHBOARD_SIDEBAR_BOTTOM_LINKS.map((link) => (
                    <SidebarLink key={link.key} link={link} />
                ))}
                <Authenticator>
                    {({ signOut }) => (
                        <div 
                            className={classNames(linkClass, 'cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10')} 
                            onClick={signOut}
                        >
                            <span className="text-xl">
                                <HiOutlineLogout />
                            </span>
                            Sign out
                        </div>
                    )}
                </Authenticator>
            </div>
        </div>
    )
}

function SidebarLink({ link }) {
    const { pathname } = useLocation()
    const isActive = pathname === link.path

    return (
        <Link
            to={link.path}
            className={classNames(
                isActive 
                    ? 'bg-[#ebf45d] text-[#24303f] shadow-lg' 
                    : 'text-neutral-400 hover:text-white', 
                linkClass
            )}
        >
            <span className={classNames(
                "text-xl transition-colors duration-200",
                isActive ? "text-[#24303f]" : "text-neutral-400"
            )}>
                {link.icon}
            </span>
            {link.label}
        </Link>
    )
}

SidebarLink.propTypes = {
    link: PropTypes.shape({
        path: PropTypes.string.isRequired,
        icon: PropTypes.node.isRequired,
        label: PropTypes.string.isRequired
    }).isRequired,
    linkClass: PropTypes.string
}
