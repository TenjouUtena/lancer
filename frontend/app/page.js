
'use client'

import { useState, useEffect } from 'react';
import { api } from './utils/api';

export default function Home() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.orders.getTop5();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error loading orders: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        {orders.length > 0 ? (
          <div className="space-y-2">
            {orders.map(order => (
              <div key={order.id} className="flex justify-between items-center p-3 border rounded">
                <span>Order #{order.id}</span>
                <span>{order.customer?.name || 'Unknown Customer'}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No orders found</p>
        )}
      </div>
    </div>
  );
}
