import { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import { API_URL } from '../../../config';
import { useButtonLoading } from '../../../hooks/useButtonLoading';

const AdminReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { isLoading, withLoading } = useButtonLoading();

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const response = await fetch(`${API_URL}/returns/all`);
      if (response.ok) {
        const data = await response.json();
        setReturns(data || []);
      } else {
        showToast(`Failed to fetch returns: ${response.status}`, 'error');
      }
    } catch (error) {
      showToast(`Error fetching returns: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateReturnStatus = withLoading('updateReturn', async (returnId, status) => {
    try {
      const response = await fetch(`${API_URL}/returns/${returnId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        showToast(`Return ${status.toLowerCase()}`, 'success');
        fetchReturns();
      } else {
        showToast('Failed to update return status', 'error');
      }
    } catch (error) {
      showToast('Error updating return status', 'error');
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-orange-800">Loading returns...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <nav className="backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Admin Returns</h1>
          <button 
            onClick={() => window.location.href = '/admin/home'}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="backdrop-blur-2xl bg-white/60 p-8 rounded-3xl border-2 border-white/60 shadow-2xl">
          <h2 className="text-3xl font-bold text-red-900 mb-6">All Return Requests</h2>
          
          {returns.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-600 mb-2">No Returns Found</h3>
              <p className="text-gray-500">No return requests have been made yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-white/80 rounded-2xl overflow-hidden shadow-lg">
                <thead className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Return ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Product</th>
                    <th className="px-6 py-4 text-left font-semibold">Seller</th>
                    <th className="px-6 py-4 text-left font-semibold">Customer</th>
                    <th className="px-6 py-4 text-left font-semibold">Type</th>
                    <th className="px-6 py-4 text-left font-semibold">Reason</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Date</th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((returnItem, index) => (
                    <tr key={returnItem.id} className={index % 2 === 0 ? 'bg-white/60' : 'bg-gray-50/60'}>
                      <td className="px-6 py-4 font-medium text-gray-900">#{returnItem.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {returnItem.product.productImageUrl && (
                            <img 
                              src={returnItem.product.productImageUrl.startsWith('http') ? returnItem.product.productImageUrl : `${API_URL.replace('/api', '')}${returnItem.product.productImageUrl}`}
                              alt={returnItem.product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{returnItem.product.name}</div>
                            <div className="text-sm text-gray-500">₹{returnItem.product.price}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{returnItem.product.seller?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{returnItem.product.seller?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{returnItem.order.user?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{returnItem.order.user?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          returnItem.type === 'RETURN' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {returnItem.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 max-w-xs truncate">{returnItem.reason}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          returnItem.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          returnItem.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          returnItem.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {returnItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(returnItem.createdAt || returnItem.requestDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {returnItem.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateReturnStatus(returnItem.id, 'APPROVED')}
                              disabled={isLoading('updateReturn')}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading('updateReturn') ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => updateReturnStatus(returnItem.id, 'REJECTED')}
                              disabled={isLoading('updateReturn')}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading('updateReturn') ? 'Processing...' : 'Reject'}
                            </button>
                          </div>
                        )}
                        {returnItem.status === 'APPROVED' && (
                          <button
                            onClick={() => updateReturnStatus(returnItem.id, 'COMPLETED')}
                            disabled={isLoading('updateReturn')}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading('updateReturn') ? 'Processing...' : 'Complete'}
                          </button>
                        )}
                      </td>
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

export default AdminReturns;