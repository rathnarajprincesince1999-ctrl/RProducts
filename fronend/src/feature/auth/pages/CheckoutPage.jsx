import { useCart } from '../../../context/CartContext';
import Checkout from '../components/Checkout';

const CheckoutPage = () => {
  const { cartItems } = useCart();

  const handleClose = () => {
    window.location.href = '/dashboard';
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No items in cart</h2>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Checkout onClose={handleClose} />
    </div>
  );
};

export default CheckoutPage;