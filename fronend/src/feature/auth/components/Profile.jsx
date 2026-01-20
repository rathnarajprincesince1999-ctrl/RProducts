import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import Toast from '../../../components/Toast';
import { useToast } from '../../../context/ToastContext';

const Profile = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [addressForm, setAddressForm] = useState({ type: '', fullAddress: '' });
  const [paymentForm, setPaymentForm] = useState({ type: '', cardNumber: '', expiryDate: '', cvv: '', upiId: '' });
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returningOrder, setReturningOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const { showToast } = useToast();

  const token = localStorage.getItem('token');

  useEffect(() => {
    let isMounted = true;
    
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok && isMounted) {
          const userData = await response.json();
          setProfileData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || ''
          });
        }
      } catch (error) {
        if (isMounted) {
          console.log('Using local storage data as fallback');
        }
      }
    };
    
    fetchUserProfile();
    
    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        if (activeTab === 'orders') {
          const user = JSON.parse(localStorage.getItem('user'));
          const response = await fetch(`${API_URL}/orders/user?userEmail=${encodeURIComponent(user?.email || '')}`);
          if (response.ok && isMounted) {
            const data = await response.json();
            setOrders(data);
          }
          // Fetch returns
          const returnsResponse = await fetch(`${API_URL}/returns/user?userEmail=${encodeURIComponent(user?.email || '')}`);
          if (returnsResponse.ok && isMounted) {
            const returnsData = await returnsResponse.json();
            setReturns(returnsData);
          }
        } else if (activeTab === 'addresses') {
          const response = await fetch(`${API_URL}/addresses/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok && isMounted) {
            const data = await response.json();
            setAddresses(data);
          }
        } else if (activeTab === 'payments') {
          const response = await fetch(`${API_URL}/payments/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok && isMounted) {
            const data = await response.json();
            setPayments(data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (isMounted) {
          if (activeTab === 'orders') setOrders([]);
          if (activeTab === 'addresses') setAddresses([]);
          if (activeTab === 'payments') setPayments([]);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [activeTab, token]);

  const refreshData = async (type) => {
    try {
      const response = await fetch(`${API_URL}/${type}/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (type === 'addresses') setAddresses(data);
        if (type === 'payments') setPayments(data);
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    }
  };

  const addAddress = async () => {
    try {
      const url = editingAddress ? `${API_URL}/addresses/${editingAddress.id}` : `${API_URL}/addresses`;
      const method = editingAddress ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressForm)
      });
      if (response.ok) {
        refreshData('addresses');
        setAddressForm({ type: '', fullAddress: '' });
        setEditingAddress(null);
        setShowAddressForm(false);
        alert(editingAddress ? 'Address updated successfully!' : 'Address added successfully!');
      }
    } catch (error) {
      alert('Error saving address: ' + error.message);
    }
  };

  const editAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({ type: address.type, fullAddress: address.fullAddress });
    setShowAddressForm(true);
  };

  const deleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const response = await fetch(`${API_URL}/addresses/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          refreshData('addresses');
          alert('Address deleted successfully!');
        }
      } catch (error) {
        alert('Error deleting address: ' + error.message);
      }
    }
  };

  const addPayment = async () => {
    try {
      const url = editingPayment ? `${API_URL}/payments/${editingPayment.id}` : `${API_URL}/payments`;
      const method = editingPayment ? 'PUT' : 'POST';
      
      let paymentData;
      if (paymentForm.type === 'UPI') {
        paymentData = {
          type: paymentForm.type,
          upiId: paymentForm.upiId
        };
      } else {
        paymentData = {
          type: paymentForm.type,
          lastFour: paymentForm.cardNumber.slice(-4),
          expiryDate: paymentForm.expiryDate
        };
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });
      if (response.ok) {
        refreshData('payments');
        setPaymentForm({ type: '', cardNumber: '', expiryDate: '', cvv: '', upiId: '' });
        setEditingPayment(null);
        setShowPaymentForm(false);
        alert(editingPayment ? 'Payment method updated successfully!' : 'Payment method added successfully!');
      }
    } catch (error) {
      alert('Error saving payment method: ' + error.message);
    }
  };

  const editPayment = (payment) => {
    setEditingPayment(payment);
    if (payment.type === 'UPI') {
      setPaymentForm({ 
        type: payment.type, 
        cardNumber: '', 
        expiryDate: '', 
        cvv: '',
        upiId: payment.upiId || ''
      });
    } else {
      setPaymentForm({ 
        type: payment.type, 
        cardNumber: '****' + payment.lastFour, 
        expiryDate: payment.expiryDate, 
        cvv: '',
        upiId: ''
      });
    }
    setShowPaymentForm(true);
  };

  const deletePayment = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        const response = await fetch(`${API_URL}/payments/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          refreshData('payments');
          alert('Payment method deleted successfully!');
        }
      } catch (error) {
        alert('Error deleting payment method: ' + error.message);
      }
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      if (response.ok) {
        const updatedUser = await response.json();
        showToast('Profile updated successfully', 'success');
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update profile' }));
        showToast('Error: ' + (errorData.message || 'Failed to update profile'), 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnOrder = (order) => {
    setReturningOrder(order);
    setShowReturnModal(true);
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

  const cancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`${API_URL}/orders/${orderId}/cancel?userEmail=${encodeURIComponent(user?.email || '')}`, {
          method: 'PUT'
        });
        if (response.ok) {
          // Refresh orders
          const ordersResponse = await fetch(`${API_URL}/orders/user?userEmail=${encodeURIComponent(user?.email || '')}`);
          if (ordersResponse.ok) {
            const data = await ordersResponse.json();
            setOrders(data);
          }
          showToast('Order cancelled successfully', 'success');
        } else {
          showToast('Failed to cancel order', 'error');
        }
      } catch (error) {
        showToast('Error cancelling order', 'error');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="backdrop-blur-2xl bg-white/90 rounded-3xl border-2 border-white/60 shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gradient-to-b from-emerald-500 to-teal-600 p-6">
            <h2 className="text-2xl font-bold text-white mb-8">Profile</h2>
            <nav className="space-y-2">
              {[
                { id: 'profile', label: 'Personal Info', icon: (
                  <svg className="w-5 h-5" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="20" r="12" fill="currentColor" opacity="0.3"/>
                    <path d="M32 8c6.6 0 12 5.4 12 12s-5.4 12-12 12-12-5.4-12-12S25.4 8 32 8z" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M12 56c0-11 9-20 20-20s20 9 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) },
                { id: 'orders', label: 'Orders', icon: (
                  <svg className="w-5 h-5" viewBox="0 0 64 64" fill="none">
                    <rect x="12" y="16" width="40" height="32" rx="4" fill="currentColor" opacity="0.3"/>
                    <rect x="12" y="16" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M20 16V12c0-2.2 1.8-4 4-4h16c2.2 0 4 1.8 4 4v4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M20 28h24M20 36h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) },
                { id: 'addresses', label: 'Addresses', icon: (
                  <svg className="w-5 h-5" viewBox="0 0 64 64" fill="none">
                    <path d="M32 8c-8.8 0-16 7.2-16 16 0 12 16 32 16 32s16-20 16-32c0-8.8-7.2-16-16-16z" fill="currentColor" opacity="0.3"/>
                    <path d="M32 8c-8.8 0-16 7.2-16 16 0 12 16 32 16 32s16-20 16-32c0-8.8-7.2-16-16-16z" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <circle cx="32" cy="24" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                ) },
                { id: 'payments', label: 'Payments', icon: (
                  <svg className="w-5 h-5" viewBox="0 0 64 64" fill="none">
                    <rect x="8" y="20" width="48" height="24" rx="4" fill="currentColor" opacity="0.3"/>
                    <rect x="8" y="20" width="48" height="24" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <rect x="8" y="28" width="48" height="4" fill="currentColor"/>
                    <circle cx="16" cy="38" r="2" fill="currentColor"/>
                    <circle cx="24" cy="38" r="2" fill="currentColor"/>
                    <circle cx="32" cy="38" r="2" fill="currentColor"/>
                    <circle cx="40" cy="38" r="2" fill="currentColor"/>
                  </svg>
                ) },
                { id: 'logout', label: 'Logout', icon: (
                  <svg className="w-5 h-5" viewBox="0 0 64 64" fill="none">
                    <path d="M24 8H16c-2.2 0-4 1.8-4 4v40c0 2.2 1.8 4 4 4h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M40 20l12 12-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M52 32H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'logout') {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.href = '/';
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white/20 text-white font-semibold' 
                      : 'text-white/80 hover:bg-white/10'
                  } ${tab.id === 'logout' ? 'hover:bg-red-500/20' : ''}`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {activeTab === 'profile' && 'Personal Information'}
                {activeTab === 'orders' && 'Order History'}
                {activeTab === 'addresses' && 'Saved Addresses'}
                {activeTab === 'payments' && 'Payment Methods'}
              </h3>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-500 text-white hover:bg-gray-600 transition-all"
              >
                Close
              </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24"
                  />
                </div>
                <button
                  onClick={updateProfile}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No orders found</p>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">Order #{order.id}</h4>
                        <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-600 mb-2">Status: <span className={`font-semibold ${
                        order.status === 'CANCELLED' ? 'text-red-600' :
                        order.status === 'REJECTED' ? 'text-red-600' :
                        order.status === 'DELIVERED' ? 'text-green-600' :
                        order.status === 'SHIPPED' ? 'text-blue-600' :
                        'text-yellow-600'
                      }`}>{order.status}</span></p>
                      {order.status === 'REJECTED' && order.rejectionReason && (
                        <p className="text-sm text-red-600 mb-2">Rejection Reason: {order.rejectionReason}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">Total: ₹{order.total}</p>
                        <div className="flex gap-2">
                          {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                            <button
                              onClick={() => cancelOrder(order.id)}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                            >
                              Cancel Order
                            </button>
                          )}
                          {(() => {
                            const orderReturn = returns.find(ret => ret.order?.id === order.id);
                            if (orderReturn) {
                              return (
                                <span className={`px-3 py-1 text-sm rounded ${
                                  orderReturn.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  orderReturn.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                  orderReturn.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  Return {orderReturn.status}
                                </span>
                              );
                            }
                            return order.status === 'DELIVERED' && order.orderItems && order.orderItems.some(item => item.product?.returnable) && (
                              <button
                                onClick={() => handleReturnOrder(order)}
                                className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
                              >
                                Return Order
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold">Your Addresses</h4>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Add Address
                  </button>
                </div>
                
                {showAddressForm && (
                  <div className="bg-gray-50 p-4 rounded-xl border">
                    <h5 className="font-semibold mb-3">{editingAddress ? 'Edit Address' : 'Add New Address'}</h5>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Address Type (Home, Work, etc.)"
                        value={addressForm.type}
                        onChange={(e) => setAddressForm({...addressForm, type: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <textarea
                        placeholder="Full Address"
                        value={addressForm.fullAddress}
                        onChange={(e) => setAddressForm({...addressForm, fullAddress: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 h-20"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={addAddress}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                        >
                          {editingAddress ? 'Update Address' : 'Save Address'}
                        </button>
                        <button
                          onClick={() => setShowAddressForm(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {addresses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No addresses saved</p>
                ) : (
                  addresses.map(address => (
                    <div key={address.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold mb-2">{address.type}</h4>
                          <p className="text-gray-600">{address.fullAddress}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editAddress(address)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteAddress(address.id)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold">Your Payment Methods</h4>
                  <button
                    onClick={() => setShowPaymentForm(true)}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Add Payment Method
                  </button>
                </div>
                
                {showPaymentForm && (
                  <div className="bg-gray-50 p-4 rounded-xl border">
                    <h5 className="font-semibold mb-3">{editingPayment ? 'Edit Payment Method' : 'Add New Payment Method'}</h5>
                    <div className="space-y-3">
                      <select
                        value={paymentForm.type}
                        onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select Payment Type</option>
                        <option value="UPI">UPI</option>
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="American Express">American Express</option>
                        <option value="Rupay">Rupay</option>
                      </select>
                      
                      {paymentForm.type === 'UPI' ? (
                        <input
                          type="text"
                          placeholder="UPI ID (e.g., user@paytm)"
                          value={paymentForm.upiId}
                          onChange={(e) => setPaymentForm({...paymentForm, upiId: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      ) : paymentForm.type && paymentForm.type !== 'UPI' ? (
                        <>
                          <input
                            type="text"
                            placeholder="Card Number"
                            value={paymentForm.cardNumber}
                            onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            maxLength="16"
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="MM/YY"
                              value={paymentForm.expiryDate}
                              onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              maxLength="5"
                            />
                            <input
                              type="text"
                              placeholder="CVV"
                              value={paymentForm.cvv}
                              onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              maxLength="3"
                            />
                          </div>
                        </>
                      ) : null}
                      
                      <div className="flex gap-2">
                        <button
                          onClick={addPayment}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                        >
                          {editingPayment ? 'Update Payment Method' : 'Save Payment Method'}
                        </button>
                        <button
                          onClick={() => setShowPaymentForm(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {payments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No payment methods saved</p>
                ) : (
                  payments.map(payment => (
                    <div key={payment.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold mb-2">{payment.type}</h4>
                          <p className="text-gray-600">
                            {payment.type === 'UPI' ? payment.upiId : `****${payment.lastFour}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editPayment(payment)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deletePayment(payment.id)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="backdrop-blur-2xl bg-white/90 p-8 rounded-3xl border-2 border-white/60 shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Return Order</h3>
            <p className="text-gray-600 mb-4">Order #{returningOrder?.id}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Return</label>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Please provide a reason for returning this order..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={submitReturn}
                  disabled={submittingReturn}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notifications are handled by ToastProvider */}
    </div>
  );
};

export default Profile;