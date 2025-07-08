'use client'

import { useState, useEffect } from 'react'
import { api } from '../utils/api.js'

export function OrderForm({ order, onClose }) {
    const [formData, setFormData] = useState({
        customerId: '',
        commissionId: '',
        orderDate: new Date().toISOString().slice(0, 16),
        dateStarted: new Date().toISOString().slice(0, 16),
        dateDue: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // +21 days
        status: 0, // Pending
        notes: '',
        details: '',
        paid: false,
        posted: false,
        discountsAndUpcharges: ''
    })
    const [orderLines, setOrderLines] = useState([])
    const [newOrderLine, setNewOrderLine] = useState({
        productId: '',
        quantity: 1,
        unitPrice: '',
        discount: '',
        discountAmount: 0,
        notes: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [customers, setCustomers] = useState([])
    const [products, setProducts] = useState([])
    const [commissions, setCommissions] = useState([])

    useEffect(() => {
        fetchDropdownData()
        if (order) {
            setFormData({
                customerId: order.customerId || '',
                commissionId: order.commissionId || '',
                orderDate: order.orderDate ? new Date(order.orderDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                dateStarted: order.dateStarted ? new Date(order.dateStarted).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                dateDue: order.dateDue ? new Date(order.dateDue).toISOString().slice(0, 16) : new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                status: order.status || 0,
                notes: order.notes || '',
                details: order.details || '',
                paid: order.paid || false,
                posted: order.posted || false,
                discountsAndUpcharges: order.discountsAndUpcharges || ''
            })
            setOrderLines(order.orderLines || [])
        }
    }, [order])

    const fetchDropdownData = async () => {
        try {
            const [customersData, productsData, commissionsData] = await Promise.all([
                api.customers.getAll(),
                api.products.getAll(),
                api.commissions.getAll()
            ])

            setCustomers(customersData)
            setProducts(productsData)
            setCommissions(commissionsData)
        } catch (err) {
            console.error('Error fetching dropdown data:', err)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!formData.customerId && !formData.commissionId) {
            setError('Either Customer or Commission is required')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const payload = {
                ...formData,
                customerId: formData.customerId ? parseInt(formData.customerId) : null,
                commissionId: formData.commissionId ? parseInt(formData.commissionId) : null,
                orderDate: new Date(formData.orderDate).toISOString(),
                dateStarted: new Date(formData.dateStarted).toISOString(),
                dateDue: new Date(formData.dateDue).toISOString(),
                status: parseInt(formData.status),
                orderLines: orderLines.map(line => ({
                    productId: parseInt(line.productId),
                    quantity: parseInt(line.quantity),
                    unitPrice: parseFloat(line.unitPrice),
                    discount: line.discount || '',
                    discountAmount: parseFloat(line.discountAmount) || 0,
                    notes: line.notes || ''
                }))
            }

            if (order) {
                payload.id = order.id
                // For updates, we don't send order lines in the main payload
                delete payload.orderLines
                await api.orders.update(order.id, payload)
            } else {
                await api.orders.create(payload)
            }

            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleNewOrderLineChange = (e) => {
        const { name, value } = e.target
        setNewOrderLine(prev => {
            const updated = { ...prev, [name]: value }
            
            // Auto-populate unit price when product is selected
            if (name === 'productId' && value) {
                const product = products.find(p => p.id === parseInt(value))
                if (product && !prev.unitPrice) {
                    updated.unitPrice = product.price
                }
            }
            
            return updated
        })
    }

    const addOrderLine = () => {
        if (!newOrderLine.productId) {
            setError('Product is required for order line')
            return
        }

        const product = products.find(p => p.id === parseInt(newOrderLine.productId))
        if (!product) {
            setError('Selected product not found')
            return
        }

        const orderLineToAdd = {
            id: Date.now(), // Temporary ID for frontend
            productId: parseInt(newOrderLine.productId),
            product: product,
            quantity: parseInt(newOrderLine.quantity) || 1,
            unitPrice: parseFloat(newOrderLine.unitPrice) || product.price,
            discount: newOrderLine.discount || '',
            discountAmount: parseFloat(newOrderLine.discountAmount) || 0,
            notes: newOrderLine.notes || ''
        }

        // Calculate net price
        orderLineToAdd.netPrice = (orderLineToAdd.unitPrice * orderLineToAdd.quantity) - orderLineToAdd.discountAmount

        setOrderLines(prev => [...prev, orderLineToAdd])
        setNewOrderLine({
            productId: '',
            quantity: 1,
            unitPrice: '',
            discount: '',
            discountAmount: 0,
            notes: ''
        })
        setError(null)
    }

    const removeOrderLine = (index) => {
        setOrderLines(prev => prev.filter((_, i) => i !== index))
    }

    const updateOrderLine = (index, field, value) => {
        setOrderLines(prev => {
            const updated = [...prev]
            updated[index] = { ...updated[index], [field]: value }
            
            // Recalculate net price
            const line = updated[index]
            line.netPrice = (line.unitPrice * line.quantity) - line.discountAmount
            
            return updated
        })
    }

    const getTotalAmount = () => {
        return orderLines.reduce((sum, line) => sum + (line.netPrice || 0), 0)
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    const handleCancel = () => {
        onClose()
    }

    const statusOptions = [
        { value: 0, label: 'Pending' },
        { value: 1, label: 'In Progress' },
        { value: 2, label: 'Completed' },
        { value: 3, label: 'Cancelled' },
        { value: 4, label: 'Refunded' }
    ]

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {order ? 'Edit Order' : 'Create New Order'}
                </h2>
                <button
                    onClick={handleCancel}
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

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">
                            Customer
                        </label>
                        <select
                            id="customerId"
                            name="customerId"
                            value={formData.customerId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        >
                            <option value="">Select a customer</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name} ({customer.emailAddress})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="commissionId" className="block text-sm font-medium text-gray-700 mb-2">
                            Commission
                        </label>
                        <select
                            id="commissionId"
                            name="commissionId"
                            value={formData.commissionId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        >
                            <option value="">Select a commission</option>
                            {commissions.map(commission => (
                                <option key={commission.id} value={commission.id}>
                                    {commission.name} - ${commission.price}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700 mb-2">
                            Order Date *
                        </label>
                        <input
                            type="datetime-local"
                            id="orderDate"
                            name="orderDate"
                            value={formData.orderDate}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        />
                    </div>

                    <div>
                        <label htmlFor="dateStarted" className="block text-sm font-medium text-gray-700 mb-2">
                            Date Started
                        </label>
                        <input
                            type="datetime-local"
                            id="dateStarted"
                            name="dateStarted"
                            value={formData.dateStarted}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        />
                    </div>

                    <div>
                        <label htmlFor="dateDue" className="block text-sm font-medium text-gray-700 mb-2">
                            Date Due
                        </label>
                        <input
                            type="datetime-local"
                            id="dateDue"
                            name="dateDue"
                            value={formData.dateDue}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="discountsAndUpcharges" className="block text-sm font-medium text-gray-700 mb-2">
                            Discounts & Upcharges
                        </label>
                        <input
                            type="text"
                            id="discountsAndUpcharges"
                            name="discountsAndUpcharges"
                            value={formData.discountsAndUpcharges}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                            placeholder="Enter discount/upcharge details"
                        />
                    </div>

                    <div className="flex items-center space-x-6 pt-6">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="paid"
                                name="paid"
                                checked={formData.paid}
                                onChange={(e) => setFormData(prev => ({ ...prev, paid: e.target.checked }))}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="paid" className="ml-2 block text-sm text-gray-900">
                                Paid
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="posted"
                                name="posted"
                                checked={formData.posted}
                                onChange={(e) => setFormData(prev => ({ ...prev, posted: e.target.checked }))}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="posted" className="ml-2 block text-sm text-gray-900">
                                Posted
                            </label>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
                            Details
                        </label>
                        <textarea
                            id="details"
                            name="details"
                            value={formData.details}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                            placeholder="Order details..."
                        />
                    </div>

                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                            placeholder="Order notes..."
                        />
                    </div>
                </div>

                {/* Order Lines Section */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
                    
                    {/* Add New Order Line */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Add Item</h4>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                            <div className="md:col-span-2">
                                <select
                                    value={newOrderLine.productId}
                                    onChange={handleNewOrderLineChange}
                                    name="productId"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                    <option value="">Select product</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} - {formatPrice(product.price)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <input
                                    type="number"
                                    placeholder="Qty"
                                    min="1"
                                    value={newOrderLine.quantity}
                                    onChange={handleNewOrderLineChange}
                                    name="quantity"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    placeholder="Unit Price"
                                    min="0"
                                    step="0.01"
                                    value={newOrderLine.unitPrice}
                                    onChange={handleNewOrderLineChange}
                                    name="unitPrice"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    placeholder="Discount"
                                    min="0"
                                    step="0.01"
                                    value={newOrderLine.discountAmount}
                                    onChange={handleNewOrderLineChange}
                                    name="discountAmount"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <button
                                    type="button"
                                    onClick={addOrderLine}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors duration-150 text-sm"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Order Lines List */}
                    {orderLines.length > 0 && (
                        <div className="space-y-3">
                            {orderLines.map((line, index) => (
                                <div key={line.id || index} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                                <div className="md:col-span-2">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {line.product?.name || 'Unknown Product'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {line.product?.artist?.name || 'Unknown Artist'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={line.quantity}
                                                        onChange={(e) => updateOrderLine(index, 'quantity', parseInt(e.target.value))}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={line.unitPrice}
                                                        onChange={(e) => updateOrderLine(index, 'unitPrice', parseFloat(e.target.value))}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                    />
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatPrice(line.netPrice || 0)}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeOrderLine(index)}
                                            className="ml-3 text-red-600 hover:text-red-900"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="border-t pt-3">
                                <div className="flex justify-between text-lg font-semibold text-gray-900">
                                    <span>Total Amount:</span>
                                    <span>{formatPrice(getTotalAmount())}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && (
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? 'Saving...' : (order ? 'Update Order' : 'Create Order')}
                    </button>
                </div>
            </form>
        </div>
    )
}