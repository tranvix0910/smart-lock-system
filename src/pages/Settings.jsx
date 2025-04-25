import { useState, useEffect } from 'react'
import {
    MdSettings,
    MdLock,
    MdNotifications,
    MdPalette,
    MdDevices,
    MdStorage,
    MdSecurity,
    MdInfo,
    MdSave,
    MdCheck,
    MdClose,
    MdDarkMode,
    MdLightMode,
    MdEmail,
    MdPhone
} from 'react-icons/md'
import useUserAttributes from '../hooks/useUserAttributes'
import classNames from 'classnames'

const Settings = () => {
    const userAttributes = useUserAttributes()
    const [activeTab, setActiveTab] = useState('general')
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    // Settings state
    const [theme, setTheme] = useState('light')
    const [language, setLanguage] = useState('en')
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [smsNotifications, setSmsNotifications] = useState(false)
    const [securityAlerts, setSecurityAlerts] = useState(true)
    const [dataStorage, setDataStorage] = useState('30days')
    const [lastBackup, setLastBackup] = useState(null)
    const [isSaving, setIsSaving] = useState(false)

    // Show notification message
    const showMessage = (msg, type) => {
        setMessage(msg)
        setMessageType(type)

        setTimeout(() => {
            setMessage('')
            setMessageType('')
        }, 3000)
    }

    // Save settings changes
    const saveSettings = () => {
        setIsSaving(true)

        // Simulating API call
        setTimeout(() => {
            setIsSaving(false)
            showMessage('Settings saved successfully', 'success')
        }, 1000)
    }

    // Simulate loading data
    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false)
            setLastBackup(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // 7 days ago
        }, 500)
    }, [])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ebf45d]"></div>
            </div>
        )
    }

    // Settings categories/tabs
    const tabs = [
        { id: 'general', label: 'General', icon: <MdSettings /> },
        { id: 'appearance', label: 'Appearance', icon: <MdPalette /> },
        { id: 'notifications', label: 'Notifications', icon: <MdNotifications /> },
        { id: 'security', label: 'Security', icon: <MdSecurity /> },
        { id: 'devices', label: 'Devices', icon: <MdDevices /> },
        { id: 'data', label: 'Data & Storage', icon: <MdStorage /> }
    ]

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <MdSettings className="w-8 h-8 text-[#24303f]" />
                    <h1 className="text-2xl font-semibold text-[#24303f]">Settings</h1>
                </div>
                <p className="text-gray-500 mt-1">Customize your application preferences</p>
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

            {/* Settings content */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left sidebar - Tab navigation */}
                <div className="lg:w-1/4">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="px-6 py-4 bg-[#24303f] text-white">
                            <h2 className="text-lg font-medium">Settings</h2>
                        </div>
                        <div className="p-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={classNames(
                                        'w-full flex items-center gap-3 px-4 py-3 rounded-md text-left mb-1 last:mb-0 transition-colors duration-200',
                                        activeTab === tab.id
                                            ? 'bg-[#ebf45d] text-[#24303f] font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    )}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <span className="text-xl">{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main content area */}
                <div className="lg:w-3/4 space-y-6">
                    {/* Save Settings Button (Floating) */}
                    <div className="fixed bottom-6 right-6 z-10">
                        <button
                            className="flex items-center gap-2 px-4 py-3 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-all duration-200 font-medium shadow-md"
                            onClick={saveSettings}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-[#24303f] border-t-transparent rounded-full animate-spin"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <MdSave className="w-5 h-5" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="px-6 py-4 bg-[#24303f] text-white">
                                <h2 className="text-lg font-medium flex items-center gap-2">
                                    <MdSettings className="w-5 h-5 text-[#ebf45d]" />
                                    <span>General Settings</span>
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-[#24303f] mb-4">Account Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Username
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d] focus:border-[#ebf45d]"
                                                value={userAttributes?.preferred_username || ''}
                                                disabled
                                            />
                                            <p className="mt-1 text-sm text-gray-500">
                                                Contact administrator to change
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d] focus:border-[#ebf45d]"
                                                value={userAttributes?.email || ''}
                                                disabled
                                            />
                                            <p className="mt-1 text-sm text-gray-500">
                                                Contact administrator to change
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-[#24303f] mb-4">Language Preferences</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Display Language
                                        </label>
                                        <div className="flex items-center">
                                            <select
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d] focus:border-[#ebf45d]"
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                            >
                                                <option value="en">English</option>
                                                <option value="vi">Vietnamese</option>
                                                <option value="fr">French</option>
                                                <option value="es">Spanish</option>
                                            </select>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Changes will apply after reloading the application
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-[#24303f] mb-4">System Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Version</span>
                                            <span className="font-medium text-[#24303f]">1.0.0</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Last Updated</span>
                                            <span className="font-medium text-[#24303f]">May 30, 2023</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">License</span>
                                            <span className="font-medium text-[#24303f]">Standard Edition</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Settings */}
                    {activeTab === 'appearance' && (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="px-6 py-4 bg-[#24303f] text-white">
                                <h2 className="text-lg font-medium flex items-center gap-2">
                                    <MdPalette className="w-5 h-5 text-[#ebf45d]" />
                                    <span>Appearance Settings</span>
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-[#24303f] mb-4">Theme</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div
                                            className={classNames(
                                                'p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors duration-200',
                                                theme === 'light' ? 'border-[#ebf45d] bg-yellow-50' : 'border-gray-200'
                                            )}
                                            onClick={() => setTheme('light')}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <MdLightMode className="w-6 h-6 text-[#24303f]" />
                                                    <span className="font-medium text-[#24303f]">Light Mode</span>
                                                </div>
                                                {theme === 'light' && (
                                                    <div className="w-6 h-6 bg-[#ebf45d] rounded-full flex items-center justify-center">
                                                        <MdCheck className="w-4 h-4 text-[#24303f]" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="h-24 bg-white border border-gray-200 rounded-md flex items-center justify-center">
                                                <div className="w-2/3 space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded-full w-full"></div>
                                                    <div className="h-4 bg-gray-200 rounded-full w-5/6"></div>
                                                    <div className="h-4 bg-gray-200 rounded-full w-4/6"></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className={classNames(
                                                'p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors duration-200',
                                                theme === 'dark' ? 'border-[#ebf45d] bg-yellow-50' : 'border-gray-200'
                                            )}
                                            onClick={() => setTheme('dark')}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <MdDarkMode className="w-6 h-6 text-[#24303f]" />
                                                    <span className="font-medium text-[#24303f]">Dark Mode</span>
                                                </div>
                                                {theme === 'dark' && (
                                                    <div className="w-6 h-6 bg-[#ebf45d] rounded-full flex items-center justify-center">
                                                        <MdCheck className="w-4 h-4 text-[#24303f]" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="h-24 bg-gray-800 border border-gray-700 rounded-md flex items-center justify-center">
                                                <div className="w-2/3 space-y-2">
                                                    <div className="h-4 bg-gray-600 rounded-full w-full"></div>
                                                    <div className="h-4 bg-gray-600 rounded-full w-5/6"></div>
                                                    <div className="h-4 bg-gray-600 rounded-full w-4/6"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm text-gray-500">
                                        Theme changes will apply after reloading the application
                                    </p>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-[#24303f] mb-4">Text Size</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                                            <div className="flex items-center">
                                                <span className="text-gray-500 mr-2">A</span>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="5"
                                                    defaultValue="3"
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <span className="text-gray-500 ml-2 text-lg">A</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notification Settings */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="px-6 py-4 bg-[#24303f] text-white">
                                <h2 className="text-lg font-medium flex items-center gap-2">
                                    <MdNotifications className="w-5 h-5 text-[#ebf45d]" />
                                    <span>Notification Settings</span>
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-[#24303f] mb-4">
                                        Notification Preferences
                                    </h3>

                                    <div className="space-y-6">
                                        {/* Email Notifications */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-100 p-2 rounded-full">
                                                    <MdEmail className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[#24303f]">Email Notifications</p>
                                                    <p className="text-gray-500 text-sm">
                                                        Receive updates and alerts via email
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={emailNotifications}
                                                    onChange={() => setEmailNotifications(!emailNotifications)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ebf45d]"></div>
                                            </label>
                                        </div>

                                        {/* SMS Notifications */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-green-100 p-2 rounded-full">
                                                    <MdPhone className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[#24303f]">SMS Notifications</p>
                                                    <p className="text-gray-500 text-sm">
                                                        Receive urgent alerts via SMS
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={smsNotifications}
                                                    onChange={() => setSmsNotifications(!smsNotifications)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ebf45d]"></div>
                                            </label>
                                        </div>

                                        {/* Security Alerts */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-red-100 p-2 rounded-full">
                                                    <MdSecurity className="w-5 h-5 text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[#24303f]">Security Alerts</p>
                                                    <p className="text-gray-500 text-sm">
                                                        Get notified about security events
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={securityAlerts}
                                                    onChange={() => setSecurityAlerts(!securityAlerts)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ebf45d]"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-[#24303f] mb-4">Email Frequency</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Receive digest emails
                                        </label>
                                        <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d] focus:border-[#ebf45d]">
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="never">Never</option>
                                        </select>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Summary of all activities and alerts
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="px-6 py-4 bg-[#24303f] text-white">
                                <h2 className="text-lg font-medium flex items-center gap-2">
                                    <MdSecurity className="w-5 h-5 text-[#ebf45d]" />
                                    <span>Security Settings</span>
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-[#24303f] mb-4">Password Management</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="font-medium text-[#24303f]">Your Password</p>
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

                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-[#24303f] mb-4">
                                        Two-Factor Authentication
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="font-medium text-[#24303f]">2FA Status</p>
                                                <p className="text-gray-500 text-sm">Enhance your account security</p>
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

                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-[#24303f] mb-4">Login Sessions</h3>
                                    <div className="space-y-4">
                                        <div className="border border-gray-200 rounded-lg">
                                            <div className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-100 p-2 rounded-full">
                                                        <MdDevices className="w-5 h-5 text-blue-600" />
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
                                        </div>

                                        <button className="w-full text-center text-red-600 font-medium hover:text-red-800 transition-colors duration-150">
                                            Log Out From All Devices
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data & Storage Settings */}
                    {activeTab === 'data' && (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="px-6 py-4 bg-[#24303f] text-white">
                                <h2 className="text-lg font-medium flex items-center gap-2">
                                    <MdStorage className="w-5 h-5 text-[#ebf45d]" />
                                    <span>Data & Storage Settings</span>
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-[#24303f] mb-4">Data Retention</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Keep access logs for
                                        </label>
                                        <select
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d] focus:border-[#ebf45d]"
                                            value={dataStorage}
                                            onChange={(e) => setDataStorage(e.target.value)}
                                        >
                                            <option value="7days">7 days</option>
                                            <option value="30days">30 days</option>
                                            <option value="90days">90 days</option>
                                            <option value="1year">1 year</option>
                                            <option value="forever">Forever</option>
                                        </select>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Older logs will be automatically deleted
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-[#24303f] mb-4">Data Backup</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="font-medium text-[#24303f]">Last Backup</p>
                                                <p className="text-gray-500 text-sm">
                                                    {lastBackup ? lastBackup.toLocaleDateString() : 'Never'}
                                                </p>
                                            </div>
                                            {lastBackup && (
                                                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                                                    7 days ago
                                                </span>
                                            )}
                                        </div>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150 font-medium">
                                            <MdSave className="w-5 h-5" />
                                            <span>Backup Now</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-[#24303f] mb-4">Export Data</h3>
                                    <p className="text-gray-500 mb-4">Download all your data in a portable format</p>
                                    <div className="flex flex-wrap gap-3">
                                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                            Export as CSV
                                        </button>
                                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                            Export as JSON
                                        </button>
                                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                            Export as PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Devices Settings */}
                    {activeTab === 'devices' && (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="px-6 py-4 bg-[#24303f] text-white">
                                <h2 className="text-lg font-medium flex items-center gap-2">
                                    <MdDevices className="w-5 h-5 text-[#ebf45d]" />
                                    <span>Device Management</span>
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-[#24303f] mb-4">Connected Devices</h3>
                                    <div className="space-y-4">
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

                                            <div className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-gray-100 p-2 rounded-full">
                                                        <MdDevices className="w-6 h-6 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[#24303f]">Tablet</p>
                                                        <p className="text-gray-500 text-sm">
                                                            iPad • Last active 7 days ago
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

                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-[#24303f] mb-4">Device Permissions</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <MdNotifications className="w-5 h-5 text-[#24303f]" />
                                                <span className="text-gray-700">Push Notifications</span>
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
                                                <MdLock className="w-5 h-5 text-[#24303f]" />
                                                <span className="text-gray-700">Remember Login</span>
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

                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-[#24303f] mb-4">Device Limits</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Maximum connected devices
                                        </label>
                                        <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d] focus:border-[#ebf45d]">
                                            <option value="3">3 devices</option>
                                            <option value="5">5 devices</option>
                                            <option value="10">10 devices</option>
                                            <option value="unlimited">Unlimited</option>
                                        </select>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Limit the number of devices that can access your account
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Settings
