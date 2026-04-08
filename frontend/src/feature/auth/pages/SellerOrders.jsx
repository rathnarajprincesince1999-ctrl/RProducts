import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import { useToast } from '../../../context/ToastContext';
import { useButtonLoading } from '../../../hooks/useButtonLoading';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [showShipModal, setShowShipModal] = useState(false);
  const [shippingOrder, setShippingOrder] = useState(null);
  const [packageDetails, setPackageDetails] = useState({
    packageWeight: 0.5,
    packageLength: 15,
    packageBreadth: 10,
    packageHeight: 8
  });
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { showToast } = useToast();
  const { isLoading, withLoading } = useButtonLoading();
  const token = localStorage.getItem('sellerToken');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const seller = JSON.parse(localStorage.getItem('seller'));
      const response = await fetch(`${API_URL}/orders/seller?sellerEmail=${encodeURIComponent(seller?.email || '')}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sellerToken');
    localStorage.removeItem('seller');
    window.location.href = '/';
  };

  const handleShipOrder = (order) => {
    setShippingOrder(order);
    setShowShipModal(true);
  };

  const submitShipping = withLoading('shipOrder', async () => {
    try {
      const response = await fetch(`${API_URL}/orders/${shippingOrder.id}/ship`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(packageDetails)
      });

      if (response.ok) {
        const result = await response.json();
        fetchOrders();
        setShowShipModal(false);
        setShippingOrder(null);
        setPackageDetails({ packageWeight: 0.5, packageLength: 15, packageBreadth: 10, packageHeight: 8 });
        showToast(result.message || 'Order shipped successfully via Shiprocket!', 'success');
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to ship order', 'error');
      }
    } catch (error) {
      showToast('Error shipping order', 'error');
    }
  });

  const handleRejectOrder = (order) => {
    setRejectingOrder(order);
    setShowRejectModal(true);
  };

  const submitRejection = withLoading('rejectOrder', async () => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/orders/${rejectingOrder.id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (response.ok) {
        fetchOrders();
        setShowRejectModal(false);
        setRejectingOrder(null);
        setRejectionReason('');
        showToast('Order rejected successfully', 'success');
      } else {
        showToast('Failed to reject order', 'error');
      }
    } catch (error) {
      showToast('Error rejecting order', 'error');
    }
  });

  const updateOrderStatus = withLoading('updateStatus', async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchOrders();
        showToast(`Order ${newStatus.toLowerCase()}`, 'success');
      } else {
        showToast('Failed to update order status', 'error');
      }
    } catch (error) {
      showToast('Error updating order status', 'error');
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
          {/* Mobile Layout */}
          <div className="flex md:hidden justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <button onClick={() => window.location.href = '/seller'} className="text-blue-600 hover:text-blue-800">
                <svg className="w-5 h-5" viewBox="0 0 64 64" fill="none">
                  <path d="M40 16L24 32l16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Orders
              </h1>
            </div>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-semibold"
            >
              Logout
            </button>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden md:flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => window.location.href = '/seller'} className="text-blue-600 hover:text-blue-800">
                <svg className="w-6 h-6" viewBox="0 0 64 64" fill="none">
                  <path d="M40 16L24 32l16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
                </svg>
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Orders
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
                <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button 
                onClick={handleLogout}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8 gap-4">
          <h2 className="text-2xl sm:text-4xl font-bold text-blue-900">Product Orders</h2>
          <div className="text-base sm:text-lg font-semibold text-blue-800">
            Total Orders: {orders.length}
          </div>
        </div>

        <div className="backdrop-blur-2xl bg-white/60 rounded-3xl border-2 border-white/60 shadow-2xl overflow-hidden">
          {/* Mobile Cards */}
          <div className="block lg:hidden">
            {orders.map((order, index) => (
              <div key={order.id} className="p-4 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm">#{order.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    order.status === 'DELIVERED' 
                      ? 'bg-green-100 text-green-800' 
                      : order.status === 'CANCELLED'
                      ? 'bg-red-100 text-red-800'
                      : order.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : order.status === 'SHIPPED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm mb-3">
                  <p><span className="font-medium">Product:</span> {order.orderItems && order.orderItems.length > 0 
                    ? order.orderItems.map(item => item.product?.name).join(', ')
                    : 'N/A'
                  }</p>
                  <p><span className="font-medium">Customer:</span> {order.user?.name || 'N/A'}</p>
                  <p><span className="font-medium">Quantity:</span> {order.orderItems && order.orderItems.length > 0 
                    ? order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
                    : 0
                  }</p>
                  <p><span className="font-medium">Amount:</span> ₹{order.total}</p>
                  <p><span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                {order.status === 'PENDING' && (
                  order.adminApproved ? (
                    <div className="text-center">
                      <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">✅ Ready for Shipping</span>
                      <p className="text-xs text-gray-500 mt-1">Go to Shipping page to ship this order</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-xs text-orange-600 font-medium">Waiting for Admin Approval</span>
                    </div>
                  )
                )}
                {order.status === 'APPROVED' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleShipOrder(order)}
                      disabled={isLoading('shipOrder')}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading('shipOrder') ? 'Shipping...' : 'Ship with Details'}
                    </button>
                    <button
                      onClick={() => handleRejectOrder(order)}
                      disabled={isLoading('shipOrder')}
                      className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {order.status === 'SHIPPED' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                    disabled={isLoading('updateStatus')}
                    className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading('updateStatus') ? 'Delivering...' : 'Mark Delivered'}
                  </button>
                )}
                {order.status === 'REJECTED' && order.rejectionReason && (
                  <div className="mt-2">
                    <span className="text-xs text-red-600">Reason: {order.rejectionReason}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto scrollbar-hide">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Order ID</th>
                  <th className="px-6 py-4 text-left font-semibold">Product</th>
                  <th className="px-6 py-4 text-left font-semibold">Customer</th>
                  <th className="px-6 py-4 text-left font-semibold">Quantity</th>
                  <th className="px-6 py-4 text-left font-semibold">Amount</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Date</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={order.id} className={`${index % 2 === 0 ? 'bg-white/50' : 'bg-white/30'} hover:bg-white/70 transition-colors`}>
                    <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 text-gray-900">
                      {order.orderItems && order.orderItems.length > 0 
                        ? order.orderItems.map(item => item.product?.name).join(', ')
                        : 'N/A'
                      }
                    </td>
                    <td className="px-6 py-4 text-gray-900">{order.user?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-900">
                      {order.orderItems && order.orderItems.length > 0 
                        ? order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
                        : 0
                      }
                    </td>
                    <td className="px-6 py-4 text-gray-900">₹{order.total}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'DELIVERED' 
                          ? 'bg-green-100 text-green-800' 
                          : order.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : order.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : order.status === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {order.status === 'PENDING' && (
                        order.adminApproved ? (
                          <div className="text-center">
                            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">✅ Ready for Shipping</span>
                            <p className="text-xs text-gray-500 mt-1">Go to Shipping page to ship this order</p>
                          </div>
                        ) : (
                          <span className="text-xs text-orange-600 font-medium">Waiting for Admin Approval</span>
                        )
                      )}
                      {order.status === 'APPROVED' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleShipOrder(order)}
                            disabled={isLoading('shipOrder')}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading('shipOrder') ? 'Shipping...' : 'Ship with Details'}
                          </button>
                          <button
                            onClick={() => handleRejectOrder(order)}
                            disabled={isLoading('shipOrder')}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {order.status === 'SHIPPED' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                          disabled={isLoading('updateStatus')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading('updateStatus') ? 'Delivering...' : 'Mark Delivered'}
                        </button>
                      )}
                      {(order.status === 'DELIVERED' || order.status === 'REJECTED' || order.status === 'CANCELLED') && (
                        <span className="text-sm text-gray-500">No actions available</span>
                      )}
                      {order.status === 'REJECTED' && order.rejectionReason && (
                        <div className="mt-1">
                          <span className="text-xs text-red-600">Reason: {order.rejectionReason}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No orders found for your products</p>
            </div>
          )}
        </div>
      </div>

      {/* Ship Order Modal */}
      {showShipModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="backdrop-blur-2xl bg-white/90 p-8 rounded-3xl border-2 border-white/60 shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Ship Order #{shippingOrder?.id}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Package Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={packageDetails.packageWeight}
                  onChange={(e) => setPackageDetails({...packageDetails, packageWeight: parseFloat(e.target.value) || 0.5})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Length (cm) *</label>
                  <input
                    type="number"
                    min="1"
                    value={packageDetails.packageLength}
                    onChange={(e) => setPackageDetails({...packageDetails, packageLength: parseInt(e.target.value) || 15})}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Width (cm) *</label>
                  <input
                    type="number"
                    min="1"
                    value={packageDetails.packageBreadth}
                    onChange={(e) => setPackageDetails({...packageDetails, packageBreadth: parseInt(e.target.value) || 10})}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm) *</label>
                  <input
                    type="number"
                    min="1"
                    value={packageDetails.packageHeight}
                    onChange={(e) => setPackageDetails({...packageDetails, packageHeight: parseInt(e.target.value) || 8})}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>📦 Package Details:</strong><br/>
                  Weight: {packageDetails.packageWeight}kg<br/>
                  Dimensions: {packageDetails.packageLength} × {packageDetails.packageBreadth} × {packageDetails.packageHeight} cm
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  ✅ This will automatically create shipment in Shiprocket
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={submitShipping}
                  disabled={isLoading('shipOrder')}
                  className="flex-1 px-6 py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading('shipOrder') ? 'Shipping via Shiprocket...' : '🚀 Ship via Shiprocket'}
                </button>
                <button
                  onClick={() => {
                    setShowShipModal(false);
                    setShippingOrder(null);
                    setPackageDetails({ packageWeight: 0.5, packageLength: 15, packageBreadth: 10, packageHeight: 8 });
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="backdrop-blur-2xl bg-white/90 p-8 rounded-3xl border-2 border-white/60 shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Reject Order #{rejectingOrder?.id}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for rejection *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this order..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 h-24"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={submitRejection}
                  disabled={isLoading('rejectOrder')}
                  className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading('rejectOrder') ? 'Rejecting...' : 'Reject Order'}
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectingOrder(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast notifications are handled by ToastProvider */}
    </div>
  );
};

export default SellerOrders;