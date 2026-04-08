import { useState } from 'react';
import { authService } from '../service/authService';
import { useToast } from '../../../context/ToastContext';
import { useButtonLoading } from '../../../hooks/useButtonLoading';

const ForgotPasswordModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [step, setStep] = useState(1); // 1: email, 2: token+password, 3: success
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();
  const { isLoading, withLoading } = useButtonLoading();

  if (!isOpen) return null;

  const handleEmailSubmit = withLoading('forgotPassword', async (e) => {
    e.preventDefault();
    try {
      await authService.forgotPassword({ email });
      setStep(2);
      showToast('Reset code sent to your email!', 'success');
    } catch (error) {
      showToast('Failed to send reset email: ' + error.message, 'error');
    }
  });

  const handlePasswordReset = withLoading('resetPassword', async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      await authService.resetPassword({ token, password });
      setStep(3);
      showToast('Password reset successfully!', 'success');
    } catch (error) {
      showToast('Failed to reset password: ' + error.message, 'error');
    }
  });

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setToken('');
    setPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={handleClose}>
      <div className="relative backdrop-blur-2xl bg-gradient-to-br from-orange-50/80 to-amber-50/60 p-10 rounded-[2rem] border-2 border-white/60 shadow-[0_20px_60px_rgba(251,146,60,0.3)] w-full max-w-md animate-[scale_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleClose} className="absolute top-4 right-4 text-orange-900 hover:text-orange-600 text-2xl font-bold">✕</button>
        
        {step === 1 && (
          <>
            <h2 className="text-4xl font-bold text-orange-900 mb-8 text-center">Forgot Password</h2>
            <p className="text-orange-700 text-center mb-6">Enter your email to receive a reset code.</p>
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-5 py-3 rounded-xl backdrop-blur-sm bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 text-orange-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button 
                type="submit" 
                disabled={isLoading('forgotPassword')} 
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading('forgotPassword') ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-4xl font-bold text-orange-900 mb-8 text-center">Reset Password</h2>
            <p className="text-orange-700 text-center mb-6">Enter the reset code and your new password.</p>
            <form onSubmit={handlePasswordReset} className="space-y-5">
              <input
                type="text"
                placeholder="Reset Code"
                className="w-full px-5 py-3 rounded-xl backdrop-blur-sm bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 text-orange-900"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password (min 6 characters)"
                  className="w-full px-5 py-3 pr-12 rounded-xl backdrop-blur-sm bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 text-orange-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-600 hover:text-orange-800"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full px-5 py-3 rounded-xl backdrop-blur-sm bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 text-orange-900"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
              <button 
                type="submit" 
                disabled={isLoading('resetPassword')} 
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading('resetPassword') ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-orange-900 mb-4">Password Reset!</h2>
            <p className="text-orange-700 mb-6">Your password has been successfully reset. You can now login with your new password.</p>
          </div>
        )}
        
        <p className="text-center mt-6 text-orange-700">
          Remember your password? <button onClick={() => { handleClose(); onSwitchToLogin(); }} className="font-bold hover:underline">Back to Login</button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;