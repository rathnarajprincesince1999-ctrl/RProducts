const Help = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="backdrop-blur-xl bg-white/40 border-b border-white/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()} className="text-blue-600 hover:text-blue-800">
              <svg className="w-6 h-6" viewBox="0 0 64 64" fill="none">
                <path d="M40 16L24 32l16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
              </svg>
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Help & Support
            </h1>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Contact Information */}
        <div className="backdrop-blur-2xl bg-white/60 rounded-3xl border-2 border-white/60 shadow-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">Contact Us</h2>
          <p className="text-center text-gray-700 mb-8">Need help? We're here to assist you!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phone Call */}
            <div className="text-center p-6 bg-white/50 rounded-2xl border border-white/60">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Call Us</h3>
              <a 
                href="tel:8248599487" 
                className="text-green-600 font-semibold text-lg hover:text-green-700 transition-colors"
              >
                8248599487
              </a>
              <p className="text-gray-600 text-sm mt-2">Available 24/7</p>
            </div>

            {/* WhatsApp */}
            <div className="text-center p-6 bg-white/50 rounded-2xl border border-white/60">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp</h3>
              <a 
                href="https://wa.me/918248599487" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 font-semibold text-lg hover:text-green-700 transition-colors"
              >
                8248599487
              </a>
              <p className="text-gray-600 text-sm mt-2">Quick support</p>
            </div>

            {/* Email */}
            <div className="text-center p-6 bg-white/50 rounded-2xl border border-white/60">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
              <a 
                href="mailto:rathnaraajsince1999@gmail.com" 
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors break-all"
              >
                rathnaraajsince1999@gmail.com
              </a>
              <p className="text-gray-600 text-sm mt-2">We'll respond within 24 hours</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="backdrop-blur-2xl bg-white/60 rounded-3xl border-2 border-white/60 shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white/50 rounded-xl p-6 border border-white/60">
              <h3 className="text-lg font-bold text-gray-900 mb-2">How do I place an order?</h3>
              <p className="text-gray-700">Browse products, add items to cart, and proceed to checkout. You can pay via UPI or choose Cash on Delivery.</p>
            </div>
            
            <div className="bg-white/50 rounded-xl p-6 border border-white/60">
              <h3 className="text-lg font-bold text-gray-900 mb-2">How can I track my order?</h3>
              <p className="text-gray-700">Go to Profile → Orders to view all your orders and their current status (Pending, Confirmed, Shipped, Delivered).</p>
            </div>
            
            <div className="bg-white/50 rounded-xl p-6 border border-white/60">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Can I cancel my order?</h3>
              <p className="text-gray-700">Yes, you can cancel orders before they are shipped. Go to Profile → Orders and click the Cancel button.</p>
            </div>
            
            <div className="bg-white/50 rounded-xl p-6 border border-white/60">
              <h3 className="text-lg font-bold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-700">We accept UPI payments (PhonePe, GPay, Paytm) and Cash on Delivery (COD).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;