import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';

const SellerRevenue = () => {
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveredOrders();
  }, []);

  const fetchDeliveredOrders = async () => {
    try {
      const seller = JSON.parse(localStorage.getItem('seller'));
      const response = await fetch(`${API_URL}/orders/seller?sellerEmail=${encodeURIComponent(seller?.email || '')}`);
      if (response.ok) {
        const allOrders = await response.json();
        const delivered = allOrders.filter(order => order.status === 'DELIVERED');
        setDeliveredOrders(delivered);
        
        const total = delivered.reduce((sum, order) => sum + parseFloat(order.total), 0);
        setTotalRevenue(total);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sellerToken');
    localStorage.removeItem('seller');
    window.location.href = '/';
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <nav className="backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => window.location.href = '/seller'} className="text-green-600 hover:text-green-800">
              <svg className="w-6 h-6" viewBox="0 0 64 64" fill="none">
                <path d="M40 16L24 32l16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
              </svg>
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Revenue Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Revenue Summary Card */}
        <div className="backdrop-blur-2xl bg-white/60 rounded-3xl border-2 border-white/60 shadow-2xl p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-900 mb-4">Total Revenue</h2>
            <div className="text-5xl font-bold text-green-600 mb-2">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-green-700">From {deliveredOrders.length} delivered orders</p>
          </div>
        </div>

        {/* Delivered Orders Table */}
        <div className="backdrop-blur-2xl bg-white/60 rounded-3xl border-2 border-white/60 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/60">
            <h3 className="text-2xl font-bold text-green-900">Delivered Orders</h3>
          </div>
          
          {deliveredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No delivered orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Order ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Customer</th>
                    <th className="px-6 py-4 text-left font-semibold">Products</th>
                    <th className="px-6 py-4 text-left font-semibold">Amount</th>
                    <th className="px-6 py-4 text-left font-semibold">Payment Method</th>
                    <th className="px-6 py-4 text-left font-semibold">Delivered Date</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveredOrders.map((order, index) => (
                    <tr key={order.id} className={`${index % 2 === 0 ? 'bg-white/50' : 'bg-white/30'} hover:bg-white/70 transition-colors`}>
                      <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4 text-gray-900">{order.user?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-900">
                        {order.orderItems && order.orderItems.length > 0 
                          ? order.orderItems.map(item => item.product?.name).join(', ')
                          : 'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 text-green-600 font-bold">₹{order.total}</td>
                      <td className="px-6 py-4 text-gray-900">{order.paymentMethod || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerRevenue;