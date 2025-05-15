import { useNavigate } from 'react-router-dom'
import {
    MdLock,
    MdSecurity,
    MdFingerprint,
    MdFace,
    MdDashboard,
    MdShield,
    MdLogin,
    MdKeyboardArrowRight,
    MdCreditCard
} from 'react-icons/md'
import { useState, useEffect } from 'react'
import COVER_IMAGE from '../assets/images/bg.png'

const Home = () => {
    const navigate = useNavigate()
    const [activeFeature, setActiveFeature] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        // Animation on page load
        setIsLoaded(true)
    }, [])

    const handleLogin = () => {
        navigate('/login')
    }

    const features = [
        {
            id: 'facial',
            title: 'Facial Recognition',
            description:
                'Advanced AI-powered face detection system that provides secure and quick access. Our facial recognition is designed for high accuracy with liveness detection.',
            icon: <MdFace className="w-12 h-12 text-[#ebf45d] mb-4" />,
            color: 'from-blue-500/20 to-blue-600/20',
            hoverColor: 'group-hover:from-blue-500/30 group-hover:to-blue-600/30'
        },
        {
            id: 'fingerprint',
            title: 'Fingerprint & RFID',
            description:
                'Multiple authentication methods including fingerprint scanning and RFID card access, offering flexibility and security for different scenarios.',
            icon: <MdFingerprint className="w-12 h-12 text-[#ebf45d] mb-4" />,
            color: 'from-purple-500/20 to-purple-600/20',
            hoverColor: 'group-hover:from-purple-500/30 group-hover:to-purple-600/30'
        },
        {
            id: 'portal',
            title: 'Web Management Portal',
            description:
                'Comprehensive dashboard interface for administrators to manage users, devices, access permissions, and view detailed access logs.',
            icon: <MdDashboard className="w-12 h-12 text-[#ebf45d] mb-4" />,
            color: 'from-green-500/20 to-green-600/20',
            hoverColor: 'group-hover:from-green-500/30 group-hover:to-green-600/30'
        },
        {
            id: 'card',
            title: 'RFID Card Integration',
            description:
                'Seamlessly integrate with existing RFID card systems or deploy new ones. Compatible with major card formats for enterprise environments.',
            icon: <MdCreditCard className="w-12 h-12 text-[#ebf45d] mb-4" />,
            color: 'from-amber-500/20 to-amber-600/20',
            hoverColor: 'group-hover:from-amber-500/30 group-hover:to-amber-600/30'
        },
        {
            id: 'security',
            title: 'Enhanced Security',
            description:
                'Military-grade encryption for all data transmissions. Comprehensive logging and auditing for all access attempts with real-time alerts.',
            icon: <MdShield className="w-12 h-12 text-[#ebf45d] mb-4" />,
            color: 'from-red-500/20 to-red-600/20',
            hoverColor: 'group-hover:from-red-500/30 group-hover:to-red-600/30'
        },
        {
            id: 'access',
            title: 'Smart Access Control',
            description:
                'Intelligent access control with time-based rules, multi-factor authentication, and remote access management from anywhere.',
            icon: <MdLock className="w-12 h-12 text-[#ebf45d] mb-4" />,
            color: 'from-teal-500/20 to-teal-600/20',
            hoverColor: 'group-hover:from-teal-500/30 group-hover:to-teal-600/30'
        }
    ]

    return (
        <div
            className={`min-h-screen bg-[#24303f] transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        >
            {/* Hero Section */}
            <div className="relative h-screen">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={COVER_IMAGE}
                        className="w-full h-full object-cover opacity-15"
                        alt="Smart Lock Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#24303f]/95 to-[#24303f]/80"></div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 h-full flex items-center">
                    <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center">
                        {/* Left Content - Text */}
                        <div className="lg:w-1/2 mb-12 lg:mb-0 lg:pr-12">
                            <div className="inline-block mb-6 px-3 py-1 bg-[#ebf45d]/10 rounded-full">
                                <span className="text-[#ebf45d] text-sm font-medium">Advanced Security Systems</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                Smart Lock <span className="text-[#ebf45d]">System</span>
                            </h1>

                            <p className="text-lg text-gray-300 mb-8 max-w-xl leading-relaxed">
                                An advanced security solution designed for modern enterprises and homes. Featuring
                                multi-factor authentication with fingerprint, face recognition and RFID technologies.
                            </p>

                            <div className="mb-6 flex items-start">
                                <span className="flex-shrink-0 mr-2 mt-1 text-[#ebf45d]">⚡</span>
                                <p className="text-gray-400 italic">
                                    Designed by Tran Dai Vi - N22DCCI044
                                    <br />
                                    Posts and Telecommunications Institute of Technology (PTIT)
                                    <br />
                                    Email and Password for Test User
                                    <br />
                                    Email: test@gmail.com
                                    <br />
                                    Password: Test123456@
                                </p>
                            </div>

                            <button
                                onClick={handleLogin}
                                className="flex items-center gap-2 bg-[#ebf45d] hover:bg-[#d9e154] text-[#24303f] font-medium py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                <MdLogin className="w-5 h-5" />
                                <span>Get Started</span>
                                <MdKeyboardArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Right Content - Demo Device Visualization */}
                        <div className="lg:w-1/2 flex justify-center">
                            <div className="relative bg-[#2a3b4f] rounded-2xl p-8 shadow-2xl w-full max-w-md">
                                <div className="absolute -top-4 -right-4 bg-[#ebf45d] rounded-full p-3">
                                    <MdSecurity className="w-6 h-6 text-[#24303f]" />
                                </div>

                                {/* Device Display Screen */}
                                <div className="bg-[#1a2533] rounded-lg p-5 mb-6 border border-gray-700">
                                    <div className="mb-4 flex justify-between items-center">
                                        <div className="bg-[#ebf45d] w-16 h-1.5 rounded-full"></div>
                                        <div className="bg-green-400 w-2.5 h-2.5 rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="text-center mb-6">
                                        <p className="text-gray-400 text-sm">Smart Lock Status</p>
                                        <p className="text-[#ebf45d] text-xl font-semibold">SECURED</p>
                                    </div>
                                    <div className="flex justify-center mb-4">
                                        <MdLock className="w-20 h-20 text-[#ebf45d] animate-pulse" />
                                    </div>
                                    <div className="bg-[#2a3b4f] rounded-md p-2 text-center">
                                        <p className="text-gray-300 text-xs">Last access: Today, 10:45 AM</p>
                                    </div>
                                </div>

                                {/* Authentication Methods */}
                                <div className="flex justify-between mb-6">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-[#3a4b5f] rounded-full flex items-center justify-center mx-auto mb-2">
                                            <MdFingerprint className="w-6 h-6 text-[#ebf45d]" />
                                        </div>
                                        <p className="text-gray-300 text-xs">Fingerprint</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-[#3a4b5f] rounded-full flex items-center justify-center mx-auto mb-2">
                                            <MdFace className="w-6 h-6 text-[#ebf45d]" />
                                        </div>
                                        <p className="text-gray-300 text-xs">Face ID</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-[#3a4b5f] rounded-full flex items-center justify-center mx-auto mb-2">
                                            <MdCreditCard className="w-6 h-6 text-[#ebf45d]" />
                                        </div>
                                        <p className="text-gray-300 text-xs">RFID Card</p>
                                    </div>
                                </div>

                                {/* Status Indicators */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#3a4b5f] rounded p-3">
                                        <div className="flex justify-between items-center">
                                            <p className="text-gray-300 text-xs">Battery</p>
                                            <p className="text-green-400 text-xs">92%</p>
                                        </div>
                                        <div className="bg-gray-700 h-1 rounded-full mt-2">
                                            <div
                                                className="bg-green-400 h-1 rounded-full"
                                                style={{ width: '92%' }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="bg-[#3a4b5f] rounded p-3">
                                        <div className="flex justify-between items-center">
                                            <p className="text-gray-300 text-xs">Wi-Fi</p>
                                            <p className="text-[#ebf45d] text-xs">Connected</p>
                                        </div>
                                        <div className="flex items-end gap-1 mt-2 h-3">
                                            <div className="bg-[#ebf45d] w-1 h-1 rounded-sm"></div>
                                            <div className="bg-[#ebf45d] w-1 h-2 rounded-sm"></div>
                                            <div className="bg-[#ebf45d] w-1 h-3 rounded-sm"></div>
                                            <div className="bg-[#ebf45d] w-1 h-4 rounded-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="border-2 border-[#ebf45d] rounded-full p-2">
                        <svg className="w-6 h-6 text-[#ebf45d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            ></path>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-[#1c2736] py-20 px-6">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Advanced <span className="text-[#ebf45d]">Features</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Our smart lock system combines cutting-edge hardware with intelligent software to provide
                            the highest level of security and convenience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature) => (
                            <div
                                key={feature.id}
                                className={`group bg-gradient-to-br ${feature.color} p-6 rounded-xl border border-gray-700 hover:border-[#ebf45d]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#ebf45d]/5 ${activeFeature === feature.id ? 'border-[#ebf45d]' : ''}`}
                                onMouseEnter={() => setActiveFeature(feature.id)}
                                onMouseLeave={() => setActiveFeature(null)}
                            >
                                <div className="mb-4">
                                    <div className="inline-block p-3 bg-[#2a3b4f] rounded-lg">{feature.icon}</div>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="bg-[#24303f] py-16 px-6">
                <div className="container mx-auto">
                    <div className="bg-gradient-to-r from-[#2a3b4f] to-[#1c2736] rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#ebf45d]/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-[#ebf45d]/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                    Ready to secure your space?
                                </h2>
                                <p className="text-gray-300 max-w-xl">
                                    Get started with our smart lock system today and experience the perfect balance of
                                    security and convenience.
                                </p>
                            </div>
                            <button
                                onClick={handleLogin}
                                className="flex items-center gap-2 bg-[#ebf45d] hover:bg-[#d9e154] text-[#24303f] font-medium py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 whitespace-nowrap"
                            >
                                <MdSecurity className="w-5 h-5" />
                                <span>Get Access Now</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-[#1a2432] py-8 text-center text-gray-400 text-sm">
                <div className="container mx-auto px-6">
                    <p>© {new Date().getFullYear()} Smart Lock System. Designed by Tran Dai Vi - N22DCCI044</p>
                    <p className="mt-2">Posts and Telecommunications Institute of Technology (PTIT)</p>
                </div>
            </footer>
        </div>
    )
}

export default Home
