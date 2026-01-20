import { useState, useEffect } from 'react';
import { useCart } from '../../../context/CartContext';
import { useToast } from '../../../context/ToastContext';
import { API_URL } from '../../../config';
import OrderSuccess from './OrderSuccess';
import { useButtonLoading } from '../../../hooks/useButtonLoading';

const Checkout = ({ onClose }) => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const [step, setStep] = useState(1); // 1: Review, 2: Payment Method, 3: Payment/COD, 4: Transaction ID
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [upiId, setUpiId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [successOrderIds, setSuccessOrderIds] = useState([]);
  const { isLoading, withLoading } = useButtonLoading();

  const total = getCartTotal();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUpiDetails();
    generateQRCode();
  }, []);

  const fetchUpiDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/checkout/upi-details`);
      if (response.ok) {
        const data = await response.json();
        setUpiId(data.upiId);
      }
    } catch (error) {
      showToast('Error fetching UPI details', 'error');
    }
  };

  const generateQRCode = () => {
    const upiString = `upi://pay?pa=${upiId}&am=${total}&cu=INR&tn=RATHNA Products Payment`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
    setQrCodeUrl(qrUrl);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    showToast('UPI ID copied to clipboard!', 'success');
  };

  const processCheckout = withLoading('processCheckout', async () => {
    if (paymentMethod === 'UPI' && !transactionId.trim()) {
      showToast('Please enter transaction ID', 'error');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const checkoutData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: total,
        paymentMethod: paymentMethod,
        transactionId: paymentMethod === 'UPI' ? transactionId.trim() : null
      };

      const response = await fetch(`${API_URL}/checkout/process?userEmail=${encodeURIComponent(user?.email || '')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkoutData)
      });

      if (response.ok) {
        const result = await response.json();
        const orderIds = result.orderIds || [result.orderId];
        setSuccessOrderIds(orderIds);
        setShowOrderSuccess(true);
        clearCart();
      } else {
        const error = await response.json().catch(() => ({ message: 'Checkout failed' }));
        showToast('Error: ' + error.message, 'error');
      }
    } catch (error) {
      showToast('Error processing checkout: ' + error.message, 'error');
    }
  });

  if (showOrderSuccess) {
    return (
      <OrderSuccess 
        orderIds={successOrderIds} 
        onClose={() => {
          setShowOrderSuccess(false);
          onClose();
        }} 
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="backdrop-blur-2xl bg-white/95 rounded-3xl border-2 border-white/60 shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Checkout</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= stepNum ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && <div className={`w-12 h-1 ${step > stepNum ? 'bg-emerald-500' : 'bg-gray-300'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Order Review */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={isLoading('processCheckout')}
                className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Choose Payment Method
              </button>
            </div>
          )}

          {/* Step 2: Payment Method Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Choose Payment Method</h3>
              <div className="space-y-4">
                <div 
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'UPI' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      paymentMethod === 'UPI' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'UPI' && <div className="w-full h-full rounded-full bg-white scale-50"></div>}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">UPI Payment</h4>
                      <p className="text-gray-600 text-sm">Pay instantly using UPI apps like PhonePe, GPay, Paytm</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      paymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'COD' && <div className="w-full h-full rounded-full bg-white scale-50"></div>}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Cash on Delivery</h4>
                      <p className="text-gray-600 text-sm">Pay when your order is delivered</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  disabled={isLoading('processCheckout')}
                  className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(paymentMethod === 'UPI' ? 3 : 4)}
                  disabled={!paymentMethod || isLoading('processCheckout')}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: UPI Payment */}
          {step === 3 && paymentMethod === 'UPI' && (
            <div className="space-y-6 text-center">
              <h3 className="text-xl font-semibold mb-4">UPI Payment</h3>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl">
                <p className="text-lg font-semibold mb-4">Amount to Pay: ₹{total.toFixed(2)}</p>
                
                {/* QR Code */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-3">Scan QR Code to Pay</p>
                  <div className="flex justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="UPI QR Code" 
                      className="border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* UPI ID */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Or copy UPI ID</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="bg-white px-3 py-2 rounded-lg border text-sm">
                      {upiId}
                    </code>
                    <button
                      onClick={copyUpiId}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  After completing the payment, click "Payment Done" to enter transaction details.
                </p>
              </div>

              <button
                onClick={() => setStep(4)}
                disabled={isLoading('processCheckout')}
                className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Payment Done
              </button>
            </div>
          )}

          {/* Step 4: Transaction ID or COD Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              {paymentMethod === 'UPI' ? (
                <>
                  <h3 className="text-xl font-semibold mb-4">Enter Transaction Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction ID *
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter UPI transaction ID"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        You can find this in your payment app after successful payment
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-4">Confirm Cash on Delivery</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-yellow-600 text-2xl">💰</div>
                      <div>
                        <h4 className="font-semibold text-yellow-800">Cash on Delivery Selected</h4>
                        <p className="text-yellow-700 text-sm">You will pay ₹{total.toFixed(2)} when your order is delivered</p>
                      </div>
                    </div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Keep exact change ready</li>
                      <li>• Payment accepted in cash only</li>
                      <li>• Order will be confirmed after this step</li>
                    </ul>
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(paymentMethod === 'UPI' ? 3 : 2)}
                  disabled={isLoading('processCheckout')}
                  className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  onClick={processCheckout}
                  disabled={isLoading('processCheckout') || (paymentMethod === 'UPI' && !transactionId.trim())}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading('processCheckout') ? 'Processing...' : 'Complete Order'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;