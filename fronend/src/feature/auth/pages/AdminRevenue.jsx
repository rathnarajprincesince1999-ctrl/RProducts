import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';

const AdminRevenue = () => {
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueByseller, setRevenueByseller] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllDeliveredOrders();
  }, []);

  const fetchAllDeliveredOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/admin/revenue`);
      if (response.ok) {
        const data = await response.json();
        setDeliveredOrders(data.deliveredOrders);
        setTotalRevenue(data.totalRevenue);
        setRevenueByseller(data.sellerRevenue);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    window.location.href = '/';
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      <nav className="backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => window.location.href = '/admin'} className="text-yellow-600 hover:text-yellow-800">
              <svg className="w-6 h-6" viewBox="0 0 64 64" fill="none">
                <path d="M40 16L24 32l16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
              </svg>
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
              Platform Revenue
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
        {/* Total Revenue Summary */}
        <div className="backdrop-blur-2xl bg-white/60 rounded-3xl border-2 border-white/60 shadow-2xl p-8 mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-yellow-900 mb-4">Total Platform Revenue</h2>
            <div className="text-6xl font-bold text-yellow-600 mb-2">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-yellow-700">From {deliveredOrders.length} delivered orders across all sellers</p>
          </div>
        </div>

        {/* Revenue by Seller */}
        <div className="backdrop-blur-2xl bg-white/60 rounded-3xl border-2 border-white/60 shadow-2xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-yellow-900 mb-6">Revenue by Seller</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(revenueByseller).map(([sellerKey, data]) => (
              <div key={sellerKey} className="bg-white/50 rounded-xl p-4 border border-white/60">
                <h4 className="font-bold text-gray-900 mb-2">{data.sellerName}</h4>
                <p className="text-2xl font-bold text-yellow-600">₹{data.revenue.toFixed(2)}</p>
                <p className="text-sm text-gray-600">{data.orders} delivered orders</p>
              </div>
            ))}
          </div>
        </div>

        {/* All Delivered Orders */}
        <div className="backdrop-blur-2xl bg-white/60 rounded-3xl border-2 border-white/60 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/60">
            <h3 className="text-2xl font-bold text-yellow-900">All Delivered Orders</h3>
          </div>
          
          {deliveredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No delivered orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Order ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Seller</th>
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
                      <td className="px-6 py-4 text-gray-900">{order.seller?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-900">{order.user?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-900">
                        {order.orderItems && order.orderItems.length > 0 
                          ? order.orderItems.map(item => item.product?.name).join(', ')
                          : 'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 text-yellow-600 font-bold">₹{order.total}</td>
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

export default AdminRevenue;