import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import Profile from '../components/Profile';
import Cart from '../components/Cart';
import { useCart } from '../../../context/CartContext';
import { useToast } from '../../../context/ToastContext';
import { useButtonLoading } from '../../../hooks/useButtonLoading';

const UserHome = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const { addToCart, getCartItemsCount } = useCart();
  const { showToast } = useToast();
  const { isLoading, withLoading } = useButtonLoading();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.categoryName && product.categoryName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        showToast('Failed to fetch categories', 'error');
      }
    } catch (error) {
      showToast('Error fetching categories', 'error');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } else {
        showToast('Failed to fetch products', 'error');
      }
    } catch (error) {
      showToast('Error fetching products', 'error');
    }
  };



  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (!token) {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <nav className="backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          {/* Mobile Layout */}
          <div className="flex md:hidden justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-500 shadow-lg animate-spin" style={{animationDuration: '3s'}}>
                <img src="/rathna-logo.jpg" alt="RATHNA Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">RATHNA Products</h1>
            </div>
          </div>
          
          {/* Mobile Search */}
          <div className="md:hidden mb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white/80 backdrop-blur-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="28" r="16" stroke="currentColor" strokeWidth="3" fill="none"/>
                  <path d="M44 44l12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>
          


          {/* Desktop Layout */}
          <div className="hidden md:flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-emerald-500 shadow-lg animate-spin" style={{animationDuration: '4s'}}>
                <img src="/rathna-logo.jpg" alt="RATHNA Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">RATHNA Products</h1>
            </div>
            
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white/80 backdrop-blur-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="28" r="16" stroke="currentColor" strokeWidth="3" fill="none"/>
                    <path d="M44 44l12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.location.href = '/products'}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
              >
                All Products
              </button>
              <button 
                onClick={() => setShowProfile(true)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-center hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="20" r="12" fill="currentColor" opacity="0.3"/>
                  <path d="M32 8c6.6 0 12 5.4 12 12s-5.4 12-12 12-12-5.4-12-12S25.4 8 32 8z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M12 56c0-11 9-20 20-20s20 9 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowCart(true)}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 64 64" fill="none">
                    <rect x="12" y="16" width="40" height="32" rx="4" fill="currentColor" opacity="0.3"/>
                    <rect x="12" y="16" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M20 16V12c0-2.2 1.8-4 4-4h16c2.2 0 4 1.8 4 4v4" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="24" cy="52" r="4" fill="currentColor"/>
                    <circle cx="44" cy="52" r="4" fill="currentColor"/>
                  </svg>
                  {getCartItemsCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getCartItemsCount()}
                    </span>
                  )}
                </button>
              </div>
              <span className="text-emerald-800 font-semibold hidden lg:block">Welcome, {user.name || 'User'}</span>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="px-3 sm:px-6 py-6 sm:py-12">
        {/* Categories Section */}
        <div className="mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold text-emerald-900 mb-4 sm:mb-8 text-center">Categories</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-8">
            {categories.map((category) => (
              <div key={category.id} className="flex flex-col items-center group cursor-pointer" onClick={() => window.location.href = `/category/${category.id}`}>
                <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 sm:border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  {category.categoryImageUrl ? (
                    <img 
                      src={category.categoryImageUrl.startsWith('http') ? category.categoryImageUrl : `${API_URL.replace('/api', '')}${category.categoryImageUrl}`}
                      alt={category.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <span className="text-white font-bold text-xs sm:text-lg">{category.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-emerald-900 mt-1 sm:mt-3 text-center group-hover:text-emerald-700 transition-colors line-clamp-2">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
          {categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No categories available yet.</p>
            </div>
          )}
        </div>

        {/* Products Section */}
        <div>
          <h2 className="text-2xl sm:text-4xl font-bold text-emerald-900 mb-4 sm:mb-8 text-center">
            {searchTerm ? `Search Results (${filteredProducts.length})` : 'Products'}
          </h2>
          {filteredProducts.length > 0 ? (
            <div className="relative">
              <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 scrollbar-hide">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex-shrink-0 w-40 sm:w-48"
                  onClick={() => window.location.href = `/product/${product.id}`}
                  style={{background: `linear-gradient(135deg, ${product.cardColor || '#3B82F6'}20, ${product.cardColor || '#3B82F6'}10)`}}
                >
                  <div className="aspect-square p-1 sm:p-2">
                    {product.productImageUrl ? (
                      <img 
                        src={product.productImageUrl.startsWith('http') ? product.productImageUrl : `${API_URL.replace('/api', '')}${product.productImageUrl}`}
                        alt={product.name} 
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs sm:text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 sm:p-3 pt-0">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 line-clamp-2 leading-tight">{product.name}</h4>
                    <div className="flex items-baseline gap-1 mb-1 sm:mb-2">
                      <span className="text-sm sm:text-lg font-bold text-gray-900">₹{product.price}</span>
                      {product.unit && (
                        <span className="text-xs text-gray-500">/{product.unit}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-1 sm:mb-2 line-clamp-1">{product.description}</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        withLoading(`addToCart-${product.id}`, async () => {
                          addToCart(product);
                          showToast('Added to cart!', 'success');
                        })();
                      }}
                      disabled={isLoading(`addToCart-${product.id}`)}
                      className="w-full px-2 sm:px-3 py-1 text-white text-xs font-semibold rounded-lg transition-all mb-1 sm:mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{background: `linear-gradient(135deg, ${product.cardColor || '#3B82F6'}, ${product.cardColor || '#3B82F6'}dd)`}}
                    >
                      {isLoading(`addToCart-${product.id}`) ? 'Adding...' : 'Add to Cart'}
                    </button>
                    {product.categoryName && (
                      <span className="inline-block px-1 sm:px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">
                        {product.categoryName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm ? `No products found for "${searchTerm}"` : 'No products available yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 py-2">
          <button 
            onClick={() => setShowProfile(true)}
            className="flex flex-col items-center py-2 px-1"
          >
            <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs text-gray-600">Profile</span>
          </button>
          <button 
            onClick={() => window.location.href = '/products'}
            className="flex flex-col items-center py-2 px-1"
          >
            <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-xs text-gray-600">Products</span>
          </button>
          <button 
            onClick={() => window.location.href = '/returns'}
            className="flex flex-col items-center py-2 px-1"
          >
            <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
            </svg>
            <span className="text-xs text-gray-600">Returns</span>
          </button>
          <button 
            onClick={() => setShowCart(true)}
            className="flex flex-col items-center py-2 px-1 relative"
          >
            <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            {getCartItemsCount() > 0 && (
              <span className="absolute -top-1 right-3 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {getCartItemsCount()}
              </span>
            )}
            <span className="text-xs text-gray-600">Cart</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center py-2 px-1"
          >
            <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-xs text-gray-600">Logout</span>
          </button>
        </div>
      </div>

      {showProfile && (
        <Profile user={user} onClose={() => setShowProfile(false)} />
      )}
      
      {showCart && (
        <Cart onClose={() => setShowCart(false)} />
      )}
    </div>
  );
};

export default UserHome;
