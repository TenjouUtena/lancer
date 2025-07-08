'use client'

import { useState, useEffect } from 'react';
import { api } from '../utils/api.js';

export default function CommissionsPage() {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNew, setShowNew] = useState(false);
    const [editingCommission, setEditingCommission] = useState(null);

    const fetchCommissions = async () => {
        try {
            setLoading(true);
            const data = await api.commissions.getAll();
            setCommissions(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, []);

    const handleDelete = async (commissionId) => {
        if (!confirm('Are you sure you want to delete this commission?')) return;
        
        try {
            await api.commissions.delete(commissionId);
            fetchCommissions();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCloseModals = () => {
        setShowNew(false);
        setEditingCommission(null);
        fetchCommissions();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
                    <p className="text-sm text-gray-500">Manage your commission types and pricing</p>
                </div>
                <button
                    onClick={() => setShowNew(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Commission
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}

            {/* Commissions Grid */}
            {commissions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No commissions</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating your first commission type.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {commissions.map((commission) => (
                        <div key={commission.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            {/* Image */}
                            <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                {commission.advertImageUrl ? (
                                    <img
                                        src={commission.advertImageUrl}
                                        alt={commission.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-gray-400">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-medium text-gray-900 truncate">{commission.name}</h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{commission.description}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-lg font-semibold text-green-600">${commission.price.toFixed(2)}</span>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        {commission.type}
                                    </span>
                                </div>
                                
                                {commission.slots && (
                                    <div className="mt-2">
                                        <span className="text-xs text-gray-500">Slots: {commission.slots}</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-xs text-gray-500">ID: #{commission.id}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingCommission(commission)}
                                            className="text-blue-600 hover:text-blue-900 transition-colors duration-150 p-1"
                                            title="Edit Commission"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(commission.id)}
                                            className="text-red-600 hover:text-red-900 transition-colors duration-150 p-1"
                                            title="Delete Commission"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* New Commission Modal */}
            {showNew && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <CommissionForm onClose={handleCloseModals} />
                    </div>
                </div>
            )}

            {/* Edit Commission Modal */}
            {editingCommission && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <CommissionForm commission={editingCommission} onClose={handleCloseModals} />
                    </div>
                </div>
            )}
        </div>
    );
}

const CommissionForm = ({ commission, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        type: 0, // Digital
        slots: 1,
        baseCreatorId: '',
        artistBaseId: '',
        advertImageUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [artists, setArtists] = useState([]);
    const [artistBases, setArtistBases] = useState([]);

    const commissionTypes = [
        { value: 0, label: 'Digital' },
        { value: 1, label: 'Traditional' },
        { value: 2, label: 'Animation' },
        { value: 3, label: 'Reference' },
        { value: 4, label: 'Icon' },
        { value: 5, label: 'Custom' }
    ];

    useEffect(() => {
        // Fetch artists and artist bases for dropdowns
        const fetchData = async () => {
            try {
                const [artistsData, basesData] = await Promise.all([
                    api.artists.getAll(),
                    api.artistBases.getAll()
                ]);
                setArtists(artistsData);
                setArtistBases(basesData);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };

        fetchData();

        if (commission) {
            setFormData({
                name: commission.name || '',
                description: commission.description || '',
                price: commission.price || 0,
                type: commission.type || 0,
                slots: commission.slots || 1,
                baseCreatorId: commission.baseCreatorId || '',
                artistBaseId: commission.artistBaseId || '',
                advertImageUrl: commission.advertImageUrl || ''
            });
        }
    }, [commission]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'slots' || name === 'type' ? 
                (name === 'price' ? parseFloat(value) || 0 : parseInt(value) || 0) : 
                value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            setError('Name is required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const submitData = {
                ...formData,
                baseCreatorId: formData.baseCreatorId ? parseInt(formData.baseCreatorId) : null,
                artistBaseId: formData.artistBaseId ? parseInt(formData.artistBaseId) : null
            };

            if (commission) {
                await api.commissions.update(commission.id, submitData);
            } else {
                await api.commissions.create(submitData);
            }

            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {commission ? 'Edit Commission' : 'Add New Commission'}
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

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Commission Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                            placeholder="Enter commission name"
                        />
                    </div>

                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                            Type *
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        >
                            {commissionTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
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
                        placeholder="Enter commission description"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            min="0"
                            step="0.01"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label htmlFor="slots" className="block text-sm font-medium text-gray-700 mb-2">
                            Slots
                        </label>
                        <input
                            type="number"
                            id="slots"
                            name="slots"
                            value={formData.slots}
                            onChange={handleChange}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                            placeholder="1"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="baseCreatorId" className="block text-sm font-medium text-gray-700 mb-2">
                            Base Creator
                        </label>
                        <select
                            id="baseCreatorId"
                            name="baseCreatorId"
                            value={formData.baseCreatorId}
                            onChange={handleChange}
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
                        <label htmlFor="artistBaseId" className="block text-sm font-medium text-gray-700 mb-2">
                            Base Name
                        </label>
                        <select
                            id="artistBaseId"
                            name="artistBaseId"
                            value={formData.artistBaseId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        >
                            <option value="">Select a base</option>
                            {artistBases.map(base => (
                                <option key={base.id} value={base.id}>
                                    {base.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="advertImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                        Advertisement Image URL
                    </label>
                    <input
                        type="url"
                        id="advertImageUrl"
                        name="advertImageUrl"
                        value={formData.advertImageUrl}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
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
                        {loading ? (commission ? 'Updating...' : 'Creating...') : (commission ? 'Update Commission' : 'Create Commission')}
                    </button>
                </div>
            </form>
        </div>
    );
};