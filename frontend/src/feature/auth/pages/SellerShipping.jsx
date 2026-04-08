import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import { useToast } from '../../../context/ToastContext';
import { useButtonLoading } from '../../../hooks/useButtonLoading';

const SellerShipping = () => {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [packageDetails, setPackageDetails] = useState({
    weight: '',
    length: '',
    breadth: '',
    height: ''
  });
  const { showToast } = useToast();
  const { isLoading, withLoading } = useButtonLoading();

  const seller = JSON.parse(localStorage.getItem('seller') || '{}');
  const token = localStorage.getItem('sellerToken');

  useEffect(() => {
    if (!token) {
      window.location.href = '/';
      return;
    }
    fetchOrders();
  }, [token]);

  const fetchOrders = withLoading('fetchOrders', async () => {
    try {
      const response = await fetch(`${API_URL}/orders/seller?sellerEmail=${encodeURIComponent(seller.email)}`);
      if (response.ok) {
        const data = await response.json();
        // Filter orders that are admin approved and ready for shipping but not shipped
        const shippableOrders = data.filter(order => 
          order.adminApproved && 
          order.status === 'APPROVED' && 
          !order.shippedAt
        );
        setOrders(shippableOrders);
      }
    } catch (error) {
      showToast('Error fetching orders', 'error');
    }
  });

  const handleShipOrder = (order) => {
    setSelectedOrder(order);
    setPackageDetails({
      weight: '',
      length: '',
      breadth: '',
      height: ''
    });
    setShowModal(true);
  };

  const submitShipping = withLoading('submitShipping', async () => {
    const { weight, length, breadth, height } = packageDetails;
    if (!weight || !length || !breadth || !height) {
      showToast('Please fill all package details', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/orders/${selectedOrder.id}/ship`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          packageWeight: parseFloat(weight),
          packageLength: parseInt(length),
          packageBreadth: parseInt(breadth),
          packageHeight: parseInt(height)
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showToast(result.message, 'success');
          if (result.shiprocket && result.shiprocket.awb_code) {
            showToast(`AWB Code: ${result.shiprocket.awb_code}`, 'info');
          }
        } else {
          showToast(result.message || 'Failed to ship order', 'error');
        }
        setShowModal(false);
        fetchOrders();
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to ship order', 'error');
      }
    } catch (error) {
      showToast('Error shipping order', 'error');
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <nav className="backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Shipping Management
          </h1>
          <button 
            onClick={() => window.location.href = '/seller/home'}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="backdrop-blur-2xl bg-white/60 p-8 rounded-3xl border-2 border-white/60 shadow-2xl">
          <h2 className="text-2xl font-bold text-indigo-900 mb-6">Orders Ready for Shipping</h2>
          
          {isLoading('fetchOrders') ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No orders ready for shipping</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Order #{order.id}</h3>
                      <p className="text-gray-600 mb-1">Customer: {order.user?.name || order.user?.email}</p>
                      <p className="text-gray-600 mb-1">Total: ₹{order.total}</p>
                      <p className="text-gray-600 mb-1">Status: {order.status}</p>
                      <p className="text-sm text-green-600">✓ Admin Approved</p>
                      
                      {order.shippingAddress && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-800 mb-1">Delivery Address:</p>
                          <p className="text-sm text-blue-700">
                            {order.shippingAddress}, {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
                          </p>
                          {order.shippingLandmark && (
                            <p className="text-sm text-blue-700">Landmark: {order.shippingLandmark}</p>
                          )}
                          <p className="text-sm text-blue-700">Phone: {order.shippingPhone}</p>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleShipOrder(order)}
                      disabled={isLoading('submitShipping')}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ship Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-white/95 rounded-3xl border-2 border-white/60 shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-indigo-900 mb-4">Enter Package Details</h3>
              <p className="text-gray-600 mb-6">Order #{selectedOrder?.id}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={packageDetails.weight}
                    onChange={(e) => setPackageDetails({...packageDetails, weight: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Length (cm) *</label>
                  <input
                    type="number"
                    min="1"
                    value={packageDetails.length}
                    onChange={(e) => setPackageDetails({...packageDetails, length: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Breadth (cm) *</label>
                  <input
                    type="number"
                    min="1"
                    value={packageDetails.breadth}
                    onChange={(e) => setPackageDetails({...packageDetails, breadth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm) *</label>
                  <input
                    type="number"
                    min="1"
                    value={packageDetails.height}
                    onChange={(e) => setPackageDetails({...packageDetails, height: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isLoading('submitShipping')}
                  className="flex-1 py-2 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={submitShipping}
                  disabled={isLoading('submitShipping')}
                  className="flex-1 py-2 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading('submitShipping') ? 'Shipping...' : 'Ship Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerShipping;