import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
    MdClose,
    MdDelete,
    MdCheckBox,
    MdCheckBoxOutlineBlank,
    MdArrowForward,
    MdWarning,
    MdCheck
} from 'react-icons/md'

// isDeleting
const DeleteDeviceModal = ({ isOpen, onClose, device, onConfirm, deleteResponse }) => {
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
        if (!isConfirmChecked) return
        setCurrentStep(2)
        onConfirm()
    }

    const handleCancel = () => {
        setCurrentStep(1)
        setIsConfirmChecked(false)
        onClose()
    }

    if (!isOpen || !device) return null

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        {/* Warning Card */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <MdWarning className="h-6 w-6 text-red-500" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Warning: Device Deletion</h3>
                                    <p className="mt-2 text-sm text-red-700">
                                        You are about to delete device &quot;{device?.deviceName}&quot;. This action
                                        cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Device Info Card */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h4 className="font-medium text-gray-800 mb-3">Device Information</h4>
                            <div className="space-y-2">
                                <div className="flex items-center text-sm">
                                    <span className="text-gray-500 w-24">Device ID:</span>
                                    <span className="text-gray-900 font-medium">{device?.deviceId}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <span className="text-gray-500 w-24">Location:</span>
                                    <span className="text-gray-900">{device?.location}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <span className="text-gray-500 w-24">Status:</span>
                                    <span className="text-gray-900">{device?.status}</span>
                                </div>
                            </div>
                        </div>

                        {/* Deletion Process */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h4 className="font-medium text-gray-800 mb-3">Deletion Process</h4>
                            <ol className="space-y-3">
                                <li className="flex items-center text-sm text-gray-600">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                        <span className="text-red-600 text-xs font-medium">1</span>
                                    </div>
                                    Device deletion request will be sent
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                        <span className="text-red-600 text-xs font-medium">2</span>
                                    </div>
                                    System will wait for device confirmation
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                        <span className="text-red-600 text-xs font-medium">3</span>
                                    </div>
                                    Device will be removed from your account
                                </li>
                            </ol>
                        </div>

                        {/* Confirmation Checkbox */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsConfirmChecked(!isConfirmChecked)}
                                className="flex items-center text-sm text-gray-700 hover:text-gray-900"
                            >
                                {isConfirmChecked ? (
                                    <MdCheckBox className="w-5 h-5 text-red-500 mr-2" />
                                ) : (
                                    <MdCheckBoxOutlineBlank className="w-5 h-5 text-gray-400 mr-2" />
                                )}
                                I understand and want to proceed with deletion
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleNextStep}
                                disabled={!isConfirmChecked}
                                className={`px-4 py-2 rounded-lg flex items-center text-sm ${
                                    isConfirmChecked
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                Continue
                                <MdArrowForward className="ml-2 w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="space-y-6">
                        {/* Progress Steps */}
                        <div className="space-y-4">
                            {/* Step 1: Request Deletion */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                                            !deleteResponse ? 'bg-red-100' : 'bg-green-100'
                                        }`}
                                    >
                                        {!deleteResponse ? (
                                            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <MdCheck className="w-6 h-6 text-green-500" />
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

                            {/* Step 2: Device Deletion */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                                            !deleteResponse ? 'bg-gray-100' : 'bg-red-100'
                                        }`}
                                    >
                                        {!deleteResponse ? (
                                            <MdDelete className="w-6 h-6 text-gray-400" />
                                        ) : (
                                            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
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

                        {/* Action Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] relative overflow-hidden flex flex-col">
                {/* Header - Gradient style with warning color */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-red-500 rounded-full p-2 sm:p-2.5 mr-2 sm:mr-3 shadow-sm">
                                <MdDelete className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                                    Step {currentStep} of 2
                                </p>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                    {currentStep === 1 ? 'Confirm Deletion' : 'Processing Deletion'}
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full transition-colors"
                        >
                            <MdClose className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content area with overflow scroll */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">{renderStepContent()}</div>
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
