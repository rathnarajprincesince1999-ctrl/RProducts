import { useState } from 'react';
import { authService } from '../service/authService';
import { useButtonLoading } from '../../../hooks/useButtonLoading';

const SignupModal = ({ isOpen, onClose, onSwitchToLogin, onSwitchToForgotPassword }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, withLoading } = useButtonLoading();

  if (!isOpen) return null;

  const handleSubmit = withLoading('signup', async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      alert('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    try {
      const response = await authService.signup(formData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      window.location.href = '/dashboard';
    } catch (error) {
      alert('Signup failed: ' + error.message);
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="relative backdrop-blur-2xl bg-gradient-to-br from-purple-50/80 to-pink-50/60 p-10 rounded-[2rem] border-2 border-white/60 shadow-[0_20px_60px_rgba(168,85,247,0.3)] w-full max-w-md animate-[scale_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-purple-900 hover:text-purple-600 text-2xl font-bold">✕</button>
        <h2 className="text-4xl font-bold text-purple-900 mb-8 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Name"
            className="w-full px-5 py-3 rounded-xl backdrop-blur-sm bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 text-purple-900"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-5 py-3 rounded-xl backdrop-blur-sm bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 text-purple-900"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 6 characters)"
              className="w-full px-5 py-3 pr-12 rounded-xl backdrop-blur-sm bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 text-purple-900"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              minLength={6}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600 hover:text-purple-800"
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
          <button type="submit" disabled={isLoading('signup')} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading('signup') ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <div className="text-center mt-6 space-y-2">
          <p className="text-purple-700">
            Already have an account? <button onClick={() => { onClose(); onSwitchToLogin(); }} className="font-bold hover:underline">Login</button>
          </p>
          <p className="text-purple-700">
            <button onClick={() => { onClose(); onSwitchToForgotPassword(); }} className="text-sm hover:underline">Forgot Password?</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;
