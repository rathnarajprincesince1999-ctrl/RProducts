import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSeller, setEditingSeller] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '', name: '', email: '' });
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/sellers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSellers(data);
      } else {
        console.error('Failed to fetch sellers:', response.status);
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingSeller 
        ? `${API_URL}/admin/sellers/${editingSeller.id}`
        : `${API_URL}/admin/sellers`;
      
      const response = await fetch(url, {
        method: editingSeller ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchSellers();
        resetForm();
        alert(editingSeller ? 'Seller updated successfully!' : 'Seller created successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to save seller');
      }
    } catch (error) {
      console.error('Error saving seller:', error);
      alert('Error saving seller: ' + error.message);
    }
  };

  const deleteSeller = async (id) => {
    if (window.confirm('Are you sure you want to delete this seller? This action cannot be undone.')) {
      try {
        const response = await fetch(`${API_URL}/admin/sellers/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          fetchSellers();
          alert('Seller deleted successfully!');
        } else {
          alert('Failed to delete seller');
        }
      } catch (error) {
        console.error('Error deleting seller:', error);
        alert('Error deleting seller: ' + error.message);
      }
    }
  };

  const editSeller = (seller) => {
    setEditingSeller(seller);
    setFormData({
      username: seller.username,
      password: '',
      name: seller.name,
      email: seller.email
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', name: '', email: '' });
    setEditingSeller(null);
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <nav className="backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => window.location.href = '/admin'} className="text-orange-600 hover:text-orange-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Manage Sellers</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search sellers..."
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button 
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
            >
              Add Seller
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="backdrop-blur-2xl bg-white/60 p-10 rounded-3xl border-2 border-white/60 shadow-2xl">
            {sellers.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Sellers Found</h3>
                <p className="text-gray-500">Click "Add Seller" to create your first seller account.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {sellers.map((seller) => (
                  <div key={seller.id} className="bg-white/80 p-6 rounded-2xl border border-white/60 shadow-lg flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{seller.name}</h3>
                      <p className="text-gray-600">Username: {seller.username}</p>
                      <p className="text-gray-600">Email: {seller.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => editSeller(seller)}
                        className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteSeller(seller.id)}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">{editingSeller ? 'Edit Seller' : 'Add New Seller'}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border rounded-lg mb-4"
                required
              />
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full p-3 border rounded-lg mb-4"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 border rounded-lg mb-4"
                required
              />
              <input
                type="password"
                placeholder={editingSeller ? "New Password (leave blank to keep current)" : "Password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full p-3 border rounded-lg mb-4"
                required={!editingSeller}
              />
              <div className="flex gap-4">
                <button type="submit" className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
                  {editingSeller ? 'Update Seller' : 'Add Seller'}
                </button>
                <button type="button" onClick={resetForm} className="flex-1 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellers;