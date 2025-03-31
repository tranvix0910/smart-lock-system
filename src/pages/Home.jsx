import COVER_IMAGE from '../assets/images/bg.png'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const navigate = useNavigate()
    const handleLogin = () => {
        navigate('/login')
    }

    return (
        <>
            <div className="w-full h-screen flex item-start">
                <div className="relative w-1/2 h-full flex flex-cal">
                    <img src={COVER_IMAGE} className="w-full h-full object-cover" />
                </div>

                <div className="w-1/2 h-full bg-[#24303f] flex flex-col p-20 justify-center">
                    <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
                        <div className="text-balance text-3xl font-semibold tracking-tight text-[#ebf45d] sm:text-4xl">
                            <h2>
                                Smart Lock System
                            </h2>
                            <h2 className="text-2xl mt-2">
                                Designed by Tran Dai Vi - N22DCCI044
                            </h2>
                        </div>
                        <p className="mt-6 text-pretty text-lg/8 text-gray-300">
                            The Smart Lock System is an advanced security solution designed by Tran Dai Vi, a student at the Posts and Telecommunications Institute of Technology (PTIT), specializing in IoT. This system is engineered to provide a seamless, secure, and intelligent access experience.
                        </p>
                        <div className="mt-8">
                            <h3 className="text-2xl font-semibold text-[#ebf45d] mb-6">Key Features</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-[#2a3b4f] p-6 rounded-lg flex flex-col items-center text-center hover:transform hover:scale-105 transition-transform duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-[#ebf45d] mb-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                    </svg>
                                    <h4 className="text-lg font-medium text-[#ebf45d] mb-2">Facial Recognition</h4>
                                    <p className="text-gray-300">Advanced face detection for secure and quick access</p>
                                </div>

                                <div className="bg-[#2a3b4f] p-6 rounded-lg flex flex-col items-center text-center hover:transform hover:scale-105 transition-transform duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-[#ebf45d] mb-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2ZM9 9h6v6H9V9Z" />
                                    </svg>
                                    <h4 className="text-lg font-medium text-[#ebf45d] mb-2">Fingerprint & RFID</h4>
                                    <p className="text-gray-300">Multiple authentication methods for flexibility</p>
                                </div>

                                <div className="bg-[#2a3b4f] p-6 rounded-lg flex flex-col items-center text-center hover:transform hover:scale-105 transition-transform duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-[#ebf45d] mb-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                                    </svg>
                                    <h4 className="text-lg font-medium text-[#ebf45d] mb-2">Web Portal</h4>
                                    <p className="text-gray-300">Comprehensive management interface</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                            <button
                                onClick={handleLogin}
                                className="flex items-center gap-x-3 rounded-md bg-[#ebf45d] px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                                    />
                                </svg>
                                Login as a User
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login
