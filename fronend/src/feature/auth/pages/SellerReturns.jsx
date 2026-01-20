import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import { useToast } from '../../../context/ToastContext';
import { useButtonLoading } from '../../../hooks/useButtonLoading';

const SellerReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const seller = JSON.parse(localStorage.getItem('seller') || '{}');
  const { showToast } = useToast();
  const { isLoading, withLoading } = useButtonLoading();

  useEffect(() => {
    fetchSellerReturns();
  }, []);

  const fetchSellerReturns = async () => {
    try {
      const response = await fetch(`${API_URL}/returns/seller?sellerEmail=${seller.email}`);
      if (response.ok) {
        const data = await response.json();
        setReturns(data || []);
      } else {
        showToast(`Failed to fetch return requests: ${response.status}`, 'error');
      }
    } catch (error) {
      showToast(`Error connecting to server: ${error.message}`, 'error');
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
        fetchSellerReturns();
        showToast(`Return request ${status.toLowerCase()} successfully!`, 'success');
      } else {
        showToast('Failed to update return status', 'error');
      }
    } catch (error) {
      showToast('Error updating return status', 'error');
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('sellerToken');
    localStorage.removeItem('seller');
    window.location.href = '/';
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <nav className="backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
          {/* Mobile Layout */}
          <div className="flex md:hidden justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <button onClick={() => window.location.href = '/seller'} className="text-orange-600 hover:text-orange-800">
                <svg className="w-5 h-5" viewBox="0 0 64 64" fill="none">
                  <path d="M40 16L24 32l16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Returns
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
              <button onClick={() => window.location.href = '/seller'} className="text-orange-600 hover:text-orange-800">
                <svg className="w-6 h-6" viewBox="0 0 64 64" fill="none">
                  <path d="M40 16L24 32l16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
                </svg>
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Return Requests
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search returns..."
                  className="pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
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
        <div className="backdrop-blur-2xl bg-white/60 rounded-3xl border-2 border-white/60 shadow-2xl overflow-hidden">
          <div className="p-3 sm:p-6 border-b border-white/60">
            <h3 className="text-lg sm:text-2xl font-bold text-orange-900">Return & Replacement Requests</h3>
          </div>
          
          {returns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No return requests yet</p>
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="block md:hidden">
                {returns.map((returnRequest, index) => (
                  <div key={returnRequest.id} className="p-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm">#{returnRequest.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        returnRequest.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        returnRequest.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        returnRequest.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {returnRequest.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm mb-3">
                      <p><span className="font-medium">Type:</span> 
                        <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                          returnRequest.type === 'RETURN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {returnRequest.type}
                        </span>
                      </p>
                      <p><span className="font-medium">Product:</span> {returnRequest.product?.name || 'N/A'}</p>
                      <p><span className="font-medium">Customer:</span> {returnRequest.order?.user?.name || 'N/A'}</p>
                      <p><span className="font-medium">Order:</span> #{returnRequest.order?.id}</p>
                      <p><span className="font-medium">Reason:</span> {returnRequest.reason}</p>
                      <p><span className="font-medium">Date:</span> {new Date(returnRequest.createdAt).toLocaleDateString()}</p>
                    </div>
                    {returnRequest.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateReturnStatus(returnRequest.id, 'APPROVED')}
                          disabled={isLoading('updateReturn')}
                          className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading('updateReturn') ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => updateReturnStatus(returnRequest.id, 'REJECTED')}
                          disabled={isLoading('updateReturn')}
                          className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading('updateReturn') ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    )}
                    {returnRequest.status === 'APPROVED' && (
                      <button
                        onClick={() => updateReturnStatus(returnRequest.id, 'COMPLETED')}
                        disabled={isLoading('updateReturn')}
                        className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading('updateReturn') ? 'Processing...' : 'Complete'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Request ID</th>
                      <th className="px-6 py-4 text-left font-semibold">Type</th>
                      <th className="px-6 py-4 text-left font-semibold">Product</th>
                      <th className="px-6 py-4 text-left font-semibold">Customer</th>
                      <th className="px-6 py-4 text-left font-semibold">Order ID</th>
                      <th className="px-6 py-4 text-left font-semibold">Reason</th>
                      <th className="px-6 py-4 text-left font-semibold">Status</th>
                      <th className="px-6 py-4 text-left font-semibold">Date</th>
                      <th className="px-6 py-4 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returns.map((returnRequest, index) => (
                      <tr key={returnRequest.id} className={`${index % 2 === 0 ? 'bg-white/50' : 'bg-white/30'} hover:bg-white/70 transition-colors`}>
                        <td className="px-6 py-4 font-medium text-gray-900">#{returnRequest.id}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            returnRequest.type === 'RETURN' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {returnRequest.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900">{returnRequest.product?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-900">{returnRequest.order?.user?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-900">#{returnRequest.order?.id}</td>
                        <td className="px-6 py-4 text-gray-900 max-w-xs truncate">{returnRequest.reason}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            returnRequest.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            returnRequest.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            returnRequest.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {returnRequest.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900">{new Date(returnRequest.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          {returnRequest.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateReturnStatus(returnRequest.id, 'APPROVED')}
                                disabled={isLoading('updateReturn')}
                                className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isLoading('updateReturn') ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => updateReturnStatus(returnRequest.id, 'REJECTED')}
                                disabled={isLoading('updateReturn')}
                                className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isLoading('updateReturn') ? 'Processing...' : 'Reject'}
                              </button>
                            </div>
                          )}
                          {returnRequest.status === 'APPROVED' && (
                            <button
                              onClick={() => updateReturnStatus(returnRequest.id, 'COMPLETED')}
                              disabled={isLoading('updateReturn')}
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerReturns;