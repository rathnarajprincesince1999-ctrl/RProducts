import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../../../config';
import Cart from '../components/Cart';
import Profile from '../components/Profile';
import { useCart } from '../../../context/CartContext';
import { useToast } from '../../../context/ToastContext';
import { useButtonLoading } from '../../../hooks/useButtonLoading';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const { addToCart, getCartItemsCount } = useCart();
  const { showToast } = useToast();
  const { isLoading, withLoading } = useButtonLoading();

  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [categoryId]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const fetchCategoryAndProducts = async () => {
    try {
      // Fetch category details
      const categoryResponse = await fetch(`${API_URL}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (categoryResponse.ok) {
        const categories = await categoryResponse.json();
        const currentCategory = categories.find(cat => cat.id === parseInt(categoryId));
        setCategory(currentCategory);
      } else {
        showToast('Failed to fetch categories', 'error');
      }

      // Fetch products for this category
      const productsResponse = await fetch(`${API_URL}/products/category/${categoryId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData);
        setFilteredProducts(productsData);
      } else {
        showToast('Failed to fetch products', 'error');
      }
    } catch (error) {
      showToast('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-orange-500 shadow-lg animate-spin mb-4">
            <img src="/rathna-logo.jpg" alt="RATHNA Logo" className="w-full h-full object-cover" />
          </div>
          <p className="text-orange-800 font-semibold text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-rose-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-red-500 shadow-lg mb-4">
            <img src="/rathna-logo.jpg" alt="RATHNA Logo" className="w-full h-full object-cover" />
          </div>
          <p className="text-red-800 font-semibold text-lg">Category not found</p>
        </div>
      </div>
    );
  }

  const backgroundColor = category.color || '#FF6B35';

  return (
    <div className="min-h-screen" style={{background: `linear-gradient(135deg, ${backgroundColor}20, ${backgroundColor}10)`}}>
      <nav className="backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          {/* Mobile Layout */}
          <div className="flex md:hidden justify-between items-center mb-3">
            <h1 className="text-lg font-bold" style={{color: backgroundColor}}>
              {category.name}
            </h1>
            <button 
              onClick={() => window.history.back()}
              className="px-3 py-1 rounded-lg text-white text-sm font-semibold transition-all shadow-lg"
              style={{background: `linear-gradient(135deg, ${backgroundColor}, ${backgroundColor}dd)`}}
            >
              Back
            </button>
          </div>
          
          {/* Mobile Search */}
          <div className="md:hidden mb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex justify-between items-center">
            <h1 className="text-3xl font-bold" style={{color: backgroundColor}}>
              {category.name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-md mx-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowCart(true)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartItemsCount()}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setShowProfile(true)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <button 
                onClick={() => window.history.back()}
                className="px-4 py-2 rounded-xl text-white font-semibold transition-all shadow-lg"
                style={{background: `linear-gradient(135deg, ${backgroundColor}, ${backgroundColor}dd)`}}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </nav>

      {(category.bannerImageUrls && category.bannerImageUrls.length > 0) ? (
        <div className="relative h-32 sm:h-64 overflow-hidden">
          <div className="flex transition-transform duration-500 ease-in-out" style={{transform: `translateX(-${currentBannerIndex * 100}%)`}}>
            {category.bannerImageUrls.map((bannerUrl, index) => (
              <div key={index} className="w-full flex-shrink-0 relative">
                <img 
                  src={bannerUrl.startsWith('http') ? bannerUrl : `${API_URL.replace('/api', '')}${bannerUrl}`} 
                  alt={`${category.name} banner ${index + 1}`} 
                  className="w-full h-32 sm:h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <h2 className="text-2xl sm:text-5xl font-bold text-white">{category.name}</h2>
                </div>
              </div>
            ))}
          </div>
          {category.bannerImageUrls.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentBannerIndex(prev => prev === 0 ? category.bannerImageUrls.length - 1 : prev - 1)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={() => setCurrentBannerIndex(prev => prev === category.bannerImageUrls.length - 1 ? 0 : prev + 1)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {category.bannerImageUrls.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBannerIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentBannerIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : category.bannerImageUrl && (
        <div className="relative h-32 sm:h-64 overflow-hidden">
          <img 
            src={category.bannerImageUrl.startsWith('http') ? category.bannerImageUrl : `${API_URL.replace('/api', '')}${category.bannerImageUrl}`} 
            alt={category.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <h2 className="text-2xl sm:text-5xl font-bold text-white">{category.name}</h2>
          </div>
        </div>
      )}

      <div className="px-3 sm:px-6 py-4 sm:py-8 pb-20 md:pb-8">
        <div className="mb-4 sm:mb-8">
          <p className="text-sm sm:text-xl text-gray-700 mb-2 sm:mb-4">{category.description}</p>
        </div>

        <h3 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6" style={{color: backgroundColor}}>
          {searchTerm ? `Search Results (${filteredProducts.length})` : `Products (${products.length})`}
        </h3>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg sm:text-xl text-gray-600">
              {searchTerm ? `No products found for "${searchTerm}"` : 'No products found in this category'}
            </p>
          </div>
        ) : (
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
                      onClick={(event) => {
                        event.stopPropagation();
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 py-2">
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="flex flex-col items-center py-2 px-1"
          >
            <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs text-gray-600">Home</span>
          </button>
          <button 
            onClick={() => window.location.href = '/orders'}
            className="flex flex-col items-center py-2 px-1"
          >
            <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs text-gray-600">Orders</span>
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
            onClick={() => setShowProfile(true)}
            className="flex flex-col items-center py-2 px-1"
          >
            <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs text-gray-600">Profile</span>
          </button>
          <button 
            onClick={() => window.history.back()}
            className="flex flex-col items-center py-2 px-1"
          >
            <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-xs text-gray-600">Back</span>
          </button>
        </div>
      </div>
      
      {showCart && (
        <Cart onClose={() => setShowCart(false)} />
      )}
      
      {showProfile && (
        <Profile 
          user={JSON.parse(localStorage.getItem('user') || '{}')}
          onClose={() => setShowProfile(false)} 
        />
      )}
    </div>
  );
};

export default CategoryPage;