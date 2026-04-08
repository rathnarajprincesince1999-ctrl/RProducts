import { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import { useToast } from '../../../context/ToastContext';

const OrderTracking = ({ orderId, onClose }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchTrackingData();
  }, [orderId]);

  const fetchTrackingData = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/track`);
      if (response.ok) {
        const data = await response.json();
        setTrackingData(data);
      } else {
        showToast('Unable to fetch tracking information', 'error');
      }
    } catch (error) {
      showToast('Error fetching tracking data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return '✅';
      case 'out for delivery': return '🚚';
      case 'in transit': return '📦';
      case 'picked up': return '📋';
      case 'shipped': return '🚀';
      default: return '⏳';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'out for delivery': return 'text-blue-600 bg-blue-50';
      case 'in transit': return 'text-purple-600 bg-purple-50';
      case 'picked up': return 'text-orange-600 bg-orange-50';
      case 'shipped': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-2xl bg-white/95 rounded-3xl border-2 border-white/60 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Track Order #{orderId}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading tracking information...</p>
            </div>
          ) : trackingData ? (
            <div className="space-y-6">
              {/* Current Status */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{getStatusIcon(trackingData.currentStatus)}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Current Status</h3>
                    <p className={`text-lg font-semibold px-3 py-1 rounded-full inline-block ${getStatusColor(trackingData.currentStatus)}`}>
                      {trackingData.currentStatus || 'Processing'}
                    </p>
                  </div>
                </div>
                
                {trackingData.awbCode && (
                  <div className="bg-white p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Tracking Number (AWB)</p>
                    <p className="font-mono text-lg font-bold text-blue-600">{trackingData.awbCode}</p>
                    {trackingData.courierName && (
                      <p className="text-sm text-gray-600 mt-1">Courier: {trackingData.courierName}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Shipping Details */}
              {trackingData.shippingDetails && (
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h4 className="font-bold text-gray-800 mb-3">📍 Delivery Address</h4>
                  <p className="text-gray-700">
                    {trackingData.shippingDetails.address}<br/>
                    {trackingData.shippingDetails.city}, {trackingData.shippingDetails.state} - {trackingData.shippingDetails.pincode}<br/>
                    Phone: {trackingData.shippingDetails.phone}
                  </p>
                </div>
              )}

              {/* Tracking Timeline */}
              {trackingData.trackingHistory && trackingData.trackingHistory.length > 0 && (
                <div className="bg-white border border-gray-200 p-6 rounded-2xl">
                  <h4 className="font-bold text-gray-800 mb-4">📋 Tracking History</h4>
                  <div className="space-y-4">
                    {trackingData.trackingHistory.map((event, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{event.status}</p>
                          <p className="text-sm text-gray-600">{event.location}</p>
                          <p className="text-xs text-gray-500">{new Date(event.date).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Express Mode Indicator */}
              {trackingData.isExpress && (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🚀</div>
                    <div>
                      <h4 className="font-bold text-emerald-800">Express Shipping</h4>
                      <p className="text-sm text-emerald-700">Your order is being processed with automated Shiprocket integration</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Estimated Delivery */}
              {trackingData.estimatedDelivery && (
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📅</div>
                    <div>
                      <h4 className="font-bold text-yellow-800">Estimated Delivery</h4>
                      <p className="text-yellow-700">{new Date(trackingData.estimatedDelivery).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Tracking Information Available</h3>
              <p className="text-gray-600">This order hasn't been shipped yet or tracking data is not available.</p>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;