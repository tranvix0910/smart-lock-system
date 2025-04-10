import { useState, useEffect } from 'react'
import { 
    MdCreditCard, 
    MdAdd, 
    MdDelete, 
    MdRefresh,
    MdSearch
} from 'react-icons/md'
import useUserAttributes from '../../hooks/useUserAttributes'
import { formatId, formatDateTime } from '../../utils/formatters'
import AddRFIDCardModal from './Modal/AddRFIDCardModal'

const RFID = () => {
    const [rfidCards, setRfidCards] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
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

    // Mock data for example
    const mockRfidCards = [
        {
            id: 'card123',
            cardId: 'card123',
            userId: 'user456',
            userName: 'John Doe',
            cardNumber: '0123456789',
            cardType: 'Mifare Classic',
            status: 'Active',
            createdAt: '2023-05-10T08:30:00Z'
        },
        {
            id: 'card124',
            cardId: 'card124',
            userId: 'user456',
            userName: 'John Doe',
            cardNumber: '9876543210',
            cardType: 'Mifare DESFire',
            status: 'Active',
            createdAt: '2023-06-15T10:45:00Z'
        },
        {
            id: 'card125',
            cardId: 'card125',
            userId: 'user456',
            userName: 'John Doe',
            cardNumber: '5432109876',
            cardType: 'EM4100',
            status: 'Inactive',
            createdAt: '2023-07-20T14:20:00Z'
        }
    ]

    // Fetch RFID cards from API
    const fetchRfidCards = async () => {
        if (!currentUserId) return

        setIsLoading(true)
        try {
            // Here you would call an API to fetch RFID cards
            // For now, using mock data
            setTimeout(() => {
                setRfidCards(mockRfidCards)
                setIsLoading(false)
            }, 800)
        } catch (error) {
            console.error('Error fetching RFID cards:', error)
            showMessage(error.message || 'Failed to load RFID cards', 'error')
            setRfidCards([])
            setIsLoading(false)
        }
    }

    // Load RFID cards when component mounts
    useEffect(() => {
        fetchRfidCards()
    }, [currentUserId])

    const handleAddCard = (newCard) => {
        setRfidCards(prev => [...prev, {
            ...newCard,
            id: newCard.cardId
        }])
        showMessage('RFID card added successfully', 'success')
    }

    const handleOpenDeleteModal = () => {
        // Functionality will be implemented later
        showMessage('Delete functionality coming soon', 'info')
    }

    const handleRefresh = () => {
        fetchRfidCards()
        showMessage('Refreshing RFID card data', 'info')
    }

    const filteredCards = rfidCards.filter(card => 
        (card.userName && card.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (card.cardNumber && card.cardNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (card.cardId && card.cardId.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    // Helper function to format card number
    const formatCardNumber = (number) => {
        if (!number) return 'N/A'
        return number.length > 8 
            ? `${number.substring(0, 4)}...${number.substring(number.length - 4)}`
            : number
    }

    return (
        <div className="p-6">
            {/* Thông báo */}
            {message && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] px-6 py-3 rounded-lg shadow-lg flex items-center animate-fade-in-down ${
                    messageType === 'error' ? 'bg-red-500 text-white' : 
                    messageType === 'info' ? 'bg-blue-500 text-white' :
                    'bg-green-500 text-white'
                }`}>
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
                            placeholder="Search by name, card ID or card number..."
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

            {/* RFID Cards Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
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
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Card ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Card Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Card Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredCards.map((card) => (
                                    <tr key={card.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="w-8 h-8 flex items-center justify-center text-gray-400 mr-2">
                                                    <MdCreditCard className="w-6 h-6" />
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {card.cardId}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{card.userName}</div>
                                            <div className="text-sm text-gray-500">
                                                ID: {card.userId ? formatId(card.userId) : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="bg-gray-50 px-3 py-1.5 rounded text-xs font-mono text-gray-700 relative group cursor-pointer">
                                                {formatCardNumber(card.cardNumber)}
                                                {card.cardNumber && (
                                                    <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded py-1 px-2 -left-1/4 bottom-full mb-1 w-48 break-all z-10">
                                                        {card.cardNumber}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {card.cardType || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                card.status === 'Active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {card.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {card.createdAt ? formatDateTime(card.createdAt) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2 justify-center">
                                                <button
                                                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                                                    onClick={() => handleOpenDeleteModal()}
                                                    title="Delete"
                                                >
                                                    <MdDelete className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal components */}
            <AddRFIDCardModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddCard}
                userId={currentUserId}
            />
        </div>
    )
}

export default RFID
