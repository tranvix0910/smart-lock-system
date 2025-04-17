import { useState, useEffect } from 'react'
import { 
    MdCreditCard, 
    MdAdd, 
    MdDelete, 
    MdRefresh,
    MdSearch,
    MdPerson,
    MdAccessTime,
    MdInfo,
    MdNfc,
    MdCheckCircle,
    MdError
} from 'react-icons/md'
import useUserAttributes from '../../hooks/useUserAttributes'
import { formatId, formatDateTime } from '../../utils/formatters'
import AddRFIDCardModal from './Modal/AddRFIDCardModal'
import DeleteRFIDCardModal from './Modal/DeleteRFIDCardModal'
import { getRFIDCard } from '../../api/RFIDCard'

const RFID = () => {
    const [rfidCards, setRfidCards] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedCard, setSelectedCard] = useState(null)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const userAttributes = useUserAttributes()
    const currentUserId = userAttributes?.sub

    const showMessage = (msg, type) => {
        setMessage(msg)
        setMessageType(type)
        setTimeout(() => {
            setMessage('')
            setMessageType('')
        }, 3000)
    }

    // Fetch RFID cards from API
    const fetchRfidCards = async () => {
        if (!currentUserId) return

        setIsLoading(true)
        try {
            const data = await getRFIDCard(currentUserId)
            console.log('API Response:', data) // Debug log
            
            if (data.success && data.rfid && Array.isArray(data.rfid)) {
                setRfidCards(data.rfid.map(card => ({
                    ...card,
                    id: card._id || card.rfidId,
                    status: 'Active', // Default status
                    cardType: 'Standard' // Default card type
                })))
                console.log('Processed RFID Cards:', data.rfid)
                if (data.rfid.length === 0) {
                    showMessage('No RFID cards found for this user', 'info')
                }
            } else {
                console.error('Unexpected API response format:', data)
                showMessage('Error in API response format', 'error')
                loadDummyData() // Load dummy data as fallback
            }
            setIsLoading(false)
        } catch (error) {
            console.error('Error fetching RFID cards:', error)
            showMessage(error.message || 'Failed to load RFID cards', 'error')
            setRfidCards([])
            setIsLoading(false)
            loadDummyData() // Load dummy data on error
        }
    }

    // Dummy data for demo when API is not working
    const loadDummyData = () => {
        setRfidCards([
            {
                id: 'ObjectId(\'67f5368da6f04a0939960c42\')',
                userId: '39da459c-4001-704e-8a18-531c910c5e4b',
                deviceId: 'SMTV-1580',
                faceId: '0127aada-9f96-4640-a8d8-3a57d370d8e8',
                userName: 'Tran Dai Vi',
                rfidId: 'E13F:1B:03',
                rfidIdLength: 4,
                notes: '',
                createdAt: '2025-04-08T14:45:33.025+00:00',
                updatedAt: '2025-04-08T14:45:33.025+00:00',
                __v: 0,
                status: 'Active',
                cardType: 'Standard'
            },
            {
                id: 'ObjectId(\'67f5368da6f04a0939960c43\')',
                userId: '39da459c-4001-704e-8a18-531c910c5e4b',
                deviceId: 'SMTV-1581',
                faceId: '0127aada-9f96-4640-a8d8-3a57d370d8e9',
                userName: 'Nguyen Van A',
                rfidId: 'A14D:5E:07',
                rfidIdLength: 4,
                notes: 'Main entrance card',
                createdAt: '2025-03-10T09:30:15.025+00:00',
                updatedAt: '2025-03-10T09:30:15.025+00:00',
                __v: 0,
                status: 'Active',
                cardType: 'Premium'
            },
            {
                id: 'ObjectId(\'67f5368da6f04a0939960c44\')',
                userId: '39da459c-4001-704e-8a18-531c910c5e4b',
                deviceId: 'SMTV-1582',
                faceId: '0127aada-9f96-4640-a8d8-3a57d370d8e7',
                userName: 'Le Thi B',
                rfidId: 'C93B:2F:12',
                rfidIdLength: 4,
                notes: 'Backup card',
                createdAt: '2025-02-15T14:22:08.025+00:00',
                updatedAt: '2025-02-15T14:22:08.025+00:00',
                __v: 0,
                status: 'Inactive',
                cardType: 'Standard'
            }
        ])
        setIsLoading(false)
    }

    // Load RFID cards when component mounts
    useEffect(() => {
        try {
            fetchRfidCards()
        } catch (error) {
            console.error('Error in initial fetch:', error)
            showMessage('Error fetching data. Showing sample cards.', 'error')
            loadDummyData()
        }
    }, [currentUserId])

    const handleAddCard = (newCard) => {
        setRfidCards(prev => [...prev, {
            ...newCard,
            id: newCard._id || newCard.rfidId,
            status: 'Active', // Default status
            cardType: 'Standard' // Default card type
        }])
        showMessage('RFID card added successfully', 'success')
    }

    const handleOpenDeleteModal = (cardId) => {
        const card = rfidCards.find(card => card.id === cardId)
        if (card) {
            setSelectedCard(card)
            setIsDeleteModalOpen(true)
        } else {
            showMessage(`Card with ID ${cardId} not found`, 'error')
        }
    }

    const handleDeleteSuccess = (cardId) => {
        setRfidCards(prev => prev.filter(card => card.id !== cardId))
        showMessage('RFID card deleted successfully', 'success')
    }

    const handleRefresh = () => {
        showMessage('Refreshing RFID card data...', 'info')
        try {
            fetchRfidCards()
        } catch (error) {
            console.error('Error refreshing data:', error)
            showMessage('Error refreshing data. Showing sample cards.', 'error')
            loadDummyData()
        }
    }

    const filteredCards = rfidCards.filter(card => 
        (card.userName && card.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (card.rfidId && card.rfidId.toLowerCase().replace(/:/g, '').includes(searchTerm.toLowerCase().replace(/:/g, ''))) ||
        (card.deviceId && card.deviceId.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    // Helper function to generate a gradient for each card
    const getCardGradient = (cardType) => {
        switch(cardType) {
            case 'Premium':
                return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-400';
            case 'Standard':
            default:
                return 'bg-gradient-to-r from-gray-50 to-blue-50 border-l-4 border-blue-400';
        }
    }

    // Format RFID ID with colons
    const formatRfidId = (rfidId) => {
        if (!rfidId) return 'N/A';
        // Return as is since it already contains colons from the database
        return rfidId;
    }

    // Get status style
    const getStatusStyle = (status) => {
        return status === 'Active'
            ? 'bg-green-100 text-green-700 border border-green-200'
            : 'bg-red-100 text-red-700 border border-red-200';
    }

    return (
        <div className="p-6">
            {/* Notification */}
            {message && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] px-6 py-3 rounded-lg shadow-lg flex items-center animate-fade-in-down ${
                    messageType === 'error' ? 'bg-red-500 text-white' : 
                    messageType === 'info' ? 'bg-blue-500 text-white' :
                    'bg-green-500 text-white'
                }`}>
                    {messageType === 'error' && <MdError className="mr-2 w-5 h-5" />}
                    {messageType === 'info' && <MdInfo className="mr-2 w-5 h-5" />}
                    {messageType === 'success' && <MdCheckCircle className="mr-2 w-5 h-5" />}
                    {message}
                </div>
            )}
            
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <MdCreditCard className="w-8 h-8 text-[#24303f]" />
                    <h1 className="text-2xl font-semibold text-[#24303f]">RFID Card Management</h1>
                </div>
                <p className="text-gray-500 mt-1">Manage and monitor all registered RFID cards</p>
            </div>

            {/* Actions Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full">
                        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, card ID or device ID..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150"
                        >
                            <MdAdd className="w-5 h-5" />
                            <span>Add New</span>
                        </button>
                        <button
                            className="p-2 text-[#24303f] border border-gray-200 rounded-lg hover:border-[#ebf45d] transition-colors duration-150"
                            onClick={handleRefresh}
                            disabled={isLoading}
                        >
                            <MdRefresh className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* RFID Cards Display */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#24303f]"></div>
                        <p className="ml-3 text-gray-600">Loading RFID cards...</p>
                    </div>
                ) : rfidCards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <MdCreditCard className="w-16 h-16 text-gray-300 mb-3" />
                        <p className="text-lg">No RFID cards found</p>
                        <p className="text-sm text-gray-400 mt-1">Add your first RFID card by clicking the &quot;Add New&quot; button</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                        {filteredCards.map((card) => (
                            <div 
                                key={card.id} 
                                className="rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden bg-white border border-gray-100 hover:border-blue-200 flex flex-col h-full"
                            >
                                {/* Card Header */}
                                <div className={`${getCardGradient(card.cardType)} px-3 sm:px-5 py-3 sm:py-4 relative`}>
                                    {/* Card Type & Status */}
                                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                                        <div className="flex items-center">
                                            <MdNfc className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-1 sm:mr-2" />
                                            <span className="text-xs sm:text-sm font-medium text-gray-800">
                                                {card.cardType || 'Standard'} RFID
                                            </span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(card.status)}`}>
                                            {card.status}
                                        </span>
                                    </div>
                                    
                                    {/* RFID ID */}
                                    <div className="mb-3 sm:mb-4">
                                        <p className="text-base sm:text-lg md:text-xl font-mono font-semibold text-gray-800 tracking-wider truncate" title={formatRfidId(card.rfidId)}>
                                            {formatRfidId(card.rfidId)}
                                        </p>
                                    </div>
                                    
                                    {/* Device ID */}
                                    <div className="flex justify-between items-end">
                                        <div className="max-w-[70%]">
                                            <p className="text-xs text-gray-500 uppercase">Device ID</p>
                                            <p className="text-xs sm:text-sm font-medium text-gray-700 truncate" title={card.deviceId}>
                                                {card.deviceId || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-sm flex-shrink-0">
                                            <MdCreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Card Body */}
                                <div className="p-3 sm:p-5 flex-1 flex flex-col">
                                    {/* User Info */}
                                    <div className="flex items-center gap-2 sm:gap-3 pb-3 border-b border-gray-100">
                                        <div className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-blue-50 text-blue-600 flex-shrink-0">
                                            <MdPerson className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-800 text-sm sm:text-base truncate" title={card.userName || 'Unknown User'}>
                                                {card.userName || 'Unknown User'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">ID: {formatId(card.userId)}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Created Date */}
                                    <div className="flex items-center gap-2 sm:gap-3 py-3 border-b border-gray-100">
                                        <div className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-blue-50 text-blue-600 flex-shrink-0">
                                            <MdAccessTime className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-500">Created</p>
                                            <p className="text-xs sm:text-sm font-medium text-gray-800 truncate" title={card.createdAt ? formatDateTime(card.createdAt) : 'N/A'}>
                                                {card.createdAt ? formatDateTime(card.createdAt) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Face ID - Optional Display based on length */}
                                    {card.faceId && (
                                        <div className="py-3 border-b border-gray-100">
                                            <div className="flex items-center gap-2 sm:gap-3 mb-1">
                                                <div className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-blue-50 text-blue-600 flex-shrink-0">
                                                    <MdInfo className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </div>
                                                <p className="text-xs text-gray-500">Face ID</p>
                                            </div>
                                            <p className="ml-9 sm:ml-12 text-xs font-mono text-gray-600 truncate" title={card.faceId}>
                                                {card.faceId.length > 20 
                                                    ? `${card.faceId.substring(0, 15)}...${card.faceId.substring(card.faceId.length - 5)}`
                                                    : card.faceId
                                                }
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Notes - Optional */}
                                    {card.notes && (
                                        <div className="pt-3 flex-grow">
                                            <p className="text-xs text-gray-500 mb-1">Notes:</p>
                                            <p className="text-xs sm:text-sm text-gray-700 italic line-clamp-2" title={card.notes}>
                                                {card.notes}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Card Actions */}
                                    <div className="flex justify-end mt-auto pt-3">
                                        <button
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                            onClick={() => handleOpenDeleteModal(card.id)}
                                            title="Delete"
                                        >
                                            <MdDelete className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal components */}
            <AddRFIDCardModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddCard}
                userId={currentUserId}
            />
            <DeleteRFIDCardModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                card={selectedCard}
                onSuccess={handleDeleteSuccess}
                showMessage={showMessage}
            />
        </div>
    )
}

export default RFID
