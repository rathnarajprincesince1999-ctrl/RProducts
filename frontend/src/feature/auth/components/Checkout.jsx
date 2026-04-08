import { useState, useEffect } from 'react';
import { useCart } from '../../../context/CartContext';
import { useToast } from '../../../context/ToastContext';
import { API_URL } from '../../../config';
import OrderSuccess from './OrderSuccess';
import { useButtonLoading } from '../../../hooks/useButtonLoading';

const Checkout = ({ onClose }) => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const [step, setStep] = useState(1); // 1: Review, 2: Mode Selection, 3: Shipping Details, 4: Payment Method, 5: Payment/COD, 6: Transaction ID
  const [checkoutMode, setCheckoutMode] = useState(''); // 'simple' or 'express'
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [upiId, setUpiId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [successOrderIds, setSuccessOrderIds] = useState([]);
  const [shippingDetails, setShippingDetails] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    landmark: '',
    addressType: 'HOME'
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const { isLoading, withLoading } = useButtonLoading();

  const total = getCartTotal();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUpiDetails();
    generateQRCode();
    fetchSavedAddresses();
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

  const fetchSavedAddresses = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.email) {
        const response = await fetch(`${API_URL}/user-addresses/user?userEmail=${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const addresses = await response.json();
          setSavedAddresses(addresses);
          // Auto-select default address
          const defaultAddr = addresses.find(addr => addr.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id.toString());
            setShippingDetails({
              address: defaultAddr.addressLine,
              city: defaultAddr.city,
              state: defaultAddr.state,
              pincode: defaultAddr.pincode,
              phone: defaultAddr.phone,
              landmark: defaultAddr.landmark || '',
              addressType: defaultAddr.addressType || 'HOME'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    if (addressId === 'new') {
      setShippingDetails({
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        landmark: '',
        addressType: 'HOME'
      });
    } else {
      const selectedAddr = savedAddresses.find(addr => addr.id.toString() === addressId);
      if (selectedAddr) {
        setShippingDetails({
          address: selectedAddr.addressLine,
          city: selectedAddr.city,
          state: selectedAddr.state,
          pincode: selectedAddr.pincode,
          phone: selectedAddr.phone,
          landmark: selectedAddr.landmark || '',
          addressType: selectedAddr.addressType || 'HOME'
        });
      }
    }
  };

  const saveNewAddress = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${API_URL}/user-addresses/save?userEmail=${encodeURIComponent(user.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          addressLine: shippingDetails.address,
          city: shippingDetails.city,
          state: shippingDetails.state,
          pincode: shippingDetails.pincode,
          phone: shippingDetails.phone,
          landmark: shippingDetails.landmark,
          addressType: shippingDetails.addressType,
          isDefault: savedAddresses.length === 0 // First address is default
        })
      });
      if (response.ok) {
        fetchSavedAddresses();
        showToast('Address saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      showToast('Error saving address', 'error');
    }
  };
  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    showToast('UPI ID copied to clipboard!', 'success');
  };

  const generateQRCode = () => {
    const upiString = `upi://pay?pa=${upiId}&am=${total}&cu=INR&tn=RATHNA Products Payment`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
    setQrCodeUrl(qrUrl);
  };

  const processCheckout = withLoading('processCheckout', async () => {
    if (paymentMethod === 'UPI' && !transactionId.trim()) {
      showToast('Please enter transaction ID', 'error');
      return;
    }
    
    // Validate transaction ID format for UPI
    if (paymentMethod === 'UPI') {
      const transactionIdPattern = /^[A-Za-z0-9]{8,20}$/;
      if (!transactionIdPattern.test(transactionId.trim())) {
        showToast('Please enter a valid transaction ID (8-20 alphanumeric characters)', 'error');
        return;
      }
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.email) {
        showToast('User session expired. Please login again.', 'error');
        window.location.href = '/';
        return;
      }
      
      const checkoutData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: total,
        paymentMethod: paymentMethod,
        transactionId: paymentMethod === 'UPI' ? transactionId.trim() : null,
        shippingDetails: {
          address: shippingDetails.address,
          city: shippingDetails.city,
          state: shippingDetails.state,
          pincode: shippingDetails.pincode,
          phone: shippingDetails.phone,
          landmark: shippingDetails.landmark,
          addressType: shippingDetails.addressType
        },
        mode: checkoutMode // Add mode to checkout data
      };

      const endpoint = checkoutMode === 'express' ? 
        `${API_URL}/checkout/express?userEmail=${encodeURIComponent(user?.email || '')}` :
        `${API_URL}/checkout/process?userEmail=${encodeURIComponent(user?.email || '')}`;

      const response = await fetch(endpoint, {
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
        showToast('Error: ' + (error.error || error.message), 'error');
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
            {[1, 2, 3, 4, 5, 6].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= stepNum ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 6 && <div className={`w-12 h-1 ${step > stepNum ? 'bg-emerald-500' : 'bg-gray-300'}`} />}
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
                🚀 Choose Shipping Mode
              </button>
            </div>
          )}

          {/* Step 2: Mode Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Choose Checkout Mode</h3>
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Choose how you want your order processed:</strong>
                </p>
              </div>
              <div className="space-y-4">
                <div 
                  onClick={() => setCheckoutMode('simple')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    checkoutMode === 'simple' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      checkoutMode === 'simple' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {checkoutMode === 'simple' && <div className="w-full h-full rounded-full bg-white scale-50"></div>}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">🛒 Simple Mode</h4>
                      <p className="text-gray-600 text-sm">Standard checkout process - Order placed and managed manually</p>
                      <p className="text-blue-600 text-xs mt-1">Admin approves → Seller ships → Manual tracking</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  onClick={() => setCheckoutMode('express')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    checkoutMode === 'express' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      checkoutMode === 'express' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                    }`}>
                      {checkoutMode === 'express' && <div className="w-full h-full rounded-full bg-white scale-50"></div>}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">🚀 Express Mode</h4>
                      <p className="text-gray-600 text-sm">Fast shipping with Automated Shiprocket processing</p>
                      <p className="text-emerald-600 text-xs mt-1">Auto-shipped with tracking → Faster delivery</p>
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
                  onClick={() => setStep(3)}
                  disabled={!checkoutMode || isLoading('processCheckout')}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Shipping Details */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Delivery Address</h3>
              
              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-3">📍 Select Saved Address</h4>
                  <div className="space-y-2">
                    {savedAddresses.map((addr) => (
                      <div key={addr.id} className="flex items-start gap-3">
                        <input
                          type="radio"
                          id={`addr-${addr.id}`}
                          name="address"
                          value={addr.id}
                          checked={selectedAddressId === addr.id.toString()}
                          onChange={(e) => handleAddressSelect(e.target.value)}
                          className="mt-1"
                        />
                        <label htmlFor={`addr-${addr.id}`} className="flex-1 cursor-pointer">
                          <div className="text-sm font-medium">{addr.addressType} {addr.isDefault && '(Default)'}</div>
                          <div className="text-sm text-gray-600">
                            {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                          </div>
                          <div className="text-xs text-gray-500">Phone: {addr.phone}</div>
                        </label>
                      </div>
                    ))}
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="addr-new"
                        name="address"
                        value="new"
                        checked={selectedAddressId === 'new'}
                        onChange={(e) => handleAddressSelect(e.target.value)}
                      />
                      <label htmlFor="addr-new" className="text-sm font-medium text-blue-600 cursor-pointer">
                        + Add New Address
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Form */}
              {(savedAddresses.length === 0 || selectedAddressId === 'new') && (
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-green-800 mb-3">🏠 Delivery Address</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Type *</label>
                        <select
                          value={shippingDetails.addressType}
                          onChange={(e) => setShippingDetails({...shippingDetails, addressType: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="HOME">Home</option>
                          <option value="OFFICE">Office</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          pattern="[0-9]{10}"
                          value={shippingDetails.phone}
                          onChange={(e) => setShippingDetails({...shippingDetails, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="9876543210"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
                      <textarea
                        value={shippingDetails.address}
                        onChange={(e) => setShippingDetails({...shippingDetails, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 h-20"
                        placeholder="House/Flat No., Street, Area"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                      <input
                        type="text"
                        value={shippingDetails.landmark}
                        onChange={(e) => setShippingDetails({...shippingDetails, landmark: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Near Metro Station, Mall, etc."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input
                          type="text"
                          value={shippingDetails.city}
                          onChange={(e) => setShippingDetails({...shippingDetails, city: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Mumbai"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                        <input
                          type="text"
                          value={shippingDetails.state}
                          onChange={(e) => setShippingDetails({...shippingDetails, state: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Maharashtra"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                        <input
                          type="text"
                          pattern="[0-9]{6}"
                          value={shippingDetails.pincode}
                          onChange={(e) => setShippingDetails({...shippingDetails, pincode: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="400001"
                          required
                        />
                      </div>
                    </div>
                    {selectedAddressId === 'new' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="saveAddr"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                        />
                        <label htmlFor="saveAddr" className="text-sm text-gray-700">Save this address for future orders</label>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  disabled={isLoading('processCheckout')}
                  className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  onClick={async () => {
                    const { address, city, state, pincode, phone } = shippingDetails;
                    if (!address || !city || !state || !pincode || !phone) {
                      showToast('Please fill all delivery details', 'error');
                      return;
                    }
                    if (!/^[0-9]{6}$/.test(pincode)) {
                      showToast('Please enter valid 6-digit pincode', 'error');
                      return;
                    }
                    if (!/^[0-9]{10}$/.test(phone)) {
                      showToast('Please enter valid 10-digit phone number', 'error');
                      return;
                    }
                    
                    // Save address if requested
                    if (selectedAddressId === 'new' && saveAddress) {
                      await saveNewAddress();
                    }
                    
                    setStep(4);
                  }}
                  disabled={isLoading('processCheckout')}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Choose Payment Method
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Payment Method Selection */}
          {step === 4 && (
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
                  onClick={() => setStep(3)}
                  disabled={isLoading('processCheckout')}
                  className="flex-1 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(paymentMethod === 'UPI' ? 5 : 6)}
                  disabled={!paymentMethod || isLoading('processCheckout')}
                  className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 5: UPI Payment */}
          {step === 5 && paymentMethod === 'UPI' && (
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
                onClick={() => setStep(6)}
                disabled={isLoading('processCheckout')}
                className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Payment Done
              </button>
            </div>
          )}

          {/* Step 6: Transaction ID or COD Confirmation */}
          {step === 6 && (
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
                  onClick={() => setStep(paymentMethod === 'UPI' ? 5 : 4)}
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