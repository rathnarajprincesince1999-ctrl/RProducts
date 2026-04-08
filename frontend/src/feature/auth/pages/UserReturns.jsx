import { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import { API_URL } from '../../../config';
import { useButtonLoading } from '../../../hooks/useButtonLoading';

const UserReturns = () => {
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [returnType, setReturnType] = useState('RETURN');
  const [reason, setReason] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { showToast } = useToast();
  const { isLoading, withLoading } = useButtonLoading();

  useEffect(() => {
    fetchUserOrders();
    fetchUserReturns();
  }, []);

  const fetchUserOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/user?userEmail=${user.email}`);
      if (response.ok) {
        const data = await response.json();
        const deliveredOrders = data.filter(order => order.status === 'DELIVERED');
        setOrders(deliveredOrders);
      }
    } catch (error) {
      showToast('Error fetching orders', 'error');
    }
  };

  const fetchUserReturns = async () => {
    try {
      const response = await fetch(`${API_URL}/returns/user?userEmail=${user.email}`);
      if (response.ok) {
        const data = await response.json();
        setReturns(data);
      }
    } catch (error) {
      showToast('Error fetching returns', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnRequest = withLoading('submitReturn', async () => {
    if (!reason.trim()) {
      showToast('Please provide a reason', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/returns/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          productId: selectedProduct.id,
          type: returnType,
          reason: reason
        })
      });

      if (response.ok) {
        showToast(`${returnType.toLowerCase()} request submitted successfully`, 'success');
        setShowReturnModal(false);
        setReason('');
        fetchUserReturns();
      } else {
        showToast('Failed to submit return request', 'error');
      }
    } catch (error) {
      showToast('Error submitting return request', 'error');
    }
  });

  const openReturnModal = (order, product) => {
    setSelectedOrder(order);
    setSelectedProduct(product);
    setShowReturnModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-orange-800">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <nav className="backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">My Returns</h1>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Delivered Orders */}
          <div className="backdrop-blur-2xl bg-white/60 p-6 rounded-3xl border-2 border-white/60 shadow-2xl">
            <h2 className="text-2xl font-bold text-orange-900 mb-4">Delivered Orders</h2>
            {orders.length === 0 ? (
              <p className="text-gray-500">No delivered orders found</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white/80 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Order #{order.id}</span>
                      <span className="text-sm text-gray-600">
                        {new Date(order.deliveredAt).toLocaleDateString()}
                      </span>
                    </div>
                    {order.orderItems?.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mb-2">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.product.productImageUrl?.startsWith('http') ? item.product.productImageUrl : `${API_URL.replace('/api', '')}${item.product.productImageUrl}`}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <div className="font-medium">{item.product.name}</div>
                            <div className="text-sm text-gray-600">₹{item.product.price}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => openReturnModal(order, item.product)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          Return/Replace
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Return Requests */}
          <div className="backdrop-blur-2xl bg-white/60 p-6 rounded-3xl border-2 border-white/60 shadow-2xl">
            <h2 className="text-2xl font-bold text-red-900 mb-4">My Return Requests</h2>
            {returns.length === 0 ? (
              <p className="text-gray-500">No return requests found</p>
            ) : (
              <div className="space-y-4">
                {returns.map(returnItem => (
                  <div key={returnItem.id} className="bg-white/80 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">#{returnItem.id}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        returnItem.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        returnItem.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        returnItem.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {returnItem.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <img 
                        src={returnItem.product.productImageUrl?.startsWith('http') ? returnItem.product.productImageUrl : `${API_URL.replace('/api', '')}${returnItem.product.productImageUrl}`}
                        alt={returnItem.product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <div className="font-medium">{returnItem.product.name}</div>
                        <div className="text-sm text-gray-600">{returnItem.type}</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{returnItem.reason}</p>
                    <div className="text-xs text-gray-500">
                      Requested: {new Date(returnItem.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Return/Replace Product</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Type</label>
              <select 
                value={returnType} 
                onChange={(e) => setReturnType(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="RETURN">Return</option>
                <option value="REPLACEMENT">Replacement</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border rounded-lg h-24"
                placeholder="Please provide a reason for return/replacement"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReturnRequest}
                disabled={isLoading('submitReturn')}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading('submitReturn') ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                onClick={() => setShowReturnModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReturns;