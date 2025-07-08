'use client'

import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export function ProductForm({ product, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        artistId: '',
        baseId: '',
        adId: '',
        price: '',
        isAvailable: true
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [artists, setArtists] = useState([])
    const [bases, setBases] = useState([])
    const [images, setImages] = useState([])

    useEffect(() => {
        fetchDropdownData()
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                artistId: product.artistId || '',
                baseId: product.baseId || '',
                adId: product.adId || '',
                price: product.price || '',
                isAvailable: product.isAvailable !== undefined ? product.isAvailable : true
            })
        }
    }, [product])

    const fetchDropdownData = async () => {
        try {
            const [artistsData, basesData] = await Promise.all([
                api.artists.getAll(),
                api.artistBases.getAll()
            ])

            setArtists(artistsData)
            setBases(basesData)
        } catch (err) {
            console.error('Error fetching dropdown data:', err)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!formData.name.trim()) {
            setError('Product name is required')
            return
        }

        if (!formData.artistId) {
            setError('Artist is required')
            return
        }

        if (!formData.adId) {
            setError('Ad image is required')
            return
        }

        if (!formData.price || formData.price <= 0) {
            setError('Valid price is required')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                artistId: parseInt(formData.artistId),
                baseId: formData.baseId ? parseInt(formData.baseId) : null,
                adId: parseInt(formData.adId)
            }

            const url = product 
                ? `${process.env.NEXT_PUBLIC_API_URL}products/${product.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}products`

            const method = product ? 'PUT' : 'POST'

            if (product) {
                payload.id = product.id
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorData = await response.text()
                throw new Error(errorData || 'Failed to save product')
            }

            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleCancel = () => {
        onClose()
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {product ? 'Edit Product' : 'Add New Product'}
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
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        placeholder="Enter product name"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        placeholder="Enter product description"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="artistId" className="block text-sm font-medium text-gray-700 mb-2">
                            Artist *
                        </label>
                        <select
                            id="artistId"
                            name="artistId"
                            value={formData.artistId}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        >
                            <option value="">Select an artist</option>
                            {artists.map(artist => (
                                <option key={artist.id} value={artist.id}>
                                    {artist.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="baseId" className="block text-sm font-medium text-gray-700 mb-2">
                            Base (Optional)
                        </label>
                        <select
                            id="baseId"
                            name="baseId"
                            value={formData.baseId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        >
                            <option value="">Select a base</option>
                            {bases.map(base => (
                                <option key={base.id} value={base.id}>
                                    {base.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="adId" className="block text-sm font-medium text-gray-700 mb-2">
                            Ad Image *
                        </label>
                        <select
                            id="adId"
                            name="adId"
                            value={formData.adId}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        >
                            <option value="">Select an image</option>
                            {images.map(image => (
                                <option key={image.id} value={image.id}>
                                    {image.s3Key || `Image ${image.id}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                            Price *
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="isAvailable"
                            checked={formData.isAvailable}
                            onChange={handleChange}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Product is available</span>
                    </label>
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
                        {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
                    </button>
                </div>
            </form>
        </div>
    )
}