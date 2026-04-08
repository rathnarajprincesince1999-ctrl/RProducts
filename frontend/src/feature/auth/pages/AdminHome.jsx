const AdminHome = () => {
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');
  const token = localStorage.getItem('adminToken');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    window.location.href = '/';
  };

  if (!token) {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <nav className="backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">RATHNA Products - Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-orange-800 font-semibold">Admin: {admin.username || 'RATHNA'}</span>
            <button onClick={handleLogout} className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg">
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="backdrop-blur-2xl bg-white/60 p-10 rounded-3xl border-2 border-white/60 shadow-2xl">
          <h2 className="text-4xl font-bold text-orange-900 mb-6">Admin Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div 
              onClick={() => window.location.href = '/admin/users'}
              className="backdrop-blur-lg bg-gradient-to-br from-blue-50/60 to-cyan-50/40 p-4 md:p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all group"
            >
              <div className="flex items-center mb-3">
                <svg className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-blue-900 mb-2">Users</h3>
              <p className="text-blue-700 text-sm md:text-base">Manage users</p>
            </div>
            <div 
              onClick={() => window.location.href = '/admin/products'}
              className="backdrop-blur-lg bg-gradient-to-br from-purple-50/60 to-pink-50/40 p-4 md:p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all group"
            >
              <div className="flex items-center mb-3">
                <svg className="w-8 h-8 text-purple-600 group-hover:text-purple-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-purple-900 mb-2">Products</h3>
              <p className="text-purple-700 text-sm md:text-base">Manage products</p>
            </div>
            <div 
              onClick={() => window.location.href = '/admin/categories'}
              className="backdrop-blur-lg bg-gradient-to-br from-orange-50/60 to-yellow-50/40 p-4 md:p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all group"
            >
              <div className="flex items-center mb-3">
                <svg className="w-8 h-8 text-orange-600 group-hover:text-orange-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-orange-900 mb-2">Categories</h3>
              <p className="text-orange-700 text-sm md:text-base">Manage categories</p>
            </div>
            <div 
              onClick={() => window.location.href = '/admin/sellers'}
              className="backdrop-blur-lg bg-gradient-to-br from-teal-50/60 to-cyan-50/40 p-4 md:p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all group"
            >
              <div className="flex items-center mb-3">
                <svg className="w-8 h-8 text-teal-600 group-hover:text-teal-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-teal-900 mb-2">Sellers</h3>
              <p className="text-teal-700 text-sm md:text-base">Manage sellers</p>
            </div>
            <div 
              onClick={() => window.location.href = '/admin/orders'}
              className="backdrop-blur-lg bg-gradient-to-br from-green-50/60 to-emerald-50/40 p-4 md:p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all group"
            >
              <div className="flex items-center mb-3">
                <svg className="w-8 h-8 text-green-600 group-hover:text-green-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-green-900 mb-2">Orders</h3>
              <p className="text-green-700 text-sm md:text-base">View all orders</p>
            </div>
            <div 
              onClick={() => window.location.href = '/admin/revenue'}
              className="backdrop-blur-lg bg-gradient-to-br from-yellow-50/60 to-amber-50/40 p-4 md:p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all group"
            >
              <div className="flex items-center mb-3">
                <svg className="w-8 h-8 text-yellow-600 group-hover:text-yellow-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-yellow-900 mb-2">Revenue</h3>
              <p className="text-yellow-700 text-sm md:text-base">Total platform revenue</p>
            </div>
            <div 
              onClick={() => window.location.href = '/admin/returns'}
              className="backdrop-blur-lg bg-gradient-to-br from-red-50/60 to-rose-50/40 p-4 md:p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all group"
            >
              <div className="flex items-center mb-3">
                <svg className="w-8 h-8 text-red-600 group-hover:text-red-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-red-900 mb-2">Returns</h3>
              <p className="text-red-700 text-sm md:text-base">All return requests</p>
            </div>
            <div 
              onClick={() => window.location.href = '/admin/shipping'}
              className="backdrop-blur-lg bg-gradient-to-br from-indigo-50/60 to-purple-50/40 p-4 md:p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="absolute top-2 right-2">
                <div className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                  NEW
                </div>
              </div>
              <div className="flex items-center mb-3">
                <svg className="w-8 h-8 text-indigo-600 group-hover:text-indigo-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-indigo-900 mb-2">Express Shipping</h3>
              <p className="text-indigo-700 text-sm md:text-base">Shiprocket Integration</p>
              <div className="mt-2 flex items-center text-xs text-emerald-600 font-semibold">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Auto AWB Generation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
