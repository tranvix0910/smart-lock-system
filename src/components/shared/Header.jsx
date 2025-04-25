import { Fragment } from 'react'
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react'
import { HiOutlineSearch } from 'react-icons/hi'
import { MdMenu, MdPerson } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { Authenticator } from '@aws-amplify/ui-react'
import useUserAttributes from '../../hooks/useUserAttributes'
import PropTypes from 'prop-types'

export default function Header({ toggleSidebar }) {
    const navigate = useNavigate()
    const userAttributes = useUserAttributes()
    const userName = userAttributes?.preferred_username || 'Guest'
    const initials = userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)

    return (
        <div className="bg-[#24303f] h-16 px-4 md:px-6 flex items-center justify-between border-b border-[#2a3b4f] sticky top-0 z-30">
            <div className="flex items-center gap-4">
                {/* Mobile Sidebar Toggle */}
                <button
                    className="lg:hidden text-neutral-400 hover:text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                    onClick={toggleSidebar}
                >
                    <MdMenu className="h-6 w-6" />
                </button>

                {/* Search Bar */}
                <div className="relative hidden md:block flex-1 max-w-xl">
                    <div className="relative">
                        <HiOutlineSearch
                            fontSize={20}
                            className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
                        />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-[#2a3b4f] pl-10 pr-4 py-2 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ebf45d] focus:ring-opacity-50 transition-all duration-200"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
                {/* Welcome Message */}
                <div className="bg-[#2a3b4f] py-1.5 px-3 rounded-lg flex items-center gap-2">
                    <span className="text-[#ebf45d] font-medium text-sm">Welcome,</span>
                    <span className="text-neutral-200 font-semibold text-sm">{userName}</span>
                </div>

                {/* User Profile */}
                <Menu as="div" className="relative">
                    <div>
                        <MenuButton className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-[#ebf45d] focus:ring-opacity-50 transition-all duration-200">
                            <span className="sr-only">Open user menu</span>
                            <div className="h-9 w-9 rounded-full bg-[#ebf45d] flex items-center justify-center shadow-md">
                                <span className="text-[#24303f] font-bold text-sm">
                                    {initials || <MdPerson className="h-5 w-5" />}
                                </span>
                            </div>
                        </MenuButton>
                    </div>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <MenuItems className="origin-top-right z-10 absolute right-0 mt-2 w-48 rounded-lg shadow-lg p-1 bg-[#24303f] ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <MenuItem>
                                <div
                                    onClick={() => navigate('/dashboard/profile')}
                                    className="hover:bg-[#2a3b4f] focus:bg-[#2a3b4f] rounded-lg px-4 py-2 text-white text-sm font-medium cursor-pointer transition-colors duration-200"
                                >
                                    Your Profile
                                </div>
                            </MenuItem>
                            <MenuItem>
                                <div
                                    onClick={() => navigate('/dashboard/settings')}
                                    className="hover:bg-[#2a3b4f] focus:bg-[#2a3b4f] rounded-lg px-4 py-2 text-white text-sm font-medium cursor-pointer transition-colors duration-200"
                                >
                                    Settings
                                </div>
                            </MenuItem>
                            <MenuItem>
                                <Authenticator>
                                    {({ signOut }) => (
                                        <div
                                            onClick={signOut}
                                            className="hover:bg-red-500/10 focus:bg-red-500/10 rounded-lg px-4 py-2 text-red-400 text-sm font-medium cursor-pointer transition-colors duration-200"
                                        >
                                            Sign out
                                        </div>
                                    )}
                                </Authenticator>
                            </MenuItem>
                        </MenuItems>
                    </Transition>
                </Menu>
            </div>
        </div>
    )
}

Header.propTypes = {
    toggleSidebar: PropTypes.func.isRequired
}
