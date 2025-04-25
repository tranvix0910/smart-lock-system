import { MdClose, MdDevices, MdPerson, MdFace } from 'react-icons/md'
import PropTypes from 'prop-types'

const ImagePreviewModal = ({
    isOpen,
    onClose,
    imageUrl,
    data,
    type = 'face' // 'face' | 'access'
}) => {
    if (!isOpen || !imageUrl || !data) return null

    const formatId = (id) => {
        if (!id) return 'N/A'
        return id.substring(0, 8) + '...'
    }

    return (
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl relative flex"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Left Side - Information */}
                <div className="w-1/3 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
                    <div className="space-y-6">
                        {/* Header */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {type === 'face' ? 'Face ID Details' : 'Face Authentication Details'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {type === 'face' ? 'Registered at ' : 'Captured at '}
                                {data.createdAt ? new Date(data.createdAt).toLocaleString() : 'Unknown time'}
                            </p>
                        </div>

                        {/* Device Info */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Device Information</h4>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center mb-3">
                                    <MdDevices className="w-5 h-5 text-gray-400 mr-2" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {data.deviceName || data.deviceId || 'Unknown Device'}
                                        </p>
                                        {type === 'access' && (
                                            <p className="text-xs text-gray-500">{data.deviceId || 'Unknown ID'}</p>
                                        )}
                                    </div>
                                </div>
                                {type === 'access' && (
                                    <div className="flex items-center">
                                        <div
                                            className={`w-2 h-2 rounded-full ${data.status === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'} mr-2`}
                                        ></div>
                                        <span className="text-sm text-gray-600">{data.status || 'Unknown status'}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* User Info */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">User Information</h4>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <MdPerson className="w-5 h-5 text-gray-400 mr-2" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {data.userName || 'Unknown User'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {data.userId ? formatId(data.userId) : 'No ID'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Face ID Info / Authentication Method */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                {type === 'face' ? 'Face ID Information' : 'Authentication Method'}
                            </h4>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center">
                                    <MdFace className="w-5 h-5 text-blue-500 mr-2" />
                                    <span className="text-sm text-gray-600">
                                        {type === 'face' ? 'Face Recognition ID' : 'Face Recognition'}
                                    </span>
                                </div>
                                {type === 'face' && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        {data.faceId ? formatId(data.faceId) : 'No ID'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Notes if any (only for access type) */}
                        {type === 'access' && data.notes && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Notes</h4>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-sm text-gray-600">{data.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side - Image */}
                <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
                    <div className="relative w-full aspect-square flex items-center justify-center p-4">
                        <img
                            src={imageUrl}
                            alt={type === 'face' ? 'Face ID Preview' : 'Access Image'}
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>

                    {/* Close Button */}
                    <button
                        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full text-white flex items-center justify-center transition-colors duration-200"
                        onClick={onClose}
                    >
                        <MdClose className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    )
}

ImagePreviewModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    imageUrl: PropTypes.string,
    data: PropTypes.object,
    type: PropTypes.oneOf(['face', 'access'])
}

export default ImagePreviewModal
