import { useState } from 'react';
import { API_URL } from '../../../config';
import { useCart } from '../../../context/CartContext';
import Checkout from './Checkout';
import { useButtonLoading } from '../../../hooks/useButtonLoading';

const Cart = ({ onClose }) => {
  const { cartItems, updateQuantity, clearCart, getCartTotal } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const { isLoading, withLoading } = useButtonLoading();

  const handleCheckout = withLoading('checkout', async () => {
    setShowCheckout(true);
  });

  const handleClearCart = withLoading('clearCart', async () => {
    clearCart();
  });

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="backdrop-blur-2xl bg-white/90 rounded-3xl border-2 border-white/60 shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-500 text-white hover:bg-gray-600 transition-all"
              >
                Close
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-96">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    {item.productImageUrl && (
                      <img 
                        src={item.productImageUrl.startsWith('http') ? item.productImageUrl : `${API_URL.replace('/api', '')}${item.productImageUrl}`}
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded-lg" 
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-gray-600">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={isLoading('updateQuantity')}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isLoading('updateQuantity')}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">Total: ₹{getCartTotal().toFixed(2)}</span>
                <button
                  onClick={handleClearCart}
                  disabled={isLoading('clearCart')}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading('clearCart') ? 'Clearing...' : 'Clear Cart'}
                </button>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={isLoading('checkout')}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading('checkout') ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showCheckout && (
        <Checkout onClose={() => setShowCheckout(false)} />
      )}
    </>
  );
};

export default Cart;