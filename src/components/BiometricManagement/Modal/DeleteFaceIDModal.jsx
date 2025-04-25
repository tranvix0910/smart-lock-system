import { useState } from 'react'
import PropTypes from 'prop-types'
import {
    MdClose,
    MdDelete,
    MdCheckBox,
    MdCheckBoxOutlineBlank,
    MdWarning,
    MdKey,
    MdFingerprint,
    MdFace,
    MdInfo,
    MdArrowBack
} from 'react-icons/md'
import { deleteFaceID } from '../../../api/deleteFaceID'

const DeleteFaceIDModal = ({ isOpen, onClose, face, onSuccess, showMessage }) => {
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

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] relative overflow-hidden flex flex-col">
                {currentStep === 1 ? (
                    <>
                        {/* Header - Gradient style */}
                        <div className="bg-gradient-to-r from-red-50 to-rose-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="bg-red-500 rounded-full p-2 sm:p-2.5 mr-2 sm:mr-3 shadow-sm">
                                        <MdDelete className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                                            Face ID Deletion
                                        </p>
                                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                            Delete Face ID
                                        </h2>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full transition-colors"
                                    disabled={isDeleting}
                                >
                                    <MdClose className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content area with overflow scroll */}
                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
                            <div className="space-y-6">
                                <div className="bg-red-50 p-4 rounded-lg flex items-start border border-red-100">
                                    <MdWarning className="text-red-500 w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-red-800 font-medium">Warning: Permanent Action</h3>
                                        <p className="text-red-700 text-sm mt-1">
                                            You are about to delete a Face ID. This action cannot be undone.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="flex items-center mb-3">
                                        <div className="bg-gray-100 p-2 rounded-full mr-3">
                                            <MdFace className="text-gray-600 w-5 h-5" />
                                        </div>
                                        <h3 className="font-medium text-gray-800">Face ID Information</h3>
                                    </div>
                                    <div className="ml-12 space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">User</p>
                                                <p className="font-medium text-gray-900">{face.userName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Device ID</p>
                                                <p className="font-medium text-gray-900">{face.deviceId}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Created At</p>
                                                <p className="font-medium text-gray-900">
                                                    {new Date(face.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <button
                                        onClick={() => setIsConfirmChecked(!isConfirmChecked)}
                                        className="flex items-center text-gray-700 hover:text-gray-900 w-full"
                                        disabled={isDeleting}
                                    >
                                        {isConfirmChecked ? (
                                            <MdCheckBox className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                                        ) : (
                                            <MdCheckBoxOutlineBlank className="w-5 h-5 mr-2 flex-shrink-0" />
                                        )}
                                        <span className="text-sm">I understand and want to delete this Face ID</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 px-4 sm:px-6 py-4 bg-gray-50">
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className={`px-4 py-2 text-sm rounded-lg flex items-center transition-colors duration-150 ${
                                        isConfirmChecked && !isDeleting
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                    disabled={!isConfirmChecked || isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <MdDelete className="w-4 h-4 mr-2" />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Header for Dependencies Step */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <button
                                        onClick={goBack}
                                        className="mr-3 p-2 hover:bg-amber-100 rounded-full transition-colors"
                                    >
                                        <MdArrowBack className="w-5 h-5 text-amber-600" />
                                    </button>
                                    <div>
                                        <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                                            Dependencies Found
                                        </p>
                                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                            Can&apos;t Delete Face ID
                                        </h2>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full transition-colors"
                                >
                                    <MdClose className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Dependencies Content */}
                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
                            <div className="space-y-6">
                                {/* Warning Message */}
                                <div className="bg-amber-50 p-4 rounded-lg flex items-start border border-amber-200">
                                    <MdInfo className="text-amber-500 w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-amber-800 font-medium">Dependent Components Detected</h3>
                                        <p className="text-amber-700 text-sm mt-1">
                                            This Face ID has dependent components that must be deleted first.
                                        </p>
                                        <p className="text-amber-700 text-sm mt-1">
                                            Please remove all dependent RFID cards and fingerprints before deleting this
                                            Face ID.
                                        </p>
                                    </div>
                                </div>

                                {/* Face ID Info */}
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <div className="flex items-center mb-3">
                                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                                            <MdFace className="text-blue-600 w-5 h-5" />
                                        </div>
                                        <h3 className="font-medium text-blue-800">Face ID Information</h3>
                                    </div>
                                    <div className="ml-12 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">User Name</p>
                                            <p className="font-medium text-gray-900">
                                                {dependencies.faceInfo.userName}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Device ID</p>
                                            <p className="font-medium text-gray-900">
                                                {dependencies.faceInfo.deviceId}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Face ID</p>
                                            <p
                                                className="font-medium text-gray-900 text-sm truncate"
                                                title={dependencies.faceInfo.faceId}
                                            >
                                                {dependencies.faceInfo.faceId}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">User ID</p>
                                            <p
                                                className="font-medium text-gray-900 text-sm truncate"
                                                title={dependencies.faceInfo.userId}
                                            >
                                                {dependencies.faceInfo.userId}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* RFID Cards */}
                                {dependencies.relatedComponents.rfidCards.count > 0 && (
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <div className="bg-red-100 p-2 rounded-full mr-3">
                                                    <MdKey className="text-red-600 w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-red-800">RFID Cards</h3>
                                                    <p className="text-sm text-red-600">
                                                        Found {dependencies.relatedComponents.rfidCards.count} RFID card
                                                        {dependencies.relatedComponents.rfidCards.count > 1
                                                            ? 's'
                                                            : ''}{' '}
                                                        linked to this Face ID
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-red-200 text-red-700 px-3 py-1 rounded-full text-sm">
                                                {dependencies.relatedComponents.rfidCards.count} found
                                            </div>
                                        </div>

                                        <div className="ml-12 mt-3">
                                            <div className="bg-white rounded-lg overflow-hidden border border-red-100">
                                                <table className="w-full">
                                                    <thead className="bg-red-50">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-sm font-medium text-red-700">
                                                                Card ID
                                                            </th>
                                                            <th className="px-4 py-2 text-left text-sm font-medium text-red-700">
                                                                Created At
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-red-100">
                                                        {dependencies.relatedComponents.rfidCards.items.map(
                                                            (card, index) => (
                                                                <tr key={index} className="hover:bg-red-50">
                                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                                        {card.cardId}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-gray-500">
                                                                        {new Date(card.createdAt).toLocaleString()}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Fingerprints */}
                                {dependencies.relatedComponents.fingerprints.count > 0 && (
                                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <div className="bg-purple-100 p-2 rounded-full mr-3">
                                                    <MdFingerprint className="text-purple-600 w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-purple-800">Fingerprints</h3>
                                                    <p className="text-sm text-purple-600">
                                                        Found {dependencies.relatedComponents.fingerprints.count}{' '}
                                                        fingerprint
                                                        {dependencies.relatedComponents.fingerprints.count > 1
                                                            ? 's'
                                                            : ''}{' '}
                                                        linked to this Face ID
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-purple-200 text-purple-700 px-3 py-1 rounded-full text-sm">
                                                {dependencies.relatedComponents.fingerprints.count} found
                                            </div>
                                        </div>

                                        <div className="ml-12 mt-3">
                                            <div className="bg-white rounded-lg overflow-hidden border border-purple-100">
                                                <table className="w-full">
                                                    <thead className="bg-purple-50">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-sm font-medium text-purple-700">
                                                                Fingerprint ID
                                                            </th>
                                                            <th className="px-4 py-2 text-left text-sm font-medium text-purple-700">
                                                                Created At
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-purple-100">
                                                        {dependencies.relatedComponents.fingerprints.items.map(
                                                            (fingerprint, index) => (
                                                                <tr key={index} className="hover:bg-purple-50">
                                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                                        {fingerprint.fingerprintId}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-gray-500">
                                                                        {new Date(
                                                                            fingerprint.createdAt
                                                                        ).toLocaleString()}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 px-4 sm:px-6 py-4 bg-gray-50">
                            <div className="flex justify-end">
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

DeleteFaceIDModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    face: PropTypes.object,
    onSuccess: PropTypes.func.isRequired,
    showMessage: PropTypes.func.isRequired
}

export default DeleteFaceIDModal
