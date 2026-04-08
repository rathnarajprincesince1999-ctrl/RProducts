import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import { useToast } from '../../../context/ToastContext';
import OrderTracking from '../components/OrderTracking';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [returningOrder, setReturningOrder] = useState(null);
  const [replacingOrder, setReplacingOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [replaceReason, setReplaceReason] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [submittingReplace, setSubmittingReplace] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrders();
    fetchReturns();
  }, []);

  const fetchOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${API_URL}/orders/user?userEmail=${encodeURIComponent(user?.email || '')}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      showToast('Error loading orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchReturns = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${API_URL}/returns/user?userEmail=${encodeURIComponent(user?.email || '')}`);
      if (response.ok) {
        const data = await response.json();
        setReturns(data);
      }
    } catch (error) {
      console.error('Error loading returns:', error);
    }
  };

  const cancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`${API_URL}/orders/${orderId}/cancel?userEmail=${encodeURIComponent(user?.email || '')}`, {
          method: 'PUT'
        });
        if (response.ok) {
          fetchOrders();
          showToast('Order cancelled successfully', 'success');
        } else {
          showToast('Failed to cancel order', 'error');
        }
      } catch (error) {
        showToast('Error cancelling order', 'error');
      }
    }
  };

  const handleTrackOrder = (orderId) => {
    setTrackingOrderId(orderId);
    setShowTrackingModal(true);
  };

  const handleReplaceOrder = (order) => {
    setReplacingOrder(order);
    setShowReplaceModal(true);
  };

  const submitReplace = async () => {
    if (!replaceReason.trim()) {
      showToast('Please provide a reason for replacement', 'error');
      return;
    }

    if (submittingReplace) return;
    setSubmittingReplace(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${API_URL}/replacements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: replacingOrder.id,
          userEmail: user?.email,
          reason: replaceReason
        })
      });

      if (response.ok) {
        setShowReplaceModal(false);
        setReplacingOrder(null);
        setReplaceReason('');
        fetchReturns(); // Refresh to show replacement status
        showToast('Replacement request submitted successfully', 'success');
      } else {
        showToast('Failed to submit replacement request', 'error');
      }
    } catch (error) {
      showToast('Error submitting replacement request', 'error');
    } finally {
      setSubmittingReplace(false);
    }
  };

  const submitReturn = async () => {
    if (!returnReason.trim()) {
      showToast('Please provide a reason for return', 'error');
      return;
    }

    if (submittingReturn) return;
    setSubmittingReturn(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${API_URL}/returns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: returningOrder.id,
          userEmail: user?.email,
          reason: returnReason
        })
      });

      if (response.ok) {
        setShowReturnModal(false);
        setReturningOrder(null);
        setReturnReason('');
        fetchReturns();
        showToast('Return request submitted successfully', 'success');
      } else {
        showToast('Failed to submit return request', 'error');
      }
    } catch (error) {
      showToast('Error submitting return request', 'error');
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg animate-spin mb-4">
            <img src="/rathna-logo.jpg" alt="RATHNA Logo" className="w-full h-full object-cover" />
          </div>
          <p className="text-blue-800 font-semibold">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => window.location.href = '/dashboard'} className="text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">My Orders</h1>
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 py-4 space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Your orders will appear here once you make a purchase</p>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                  order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                  order.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                  order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status}
                </span>
              </div>

              {order.status === 'REJECTED' && order.rejectionReason && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-700">
                    <span className="font-medium">Rejection Reason:</span> {order.rejectionReason}
                  </p>
                </div>
              )}

              {/* Shiprocket Tracking Info */}
              {(order.awbCode || order.courierName) && (
                <div className="mb-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-800 mb-1">🚀 Express Shipping</h4>
                      {order.courierName && (
                        <p className="text-sm text-emerald-700">📦 Courier: {order.courierName}</p>
                      )}
                      {order.awbCode && (
                        <p className="text-sm text-emerald-700 font-mono">🔢 AWB: {order.awbCode}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleTrackOrder(order.id)}
                      className="px-3 py-1.5 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              )}

              {/* Order Items */}
              {order.orderItems && order.orderItems.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                  <div className="space-y-2">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        {item.product?.productImageUrl && (
                          <img 
                            src={`https://rathnaproducts.store${item.product.productImageUrl}`}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.product?.name || 'Product'}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">₹{item.quantity * item.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <p className="text-lg font-bold text-gray-900">Total: ₹{order.total}</p>
                <div className="flex gap-2">
                  {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                  {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (order.awbCode || order.courierName) && (
                    <button
                      onClick={() => handleTrackOrder(order.id)}
                      className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                    >
                      Track Order
                    </button>
                  )}
                  {(() => {
                    const orderReturn = returns.find(ret => ret.order?.id === order.id);
                    if (orderReturn) {
                      return (
                        <span className={`px-3 py-1.5 text-sm rounded ${
                          orderReturn.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          orderReturn.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          orderReturn.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {orderReturn.type === 'REPLACEMENT' ? 'Replace' : 'Return'} {orderReturn.status}
                        </span>
                      );
                    }
                    
                    if (order.status === 'DELIVERED' && order.orderItems) {
                      const returnableItems = order.orderItems.filter(item => item.product?.returnable);
                      const replaceableItems = order.orderItems.filter(item => item.product?.replaceable);
                      
                      return (
                        <div className="flex gap-2">
                          {returnableItems.length > 0 && (
                            <button
                              onClick={() => handleReturnOrder(order)}
                              className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
                            >
                              Return
                            </button>
                          )}
                          {replaceableItems.length > 0 && (
                            <button
                              onClick={() => handleReplaceOrder(order)}
                              className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors"
                            >
                              Replace
                            </button>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tracking Modal */}
      {showTrackingModal && (
        <OrderTracking 
          orderId={trackingOrderId}
          onClose={() => {
            setShowTrackingModal(false);
            setTrackingOrderId(null);
          }}
        />
      )}

      {/* Replace Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Replace Order</h3>
              <p className="text-gray-600 mb-4">Order #{replacingOrder?.id}</p>
              
              {/* Show replaceable items */}
              {replacingOrder?.orderItems && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Replaceable Items:</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {replacingOrder.orderItems
                      .filter(item => item.product?.replaceable)
                      .map((item, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded text-sm">
                          <span className="font-medium">{item.product.name}</span>
                          <span className="text-gray-500">({item.product.replacementDays} days)</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Replacement</label>
                  <textarea
                    value={replaceReason}
                    onChange={(e) => setReplaceReason(e.target.value)}
                    placeholder="Please provide a reason for replacing this order..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 text-sm"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={submitReplace}
                    disabled={submittingReplace}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingReplace ? 'Submitting...' : 'Submit Replacement'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReplaceModal(false);
                      setReplacingOrder(null);
                      setReplaceReason('');
                      setSubmittingReplace(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Return Order</h3>
              <p className="text-gray-600 mb-4">Order #{returningOrder?.id}</p>
              
              {/* Show returnable items */}
              {returningOrder?.orderItems && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Returnable Items:</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {returningOrder.orderItems
                      .filter(item => item.product?.returnable)
                      .map((item, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded text-sm">
                          <span className="font-medium">{item.product.name}</span>
                          <span className="text-gray-500">({item.product.returnDays} days)</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Return</label>
                  <textarea
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="Please provide a reason for returning this order..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24 text-sm"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={submitReturn}
                    disabled={submittingReturn}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingReturn ? 'Submitting...' : 'Submit Return'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReturnModal(false);
                      setReturningOrder(null);
                      setReturnReason('');
                      setSubmittingReturn(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;