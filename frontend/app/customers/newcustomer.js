'use client'

import { useState } from "react"

export function NewCustomer({ onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        emailAddress: '',
        discordName: '',
        discordLink: '',
        furAffinityName: '',
        furAffinityLink: '',
        twitterName: '',
        twitterLink: '',
        instagramName: '',
        instagramLink: '',
        telegramName: '',
        telegramLink: '',
        otherPlatformName: '',
        otherPlatformLink: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            setError('Name is required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to create customer');
            }

            onClose(); // Close modal and refresh parent list
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Customer</h2>
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

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        placeholder="Enter customer name"
                    />
                </div>

                <div>
                    <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="emailAddress"
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                        placeholder="Enter email address"
                    />
                </div>

                {/* Platform Contact Details */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Contact Details</h3>
                    
                    {/* Discord */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="discordName" className="block text-sm font-medium text-gray-700 mb-2">
                                Discord Name
                            </label>
                            <input
                                type="text"
                                id="discordName"
                                name="discordName"
                                value={formData.discordName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                placeholder="Enter Discord username"
                            />
                        </div>
                        <div>
                            <label htmlFor="discordLink" className="block text-sm font-medium text-gray-700 mb-2">
                                Discord Link
                            </label>
                            <input
                                type="url"
                                id="discordLink"
                                name="discordLink"
                                value={formData.discordLink}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                placeholder="Enter Discord profile link"
                            />
                        </div>
                    </div>

                    {/* FurAffinity */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="furAffinityName" className="block text-sm font-medium text-gray-700 mb-2">
                                FurAffinity Name
                            </label>
                            <input
                                type="text"
                                id="furAffinityName"
                                name="furAffinityName"
                                value={formData.furAffinityName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                placeholder="Enter FurAffinity username"
                            />
                        </div>
                        <div>
                            <label htmlFor="furAffinityLink" className="block text-sm font-medium text-gray-700 mb-2">
                                FurAffinity Link
                            </label>
                            <input
                                type="url"
                                id="furAffinityLink"
                                name="furAffinityLink"
                                value={formData.furAffinityLink}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                placeholder="Enter FurAffinity profile link"
                            />
                        </div>
                    </div>

                    {/* Twitter */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="twitterName" className="block text-sm font-medium text-gray-700 mb-2">
                                Twitter Name
                            </label>
                            <input
                                type="text"
                                id="twitterName"
                                name="twitterName"
                                value={formData.twitterName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                placeholder="Enter Twitter username"
                            />
                        </div>
                        <div>
                            <label htmlFor="twitterLink" className="block text-sm font-medium text-gray-700 mb-2">
                                Twitter Link
                            </label>
                            <input
                                type="url"
                                id="twitterLink"
                                name="twitterLink"
                                value={formData.twitterLink}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                placeholder="Enter Twitter profile link"
                            />
                        </div>
                    </div>

                    {/* Instagram */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="instagramName" className="block text-sm font-medium text-gray-700 mb-2">
                                Instagram Name
                            </label>
                            <input
                                type="text"
                                id="instagramName"
                                name="instagramName"
                                value={formData.instagramName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                placeholder="Enter Instagram username"
                            />
                        </div>
                        <div>
                            <label htmlFor="instagramLink" className="block text-sm font-medium text-gray-700 mb-2">
                                Instagram Link
                            </label>
                            <input
                                type="url"
                                id="instagramLink"
                                name="instagramLink"
                                value={formData.instagramLink}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                placeholder="Enter Instagram profile link"
                            />
                        </div>
                    </div>

                    {/* Telegram */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="telegramName" className="block text-sm font-medium text-gray-700 mb-2">
                                Telegram Name
                            </label>
                            <input
                                type="text"
                                id="telegramName"
                                name="telegramName"
                                value={formData.telegramName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                placeholder="Enter Telegram username"
                            />
                        </div>
                        <div>
                            <label htmlFor="telegramLink" className="block text-sm font-medium text-gray-700 mb-2">
                                Telegram Link
                            </label>
                            <input
                                type="url"
                                id="telegramLink"
                                name="telegramLink"
                                value={formData.telegramLink}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                placeholder="Enter Telegram profile link"
                            />
                        </div>
                    </div>

                    {/* Other Platform */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="otherPlatformName" className="block text-sm font-medium text-gray-700 mb-2">
                                Other Platform Name
                            </label>
                            <input
                                type="text"
                                id="otherPlatformName"
                                name="otherPlatformName"
                                value={formData.otherPlatformName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                placeholder="Enter other platform name"
                            />
                        </div>
                        <div>
                            <label htmlFor="otherPlatformLink" className="block text-sm font-medium text-gray-700 mb-2">
                                Other Platform Link
                            </label>
                            <input
                                type="url"
                                id="otherPlatformLink"
                                name="otherPlatformLink"
                                value={formData.otherPlatformLink}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                placeholder="Enter other platform profile link"
                            />
                        </div>
                    </div>
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
                        {loading ? 'Creating...' : 'Create Customer'}
                    </button>
                </div>
            </form>
        </div>
    );
}
