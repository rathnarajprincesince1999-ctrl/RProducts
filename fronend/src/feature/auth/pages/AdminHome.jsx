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
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="backdrop-blur-2xl bg-white/60 p-10 rounded-3xl border-2 border-white/60 shadow-2xl">
          <h2 className="text-4xl font-bold text-orange-900 mb-6">Admin Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              onClick={() => window.location.href = '/admin/users'}
              className="backdrop-blur-lg bg-gradient-to-br from-blue-50/60 to-cyan-50/40 p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all"
            >
              <h3 className="text-2xl font-bold text-blue-900 mb-2">Users</h3>
              <p className="text-blue-700">Manage users</p>
            </div>
            <div 
              onClick={() => window.location.href = '/admin/products'}
              className="backdrop-blur-lg bg-gradient-to-br from-purple-50/60 to-pink-50/40 p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all"
            >
              <h3 className="text-2xl font-bold text-purple-900 mb-2">Products</h3>
              <p className="text-purple-700">Manage products</p>
            </div>
            <div 
              onClick={() => window.location.href = '/admin/categories'}
              className="backdrop-blur-lg bg-gradient-to-br from-orange-50/60 to-yellow-50/40 p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all"
            >
              <h3 className="text-2xl font-bold text-orange-900 mb-2">Categories</h3>
              <p className="text-orange-700">Manage categories</p>
            </div>
            <div 
              onClick={() => window.location.href = '/admin/sellers'}
              className="backdrop-blur-lg bg-gradient-to-br from-teal-50/60 to-cyan-50/40 p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all"
            >
              <h3 className="text-2xl font-bold text-teal-900 mb-2">Sellers</h3>
              <p className="text-teal-700">Manage sellers</p>
            </div>
            <div 
              onClick={() => window.location.href = '/admin/orders'}
              className="backdrop-blur-lg bg-gradient-to-br from-green-50/60 to-emerald-50/40 p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all"
            >
              <h3 className="text-2xl font-bold text-green-900 mb-2">Orders</h3>
              <p className="text-green-700">View all orders</p>
            </div>
            <div 
              onClick={() => window.location.href = '/admin/revenue'}
              className="backdrop-blur-lg bg-gradient-to-br from-yellow-50/60 to-amber-50/40 p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all"
            >
              <h3 className="text-2xl font-bold text-yellow-900 mb-2">Revenue</h3>
              <p className="text-yellow-700">Total platform revenue</p>
            </div>
            <div 
              onClick={() => window.location.href = '/admin/returns'}
              className="backdrop-blur-lg bg-gradient-to-br from-red-50/60 to-rose-50/40 p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all"
            >
              <h3 className="text-2xl font-bold text-red-900 mb-2">Returns</h3>
              <p className="text-red-700">All return requests</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
