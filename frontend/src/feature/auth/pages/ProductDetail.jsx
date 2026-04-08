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
    <div className="min-h-screen transition-all duration-500 ease-in-out bg-gray-50" style={{background: `linear-gradient(135deg, ${product.cardColor || '#3B82F6'}08, ${product.cardColor || '#3B82F6'}04)`}}>
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
              <h1 className="text-lg font-bold text-gray-900">Product Details</h1>
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Product Details</h1>
            </div>
            <button onClick={handleLogout} className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Product Details - Mobile Optimized */}
      <div className="px-4 py-4 md:px-6 md:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Layout */}
          <div className="md:hidden space-y-4">
            {/* Product Image */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {product.productImageUrl ? (
                <img 
                  src={`https://rathnaproducts.store${product.productImageUrl}`} 
                  alt={product.name} 
                  className="w-full h-80 object-cover" 
                />
              ) : (
                <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-400">No Image</span>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Images */}
            {product.additionalImages && product.additionalImages.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">More Images</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.additionalImages.map((imageUrl, index) => (
                    <img 
                      key={index}
                      src={`https://rathnaproducts.store${imageUrl}`} 
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Product Info Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
              </div>
              
              {/* Price & Rating */}
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg text-gray-500 line-through">₹{product.originalPrice}</span>
                  )}
                  {product.unit && (
                    <span className="text-sm text-gray-500">per {product.unit}</span>
                  )}
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-sm font-semibold">
                    <span>4.2</span>
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">(1,234 reviews)</span>
                </div>
              </div>
              
              {/* Product Details */}
              <div className="space-y-2 text-sm">
                {product.categoryName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{product.categoryName}</span>
                  </div>
                )}
                {product.sellerName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seller:</span>
                    <span className="font-medium text-blue-600">{product.sellerName}</span>
                  </div>
                )}
                {product.stockQuantity !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stock:</span>
                    <span className={`font-medium ${
                      product.stockQuantity > 10 ? 'text-green-600' : 
                      product.stockQuantity > 0 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {product.stockQuantity > 0 ? `${product.stockQuantity} available` : 'Out of stock'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Return/Replacement Info */}
              {(product.returnable || product.replaceable) && (
                <div className="flex gap-2">
                  {product.returnable && (
                    <div className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      <span className="font-medium">{product.returnDays} Days Return</span>
                    </div>
                  )}
                  {product.replaceable && (
                    <div className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="font-medium">{product.replacementDays} Days Replace</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isLoading('addToCart') || product.stockQuantity === 0}
                  className="w-full py-3 rounded-xl text-white font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={product.stockQuantity > 0 ? {
                    background: `linear-gradient(135deg, ${product.cardColor || '#3B82F6'}, ${product.cardColor || '#3B82F6'}dd)`
                  } : {background: '#9CA3AF'}}
                >
                  {isLoading('addToCart') ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Adding to Cart...
                    </div>
                  ) : product.stockQuantity === 0 ? (
                    'Out of Stock'
                  ) : (
                    'Add to Cart'
                  )}
                </button>
                <button
                  onClick={buyNow}
                  disabled={isLoading('buyNow') || product.stockQuantity === 0}
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading('buyNow') ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : product.stockQuantity === 0 ? (
                    'Out of Stock'
                  ) : (
                    'Buy Now'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              {product.productImageUrl ? (
                <img 
                  src={`https://rathnaproducts.store${product.productImageUrl}`} 
                  alt={product.name} 
                  className="w-full h-96 object-cover rounded-lg" 
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-400">No Image</span>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Images */}
            {product.additionalImages && product.additionalImages.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">More Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {product.additionalImages.map((imageUrl, index) => (
                    <img 
                      key={index}
                      src={`https://rathnaproducts.store${imageUrl}`} 
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Product Info */}
            <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                <p className="text-gray-700 text-lg leading-relaxed">{product.description}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-bold text-green-600">₹{product.price}</span>
                  {product.unit && (
                    <span className="text-lg text-gray-600">per {product.unit}</span>
                  )}
                </div>
                
                {product.categoryName && (
                  <p className="text-lg text-gray-600">Category: <span className="font-semibold">{product.categoryName}</span></p>
                )}
                
                {product.sellerName && (
                  <p className="text-lg text-purple-600">Seller: <span className="font-semibold">{product.sellerName}</span></p>
                )}
                
                {product.stockQuantity !== undefined && (
                  <p className="text-lg text-blue-600">Stock: <span className="font-semibold">{product.stockQuantity}</span></p>
                )}
              </div>

              {/* Return/Replacement Info */}
              {(product.returnable || product.replaceable) && (
                <div className="flex gap-4">
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
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
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
                  className="flex-1 px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading('buyNow') ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section - Enhanced */}
      {relatedProducts.length > 0 && (
        <div className="px-4 py-6 md:px-6 md:py-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {relatedProducts.map((relatedProduct) => (
                <div 
                  key={relatedProduct.id} 
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
                  onClick={() => window.location.href = `/product/${relatedProduct.id}`}
                  style={{
                    background: `linear-gradient(135deg, ${relatedProduct.cardColor || '#3B82F6'}08, ${relatedProduct.cardColor || '#3B82F6'}04)`,
                    borderColor: `${relatedProduct.cardColor || '#3B82F6'}20`
                  }}
                >
                  <div className="aspect-square p-3 relative">
                    {relatedProduct.productImageUrl ? (
                      <img 
                        src={`https://rathnaproducts.store${relatedProduct.productImageUrl}`}
                        alt={relatedProduct.name} 
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-8 h-8 mx-auto text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-3 pt-0 space-y-2">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight min-h-[2.5rem]">{relatedProduct.name}</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">₹{relatedProduct.price}</span>
                      {relatedProduct.unit && (
                        <span className="text-xs text-gray-500">/{relatedProduct.unit}</span>
                      )}
                    </div>
                    
                    {/* Rating */}
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
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        withLoading(`addRelated-${relatedProduct.id}`, async () => {
                          addToCart(relatedProduct);
                          showToast('Added to cart!', 'success');
                        })();
                      }}
                      disabled={isLoading(`addRelated-${relatedProduct.id}`)}
                      className="w-full px-3 py-2 text-white text-sm font-semibold rounded-lg transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      style={{background: `linear-gradient(135deg, ${relatedProduct.cardColor || '#3B82F6'}, ${relatedProduct.cardColor || '#3B82F6'}dd)`}}
                    >
                      {isLoading(`addRelated-${relatedProduct.id}`) ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Adding...
                        </div>
                      ) : (
                        'Add to Cart'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;