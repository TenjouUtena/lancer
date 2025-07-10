'use client'

import { useState, useEffect, useCallback } from 'react';
import { api } from '../../utils/api';

export default function ArtistBaseSearch() {
    const [artistBases, setArtistBases] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Search filters
    const [searchFilters, setSearchFilters] = useState({
        name: '',
        selectedTags: [],
        minPrice: '',
        maxPrice: ''
    });

    // Fetch available tags on component mount
    useEffect(() => {
        fetchTags();
        // Perform initial search with no filters
        performSearch({});
    }, []);

    const fetchTags = async () => {
        try {
            const tags = await api.tags.getAll();
            setAvailableTags(tags);
        } catch (err) {
            console.error('Failed to fetch tags:', err);
        }
    };

    const performSearch = useCallback(async (filters = searchFilters) => {
        try {
            setLoading(true);
            setError(null);
            
            const searchParams = {
                name: filters.name || undefined,
                tags: filters.selectedTags || [],
                minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
                maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined
            };

            const results = await api.artistBases.search(searchParams);
            setArtistBases(results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [searchFilters]);

    // Debounced search for name input
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            performSearch();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchFilters.name, performSearch]);

    // Immediate search for other filters
    useEffect(() => {
        performSearch();
    }, [searchFilters.selectedTags, searchFilters.minPrice, searchFilters.maxPrice, performSearch]);

    const handleNameChange = (e) => {
        setSearchFilters(prev => ({
            ...prev,
            name: e.target.value
        }));
    };

    const handleTagToggle = (tagId) => {
        setSearchFilters(prev => ({
            ...prev,
            selectedTags: prev.selectedTags.includes(tagId)
                ? prev.selectedTags.filter(id => id !== tagId)
                : [...prev.selectedTags, tagId]
        }));
    };

    const handlePriceChange = (field, value) => {
        setSearchFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const clearFilters = () => {
        setSearchFilters({
            name: '',
            selectedTags: [],
            minPrice: '',
            maxPrice: ''
        });
    };

    const hasActiveFilters = searchFilters.name || 
                           searchFilters.selectedTags.length > 0 || 
                           searchFilters.minPrice || 
                           searchFilters.maxPrice;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Search Artist Bases</h1>
                            <p className="text-gray-600 mt-2">Find artist bases using tags, name, and price filters</p>
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Filters</h2>
                    
                    <div className="space-y-6">
                        {/* Name Search */}
                        <div>
                            <label htmlFor="name-search" className="block text-sm font-medium text-gray-700 mb-2">
                                Search by Name
                            </label>
                            <input
                                type="text"
                                id="name-search"
                                value={searchFilters.name}
                                onChange={handleNameChange}
                                placeholder="Enter artist base name..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                            />
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price Range
                            </label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        value={searchFilters.minPrice}
                                        onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                                        placeholder="Min price"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                    />
                                </div>
                                <div className="flex items-center text-gray-500">to</div>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        value={searchFilters.maxPrice}
                                        onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                                        placeholder="Max price"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Tags
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {availableTags.map((tag) => (
                                    <button
                                        key={tag.id}
                                        onClick={() => handleTagToggle(tag.id)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-150 ${
                                            searchFilters.selectedTags.includes(tag.id)
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                            {availableTags.length === 0 && (
                                <p className="text-gray-500 text-sm">No tags available</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                {/* Results */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Search Results ({artistBases.length})
                            </h2>
                            {loading && (
                                <div className="flex items-center text-gray-500">
                                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Searching...
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {artistBases.length === 0 && !loading ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No artist bases found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {hasActiveFilters 
                                    ? 'Try adjusting your search filters to find more results.'
                                    : 'No artist bases are available yet.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {artistBases.map((base) => (
                                    <div key={base.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                                        {/* Image */}
                                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                            {base.url ? (
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
                                            <h4 className="font-medium text-gray-900 truncate mb-1">{base.name}</h4>
                                            <p className="text-lg font-semibold text-green-600 mb-2">
                                                ${base.price.toFixed(2)}
                                            </p>
                                            
                                            {/* Tags */}
                                            {base.tags && base.tags.length > 0 && (
                                                <div className="mb-3">
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
                                            
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">ID: #{base.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
