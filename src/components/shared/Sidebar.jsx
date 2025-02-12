import classNames from 'classnames'
import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'
import { FcConferenceCall } from 'react-icons/fc'
import { HiOutlineLogout } from 'react-icons/hi'
import { DASHBOARD_SIDEBAR_LINKS, DASHBOARD_SIDEBAR_BOTTOM_LINKS } from '../../lib/constants/Sidebar'

import { Authenticator } from '@aws-amplify/ui-react'

const linkClass =
    'flex items-center gap-2.5 font-medium px-3 py-2 hover:bg-neutral-700 hover:no-underline active:bg-neutral-600 rounded-sm text-base'

export default function Sidebar() {
    return (
        <div className="bg-[#24303f] w-72 p-3 flex flex-col">
            <div className="flex items-center gap-2 px-1 py-3 font-bold">
                <FcConferenceCall fontSize={24} />
                <span className="text-neutral-200 text-lg">Attendance System</span>
            </div>
            <div className="py-8 flex flex-1 flex-col gap-0.5">
                {DASHBOARD_SIDEBAR_LINKS.map((link) => (
                    <SidebarLink key={link.key} link={link} />
                ))}
            </div>
            <div className="flex flex-col gap-0.5 pt-2 border-t border-neutral-700">
                {DASHBOARD_SIDEBAR_BOTTOM_LINKS.map((link) => (
                    <SidebarLink key={link.key} link={link} />
                ))}
                <Authenticator>
                    {({ signOut }) => (
                        <div className={classNames(linkClass, 'cursor-pointer text-red-500')} onClick={signOut}>
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

    const isActive = pathname.startsWith(link.path)

    return (
        <Link
            to={link.path}
            className={classNames(isActive ? 'bg-neutral-700 text-white' : 'text-neutral-400', linkClass)}
        >
            <span className="text-xl">{link.icon}</span>
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
