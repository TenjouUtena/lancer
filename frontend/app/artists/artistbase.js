'use client'

import { useState, useEffect } from 'react';
import { api } from '../utils/api.js'


export const ArtistBaseManager = ({ artistId, onClose }) => {
    const [artistBases, setArtistBases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNew, setShowNew] = useState(false);
    const [editingBase, setEditingBase] = useState(null);

    const fetchArtistBases = async () => {
        try {
            setLoading(true);
            const data = await api.artistBases.getAll();
            setArtistBases(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArtistBases();
    }, []);

    const handleDelete = async (baseId) => {
        if (!confirm('Are you sure you want to delete this artist base?')) return;
        
        try {
            await api.artistBases.delete(baseId);
            fetchArtistBases();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCloseModals = () => {
        setShowNew(false);
        setEditingBase(null);
        fetchArtistBases();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Artist Bases</h3>
                    <p className="text-sm text-gray-500">Manage artist base images and pricing</p>
                </div>
                <button
                    onClick={() => setShowNew(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Base
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

            {/* Artist Bases Grid */}
            {artistBases.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No artist bases</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first artist base.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {artistBases.map((base) => (
                        <div key={base.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            {/* Image */}
                            <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                {base.url && base.url.startsWith('/uploads/') ? (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL.replace('/api/', '')}${base.url}`}
                                        alt={base.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : base.url ? (
                                    <img
                                        src={base.url}
                                        alt={base.name}
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
                                <h4 className="font-medium text-gray-900 truncate">{base.name}</h4>
                                <p className="text-lg font-semibold text-green-600 mt-1">
                                    ${base.price.toFixed(2)}
                                </p>
                                
                                {/* Tags */}
                                {base.tags && base.tags.length > 0 && (
                                    <div className="mt-2">
                                        <div className="flex flex-wrap gap-1">
                                            {base.tags.map((tag) => (
                                                <span
                                                    key={tag.id}
                                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                                >
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-xs text-gray-500">ID: #{base.id}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingBase(base)}
                                            className="text-blue-600 hover:text-blue-900 transition-colors duration-150 p-1"
                                            title="Edit Base"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(base.id)}
                                            className="text-red-600 hover:text-red-900 transition-colors duration-150 p-1"
                                            title="Delete Base"
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

            {/* New Artist Base Modal */}
            {showNew && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <ArtistBaseForm onClose={handleCloseModals} />
                    </div>
                </div>
            )}

            {/* Edit Artist Base Modal */}
            {editingBase && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <ArtistBaseForm artistBase={editingBase} onClose={handleCloseModals} />
                    </div>
                </div>
            )}
        </div>
    );
};

export const ArtistBaseForm = ({ artistBase, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        price: 0,
        originalPsdUrl: '',
        modifiedPsdUrl: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [originalPsdFile, setOriginalPsdFile] = useState(null);
    const [modifiedPsdFile, setModifiedPsdFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [newTagName, setNewTagName] = useState('');
    const [showNewTagForm, setShowNewTagForm] = useState(false);

    // Fetch available tags
    const fetchTags = async () => {
        try {
            const tags = await api.tags.getAll();
            setAvailableTags(tags);
        } catch (err) {
            console.error('Failed to fetch tags:', err);
        }
    };

    useEffect(() => {
        fetchTags();
        
        if (artistBase) {
            setFormData({
                name: artistBase.name || '',
                url: artistBase.url || '',
                price: artistBase.price || 0,
                originalPsdUrl: artistBase.originalPsdUrl || '',
                modifiedPsdUrl: artistBase.modifiedPsdUrl || ''
            });
            if (artistBase.url) {
                if (artistBase.url.startsWith('/uploads/')) {
                    setImagePreview(`${process.env.NEXT_PUBLIC_API_URL.replace('/api/', '')}${artistBase.url}`);
                } else {
                    setImagePreview(artistBase.url);
                }
            }
            // Set selected tags if editing
            if (artistBase.tags) {
                setSelectedTags(artistBase.tags.map(tag => tag.id));
            }
        }
    }, [artistBase]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) || 0 : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
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
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('url', formData.url);
            formDataToSend.append('price', formData.price.toString());
            formDataToSend.append('originalPsdUrl', formData.originalPsdUrl);
            formDataToSend.append('modifiedPsdUrl', formData.modifiedPsdUrl);
            
            // Add selected tags
            selectedTags.forEach(tagId => {
                formDataToSend.append('tagIds', tagId.toString());
            });
            
            // Add files
            if (imageFile) {
                formDataToSend.append('imageFile', imageFile);
            }
            
            if (originalPsdFile) {
                formDataToSend.append('originalPsdFile', originalPsdFile);
            }
            
            if (modifiedPsdFile) {
                formDataToSend.append('modifiedPsdFile', modifiedPsdFile);
            }

            if (artistBase) {
                await api.artistBases.updateWithImage(artistBase.id, formDataToSend);
            } else {
                await api.artistBases.createWithImage(formDataToSend);
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
                    {artistBase ? 'Edit Artist Base' : 'Add New Artist Base'}
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
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Base Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        placeholder="Enter base name"
                    />
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
                        min="0"
                        step="0.01"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Image
                    </label>
                    <input
                        type="file"
                        id="imageFile"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Supported formats: JPG, PNG, GIF, WebP. Max size: 10MB
                    </p>
                </div>

                <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                        Or External URL
                    </label>
                    <input
                        type="url"
                        id="url"
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>

                {/* PSD File Upload Section */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">PSD Files</h4>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="originalPsdFile" className="block text-sm font-medium text-gray-700 mb-2">
                                Original PSD File
                            </label>
                            <input
                                type="file"
                                id="originalPsdFile"
                                accept=".psd"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    setOriginalPsdFile(file);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                            />
                            {originalPsdFile && (
                                <div className="mt-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>{originalPsdFile.name}</span>
                                        <span className="text-gray-500">({(originalPsdFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                    </div>
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Upload your original PSD file. Max size: 100MB
                            </p>
                        </div>
                        
                        <div>
                            <label htmlFor="modifiedPsdFile" className="block text-sm font-medium text-gray-700 mb-2">
                                Modified PSD File
                            </label>
                            <input
                                type="file"
                                id="modifiedPsdFile"
                                accept=".psd"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    setModifiedPsdFile(file);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                            />
                            {modifiedPsdFile && (
                                <div className="mt-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>{modifiedPsdFile.name}</span>
                                        <span className="text-gray-500">({(modifiedPsdFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                    </div>
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Upload your modified PSD file. Max size: 100MB
                            </p>
                        </div>

                        {/* Fallback URL inputs for backward compatibility */}
                        <div className="border-t pt-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-3">Or use URLs (legacy)</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="originalPsdUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                        Original PSD URL
                                    </label>
                                    <input
                                        type="url"
                                        id="originalPsdUrl"
                                        name="originalPsdUrl"
                                        value={formData.originalPsdUrl}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                        placeholder="https://example.com/original.psd"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="modifiedPsdUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                        Modified PSD URL
                                    </label>
                                    <input
                                        type="url"
                                        id="modifiedPsdUrl"
                                        name="modifiedPsdUrl"
                                        value={formData.modifiedPsdUrl}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                        placeholder="https://example.com/modified.psd"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tags Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                    </label>
                    <div className="space-y-3">
                        {/* Available Tags */}
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => {
                                        if (selectedTags.includes(tag.id)) {
                                            setSelectedTags(selectedTags.filter(id => id !== tag.id));
                                        } else {
                                            setSelectedTags([...selectedTags, tag.id]);
                                        }
                                    }}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-150 ${
                                        selectedTags.includes(tag.id)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>

                        {/* Add New Tag */}
                        <div className="border-t pt-3">
                            {!showNewTagForm ? (
                                <button
                                    type="button"
                                    onClick={() => setShowNewTagForm(true)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add New Tag
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newTagName}
                                        onChange={(e) => setNewTagName(e.target.value)}
                                        placeholder="Enter tag name"
                                        className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (newTagName.trim()) {
                                                try {
                                                    const newTag = await api.tags.create({ name: newTagName.trim() });
                                                    setAvailableTags([...availableTags, newTag]);
                                                    setSelectedTags([...selectedTags, newTag.id]);
                                                    setNewTagName('');
                                                    setShowNewTagForm(false);
                                                } catch (err) {
                                                    setError(err.message || 'Failed to create tag');
                                                }
                                            }
                                        }}
                                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowNewTagForm(false);
                                            setNewTagName('');
                                        }}
                                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                        <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                )}

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
                        {loading ? (artistBase ? 'Updating...' : 'Creating...') : (artistBase ? 'Update Base' : 'Create Base')}
                    </button>
                </div>
            </form>
        </div>
    );
};
