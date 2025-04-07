import classNames from 'classnames'
import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'
import { MdLockPerson, MdClose } from 'react-icons/md'
import { HiOutlineLogout } from 'react-icons/hi'
import { DASHBOARD_SIDEBAR_LINKS, DASHBOARD_SIDEBAR_BOTTOM_LINKS } from '../../lib/constants/Sidebar'
import { Authenticator } from '@aws-amplify/ui-react'
import { useState, useEffect } from 'react'

const linkClass =
    'flex items-center gap-3 font-medium px-4 py-3 hover:bg-[#2a3b4f] hover:no-underline active:bg-[#2a3b4f] rounded-lg text-base transition-all duration-200 ease-in-out'

function Sidebar({ isOpen, toggleSidebar }) {
    return (
        <div 
            className={classNames(
                'sidebar-container bg-[#24303f] w-[280px] p-4 flex flex-col z-40',
                'fixed top-0 left-0 h-full lg:static transition-transform duration-300 ease-in-out',
                'overflow-y-auto',
                isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
                'shadow-2xl lg:shadow-none'
            )}
        >
            <div className="flex items-center gap-3 px-4 py-4 font-bold text-neutral-300 border-b border-[#2a3b4f]">
                <div className="bg-[#ebf45d] p-2 rounded-lg">
                    <MdLockPerson fontSize={24} className="text-[#24303f]" />
                </div>
                <span className="text-neutral-200 text-xl">Smart Lock System</span>
                {/* Close button for mobile */}
                <button 
                    className="ml-auto lg:hidden text-white" 
                    onClick={toggleSidebar}
                >
                    <MdClose fontSize={24} />
                </button>
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

Sidebar.propTypes = {
    isOpen: PropTypes.bool,
    toggleSidebar: PropTypes.func
}

function SidebarLink({ link }) {
    const { pathname } = useLocation()
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(false)
    const isActive = pathname === link.path || 
                    (link.submenu?.some(sublink => pathname === sublink.path))

    // Automatically open submenu if current path is in submenu
    useEffect(() => {
        if (link.submenu?.some(sublink => pathname === sublink.path)) {
            setIsSubmenuOpen(true)
        }
    }, [pathname, link.submenu])

    if (link.hasSubmenu) {
        return (
            <div>
                <div
                    className={classNames(
                        isActive 
                            ? 'bg-[#ebf45d] text-[#24303f] shadow-lg' 
                            : 'text-neutral-400 hover:text-white',
                        linkClass,
                        'cursor-pointer'
                    )}
                    onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
                >
                    <span className={classNames(
                        "text-xl transition-colors duration-200",
                        isActive ? "text-[#24303f]" : "text-neutral-400"
                    )}>
                        {link.icon}
                    </span>
                    <span className="flex-1">{link.label}</span>
                    <span className={classNames(
                        "transition-transform duration-200",
                        isSubmenuOpen ? "rotate-180" : ""
                    )}>
                        {link.submenuIcon}
                    </span>
                </div>
                {isSubmenuOpen && (
                    <div className="ml-4 mt-2 space-y-2">
                        {link.submenu.map((sublink) => (
                            <Link
                                key={sublink.key}
                                to={sublink.path}
                                className={classNames(
                                    pathname === sublink.path
                                        ? 'bg-[#ebf45d] text-[#24303f] shadow-lg'
                                        : 'text-neutral-400 hover:text-white',
                                    'flex items-center gap-3 font-medium px-4 py-2 hover:bg-[#2a3b4f] hover:no-underline rounded-lg text-sm transition-all duration-200 ease-in-out'
                                )}
                            >
                                <span className={classNames(
                                    "text-lg transition-colors duration-200",
                                    pathname === sublink.path ? "text-[#24303f]" : "text-neutral-400"
                                )}>
                                    {sublink.icon}
                                </span>
                                {sublink.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        )
    }

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
        path: PropTypes.string,
        icon: PropTypes.node.isRequired,
        label: PropTypes.string.isRequired,
        hasSubmenu: PropTypes.bool,
        submenuIcon: PropTypes.node,
        submenu: PropTypes.arrayOf(
            PropTypes.shape({
                key: PropTypes.string.isRequired,
                path: PropTypes.string.isRequired,
                icon: PropTypes.node.isRequired,
                label: PropTypes.string.isRequired
            })
        )
    }).isRequired
}

export default Sidebar;
