import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import { useToast } from '../../../context/ToastContext';
import { useCart } from '../../../context/CartContext';
import { useButtonLoading } from '../../../hooks/useButtonLoading';
import { useBackgroundColor } from '../../../hooks/useBackgroundColor';

const UserProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const { isLoading, withLoading } = useButtonLoading();
  const { backgroundStyle, updateBackgroundColor, resetBackgroundColor } = useBackgroundColor();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        showToast('Failed to fetch products', 'error');
      }
    } catch (error) {
      showToast('Error loading products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      showToast('Error loading categories', 'error');
    }
  };

  const filteredProducts = selectedCategory 
    ? products.filter(product => product.categoryId === parseInt(selectedCategory))
    : products;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg animate-spin mb-4">
            <img src="/rathna-logo.jpg" alt="RATHNA Logo" className="w-full h-full object-cover" />
          </div>
          <p className="text-blue-800 font-semibold text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-all duration-500 ease-in-out" style={backgroundStyle}>
      {/* Mobile-First Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3">
          {/* Mobile Header */}
          <div className="flex md:hidden justify-between items-center">
            <div className="flex items-center gap-3">
              <button onClick={() => window.location.href = '/dashboard'} className="text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-bold text-gray-900">Products</h1>
            </div>
            <button onClick={handleLogout} className="text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
          
          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => window.location.href = '/dashboard'} className="text-blue-600 hover:text-blue-800">
                <svg className="w-6 h-6" viewBox="0 0 64 64" fill="none">
                  <path d="M40 16L24 32l16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Products</h1>
            </div>
            <button onClick={handleLogout} className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Category Filter - Mobile Optimized */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      {/* Products Grid - Enhanced Flipkart Style */}
      <div className="px-3 py-4 bg-gray-50 min-h-screen">
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto md:max-w-none md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={() => window.location.href = `/product/${product.id}`}
              onMouseEnter={() => updateBackgroundColor(product.cardColor || '#3B82F6')}
              onMouseLeave={resetBackgroundColor}
              onTouchStart={() => updateBackgroundColor(product.cardColor || '#3B82F6')}
              onTouchEnd={resetBackgroundColor}
              style={{
                background: `linear-gradient(135deg, ${product.cardColor || '#3B82F6'}08, ${product.cardColor || '#3B82F6'}04)`,
                borderColor: `${product.cardColor || '#3B82F6'}20`
              }}
            >
              {/* Product Image */}
              <div className="aspect-square p-3 relative">
                {product.productImageUrl ? (
                  <img 
                    src={`https://rathnaproducts.store${product.productImageUrl}`} 
                    alt={product.name} 
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center" style={{display: product.productImageUrl ? 'none' : 'flex'}}>
                  <div className="text-center">
                    <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                </div>
                
                {/* Discount Badge */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded-md font-semibold">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-3 pt-0 space-y-2">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight min-h-[2.5rem]">{product.name}</h3>
                
                {/* Price Section */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                    )}
                    {product.unit && (
                      <span className="text-xs text-gray-500">/{product.unit}</span>
                    )}
                  </div>
                </div>
                
                {/* Rating & Reviews */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1,2,3,4,5].map((star) => (
                        <svg key={star} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">(4.2)</span>
                  </div>
                </div>
                
                {/* Category & Stock */}
                <div className="space-y-1">
                  {product.categoryName && (
                    <div className="text-xs text-gray-500 truncate">{product.categoryName}</div>
                  )}
                  {product.stockQuantity !== undefined && (
                    <div className={`text-xs font-medium ${
                      product.stockQuantity > 10 ? 'text-green-600' : 
                      product.stockQuantity > 0 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                    </div>
                  )}
                </div>
                
                {/* Return/Replace Tags */}
                {(product.returnable || product.replaceable) && (
                  <div className="flex gap-1 flex-wrap">
                    {product.returnable && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        {product.returnDays}d Return
                      </span>
                    )}
                    {product.replaceable && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        {product.replacementDays}d Replace
                      </span>
                    )}
                  </div>
                )}
                
                {/* Add to Cart Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (product.stockQuantity > 0) {
                      withLoading(`addToCart-${product.id}`, async () => {
                        addToCart(product);
                        showToast('Added to cart!', 'success');
                      })();
                    }
                  }}
                  disabled={isLoading(`addToCart-${product.id}`) || product.stockQuantity === 0}
                  className={`w-full px-3 py-2 text-white text-sm font-semibold rounded-lg transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    product.stockQuantity === 0 ? 'bg-gray-400' : ''
                  }`}
                  style={product.stockQuantity > 0 ? {
                    background: `linear-gradient(135deg, ${product.cardColor || '#3B82F6'}, ${product.cardColor || '#3B82F6'}dd)`
                  } : {}}
                >
                  {isLoading(`addToCart-${product.id}`) ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Adding...
                    </div>
                  ) : product.stockQuantity === 0 ? (
                    'Out of Stock'
                  ) : (
                    'Add to Cart'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500 text-lg">No products found</p>
            <p className="text-gray-400 text-sm mt-1">Try changing your category filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProducts;