import { Fragment } from 'react'
import {
    Menu,
    MenuButton,
    MenuItems,
    MenuItem,
    Popover,
    PopoverButton,
    PopoverPanel,
    Transition
} from '@headlessui/react'
import { HiOutlineBell, HiOutlineSearch, HiOutlineChatAlt } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames'
import { Authenticator } from '@aws-amplify/ui-react'
import useUserAttributes from '../../hooks/useUserAttributes'

export default function Header() {
    
    const navigate = useNavigate()
    const userAttributes = useUserAttributes()

    return (
        <div className="bg-[#24303f] h-16 px-6 flex items-center justify-between border-b border-[#2a3b4f]">
            <div className="relative flex-1 max-w-xl">
                <div className="relative">
                    <HiOutlineSearch fontSize={20} className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-[#2a3b4f] pl-10 pr-4 py-2 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ebf45d] focus:ring-opacity-50 transition-all duration-200"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Popover className="relative">
                    {({ open }) => (
                        <>
                            <PopoverButton
                                className={classNames(
                                    open && 'bg-[#2a3b4f]',
                                    'group inline-flex items-center rounded-lg p-2 text-neutral-400 hover:text-white hover:bg-[#2a3b4f] focus:outline-none transition-all duration-200'
                                )}
                            >
                                <HiOutlineChatAlt fontSize={20} />
                            </PopoverButton>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-200"
                                enterFrom="opacity-0 translate-y-1"
                                enterTo="opacity-100 translate-y-0"
                                leave="transition ease-in duration-150"
                                leaveFrom="opacity-100 translate-y-0"
                                leaveTo="opacity-0 translate-y-1"
                            >
                                <PopoverPanel className="absolute right-0 z-10 mt-2.5 transform h-90 w-80">
                                    <div className="bg-[#24303f] rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 px-2 py-2.5">
                                        <div className="px-4 py-2">
                                            <strong className="text-sm font-medium text-white">Messages</strong>
                                        </div>
                                        <div className="mt-2 px-4 py-2 text-sm">
                                            <a
                                                className="flex flex-col gap-2.5 border-t border-[#2a3b4f] px-4.5 py-3 hover:bg-[#2a3b4f] rounded-lg transition-colors duration-200"
                                                href="/"
                                            >
                                                <p className="text-sm text-white">
                                                    <span className="font-medium">Edit your information in a swipe</span>
                                                    <br />
                                                    <span className="text-neutral-400">Sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.</span>
                                                </p>
                                                <p className="text-xs text-neutral-400">12 May, 2025</p>
                                            </a>
                                        </div>
                                    </div>
                                </PopoverPanel>
                            </Transition>
                        </>
                    )}
                </Popover>
                <Popover className="relative">
                    {({ open }) => (
                        <>
                            <PopoverButton
                                className={classNames(
                                    open && 'bg-[#2a3b4f]',
                                    'group inline-flex items-center rounded-lg p-2 text-neutral-400 hover:text-white hover:bg-[#2a3b4f] focus:outline-none transition-all duration-200'
                                )}
                            >
                                <HiOutlineBell fontSize={20} />
                            </PopoverButton>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-200"
                                enterFrom="opacity-0 translate-y-1"
                                enterTo="opacity-100 translate-y-0"
                                leave="transition ease-in duration-150"
                                leaveFrom="opacity-100 translate-y-0"
                                leaveTo="opacity-0 translate-y-1"
                            >
                                <PopoverPanel className="absolute right-0 z-10 mt-2.5 transform w-80">
                                    <div className="bg-[#24303f] rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 px-2 py-2.5">
                                        <div className="px-4 py-2">
                                            <strong className="text-sm font-medium text-white">Notifications</strong>
                                        </div>
                                        <div className="mt-2 px-4 py-2 text-sm">
                                            <a
                                                className="flex flex-col gap-2.5 border-t border-[#2a3b4f] px-4.5 py-3 hover:bg-[#2a3b4f] rounded-lg transition-colors duration-200"
                                                href="/"
                                            >
                                                <p className="text-sm text-white">
                                                    <span className="font-medium">System Update</span>
                                                    <br />
                                                    <span className="text-neutral-400">New features and improvements have been added to the system.</span>
                                                </p>
                                                <p className="text-xs text-neutral-400">2 hours ago</p>
                                            </a>
                                        </div>
                                    </div>
                                </PopoverPanel>
                            </Transition>
                        </>
                    )}
                </Popover>
                <div className="flex items-center gap-3">
                    <div
                        className="text-neutral-300 font-medium truncate max-w-[150px]"
                        title={userAttributes?.preferred_username || 'Please sign in'}
                    >
                        Welcome, {userAttributes?.preferred_username || 'Guest'}
                    </div>
                    <Menu as="div" className="relative">
                        <div>
                            <MenuButton className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-[#ebf45d] focus:ring-opacity-50 transition-all duration-200">
                                <span className="sr-only">Open user menu</span>
                                <div
                                    className="h-10 w-10 rounded-full bg-[#ebf45d] bg-cover bg-no-repeat bg-center ring-2 ring-[#2a3b4f]"
                                    style={{ backgroundImage: 'url("https://source.unsplash.com/80x80?face")' }}
                                ></div>
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
        </div>
    )
}
