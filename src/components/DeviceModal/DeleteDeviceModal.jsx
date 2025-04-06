import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { MdClose, MdDelete, MdCheckBox, MdCheckBoxOutlineBlank, MdArrowForward, MdArrowBack } from 'react-icons/md'

// isDeleting
const DeleteDeviceModal = ({ 
    isOpen, 
    onClose, 
    device,
    onConfirm,
    deleteResponse 
}) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [isConfirmChecked, setIsConfirmChecked] = useState(false)

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(1)
            setIsConfirmChecked(false)
        }
    }, [isOpen])

    const handleNextStep = () => {
        if (!isConfirmChecked) {
            return
        }
        setCurrentStep(2)
        onConfirm()
    }

    const handleCancel = () => {
        setCurrentStep(1)
        setIsConfirmChecked(false)
        onClose()
    }

    const prevStep = () => {
        setCurrentStep(prev => prev - 1)
    }

    if (!isOpen || !device) return null

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h3 className="text-sm font-medium text-gray-800">Instructions for deleting device</h3>
                        <div className="space-y-6">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#F16767] rounded-full flex items-center justify-center text-white font-semibold">1</div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800">Confirm Deletion</h4>
                                    <p className="text-sm text-gray-600 mb-3">
                                        You are about to delete the device &quot;{device?.deviceName}&quot;. This process involves:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-2">
                                        <li>Sending a deletion request to the device</li>
                                        <li>Waiting for device confirmation</li>
                                        <li>Removing the device from your account</li>
                                    </ol>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#F16767] rounded-full flex items-center justify-center text-white font-semibold">2</div>
                                <div>
                                    <h4 className="font-semibold text-gray-800">Device Information</h4>
                                    <p className="text-sm text-gray-600">Device ID: {device?.deviceId}</p>
                                    <p className="text-sm text-gray-600">Location: {device?.location}</p>
                                    <p className="text-sm text-gray-600">Status: {device?.status}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-[#F16767] rounded-full flex items-center justify-center text-white font-semibold">3</div>
                                <div>
                                    <h4 className="font-semibold text-gray-800">Final Confirmation</h4>
                                    <p className="text-sm text-gray-600">Please confirm that you understand the deletion process</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center">
                            <button
                                onClick={() => setIsConfirmChecked(!isConfirmChecked)}
                                className="flex items-center text-gray-700 hover:text-gray-900"
                            >
                                {isConfirmChecked ? (
                                    <MdCheckBox className="w-5 h-5 text-blue-600 mr-2" />
                                ) : (
                                    <MdCheckBoxOutlineBlank className="w-5 h-5 mr-2" />
                                )}
                                I understand and want to proceed with deletion
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleNextStep}
                                className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                                    isConfirmChecked 
                                        ? 'bg-red-500 text-white hover:bg-red-600' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                                disabled={!isConfirmChecked}
                            >
                                Continue
                                <MdArrowForward className="ml-2" />
                            </button>
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-800">Deleting device</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        !deleteResponse ? 'bg-[#F16767] text-white' :
                                        'bg-green-100 text-green-600'
                                    }`}>
                                        {!deleteResponse ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <MdDelete className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800">Request Deletion</h4>
                                        <p className="text-sm text-gray-600">
                                            {!deleteResponse 
                                                ? 'Sending deletion request to device...'
                                                : 'Deletion request confirmed'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        !deleteResponse ? 'bg-gray-100 text-gray-400' :
                                        'bg-[#F16767] text-white'
                                    }`}>
                                        {!deleteResponse ? (
                                            <MdDelete className="w-5 h-5" />
                                        ) : (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800">Device Deletion</h4>
                                        <p className="text-sm text-gray-600">
                                            {!deleteResponse 
                                                ? 'Waiting for request confirmation...'
                                                : 'Removing device from your account...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between gap-2">
                            <button
                                onClick={prevStep}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:border-[#ebf45d] transition-colors duration-150 flex items-center"
                            >
                                <MdArrowBack className="mr-2" />
                                Back
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#24303f]">Delete Device</h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <MdClose className="w-6 h-6" />
                    </button>
                </div>

                {renderStepContent()}
            </div>
        </div>
    )
}

DeleteDeviceModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    device: PropTypes.object,
    deleteResponse: PropTypes.object
}

export default DeleteDeviceModal
