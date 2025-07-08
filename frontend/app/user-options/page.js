'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import { api } from '../utils/api';

// Custom hook or function to download the export
async function downloadExport() {
  try {
    const blob = await api.export.download();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_data.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading export:', error);
    throw error;
  }
}

export default function UserOptions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      await downloadExport();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">User Options</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Data Export</h2>
          <p className="mb-4">
            Export all your data to an Excel file. This includes your artists, customers, products, orders, and more.
          </p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <button
            onClick={handleExport}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Exporting...' : 'Export Data to Excel'}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
