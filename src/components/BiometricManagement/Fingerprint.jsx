import { useState } from 'react'
import { 
    MdFingerprint, 
    MdPersonAdd, 
    MdDelete, 
    MdRefresh,
    MdSearch,
    MdEdit,
    MdClose
} from 'react-icons/md'

const Fingerprint = () => {
    const [fingerprints, setFingerprints] = useState([
        { id: 1, userId: 'USER001', userName: 'John Doe', fingerprintId: 'FP001', status: 'Active', createdAt: '2024-03-20T08:30:00' },
        { id: 2, userId: 'USER002', userName: 'Jane Smith', fingerprintId: 'FP002', status: 'Active', createdAt: '2024-03-20T09:15:00' },
        { id: 3, userId: 'USER003', userName: 'Mike Johnson', fingerprintId: 'FP003', status: 'Inactive', createdAt: '2024-03-19T14:20:00' }
    ])
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    const filteredFingerprints = fingerprints.filter(fp => 
        fp.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fp.fingerprintId.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this fingerprint?')) {
            setFingerprints(prev => prev.filter(fp => fp.id !== id))
        }
    }

    const handleStatusToggle = (id) => {
        setFingerprints(prev => prev.map(fp => 
            fp.id === id 
                ? { ...fp, status: fp.status === 'Active' ? 'Inactive' : 'Active' }
                : fp
        ))
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <MdFingerprint className="w-8 h-8 text-[#24303f]" />
                    <h1 className="text-2xl font-semibold text-[#24303f]">Fingerprint Management</h1>
                </div>
                <p className="text-gray-500 mt-1">Manage and monitor all registered fingerprints</p>
            </div>

            {/* Actions Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full">
                        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or fingerprint ID..."
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
                            <MdPersonAdd className="w-5 h-5" />
                            <span>Add New</span>
                        </button>
                        <button
                            className="p-2 text-[#24303f] border border-gray-200 rounded-lg hover:border-[#ebf45d] transition-colors duration-150"
                            onClick={() => window.location.reload()}
                        >
                            <MdRefresh className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Fingerprints Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fingerprint ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredFingerprints.map((fingerprint) => (
                                <tr key={fingerprint.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <MdFingerprint className="w-5 h-5 mr-2 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-900">
                                                {fingerprint.fingerprintId}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{fingerprint.userName}</div>
                                        <div className="text-sm text-gray-500">{fingerprint.userId}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleStatusToggle(fingerprint.id)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                fingerprint.status === 'Active'
                                                    ? 'bg-[#ebf45d] text-[#24303f] border border-[#d9e154]'
                                                    : 'bg-red-100 text-red-700 border border-red-200'
                                            }`}
                                        >
                                            {fingerprint.status}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(fingerprint.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="p-1 text-blue-600 hover:text-blue-800"
                                                onClick={() => console.log('Edit', fingerprint.id)}
                                            >
                                                <MdEdit className="w-5 h-5" />
                                            </button>
                                            <button
                                                className="p-1 text-red-600 hover:text-red-800"
                                                onClick={() => handleDelete(fingerprint.id)}
                                            >
                                                <MdDelete className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-[#24303f]">Add New Fingerprint</h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <MdClose className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    User
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ebf45d]">
                                    <option value="">Select User</option>
                                    <option value="1">John Doe</option>
                                    <option value="2">Jane Smith</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fingerprint Scanner
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <MdFingerprint className="w-16 h-16 mx-auto text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">
                                        Place your finger on the scanner
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg hover:border-[#ebf45d] transition-colors duration-150"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        // Handle save
                                        setIsAddModalOpen(false)
                                    }}
                                    className="px-4 py-2 bg-[#ebf45d] text-[#24303f] rounded-lg hover:bg-[#d9e154] transition-colors duration-150"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Fingerprint
