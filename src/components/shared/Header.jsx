import { Fragment } from 'react';
import { Menu, MenuButton, MenuItems, MenuItem , Popover, PopoverButton, PopoverPanel, Transition }  from '@headlessui/react'
import { HiOutlineBell, HiOutlineSearch, HiOutlineChatAlt } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames'
import { Authenticator } from '@aws-amplify/ui-react';

import useUserAttributes from '../../hooks/useUserAttributes';

export default function Header() {
	
	const navigate = useNavigate();
	const userAttributes = useUserAttributes();

	return (
		<div className="bg-[#24303f] h-16 px-4 flex items-center border-b border-gray-200 justify-between">
			<div className="relative">
				<div className='hidden sm:block text-neutral-400'>
                    <HiOutlineSearch fontSize={20} className="absolute top-1/2 left-0 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none dark:text-white xl:w-125"
                    />
                </div>
			</div>
			<div className="flex items-center gap-2 mr-2">
				<Popover className="relative">
					{({ open }) => (
						<>
							<PopoverButton
								className={classNames(
									open && 'bg-gray-100',
									'group inline-flex items-center rounded-sm p-1.5 text-neutral-400 hover:text-opacity-100 focus:outline-none active:bg-gray-100'
								)}
							>
								<HiOutlineChatAlt fontSize={24} />
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
									<div className="bg-white rounded-sm shadow-md ring-1 ring-black ring-opacity-5 px-2 py-2.5">
										<div className="px-4 py-2">
                                            <strong className="text-sm font-medium text-bodydark2">Messages</strong>
                                        </div>
										<div className="mt-2 px-4 py-2 text-sm">
                                            <a className="flex flex-col gap-2.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4" href="/">
                                                <p className="text-sm">
                                                    <span className="text-black dark:text-white">Edit your information in a swipe</span> 
                                                        Sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.
                                                </p>
                                                <p className="text-xs">12 May, 2025</p>
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
									open && 'bg-gray-100',
									'group inline-flex items-center rounded-sm p-1.5 text-neutral-400 hover:text-opacity-100 focus:outline-none active:bg-gray-100'
								)}
							>
								<HiOutlineBell fontSize={24} />
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
                                    <div className="bg-white rounded-sm shadow-md ring-1 ring-black ring-opacity-5 px-2 py-2.5">
                                        <div className="px-4 py-2">
                                            <strong className="text-sm font-medium text-bodydark2">Messages</strong>
                                        </div>
                                        <div className="mt-2 px-4 py-2 text-sm">
                                            <a className="flex flex-col gap-2.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4" href="/">
                                                <p className="text-sm">
                                                    <span className="text-black dark:text-white">Edit your information in a swipe</span> 
                                                        Sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.
                                                </p>
                                                <p className="text-xs">12 May, 2025</p>
                                            </a>
                                        </div>
                                    </div>
								</PopoverPanel>
							</Transition>
						</>
					)}
				</Popover>
				<div
					className="text-neutral-400 font-medium truncate max-w-[150px]"
					title={userAttributes?.preferred_username || 'Please sign in'}
				>
					Welcome!, {userAttributes?.preferred_username || 'Guest'}
				</div>
				<Menu as="div" className="relative">
					<div>
						<MenuButton className="ml-2 bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-400">
							<span className="sr-only">Open user menu</span>
							<div
								className="h-10 w-10 rounded-full bg-sky-500 bg-cover bg-no-repeat bg-center"
								style={{ backgroundImage: 'url("https://source.unsplash.com/80x80?face")' }}
							>
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
						<MenuItems className="origin-top-right z-10 absolute right-0 mt-2 w-48 rounded-sm shadow-md p-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
							<MenuItem>
								<div
									onClick={() => navigate('/dashboard/profile')}
									className="hover:bg-gray-100 focus:bg-gray-200 rounded-sm px-4 py-2 text-gray-700 text-sm font-medium cursor-pointer"
								>
									Your Profile
								</div>
							</MenuItem>
							<MenuItem>
								<div
									onClick={() => navigate('/dashboard/settings')}
									className="hover:bg-gray-100 focus:bg-gray-200 rounded-sm px-4 py-2 text-gray-700 text-sm font-medium cursor-pointer"
								>
									Settings
								</div>
								</MenuItem>

							<MenuItem>
								<Authenticator>
									{({ signOut }) => (
										<div onClick={signOut} className="hover:bg-gray-200 rounded-sm px-4 py-2 text-gray-700 text-sm font-medium cursor-pointer focus:bg-gray-200">
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