import { HiOutlineViewGrid, HiOutlineUserCircle, HiOutlineCog } from 'react-icons/hi'

import { MdLockClock, MdDeviceHub } from 'react-icons/md'

export const DASHBOARD_SIDEBAR_LINKS = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: <HiOutlineViewGrid />
    },
    {
        key: 'devices-management',
        label: 'Devices Management',
        path: '/dashboard/devices-management',
        icon: <MdDeviceHub />
    },
    {
        key: 'recent-access-logs',
        label: 'Recent Access Logs',
        path: '/dashboard/recent-access-logs',
        icon: <MdLockClock />
    },
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
