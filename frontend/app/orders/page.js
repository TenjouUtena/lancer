'use client'

import { useState, useEffect } from 'react'
import { OrderForm } from './OrderForm'
import { OrderDetails } from './OrderDetails'
import { api } from '../utils/api'

export default function OrdersPage() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [editingOrder, setEditingOrder] = useState(null)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showDetails, setShowDetails] = useState(false)
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const data = await api.orders.getAll()
            setOrders(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this order? This will also delete all order lines.')) {
            return
        }

        try {
            await api.orders.delete(id)
            await fetchOrders()
        } catch (err) {
            setError(err.message)
        }
    }

    const handleEdit = (order) => {
        setEditingOrder(order)
        setShowForm(true)
    }

    const handleViewDetails = (order) => {
        setSelectedOrder(order)
        setShowDetails(true)
    }

    const handleCloseForm = () => {
        setShowForm(false)
        setEditingOrder(null)
        fetchOrders()
    }

    const handleCloseDetails = () => {
        setShowDetails(false)
        setSelectedOrder(null)
        fetchOrders()
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 0: return 'bg-yellow-100 text-yellow-800' // Pending
            case 1: return 'bg-blue-100 text-blue-800' // InProgress
            case 2: return 'bg-green-100 text-green-800' // Completed
            case 3: return 'bg-red-100 text-red-800' // Cancelled
            case 4: return 'bg-purple-100 text-purple-800' // Refunded
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 0: return 'Pending'
            case 1: return 'In Progress'
            case 2: return 'Completed'
            case 3: return 'Cancelled'
            case 4: return 'Refunded'
            default: return 'Unknown'
        }
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const filteredOrders = orders.filter(order => {
        if (statusFilter === 'all') return true
        return order.status.toString() === statusFilter
    })

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    Error: {error}
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="0">Pending</option>
                        <option value="1">In Progress</option>
                        <option value="2">Completed</option>
                        <option value="3">Cancelled</option>
                        <option value="4">Refunded</option>
                    </select>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-150"
                    >
                        New Order
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
                        <OrderForm
                            order={editingOrder}
                            onClose={handleCloseForm}
                        />
                    </div>
                </div>
            )}

            {showDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-6xl w-full m-4 max-h-[90vh] overflow-y-auto">
                        <OrderDetails
                            order={selectedOrder}
                            onClose={handleCloseDetails}
                        />
                    </div>
                </div>
            )}

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            #{order.id}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {order.customer?.name || 'Unknown Customer'}
                                        </div>
                                        {order.customer?.emailAddress && (
                                            <div className="text-sm text-gray-500">
                                                {order.customer.emailAddress}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {formatDate(order.orderDate)}
                                        </div>
                                        {order.completedDate && (
                                            <div className="text-sm text-gray-500">
                                                Completed: {formatDate(order.completedDate)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {order.orderLines?.length || 0} items
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatPrice(order.totalAmount)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleViewDetails(order)}
                                            className="text-green-600 hover:text-green-900 mr-3"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleEdit(order)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(order.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            {statusFilter === 'all' 
                                ? 'No orders found. Click "New Order" to create one.'
                                : `No orders found with status "${getStatusText(parseInt(statusFilter))}".`
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}