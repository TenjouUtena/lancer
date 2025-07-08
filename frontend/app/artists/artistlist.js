'use client'

import { useEffect, useState } from 'react';
import { api } from '../utils/api' 

export const ArtistList = ({ onEdit, onDelete }) => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchArtists = async () => {
        try {
            setLoading(true);
            const data = await api.artists.getTop5();
            setArtists(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArtists();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            </div>
        );
    }

    if (artists.length === 0) {
        return (
            <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No artists found</h3>
                <p className="mt-1 text-sm text-gray-500">No artists available in the top 5 list.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {artists.map((artist) => (
                <div 
                    key={artist.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-150"
                >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                        {/* Drag Handle */}
                        <div className="flex-shrink-0 text-gray-400 cursor-move" title="Drag to reorder">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </div>

                        {/* Artist Info */}
                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {artist.name}
                                </p>
                                <p className="text-xs text-gray-500">ID: #{artist.id}</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm text-gray-600 truncate">
                                    <span className="font-medium">FA:</span> {artist.faname || '-'}
                                </p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm text-gray-600 truncate">
                                    <span className="font-medium">Platform:</span> {artist.platform || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {(onEdit || onDelete) && (
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(artist)}
                                    className="text-blue-600 hover:text-blue-900 transition-colors duration-150 p-1"
                                    title="Edit Artist"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(artist.id)}
                                    className="text-red-600 hover:text-red-900 transition-colors duration-150 p-1"
                                    title="Delete Artist"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
