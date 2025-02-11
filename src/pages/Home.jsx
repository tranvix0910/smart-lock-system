import COVER_IMAGE from '../assets/images/bg.png'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const navigate = useNavigate() // Hook để điều hướng

    const handleLogin = () => {
        navigate('/login') // Chuyển hướng tới /login
    }

    return (
        <>
            <div className="w-full h-screen flex item-start">
                <div className="relative w-1/2 h-full flex flex-cal">
                    <img src={COVER_IMAGE} className="w-full h-full object-cover" />
                </div>

                <div className="w-1/2 h-full bg-[#24303f] flex flex-col p-20 justify-center">
                    <div className="flex gap-x-3 text-x text-pretty text-lg/8 text-gray-300">
                        Smart Attendance System
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6 text-[#ebf45d]"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                            />
                        </svg>
                    </div>

                    <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
                        <div className="text-balance text-3xl font-semibold tracking-tight text-[#ebf45d] sm:text-4xl">
                            <h2>Welcome!</h2>
                        </div>
                        <p className="mt-6 text-pretty text-lg/8 text-gray-300">
                            Effortlessly manage student attendance with our advanced facial recognition technology. This
                            system allows teachers to streamline the attendance process, saving time and reducing
                            errors.
                        </p>

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
                                Login as a Teacher
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login
