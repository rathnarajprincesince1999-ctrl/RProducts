import { useState } from 'react';
import { API_URL } from '../../../config';
import { useButtonLoading } from '../../../hooks/useButtonLoading';

const SellerModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [rememberDays, setRememberDays] = useState(7);
  const [showAdminPreLogin, setShowAdminPreLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const { isLoading, withLoading } = useButtonLoading();

  if (!isOpen) return null;

  const handleSubmit = withLoading('sellerLogin', async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/seller/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Invalid credentials' }));
        throw new Error(errorData.message || 'Invalid credentials');
      }
      
      const data = await response.json();
      
      if (rememberMe) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + rememberDays);
        localStorage.setItem('sellerTokenExpiry', expiryDate.toISOString());
        localStorage.setItem('rememberSellerLogin', 'true');
      }
      
      localStorage.setItem('sellerToken', data.token);
      localStorage.setItem('seller', JSON.stringify(data));
      window.location.href = '/seller';
    } catch (error) {
      console.error('Seller login error:', error);
      alert('Seller login failed: ' + error.message);
    }
  });

  const handleAdminEmailSubmit = withLoading('verifyEmail', async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/admin/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail })
      });
      const isValid = await response.json();
      if (isValid) {
        setShowAdminPreLogin(false);
        setAdminEmail('');
        onClose();
        // Open admin modal directly
        window.dispatchEvent(new CustomEvent('openAdminModal'));
      } else {
        alert('Invalid admin email');
      }
    } catch (error) {
      alert('Error verifying email');
    }
  });

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="relative backdrop-blur-2xl bg-gradient-to-br from-green-50/80 to-emerald-50/60 p-10 rounded-[2rem] border-2 border-white/60 shadow-[0_20px_60px_rgba(34,197,94,0.3)] w-full max-w-md animate-[scale_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-green-900 hover:text-green-600 text-2xl font-bold">✕</button>
        
        <h2 className="text-4xl font-bold text-green-900 mb-8 text-center">
          <span 
            className="cursor-pointer hover:scale-110 transition-transform duration-300 inline-block"
            onClick={() => setShowAdminPreLogin(true)}
          >S</span>eller Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Username"
            className="w-full px-5 py-3 rounded-xl backdrop-blur-sm bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 text-green-900"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-5 py-3 pr-12 rounded-xl backdrop-blur-sm bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 text-green-900"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-800"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sellerRememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2 rounded"
              />
              <label htmlFor="sellerRememberMe" className="text-green-700 text-sm">Remember me for</label>
              <select
                value={rememberDays}
                onChange={(e) => setRememberDays(parseInt(e.target.value))}
                disabled={!rememberMe}
                className="ml-2 px-2 py-1 rounded bg-white/50 border border-white/60 text-green-900 text-sm disabled:opacity-50"
              >
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={365}>365 days</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={isLoading('sellerLogin')} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading('sellerLogin') ? 'Logging in...' : 'Login as Seller'}
          </button>
        </form>
      </div>
    </div>

    {/* Admin Pre-Login Modal */}
    {showAdminPreLogin && (
      <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="relative backdrop-blur-2xl bg-gradient-to-br from-orange-50/90 to-red-50/70 p-8 rounded-2xl border-2 border-white/60 shadow-2xl w-full max-w-sm">
          <button 
            onClick={() => {setShowAdminPreLogin(false); setAdminEmail('');}}
            className="absolute top-3 right-3 text-orange-900 hover:text-orange-600 text-xl font-bold"
          >
            ✕
          </button>
          <h3 className="text-2xl font-bold text-orange-900 mb-6 text-center">Admin Access</h3>
          <form onSubmit={handleAdminEmailSubmit}>
            <input
              type="email"
              placeholder="Enter admin email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 mb-4"
              required
            />
            <button 
              type="submit"
              disabled={isLoading('verifyEmail')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading('verifyEmail') ? 'Verifying...' : 'Verify Access'}
            </button>
          </form>
        </div>
      </div>
    )}
    </>
  );
};

export default SellerModal;