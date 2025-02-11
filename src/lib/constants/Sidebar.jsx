import { HiOutlineViewGrid, HiOutlineUsers, HiOutlineUserCircle, HiOutlineCog } from 'react-icons/hi'

import { MdSubject } from 'react-icons/md'

export const DASHBOARD_SIDEBAR_LINKS = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: <HiOutlineViewGrid />
    },
    {
        key: 'Subject',
        label: 'Subject',
        path: '/subject',
        icon: <MdSubject />
    },
    {
        key: 'student',
        label: 'Attendance',
        path: '/attendance',
        icon: <HiOutlineUsers />
    }
]

export const DASHBOARD_SIDEBAR_BOTTOM_LINKS = [
    {
        key: 'profile',
        label: 'Profile',
        path: '/dashboard/profile',
        icon: <HiOutlineUserCircle />
    },
    {
        key: 'settings',
        label: 'Settings',
        path: '/settings',
        icon: <HiOutlineCog />
    }
]
