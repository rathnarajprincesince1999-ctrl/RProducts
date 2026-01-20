const SellerHome = () => {
  const seller = JSON.parse(localStorage.getItem('seller') || '{}');
  const token = localStorage.getItem('sellerToken');

  const handleLogout = () => {
    localStorage.removeItem('sellerToken');
    localStorage.removeItem('seller');
    window.location.href = '/';
  };

  if (!token) {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <nav className="backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">RATHNA Products - Seller</h1>
          <div className="flex items-center gap-4">
            <span className="text-green-800 font-semibold">Seller: {seller.name || seller.username || 'Seller'}</span>
            <button onClick={handleLogout} className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg">
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="backdrop-blur-2xl bg-white/60 p-10 rounded-3xl border-2 border-white/60 shadow-2xl">
          <h2 className="text-4xl font-bold text-green-900 mb-6">Seller Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              onClick={() => window.location.href = '/seller/products'}
              className="backdrop-blur-lg bg-gradient-to-br from-purple-50/60 to-pink-50/40 p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all"
            >
              <h3 className="text-2xl font-bold text-purple-900 mb-2">Products</h3>
              <p className="text-purple-700">Manage your products</p>
            </div>
            <div 
              onClick={() => window.location.href = '/seller/orders'}
              className="backdrop-blur-lg bg-gradient-to-br from-blue-50/60 to-cyan-50/40 p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all"
            >
              <h3 className="text-2xl font-bold text-blue-900 mb-2">Orders</h3>
              <p className="text-blue-700">View your orders</p>
            </div>
            <div 
              onClick={() => window.location.href = '/seller/revenue'}
              className="backdrop-blur-lg bg-gradient-to-br from-green-50/60 to-emerald-50/40 p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all"
            >
              <h3 className="text-2xl font-bold text-green-900 mb-2">Revenue</h3>
              <p className="text-green-700">Track your earnings</p>
            </div>
            <div 
              onClick={() => window.location.href = '/seller/returns'}
              className="backdrop-blur-lg bg-gradient-to-br from-orange-50/60 to-red-50/40 p-6 rounded-2xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all"
            >
              <h3 className="text-2xl font-bold text-orange-900 mb-2">Returns</h3>
              <p className="text-orange-700">Manage return requests</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerHome;