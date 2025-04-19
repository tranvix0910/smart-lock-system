import { useState } from 'react'
import PropTypes from 'prop-types'
import { MdClose, MdDelete, MdCheckBox, MdCheckBoxOutlineBlank, MdWarning, MdKeyboardReturn, MdKey, MdFingerprint, MdFace, MdInfo, MdArrowBack } from 'react-icons/md'
import { deleteFaceID } from '../../../api/deleteFaceID'

const DeleteFaceIDModal = ({ 
    isOpen, 
    onClose, 
    face,
    onSuccess,
    showMessage 
}) => {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isConfirmChecked, setIsConfirmChecked] = useState(false)
    const [currentStep, setCurrentStep] = useState(1) // 1: Confirmation, 2: Dependencies
    const [dependencies, setDependencies] = useState(null)

    const resetModal = () => {
        setIsConfirmChecked(false)
        setCurrentStep(1)
        setDependencies(null)
    }

    const handleClose = () => {
        resetModal()
        onClose()
    }

    const goBack = () => {
        setCurrentStep(1)
    }

    const handleDelete = async () => {
        if (!isConfirmChecked || !face) return
        
        try {
            setIsDeleting(true)
            const result = await deleteFaceID(face.userId, face.deviceId, face.faceId)
            
            // Kiểm tra trường hợp có phụ thuộc
            if (result.success === false && result.dependencies === true) {
                setDependencies(result.data)
                setCurrentStep(2)
                setIsDeleting(false)
                return
            }
            
            onSuccess(face.id)
            showMessage('Face ID deleted successfully', 'success')
            handleClose()
        } catch (error) {
            console.error('Error deleting Face ID:', error)
            showMessage(error.message || 'Failed to delete Face ID', 'error')
            setIsDeleting(false)
        }
    }

    const renderConfirmationStep = () => (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#24303f]">Delete Face ID</h2>
                <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={isDeleting}
                >
                    <MdClose className="w-6 h-6" />
                </button>
            </div>

            <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg flex items-start">
                    <MdWarning className="text-red-500 w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-red-800 font-medium">Warning: Permanent Action</h3>
                        <p className="text-red-700 text-sm mt-1">
                            You are about to delete a Face ID. This action cannot be undone.
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2">Face ID Information</h3>
                    <div className="space-y-2 text-sm">
                        <p className="flex justify-between">
                            <span className="text-gray-500">User:</span>
                            <span className="font-medium">{face.userName}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-gray-500">Device ID:</span>
                            <span className="font-medium">{face.deviceId}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="text-gray-500">Created At:</span>
                            <span className="font-medium">{new Date(face.createdAt).toLocaleString()}</span>
                        </p>
                    </div>
                </div>

                <div className="mt-4">
                    <button
                        onClick={() => setIsConfirmChecked(!isConfirmChecked)}
                        className="flex items-center text-gray-700 hover:text-gray-900"
                        disabled={isDeleting}
                    >
                        {isConfirmChecked ? (
                            <MdCheckBox className="w-5 h-5 text-red-600 mr-2" />
                        ) : (
                            <MdCheckBoxOutlineBlank className="w-5 h-5 mr-2" />
                        )}
                        I understand and want to delete this Face ID
                    </button>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-150"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                            isConfirmChecked && !isDeleting
                                ? 'bg-red-500 text-white hover:bg-red-600' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!isConfirmChecked || isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <MdDelete className="w-5 h-5 mr-1" />
                                Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
    )

    const renderDependenciesStep = () => {
        if (!dependencies) return null;
        
        const { faceInfo, relatedComponents } = dependencies;
        const rfidCount = relatedComponents.rfidCards.count;
        const fingerprintCount = relatedComponents.fingerprints.count;
        const hasRfid = rfidCount > 0;
        const hasFingerprints = fingerprintCount > 0;
        
        return (
            <>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <button
                            onClick={goBack}
                            className="mr-2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-150"
                        >
                            <MdArrowBack className="w-5 h-5 text-gray-600" />
                        </button>
                        <h2 className="text-xl font-semibold text-[#24303f]">Can&apos;t Delete Face ID</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <MdClose className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {/* Thông báo hướng dẫn */}
                    <div className="bg-amber-50 p-4 rounded-lg flex items-start border border-amber-200">
                        <MdInfo className="text-amber-500 w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-amber-800 font-medium">Dependent Components Detected</h3>
                            <p className="text-amber-700 text-sm mt-1">
                                This Face ID has dependent components that must be deleted first.
                            </p>
                            <p className="text-amber-700 text-sm mt-1">
                                Please remove all dependent RFID cards and fingerprints before deleting this Face ID.
                            </p>
                        </div>
                    </div>

                    {/* Thông tin khuôn mặt */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center mb-3">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                                <MdFace className="text-blue-600 w-6 h-6" />
                            </div>
                            <h3 className="font-medium text-blue-800 text-lg">Face ID Information</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3 ml-12">
                            <div>
                                <p className="text-gray-500 text-sm">User Name</p>
                                <p className="font-medium text-gray-800">{faceInfo.userName}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Device ID</p>
                                <p className="font-medium text-gray-800">{faceInfo.deviceId}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Face ID</p>
                                <p className="font-medium text-gray-800 text-sm truncate" title={faceInfo.faceId}>
                                    {faceInfo.faceId}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">User ID</p>
                                <p className="font-medium text-gray-800 text-sm truncate" title={faceInfo.userId}>
                                    {faceInfo.userId}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Danh sách RFID phụ thuộc */}
                    <div className={`rounded-lg border p-4 ${hasRfid ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                                <div className={`p-2 rounded-full mr-3 ${hasRfid ? 'bg-red-100' : 'bg-gray-100'}`}>
                                    <MdKey className={`w-5 h-5 ${hasRfid ? 'text-red-600' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <h3 className={`font-medium text-lg ${hasRfid ? 'text-red-800' : 'text-gray-400'}`}>RFID Cards</h3>
                                    <p className={`text-sm ${hasRfid ? 'text-red-600' : 'text-gray-400'}`}>
                                        {hasRfid 
                                            ? `Found ${rfidCount} RFID card${rfidCount > 1 ? 's' : ''} linked to this Face ID` 
                                            : 'No RFID cards found'}
                                    </p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm ${hasRfid ? 'bg-red-200 text-red-700' : 'bg-gray-200 text-gray-500'}`}>
                                {rfidCount} found
                            </div>
                        </div>

                        {hasRfid && (
                            <div className="ml-12 mt-3">
                                <div className="bg-white rounded-lg overflow-hidden border border-red-100 max-h-48 overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="bg-red-50 text-left sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2 text-xs font-medium text-red-700">RFID ID</th>
                                                <th className="px-4 py-2 text-xs font-medium text-red-700">User Name</th>
                                                <th className="px-4 py-2 text-xs font-medium text-red-700">Device ID</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-red-50">
                                            {relatedComponents.rfidCards.items.map((rfid, index) => (
                                                <tr key={index} className="hover:bg-red-50 transition-colors duration-150">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{rfid.rfidId}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{rfid.userName}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{rfid.deviceId}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Danh sách vân tay phụ thuộc */}
                    <div className={`rounded-lg border p-4 ${hasFingerprints ? 'bg-purple-50 border-purple-100' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                                <div className={`p-2 rounded-full mr-3 ${hasFingerprints ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                    <MdFingerprint className={`w-5 h-5 ${hasFingerprints ? 'text-purple-600' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <h3 className={`font-medium text-lg ${hasFingerprints ? 'text-purple-800' : 'text-gray-400'}`}>Fingerprints</h3>
                                    <p className={`text-sm ${hasFingerprints ? 'text-purple-600' : 'text-gray-400'}`}>
                                        {hasFingerprints 
                                            ? `Found ${fingerprintCount} fingerprint${fingerprintCount > 1 ? 's' : ''} linked to this Face ID` 
                                            : 'No fingerprints found'}
                                    </p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm ${hasFingerprints ? 'bg-purple-200 text-purple-700' : 'bg-gray-200 text-gray-500'}`}>
                                {fingerprintCount} found
                            </div>
                        </div>

                        {hasFingerprints && (
                            <div className="ml-12 mt-3">
                                <div className="bg-white rounded-lg overflow-hidden border border-purple-100 max-h-48 overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="bg-purple-50 text-left sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2 text-xs font-medium text-purple-700">Fingerprint ID</th>
                                                <th className="px-4 py-2 text-xs font-medium text-purple-700">User Name</th>
                                                <th className="px-4 py-2 text-xs font-medium text-purple-700">Device ID</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-50">
                                            {relatedComponents.fingerprints.items.map((fingerprint, index) => (
                                                <tr key={index} className="hover:bg-purple-50 transition-colors duration-150">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{fingerprint.fingerprintId}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{fingerprint.userName}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{fingerprint.deviceId}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 mt-3 border-t border-gray-100">
                    <button
                        onClick={goBack}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-150 flex items-center text-gray-700"
                    >
                        <MdKeyboardReturn className="w-5 h-5 mr-2" />
                        Go Back
                    </button>
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-150"
                    >
                        I Understand
                    </button>
                </div>
            </>
        );
    }

    if (!isOpen || !face) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-lg p-6 w-full ${currentStep === 2 ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-hidden flex flex-col`}>
                {currentStep === 1 && renderConfirmationStep()}
                {currentStep === 2 && renderDependenciesStep()}
            </div>
        </div>
    );
}

DeleteFaceIDModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    face: PropTypes.object,
    onSuccess: PropTypes.func.isRequired,
    showMessage: PropTypes.func.isRequired
}

export default DeleteFaceIDModal 