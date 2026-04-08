import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import { useToast } from '../../../context/ToastContext';
import { useButtonLoading } from '../../../hooks/useButtonLoading';

const UserProfile = () => {
  const [addresses, setAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    landmark: '',
    addressType: 'HOME',
    isDefault: false
  });
  const { showToast } = useToast();
  const { isLoading, withLoading } = useButtonLoading();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      window.location.href = '/';
      return;
    }
    fetchAddresses();
  }, [token]);

  const fetchAddresses = withLoading('fetchAddresses', async () => {
    try {
      const response = await fetch(`${API_URL}/addresses/user?userEmail=${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      showToast('Error fetching addresses', 'error');
    }
  });

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      addressLine: address.addressLine,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      phone: address.phone,
      landmark: address.landmark || '',
      addressType: address.addressType || 'HOME',
      isDefault: address.isDefault || false
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingAddress(null);
    setFormData({
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      landmark: '',
      addressType: 'HOME',
      isDefault: addresses.length === 0
    });
    setShowModal(true);
  };

  const handleSubmit = withLoading('saveAddress', async (e) => {
    e.preventDefault();
    
    if (!formData.addressLine || !formData.city || !formData.state || !formData.pincode || !formData.phone) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/addresses/save?userEmail=${encodeURIComponent(user.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showToast('Address saved successfully!', 'success');
        setShowModal(false);
        fetchAddresses();
      } else {
        showToast('Failed to save address', 'error');
      }
    } catch (error) {
      showToast('Error saving address', 'error');
    }
  });

  const setDefaultAddress = withLoading('setDefault', async (addressId) => {
    try {
      const response = await fetch(`${API_URL}/addresses/${addressId}/default?userEmail=${encodeURIComponent(user.email)}`, {
        method: 'PUT'
      });

      if (response.ok) {
        showToast('Default address updated!', 'success');
        fetchAddresses();
      }
    } catch (error) {
      showToast('Error updating default address', 'error');
    }
  });

  const deleteAddress = withLoading('deleteAddress', async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const response = await fetch(`${API_URL}/addresses/${addressId}?userEmail=${encodeURIComponent(user.email)}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          showToast('Address deleted successfully!', 'success');
          fetchAddresses();
        }
      } catch (error) {
        showToast('Error deleting address', 'error');
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="backdrop-blur-2xl bg-white/60 p-8 rounded-3xl border-2 border-white/60 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-900">Saved Addresses</h2>
            <button
              onClick={handleAdd}
              disabled={isLoading('saveAddress')}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add New Address
            </button>
          </div>
          
          {isLoading('fetchAddresses') ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading addresses...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No saved addresses</p>
              <p className="text-gray-400 text-sm mt-2">Add your first address to save time during checkout</p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{address.addressType}</h3>
                        {address.isDefault && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-1">{address.addressLine}</p>
                      {address.landmark && (
                        <p className="text-gray-600 text-sm mb-1">Landmark: {address.landmark}</p>
                      )}
                      <p className="text-gray-700 mb-1">{address.city}, {address.state} - {address.pincode}</p>
                      <p className="text-gray-600 text-sm">Phone: {address.phone}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      {!address.isDefault && (
                        <button
                          onClick={() => setDefaultAddress(address.id)}
                          disabled={isLoading('setDefault')}
                          className="px-3 py-1 text-sm rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(address)}
                        disabled={isLoading('saveAddress')}
                        className="px-3 py-1 text-sm rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteAddress(address.id)}
                        disabled={isLoading('deleteAddress')}
                        className="px-3 py-1 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-white/95 rounded-3xl border-2 border-white/60 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Type *</label>
                  <select
                    value={formData.addressType}
                    onChange={(e) => setFormData({...formData, addressType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="HOME">Home</option>
                    <option value="OFFICE">Office</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
                  <textarea
                    value={formData.addressLine}
                    onChange={(e) => setFormData({...formData, addressLine: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                    placeholder="House/Flat No., Street, Area"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Near Metro Station, Mall, etc."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mumbai"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Maharashtra"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input
                      type="text"
                      pattern="[0-9]{6}"
                      value={formData.pincode}
                      onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="400001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      pattern="[0-9]{10}"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="9876543210"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-700">Set as default address</label>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={isLoading('saveAddress')}
                    className="flex-1 py-2 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading('saveAddress')}
                    className="flex-1 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading('saveAddress') ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;