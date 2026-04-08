import { useEffect, useState } from 'react';

const OrderSuccess = ({ orderIds, onClose }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="backdrop-blur-2xl bg-white/95 rounded-3xl border-2 border-white/60 shadow-2xl max-w-md w-full mx-4 p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600">Thank you for your purchase</p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Order Details</h3>
          <div className="space-y-1">
            {orderIds.map((orderId, index) => (
              <p key={orderId} className="text-sm text-gray-600">
                Order #{orderId}
              </p>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            You can track your order(s) in the Profile → Orders section
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
          >
            Continue Shopping
          </button>
          <p className="text-xs text-gray-500">
            Auto-closing in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;