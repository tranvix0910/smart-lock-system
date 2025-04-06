import { useState } from 'react'
import PropTypes from 'prop-types'
import { MdClose, MdDelete, MdCheckBox, MdCheckBoxOutlineBlank, MdWarning, MdFingerprint } from 'react-icons/md'

const DeleteFingerprintModal = ({ 
    isOpen, 
    onClose, 
    fingerprint,
    onSuccess,
    showMessage 
}) => {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isConfirmChecked, setIsConfirmChecked] = useState(false)

    const handleDelete = async () => {
        if (!isConfirmChecked || !fingerprint) return
        
        try {
            setIsDeleting(true)
            // Here we would call the API to delete the fingerprint
            // await deleteFingerprint(fingerprint.userId, fingerprint.deviceId, fingerprint.fingerprintId)
            
            // For now, just simulate a successful deletion
            setTimeout(() => {
                onSuccess(fingerprint.id)
                showMessage('Fingerprint deleted successfully', 'success')
                onClose()
                setIsDeleting(false)
            }, 1000)
        } catch (error) {
            console.error('Error deleting Fingerprint:', error)
            showMessage(error.message || 'Failed to delete Fingerprint', 'error')
            setIsDeleting(false)
        }
    }

    if (!isOpen || !fingerprint) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#24303f]">Delete Fingerprint</h2>
                    <button
                        onClick={onClose}
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
                                You are about to delete a Fingerprint. This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-2">Fingerprint Information</h3>
                        <div className="space-y-2 text-sm">
                            <p className="flex justify-between">
                                <span className="text-gray-500">Fingerprint ID:</span>
                                <span className="font-medium flex items-center">
                                    <MdFingerprint className="text-gray-400 mr-1" />
                                    {fingerprint.fingerprintId}
                                </span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-500">User:</span>
                                <span className="font-medium">{fingerprint.userName}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-500">Device ID:</span>
                                <span className="font-medium">{fingerprint.deviceId}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-500">Face ID:</span>
                                <span className="font-medium truncate ml-2" style={{ maxWidth: '180px' }}>
                                    {fingerprint.faceId}
                                </span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-500">Created At:</span>
                                <span className="font-medium">{new Date(fingerprint.createdAt).toLocaleString()}</span>
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
                            I understand and want to delete this Fingerprint
                        </button>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            onClick={onClose}
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
            </div>
        </div>
    )
}

DeleteFingerprintModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    fingerprint: PropTypes.object,
    onSuccess: PropTypes.func.isRequired,
    showMessage: PropTypes.func.isRequired
}

export default DeleteFingerprintModal
