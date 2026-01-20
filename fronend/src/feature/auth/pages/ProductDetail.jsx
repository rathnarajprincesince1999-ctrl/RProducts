import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../../../config';
import { useToast } from '../../../context/ToastContext';
import { useCart } from '../../../context/CartContext';
import { useButtonLoading } from '../../../hooks/useButtonLoading';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const { isLoading, withLoading } = useButtonLoading();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  const fetchRelatedProducts = async () => {
    try {
      let response;
      if (product?.category?.id) {
        // Try to get products from same category first
        response = await fetch(`${API_URL}/products/category/${product.category.id}`);
        if (response.ok) {
          const data = await response.json();
          const filtered = data.filter(p => p.id !== parseInt(id));
          if (filtered.length > 0) {
            setRelatedProducts(filtered.slice(0, 10));
            return;
          }
        }
      }
      
      // If no category products, get all products
      response = await fetch(`${API_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        const filtered = data.filter(p => p.id !== parseInt(id)).slice(0, 10);
        setRelatedProducts(filtered);
      }
    } catch (error) {
      showToast('Error loading related products', 'error');
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        showToast('Product not found', 'error');
      }
    } catch (error) {
      showToast('Error loading product details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = withLoading('addToCart', async () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    showToast('Added to cart!', 'success');
  });

  const buyNow = withLoading('buyNow', async () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    window.location.href = '/checkout';
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-purple-500 shadow-lg animate-spin mb-4">
            <img src="/rathna-logo.jpg" alt="RATHNA Logo" className="w-full h-full object-cover" />
          </div>
          <p className="text-purple-800 font-semibold text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-rose-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-red-500 shadow-lg mb-4">
            <img src="/rathna-logo.jpg" alt="RATHNA Logo" className="w-full h-full object-cover" />
          </div>
          <p className="text-red-800 font-semibold text-lg">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: `linear-gradient(135deg, ${product.cardColor || '#3B82F6'}20, ${product.cardColor || '#3B82F6'}10)`}}>
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
              Product Details
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="backdrop-blur-2xl bg-white/60 p-8 rounded-3xl border-2 border-white/60 shadow-2xl">
            {product.productImageUrl ? (
              <img 
                src={product.productImageUrl.startsWith('http') ? product.productImageUrl : `${API_URL.replace('/api', '')}${product.productImageUrl}`} 
                alt={product.name} 
                className="w-full h-96 object-cover rounded-2xl" 
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-2xl flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="backdrop-blur-2xl bg-white/60 p-8 rounded-3xl border-2 border-white/60 shadow-2xl">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">{product.name}</h1>
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">{product.description}</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-green-600">₹{product.price}</span>
                {product.unit && (
                  <span className="text-lg text-blue-600">per {product.unit}</span>
                )}
              </div>
              
              {product.category?.name && (
                <p className="text-lg text-gray-600">Category: <span className="font-semibold">{product.category.name}</span></p>
              )}
              
              {product.seller?.name && (
                <p className="text-lg text-purple-600">Seller: <span className="font-semibold">{product.seller.name}</span></p>
              )}
            </div>

            {/* Return/Replacement Info */}
            <div className="flex gap-4 mb-8">
              {product.returnable && (
                <div className="px-4 py-2 bg-green-100 text-green-800 rounded-xl">
                  <span className="font-semibold">{product.returnDays} Days Return</span>
                </div>
              )}
              {product.replaceable && (
                <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl">
                  <span className="font-semibold">{product.replacementDays} Days Replacement</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-lg font-semibold text-gray-700">Quantity:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="w-16 text-center text-xl font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isLoading('addToCart')}
                className="flex-1 px-8 py-4 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{background: `linear-gradient(135deg, ${product.cardColor || '#3B82F6'}, ${product.cardColor || '#3B82F6'}dd)`}}
              >
                {isLoading('addToCart') ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={buyNow}
                disabled={isLoading('buyNow')}
                className="flex-1 px-8 py-4 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{background: `linear-gradient(135deg, ${product.cardColor || '#3B82F6'}, ${product.cardColor || '#3B82F6'}aa)`}}
              >
                {isLoading('buyNow') ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-3xl font-bold mb-6" style={{color: product.cardColor || '#3B82F6'}}>You May Also Like</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
            {relatedProducts.map((relatedProduct) => (
              <div 
                key={relatedProduct.id} 
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex-shrink-0 w-48"
                onClick={() => window.location.href = `/product/${relatedProduct.id}`}
                style={{background: `linear-gradient(135deg, ${relatedProduct.cardColor || '#3B82F6'}20, ${relatedProduct.cardColor || '#3B82F6'}10)`}}
              >
                <div className="aspect-square p-2">
                  {relatedProduct.productImageUrl ? (
                    <img 
                      src={relatedProduct.productImageUrl.startsWith('http') ? relatedProduct.productImageUrl : `${API_URL.replace('/api', '')}${relatedProduct.productImageUrl}`}
                      alt={relatedProduct.name} 
                      className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-3 pt-0">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{relatedProduct.name}</h4>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-lg font-bold text-gray-900">₹{relatedProduct.price}</span>
                    {relatedProduct.unit && (
                      <span className="text-xs text-gray-500">/{relatedProduct.unit}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-1">{relatedProduct.description}</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      withLoading(`addRelated-${relatedProduct.id}`, async () => {
                        addToCart(relatedProduct);
                        showToast('Added to cart!', 'success');
                      })();
                    }}
                    disabled={isLoading(`addRelated-${relatedProduct.id}`)}
                    className="w-full px-2 py-1 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{background: `linear-gradient(135deg, ${relatedProduct.cardColor || '#3B82F6'}, ${relatedProduct.cardColor || '#3B82F6'}dd)`}}
                  >
                    {isLoading(`addRelated-${relatedProduct.id}`) ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;