import { useState, useEffect } from 'react'
import useUserAttributes from '../hooks/useUserAttributes'
import { formatKey } from '../utils/formatters.jsx'
import {
    MdPerson,
    MdEmail,
    MdPhone,
    MdLocationOn,
    MdEdit,
    MdLock,
    MdAccessTime,
    MdInfo,
    MdAccountCircle,
    MdVerifiedUser,
    MdSecurity,
    MdBadge,
    MdNumbers,
    MdNotifications,
    MdSettings,
    MdCheck,
    MdClose,
    MdVpnKey,
    MdCalendarToday,
    MdBusinessCenter,
    MdDevices,
    MdHistory,
    MdFingerprint,
    MdKey,
    MdNotificationsActive,
    MdLanguage,
    MdDarkMode,
    MdLightMode
} from 'react-icons/md'
import classNames from 'classnames'

const Profile = () => {
    const userAttributes = useUserAttributes()
    const [activeTab, setActiveTab] = useState('profile')
    const [activitiesExpanded, setActivitiesExpanded] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    // Show notification message
    const showMessage = (msg, type) => {
        setMessage(msg)
        setMessageType(type)

        setTimeout(() => {
            setMessage('')
            setMessageType('')
        }, 3000)
    }

    useEffect(() => {
        // Simulate loading user data
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 500)

        return () => clearTimeout(timer)
    }, [])

    // Function to get appropriate icon for different attribute types
    const getAttributeIcon = (key) => {
        const iconClass = 'w-5 h-5 text-white'
        const lowerKey = key.toLowerCase()
        switch (lowerKey) {
            case 'email':
                return <MdEmail className={iconClass} />
            case 'email_verified':
                return <MdVerifiedUser className={iconClass} />
            case 'phone_number':
            case 'phone_number_verified':
            case 'Phone_number':
            case 'Phone_number_verified':
                return <MdPhone className={iconClass} />
            case 'address':
            case 'location':
                return <MdLocationOn className={iconClass} />
            case 'created_at':
            case 'updated_at':
                return <MdAccessTime className={iconClass} />
            case 'sub':
                return <MdSecurity className={iconClass} />
            case 'user_id':
                return <MdNumbers className={iconClass} />
            case 'username':
            case 'preferred_username':
                return <MdBadge className={iconClass} />
            case 'name':
            case 'family_name':
            case 'given_name':
                return <MdPerson className={iconClass} />
            case 'birthdate':
                return <MdCalendarToday className={iconClass} />
            case 'occupation':
            case 'job_title':
                return <MdBusinessCenter className={iconClass} />
            default:
                return <MdInfo className={iconClass} />
        }
    }

    // Group user attributes into logical sections
    const groupAttributes = (attributes) => {
        if (!attributes) return {}

        const groups = {
            'Personal Information': [
                'name',
                'given_name',
                'family_name',
                'nickname',
                'username',
                'preferred_username',
                'gender',
                'birthdate',
                'picture'
            ],
            'Contact Information': [
                'email',
                'email_verified',
                'phone_number',
                'Phone_number',
                'phone_number_verified',
                'Phone_number_verified',
                'address'
            ],
            'Account Details': ['sub', 'user_id', 'created_at', 'updated_at'],
            'Other Information': []
        }

        const result = {
            'Personal Information': {},
            'Contact Information': {},
            'Account Details': {},
            'Other Information': {}
        }

        Object.entries(attributes).forEach(([key, value]) => {
            let placed = false
            for (const [groupName, keys] of Object.entries(groups)) {
                if (keys.includes(key.toLowerCase())) {
                    result[groupName][key] = value
                    placed = true
                    break
                }
            }

            if (!placed) {
                result['Other Information'][key] = value
            }
        })

        return result
    }

    // Format specific attribute values for better display
    const formatAttributeValue = (key, value) => {
        // Format dates
        if (key.includes('_at') && value) {
            try {
                return new Date(value).toLocaleString()
            } catch {
                return value
            }
        }

        // Format booleans
        if (typeof value === 'boolean') {
            return value ? (
                <span className="flex items-center gap-1.5 text-green-500 font-medium">
                    <MdCheck className="w-5 h-5" />
                    <span>Verified</span>
                </span>
            ) : (
                <span className="flex items-center gap-1.5 text-red-500 font-medium">
                    <MdClose className="w-5 h-5" />
                    <span>Not Verified</span>
                </span>
            )
        }

        // Format empty values
        if (value === '' || value === null || value === undefined) {
            return <span className="text-gray-400 italic">Not provided</span>
        }

        return value
    }

    // Format attribute keys for better display
    const formatAttributeKey = (key) => {
        // Special formatting for verification fields
        if (key.toLowerCase().includes('_verified')) {
            const baseName = key.replace(/_verified/i, '')
            return `${formatKey(baseName)} Verification Status`
        }

        // Special case for common fields
        switch (key) {
            case 'sub':
                return 'Security Identifier'
            case 'user_id':
                return 'User ID'
            case 'created_at':
                return 'Account Created'
            case 'updated_at':
                return 'Last Updated'
            case 'phone_number':
            case 'Phone_number':
                return 'Phone Number'
            case 'given_name':
                return 'First Name'
            case 'family_name':
                return 'Last Name'
            case 'preferred_username':
            case 'Preferred_username':
                return 'Username'
            default:
                return formatKey(key)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ebf45d]"></div>
            </div>
        )
    }

    if (!userAttributes) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-lg">
                    <p className="flex items-center gap-2">
                        <MdInfo className="w-6 h-6" />
                        <span>Could not load user profile. Please try again later.</span>
                    </p>
                </div>
            </div>
        )
    }

    const groupedAttributes = groupAttributes(userAttributes)

    // Extract name for header
    const userName =
        userAttributes.name || userAttributes.username || userAttributes.preferred_username || 'User Profile'
    const email = userAttributes.email || ''

    // Mock recent activity data (replace with real data when available)
    const recentActivities = [
        { id: 1, type: 'login', message: 'Successful login', icon: <MdLock />, color: 'green', time: 'Just now' },
        { id: 2, type: 'profile', message: 'Profile updated', icon: <MdEdit />, color: 'blue', time: '2 days ago' },
        {
            id: 3,
            type: 'device',
            message: 'New device connected',
            icon: <MdDevices />,
            color: 'purple',
            time: '1 week ago'
        },
        {
            id: 4,
            type: 'fingerprint',
            message: 'Fingerprint added',
            icon: <MdFingerprint />,
            color: 'orange',
            time: '1 week ago'
        },
        { id: 5, type: 'access', message: 'Accessed Front Door', icon: <MdKey />, color: 'yellow', time: '2 weeks ago' }
    ]

    // Display only 3 activities unless expanded
    const displayedActivities = activitiesExpanded ? recentActivities : recentActivities.slice(0, 3)

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <MdAccountCircle className="w-8 h-8 text-[#24303f]" />
                    <h1 className="text-2xl font-semibold text-[#24303f]">My Profile</h1>
                </div>
                <p className="text-gray-500 mt-1">View and manage your account information</p>
            </div>

            {/* Notification message */}
            {message && (
                <div
                    className={classNames('mb-6 p-4 rounded-lg flex items-center gap-2', {
                        'bg-green-100 text-green-700 border border-green-200': messageType === 'success',
                        'bg-red-100 text-red-700 border border-red-200': messageType === 'error',
                        'bg-yellow-100 text-yellow-700 border border-yellow-200': messageType === 'info'
                    })}
                >
                    {messageType === 'success' ? (
                        <MdCheck className="w-5 h-5 flex-shrink-0" />
                    ) : messageType === 'error' ? (
                        <MdClose className="w-5 h-5 flex-shrink-0" />
                    ) : (
                        <MdInfo className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span>{message}</span>
                </div>
            )}

            {/* Profile content */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left sidebar */}
                <div className="lg:w-1/3 space-y-6">
                    {/* User profile card */}
                    <div className="bg-[#24303f] rounded-lg overflow-hidden shadow-md">
                        <div className="p-8 flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full bg-[#ebf45d] flex items-center justify-center text-[#24303f] text-5xl font-bold mb-4 border-4 border-[#ebf45d] shadow-lg">
                                {userName[0]?.toUpperCase() || 'U'}
                            </div>

                            <h3 className="text-xl font-medium text-white mb-1">{userName}</h3>
                            {email && <p className="text-gray-300 mb-6">{email}</p>}

                            <div className="w-full mt-2 space-y-3">
                                <button
                                    onClick={() => {
                                        setIsEditing(!isEditing)
                                        showMessage(isEditing ? 'Edit mode disabled' : 'Edit mode enabled', 'info')
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-all duration-200 font-medium shadow-md"
                                >
                                    <MdEdit className="w-5 h-5" />
                                    <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
                                </button>

                                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2a3b4f] text-white rounded-lg hover:bg-[#364d66] transition-all duration-200 font-medium border border-[#3d566e]">
                                    <MdLock className="w-5 h-5" />
                                    <span>Change Password</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tab navigation */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-2">
                            {['profile', 'security', 'settings', 'activity'].map((tab) => (
                                <button
                                    key={tab}
                                    className={classNames(
                                        'w-full flex items-center gap-3 px-4 py-3 rounded-md text-left mb-1 last:mb-0',
                                        activeTab === tab
                                            ? 'bg-[#ebf45d] text-[#24303f] font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    )}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === 'profile' && <MdPerson className="w-5 h-5" />}
                                    {tab === 'security' && <MdVpnKey className="w-5 h-5" />}
                                    {tab === 'settings' && <MdSettings className="w-5 h-5" />}
                                    {tab === 'activity' && <MdHistory className="w-5 h-5" />}
                                    <span className="capitalize">{tab}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Account stats */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="px-6 py-4 bg-[#24303f] text-white">
                            <h2 className="text-lg font-medium flex items-center gap-2">
                                <MdInfo className="w-5 h-5 text-[#ebf45d]" />
                                <span>Account Overview</span>
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex justify-between items-center px-2 py-3 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <MdCalendarToday className="w-5 h-5 text-[#24303f]" />
                                    <span className="text-gray-700">Member Since</span>
                                </div>
                                <span className="font-medium text-[#24303f]">
                                    {userAttributes.created_at
                                        ? new Date(userAttributes.created_at).toLocaleDateString()
                                        : 'N/A'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center px-2 py-3 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <MdVerifiedUser className="w-5 h-5 text-[#24303f]" />
                                    <span className="text-gray-700">Account Status</span>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                                    Active
                                </span>
                            </div>

                            <div className="flex justify-between items-center px-2 py-3">
                                <div className="flex items-center gap-3">
                                    <MdAccessTime className="w-5 h-5 text-[#24303f]" />
                                    <span className="text-gray-700">Last Login</span>
                                </div>
                                <span className="font-medium text-[#24303f]">Just Now</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content area */}
                <div className="lg:w-2/3 space-y-6">
                    {/* Profile Tab Content */}
                    {activeTab === 'profile' && (
                        <>
                            {Object.entries(groupedAttributes).map(([groupName, attributes]) => {
                                // Skip empty groups
                                if (Object.keys(attributes).length === 0) return null

                                return (
                                    <div key={groupName} className="bg-white rounded-lg shadow-md overflow-hidden">
                                        <div className="px-6 py-4 bg-[#24303f] text-white border-b border-gray-200 flex justify-between items-center">
                                            <h2 className="text-lg font-medium flex items-center gap-2">
                                                {groupName === 'Personal Information' && (
                                                    <MdPerson className="w-5 h-5 text-[#ebf45d]" />
                                                )}
                                                {groupName === 'Contact Information' && (
                                                    <MdEmail className="w-5 h-5 text-[#ebf45d]" />
                                                )}
                                                {groupName === 'Account Details' && (
                                                    <MdBadge className="w-5 h-5 text-[#ebf45d]" />
                                                )}
                                                {groupName === 'Other Information' && (
                                                    <MdInfo className="w-5 h-5 text-[#ebf45d]" />
                                                )}
                                                <span>{groupName}</span>
                                            </h2>
                                            {groupName === 'Personal Information' && (
                                                <button
                                                    className="text-sm flex items-center gap-1 text-[#ebf45d] hover:text-[#d9e154] transition-colors duration-150"
                                                    onClick={() => {
                                                        setIsEditing(!isEditing)
                                                        showMessage('Edit mode activated', 'success')
                                                    }}
                                                >
                                                    <MdEdit className="w-4 h-4" />
                                                    <span>Edit</span>
                                                </button>
                                            )}
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {Object.entries(attributes).map(([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="p-4 hover:bg-gray-50 transition-colors duration-150"
                                                >
                                                    <div className="flex items-start">
                                                        <div className="flex-shrink-0 mt-1 bg-[#2a3b4f] p-2 rounded-full">
                                                            {getAttributeIcon(key)}
                                                        </div>
                                                        <div className="ml-4 flex-1">
                                                            <div className="text-sm text-gray-500 font-medium">
                                                                {formatAttributeKey(key)}
                                                            </div>
                                                            <div className="text-[#24303f] font-medium mt-1">
                                                                {formatAttributeValue(key, value)}
                                                            </div>
                                                        </div>
                                                        {isEditing &&
                                                            (groupName === 'Personal Information' ||
                                                                groupName === 'Contact Information') && (
                                                                <button className="text-blue-500 hover:text-blue-700">
                                                                    <MdEdit className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    )}

                    {/* Security Tab Content */}
                    {activeTab === 'security' && (
                        <>
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="px-6 py-4 bg-[#24303f] text-white">
                                    <h2 className="text-lg font-medium flex items-center gap-2">
                                        <MdVpnKey className="w-5 h-5 text-[#ebf45d]" />
                                        <span>Authentication</span>
                                    </h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-[#24303f] mb-4">Password Management</h3>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-[#24303f] font-medium">Your Password</p>
                                                    <p className="text-gray-500 text-sm">Last changed 30 days ago</p>
                                                </div>
                                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                                                    Strong
                                                </span>
                                            </div>
                                            <button className="flex items-center gap-2 px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150 font-medium">
                                                <MdLock className="w-5 h-5" />
                                                <span>Change Password</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium text-[#24303f] mb-4">
                                            Two-Factor Authentication
                                        </h3>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-[#24303f] font-medium">2FA Status</p>
                                                    <p className="text-gray-500 text-sm">
                                                        Enhance your account security
                                                    </p>
                                                </div>
                                                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                                                    Not Enabled
                                                </span>
                                            </div>
                                            <button className="flex items-center gap-2 px-4 py-2 border border-[#24303f] text-[#24303f] rounded-lg hover:bg-gray-100 transition-colors duration-150 font-medium">
                                                <MdSecurity className="w-5 h-5" />
                                                <span>Enable 2FA</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="px-6 py-4 bg-[#24303f] text-white">
                                    <h2 className="text-lg font-medium flex items-center gap-2">
                                        <MdDevices className="w-5 h-5 text-[#ebf45d]" />
                                        <span>Connected Devices</span>
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-100 p-2 rounded-full">
                                                    <MdDevices className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[#24303f]">Current Device</p>
                                                    <p className="text-gray-500 text-sm">
                                                        Windows • Chrome • IP: 192.168.1.1
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                                Active Now
                                            </span>
                                        </div>

                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-purple-100 p-2 rounded-full">
                                                    <MdDevices className="w-6 h-6 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[#24303f]">Mobile Device</p>
                                                    <p className="text-gray-500 text-sm">
                                                        Android • Last active 2 days ago
                                                    </p>
                                                </div>
                                            </div>
                                            <button className="text-red-500 hover:text-red-700">
                                                <MdClose className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Settings Tab Content */}
                    {activeTab === 'settings' && (
                        <>
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="px-6 py-4 bg-[#24303f] text-white">
                                    <h2 className="text-lg font-medium flex items-center gap-2">
                                        <MdNotifications className="w-5 h-5 text-[#ebf45d]" />
                                        <span>Notification Preferences</span>
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <MdEmail className="w-5 h-5 text-[#24303f]" />
                                                <div>
                                                    <p className="text-[#24303f] font-medium">Email Notifications</p>
                                                    <p className="text-gray-500 text-sm">
                                                        Receive updates and alerts via email
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value=""
                                                    className="sr-only peer"
                                                    defaultChecked
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ebf45d]"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <MdPhone className="w-5 h-5 text-[#24303f]" />
                                                <div>
                                                    <p className="text-[#24303f] font-medium">SMS Notifications</p>
                                                    <p className="text-gray-500 text-sm">
                                                        Receive urgent alerts via SMS
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" value="" className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ebf45d]"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <MdNotificationsActive className="w-5 h-5 text-[#24303f]" />
                                                <div>
                                                    <p className="text-[#24303f] font-medium">Security Alerts</p>
                                                    <p className="text-gray-500 text-sm">
                                                        Get notified about security events
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value=""
                                                    className="sr-only peer"
                                                    defaultChecked
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ebf45d]"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="px-6 py-4 bg-[#24303f] text-white">
                                    <h2 className="text-lg font-medium flex items-center gap-2">
                                        <MdSettings className="w-5 h-5 text-[#ebf45d]" />
                                        <span>Display Settings</span>
                                    </h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-[#24303f] mb-4">Appearance</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button className="p-4 border border-[#ebf45d] bg-white rounded-lg text-center hover:bg-gray-50 transition-colors duration-150">
                                                <div className="flex items-center justify-center mb-2 gap-2">
                                                    <MdLightMode className="w-5 h-5 text-[#24303f]" />
                                                    <span className="text-[#24303f] font-medium">Light Mode</span>
                                                </div>
                                                <div className="h-16 bg-gray-100 rounded flex items-center justify-center text-black text-sm">
                                                    Preview
                                                </div>
                                            </button>

                                            <button className="p-4 border border-gray-200 bg-white rounded-lg text-center hover:bg-gray-50 transition-colors duration-150">
                                                <div className="flex items-center justify-center mb-2 gap-2">
                                                    <MdDarkMode className="w-5 h-5 text-[#24303f]" />
                                                    <span className="text-[#24303f] font-medium">Dark Mode</span>
                                                </div>
                                                <div className="h-16 bg-gray-800 rounded flex items-center justify-center text-white text-sm">
                                                    Preview
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium text-[#24303f] mb-4">Language</h3>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center gap-3 mb-4">
                                                <MdLanguage className="w-5 h-5 text-[#24303f]" />
                                                <span className="text-gray-700">Select your preferred language</span>
                                            </div>
                                            <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d] focus:border-[#ebf45d]">
                                                <option value="en">English</option>
                                                <option value="vi">Vietnamese</option>
                                                <option value="fr">French</option>
                                                <option value="es">Spanish</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Activity Tab Content */}
                    {activeTab === 'activity' && (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="px-6 py-4 bg-[#24303f] text-white">
                                <h2 className="text-lg font-medium flex items-center gap-2">
                                    <MdHistory className="w-5 h-5 text-[#ebf45d]" />
                                    <span>Recent Activity</span>
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {displayedActivities.map((activity) => (
                                    <div key={activity.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex items-start gap-3">
                                            <div className={`flex-shrink-0 bg-${activity.color}-100 p-2 rounded-full`}>
                                                <span
                                                    className={`w-5 h-5 text-${activity.color}-700 flex items-center justify-center`}
                                                >
                                                    {activity.icon}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[#24303f] font-medium">{activity.message}</p>
                                                <p className="text-gray-500 text-sm">{activity.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {recentActivities.length > 3 && (
                                    <div className="p-4 text-center">
                                        <button
                                            onClick={() => setActivitiesExpanded(!activitiesExpanded)}
                                            className="text-[#24303f] font-medium hover:text-[#495e78] flex items-center gap-1 mx-auto"
                                        >
                                            {activitiesExpanded ? 'Show Less' : 'Show More'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile
