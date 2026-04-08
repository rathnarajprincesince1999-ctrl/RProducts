import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import Toast from '../../../components/Toast';
import { useToast } from '../../../context/ToastContext';

const Profile = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    userId: user?.userId || null,
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [addresses, setAddresses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [addressForm, setAddressForm] = useState({ type: '', fullAddress: '' });
  const [paymentForm, setPaymentForm] = useState({ type: '', cardNumber: '', expiryDate: '', cvv: '', upiId: '' });

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
            userId: userData.userId || null,
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
        if (activeTab === 'addresses') {
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

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="backdrop-blur-2xl bg-gradient-to-br from-white/20 to-white/10 border border-white/30 rounded-none sm:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.3)] w-full h-full sm:w-auto sm:h-auto sm:max-w-sm md:max-w-5xl sm:max-h-[90vh] overflow-hidden animate-[scale_0.4s_ease-out] mobile-modal">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gradient-to-r from-indigo-600/90 to-purple-600/90 backdrop-blur-sm text-white p-4 flex justify-between items-center border-b border-white/20">
          <h2 className="text-lg font-bold">My Account</h2>
          <button onClick={() => window.location.href = '/dashboard'} className="text-white hover:text-purple-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-full sm:h-auto">


          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-72 bg-gradient-to-br from-indigo-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-sm p-6 xl:p-8 border-r border-white/20">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-white/30 to-white/10 border-2 border-white/40 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Profile</h2>
              <p className="text-white/80 text-sm">{user?.name || 'User'}</p>
            </div>
            <nav className="space-y-3">
              {[
                { id: 'profile', label: 'Personal Info', icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) },
                { id: 'addresses', label: 'Addresses', icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) },
                { id: 'payments', label: 'Payments', icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ) },
                { id: 'logout', label: 'Logout', icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 group ${
                    activeTab === tab.id 
                      ? 'bg-white/25 text-white font-semibold shadow-lg backdrop-blur-sm border border-white/30' 
                      : 'text-white/80 hover:bg-white/15 hover:text-white'
                  } ${tab.id === 'logout' ? 'hover:bg-red-500/30 hover:text-red-100' : ''}`}
                >
                  <span className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'}`}>{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto h-full bg-white/5 backdrop-blur-sm">
            {/* Desktop Header */}
            <div className="hidden lg:flex justify-between items-center p-6 xl:p-8 border-b border-white/20 bg-white/10 backdrop-blur-sm">
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  {activeTab === 'profile' && 'Personal Information'}
                  {activeTab === 'addresses' && 'Saved Addresses'}
                  {activeTab === 'payments' && 'Payment Methods'}
                </h3>
                <p className="text-white/70">
                  {activeTab === 'profile' && 'Manage your account details'}
                  {activeTab === 'addresses' && 'Your delivery locations'}
                  {activeTab === 'payments' && 'Saved payment options'}
                </p>
              </div>
              <button onClick={() => window.location.href = '/dashboard'} className="px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-300 font-medium">
                Close
              </button>
            </div>

            {/* Mobile Content Header */}
            <div className="lg:hidden p-4 border-b border-white/20 bg-white/10 backdrop-blur-sm flex-shrink-0">
              <h3 className="text-lg font-bold text-white mb-1">
                {activeTab === 'profile' && 'Personal Information'}
                {activeTab === 'addresses' && 'My Addresses'}
                {activeTab === 'payments' && 'Payment Methods'}
              </h3>
              <p className="text-white/70 text-sm">
                {activeTab === 'profile' && 'Update your details'}
                {activeTab === 'addresses' && 'Manage locations'}
                {activeTab === 'payments' && 'Payment options'}
              </p>
            </div>

            <div className="p-4 lg:p-8 pb-32 lg:pb-8 profile-content">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* User ID Display */}
                  <div className="backdrop-blur-sm bg-white/10 p-6 rounded-3xl border border-white/20 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">User ID</h4>
                        <p className="text-2xl font-mono font-bold text-indigo-300">{profileData.userId || 'Loading...'}</p>
                        <p className="text-sm text-white/70">Your unique user identifier</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-white/90 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60 transition-all duration-300"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-white/90 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-4 py-3 rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60 transition-all duration-300"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-white/90 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-4 py-3 rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60 transition-all duration-300"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <label className="block text-sm font-semibold text-white/90 mb-2">Address</label>
                      <textarea
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        className="w-full px-4 py-3 rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60 h-24 resize-none transition-all duration-300"
                        placeholder="Enter your address"
                      />
                    </div>
                  </div>
                  <button
                    onClick={updateProfile}
                    disabled={loading}
                    className="w-full lg:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 min-h-[48px]"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Updating...
                      </div>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xl font-bold text-white lg:hidden">Manage Addresses</h4>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      + Add Address
                    </button>
                  </div>
                  
                  {showAddressForm && (
                    <div className="backdrop-blur-sm bg-white/10 p-6 rounded-3xl border border-white/20 shadow-xl">
                      <h5 className="font-bold mb-4 text-white text-lg">{editingAddress ? 'Edit Address' : 'Add New Address'}</h5>
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Address Type (Home, Work, etc.)"
                          value={addressForm.type}
                          onChange={(e) => setAddressForm({...addressForm, type: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/60 transition-all duration-300"
                        />
                        <textarea
                          placeholder="Full Address"
                          value={addressForm.fullAddress}
                          onChange={(e) => setAddressForm({...addressForm, fullAddress: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/60 h-24 resize-none transition-all duration-300"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={addAddress}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 font-semibold transition-all duration-300"
                          >
                            {editingAddress ? 'Update' : 'Save'}
                          </button>
                          <button
                            onClick={() => {
                              setShowAddressForm(false);
                              setEditingAddress(null);
                              setAddressForm({ type: '', fullAddress: '' });
                            }}
                            className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-2xl hover:bg-white/30 font-semibold transition-all duration-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {addresses.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No addresses saved</h3>
                      <p className="text-white/70">Add an address for faster checkout</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {addresses.map(address => (
                        <div key={address.id} className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-3xl p-6 shadow-lg hover:bg-white/15 transition-all duration-300">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  </svg>
                                </div>
                                <h4 className="font-bold text-white text-lg">{address.type}</h4>
                              </div>
                              <p className="text-white/80 leading-relaxed ml-13">{address.fullAddress}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => editAddress(address)}
                                className="px-4 py-2 bg-blue-500/80 backdrop-blur-sm text-white rounded-xl hover:bg-blue-600/80 transition-all duration-300 font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteAddress(address.id)}
                                className="px-4 py-2 bg-red-500/80 backdrop-blur-sm text-white rounded-xl hover:bg-red-600/80 transition-all duration-300 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xl font-bold text-white lg:hidden">Payment Methods</h4>
                    <button
                      onClick={() => setShowPaymentForm(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      + Add Payment
                    </button>
                  </div>
                  
                  {showPaymentForm && (
                    <div className="backdrop-blur-sm bg-white/10 p-6 rounded-3xl border border-white/20 shadow-xl">
                      <h5 className="font-bold mb-4 text-white text-lg">{editingPayment ? 'Edit Payment Method' : 'Add Payment Method'}</h5>
                      <div className="space-y-4">
                        <select
                          value={paymentForm.type}
                          onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-white transition-all duration-300"
                        >
                          <option value="" className="bg-gray-800 text-white">Select Payment Type</option>
                          <option value="UPI" className="bg-gray-800 text-white">UPI</option>
                          <option value="Visa" className="bg-gray-800 text-white">Visa</option>
                          <option value="Mastercard" className="bg-gray-800 text-white">Mastercard</option>
                          <option value="American Express" className="bg-gray-800 text-white">American Express</option>
                          <option value="Rupay" className="bg-gray-800 text-white">Rupay</option>
                        </select>
                        
                        {paymentForm.type === 'UPI' ? (
                          <input
                            type="text"
                            placeholder="UPI ID (e.g., user@paytm)"
                            value={paymentForm.upiId}
                            onChange={(e) => setPaymentForm({...paymentForm, upiId: e.target.value})}
                            className="w-full px-4 py-3 rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/60 transition-all duration-300"
                          />
                        ) : paymentForm.type && paymentForm.type !== 'UPI' ? (
                          <>
                            <input
                              type="text"
                              placeholder="Card Number"
                              value={paymentForm.cardNumber}
                              onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                              className="w-full px-4 py-3 rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/60 transition-all duration-300"
                              maxLength="16"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="MM/YY"
                                value={paymentForm.expiryDate}
                                onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                                className="px-4 py-3 rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/60 transition-all duration-300"
                                maxLength="5"
                              />
                              <input
                                type="text"
                                placeholder="CVV"
                                value={paymentForm.cvv}
                                onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                                className="px-4 py-3 rounded-2xl backdrop-blur-sm bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/60 transition-all duration-300"
                                maxLength="3"
                              />
                            </div>
                          </>
                        ) : null}
                        
                        <div className="flex gap-3">
                          <button
                            onClick={addPayment}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-600 font-semibold transition-all duration-300"
                          >
                            {editingPayment ? 'Update' : 'Save'}
                          </button>
                          <button
                            onClick={() => {
                              setShowPaymentForm(false);
                              setEditingPayment(null);
                              setPaymentForm({ type: '', cardNumber: '', expiryDate: '', cvv: '', upiId: '' });
                            }}
                            className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-2xl hover:bg-white/30 font-semibold transition-all duration-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {payments.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No payment methods</h3>
                      <p className="text-white/70">Add a payment method for easy checkout</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {payments.map(payment => (
                        <div key={payment.id} className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-3xl p-6 shadow-lg hover:bg-white/15 transition-all duration-300">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  payment.type === 'UPI' 
                                    ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                                    : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                                }`}>
                                  {payment.type === 'UPI' ? (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-bold text-white text-lg">{payment.type}</h4>
                                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                    payment.type === 'UPI' 
                                      ? 'bg-green-500/20 text-green-200 border border-green-400/30' 
                                      : 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
                                  }`}>
                                    {payment.type === 'UPI' ? 'UPI' : 'Card'}
                                  </span>
                                </div>
                              </div>
                              <p className="text-white/80 ml-13 font-mono">
                                {payment.type === 'UPI' ? payment.upiId : `•••• •••• •••• ${payment.lastFour}`}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => editPayment(payment)}
                                className="px-4 py-2 bg-blue-500/80 backdrop-blur-sm text-white rounded-xl hover:bg-blue-600/80 transition-all duration-300 font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deletePayment(payment.id)}
                                className="px-4 py-2 bg-red-500/80 backdrop-blur-sm text-white rounded-xl hover:bg-red-600/80 transition-all duration-300 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Options */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-600/95 via-purple-600/95 to-pink-600/95 backdrop-blur-lg border-t border-white/20 shadow-2xl z-50">
          <div className="grid grid-cols-4 gap-1 p-3 pb-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all duration-300 ${
                activeTab === 'profile' 
                  ? 'bg-white/25 text-white shadow-lg backdrop-blur-sm border border-white/30' 
                  : 'text-white/70 hover:bg-white/15 hover:text-white'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-semibold">Profile</span>
            </button>
            
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all duration-300 ${
                activeTab === 'addresses' 
                  ? 'bg-white/25 text-white shadow-lg backdrop-blur-sm border border-white/30' 
                  : 'text-white/70 hover:bg-white/15 hover:text-white'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-semibold">Address</span>
            </button>
            
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all duration-300 ${
                activeTab === 'payments' 
                  ? 'bg-white/25 text-white shadow-lg backdrop-blur-sm border border-white/30' 
                  : 'text-white/70 hover:bg-white/15 hover:text-white'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-xs font-semibold">Payment</span>
            </button>
            
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
              }}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl text-red-200 hover:bg-red-500/30 hover:text-red-100 transition-all duration-300"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Toast Notifications are handled by ToastProvider */}
    </div>
  );
};

export default Profile;