import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import { useToast } from '../../../context/ToastContext';
import { useCart } from '../../../context/CartContext';
import { useButtonLoading } from '../../../hooks/useButtonLoading';

const UserProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const { isLoading, withLoading } = useButtonLoading();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => window.location.href = '/dashboard'} className="text-blue-600 hover:text-blue-800">
              <svg className="w-6 h-6" viewBox="0 0 64 64" fill="none">
                <path d="M40 16L24 32l16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
              </svg>
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Products
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-blue-900">Browse Products</h2>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="backdrop-blur-2xl bg-white/60 p-6 rounded-3xl border-2 border-white/60 shadow-2xl cursor-pointer hover:shadow-3xl hover:scale-105 transition-all duration-300"
              onClick={() => window.location.href = `/product/${product.id}`}
              style={{background: `linear-gradient(135deg, ${product.cardColor || '#3B82F6'}20, ${product.cardColor || '#3B82F6'}10)`}}
            >
              {product.productImageUrl && (
                <img 
                  src={product.productImageUrl.startsWith('http') ? product.productImageUrl : `${API_URL.replace('/api', '')}${product.productImageUrl}`} 
                  alt={product.name} 
                  className="w-full h-48 object-cover rounded-2xl mb-4" 
                />
              )}
              <h3 className="text-xl font-bold text-blue-900 mb-2">{product.name}</h3>
              <p className="text-gray-700 mb-2 line-clamp-2">{product.description}</p>
              <p className="text-2xl font-bold text-green-600 mb-2">₹{product.price}</p>
              {product.unit && (
                <p className="text-sm text-blue-600 mb-2">Unit: {product.unit}</p>
              )}
              {product.category?.name && (
                <p className="text-sm text-gray-500 mb-2">Category: {product.category.name}</p>
              )}
              {product.seller?.name && (
                <p className="text-sm text-purple-600 mb-4">Seller: {product.seller.name}</p>
              )}
              
              <div className="flex gap-2 text-xs mb-4">
                {product.returnable && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    {product.returnDays}d Return
                  </span>
                )}
                {product.replaceable && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {product.replacementDays}d Replace
                  </span>
                )}
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  withLoading(`addToCart-${product.id}`, async () => {
                    addToCart(product);
                    showToast('Added to cart!', 'success');
                  })();
                }}
                disabled={isLoading(`addToCart-${product.id}`)}
                className="w-full px-4 py-2 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                style={{background: `linear-gradient(135deg, ${product.cardColor || '#3B82F6'}, ${product.cardColor || '#3B82F6'}dd)`}}
              >
                {isLoading(`addToCart-${product.id}`) ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProducts;