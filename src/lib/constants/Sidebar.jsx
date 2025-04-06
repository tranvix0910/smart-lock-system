import { HiOutlineViewGrid, HiOutlineUserCircle, HiOutlineCog } from 'react-icons/hi'
import { MdLockClock, MdDeviceHub, MdFingerprint, MdFace, MdKeyboardArrowDown, MdVerifiedUser } from 'react-icons/md'
import { RiRfidFill } from "react-icons/ri";

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
    {
        key: 'biometric-management',
        label: 'Biometric Management',
        icon: <MdVerifiedUser />,
        hasSubmenu: true,
        submenuIcon: <MdKeyboardArrowDown />,
        submenu: [
            {
                key: 'faceid',
                label: 'Face ID',
                path: '/dashboard/biometric/faceid',
                icon: <MdFace />
            },
            {
                key: 'fingerprint',
                label: 'Fingerprint',
                path: '/dashboard/biometric/fingerprint',
                icon: <MdFingerprint />
            },
            {
                key: 'rfid',
                label: 'RFID',
                path: '/dashboard/biometric/rfid',
                icon: <RiRfidFill />
            }
            
        ]
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
