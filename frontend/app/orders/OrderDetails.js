'use client'

import { useState, useEffect } from 'react'

export function OrderDetails({ order, onClose }) {
    const [orderLines, setOrderLines] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [editingLine, setEditingLine] = useState(null)
    const [editFormData, setEditFormData] = useState({})

    useEffect(() => {
        if (order) {
            setOrderLines(order.orderLines || [])
        }
    }, [order])

    const getStatusColor = (status) => {
        switch (status) {
            case 0: return 'bg-yellow-100 text-yellow-800'
            case 1: return 'bg-blue-100 text-blue-800'
            case 2: return 'bg-green-100 text-green-800'
            case 3: return 'bg-red-100 text-red-800'
            case 4: return 'bg-purple-100 text-purple-800'
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
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleEditLine = (line) => {
        setEditingLine(line.id)
        setEditFormData({
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discountAmount: line.discountAmount,
            notes: line.notes
        })
    }

    const handleSaveEdit = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}orderlines/${editingLine}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    id: editingLine,
                    productId: orderLines.find(l => l.id === editingLine).productId,
                    quantity: parseInt(editFormData.quantity),
                    unitPrice: parseFloat(editFormData.unitPrice),
                    discountAmount: parseFloat(editFormData.discountAmount) || 0,
                    notes: editFormData.notes || ''
                })
            })

            if (!response.ok) {
                throw new Error('Failed to update order line')
            }

            // Update local state
            setOrderLines(prev => prev.map(line => {
                if (line.id === editingLine) {
                    const updatedLine = {
                        ...line,
                        quantity: parseInt(editFormData.quantity),
                        unitPrice: parseFloat(editFormData.unitPrice),
                        discountAmount: parseFloat(editFormData.discountAmount) || 0,
                        notes: editFormData.notes || ''
                    }
                    updatedLine.netPrice = (updatedLine.unitPrice * updatedLine.quantity) - updatedLine.discountAmount
                    return updatedLine
                }
                return line
            }))

            setEditingLine(null)
            setEditFormData({})
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCancelEdit = () => {
        setEditingLine(null)
        setEditFormData({})
    }

    const handleDeleteLine = async (lineId) => {
        if (!confirm('Are you sure you want to delete this order line?')) {
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}orderlines/${lineId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('Failed to delete order line')
            }

            setOrderLines(prev => prev.filter(line => line.id !== lineId))
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleEditFormChange = (e) => {
        const { name, value } = e.target
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const getTotalAmount = () => {
        return orderLines.reduce((sum, line) => sum + (line.netPrice || 0), 0)
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Order Details #{order?.id}
                </h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}

            {/* Order Information */}
            <div className="bg-white border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-500">Customer</h4>
                            <p className="text-sm text-gray-900">{order?.customer?.name || 'Unknown'}</p>
                            {order?.customer?.emailAddress && (
                                <p className="text-sm text-gray-600">{order.customer.emailAddress}</p>
                            )}
                        </div>
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-500">Order Date</h4>
                            <p className="text-sm text-gray-900">{formatDate(order?.orderDate)}</p>
                        </div>
                        {order?.completedDate && (
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-500">Completed Date</h4>
                                <p className="text-sm text-gray-900">{formatDate(order.completedDate)}</p>
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-500">Status</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order?.status)}`}>
                                {getStatusText(order?.status)}
                            </span>
                        </div>
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-500">Total Amount</h4>
                            <p className="text-lg font-semibold text-gray-900">{formatPrice(getTotalAmount())}</p>
                        </div>
                    </div>
                </div>
                {order?.notes && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
                    </div>
                )}
            </div>

            {/* Order Lines */}
            <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
                
                {orderLines.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No items in this order.</p>
                ) : (
                    <div className="space-y-4">
                        {orderLines.map((line) => (
                            <div key={line.id} className="border rounded-lg p-4">
                                {editingLine === line.id ? (
                                    // Edit Mode
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    Quantity
                                                </label>
                                                <input
                                                    type="number"
                                                    name="quantity"
                                                    min="1"
                                                    value={editFormData.quantity}
                                                    onChange={handleEditFormChange}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    Unit Price
                                                </label>
                                                <input
                                                    type="number"
                                                    name="unitPrice"
                                                    min="0"
                                                    step="0.01"
                                                    value={editFormData.unitPrice}
                                                    onChange={handleEditFormChange}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    Discount
                                                </label>
                                                <input
                                                    type="number"
                                                    name="discountAmount"
                                                    min="0"
                                                    step="0.01"
                                                    value={editFormData.discountAmount}
                                                    onChange={handleEditFormChange}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    disabled={loading}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                                Notes
                                            </label>
                                            <input
                                                type="text"
                                                name="notes"
                                                value={editFormData.notes}
                                                onChange={handleEditFormChange}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                placeholder="Item notes..."
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    // View Mode
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                                <div className="md:col-span-2">
                                                    <h4 className="font-medium text-gray-900">
                                                        {line.product?.name || 'Unknown Product'}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        Artist: {line.product?.artist?.name || 'Unknown'}
                                                    </p>
                                                    {line.product?.base && (
                                                        <p className="text-sm text-gray-600">
                                                            Base: {line.product.base.name}
                                                        </p>
                                                    )}
                                                    {line.notes && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Note: {line.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Quantity</p>
                                                    <p className="font-medium">{line.quantity}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Unit Price</p>
                                                    <p className="font-medium">{formatPrice(line.unitPrice)}</p>
                                                    {line.discountAmount > 0 && (
                                                        <p className="text-sm text-red-600">
                                                            -{formatPrice(line.discountAmount)}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Total</p>
                                                    <p className="font-medium text-lg">{formatPrice(line.netPrice)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleEditLine(line)}
                                                className="text-blue-600 hover:text-blue-900 text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLine(line.id)}
                                                className="text-red-600 hover:text-red-900 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        <div className="border-t pt-4">
                            <div className="flex justify-between text-lg font-semibold text-gray-900">
                                <span>Total Amount:</span>
                                <span>{formatPrice(getTotalAmount())}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-6">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-150"
                >
                    Close
                </button>
            </div>
        </div>
    )
}