import { useState, useEffect } from 'react';
import SignupModal from './feature/auth/component/SignupModal';
import LoginModal from './feature/auth/component/LoginModal';
import AdminModal from './feature/auth/component/AdminModal';
import SellerModal from './feature/auth/component/SellerModal';
import ForgotPasswordModal from './feature/auth/component/ForgotPasswordModal';
import SignupWarningModal from './feature/auth/component/SignupWarningModal';

const UserPreHome = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSeller, setShowSeller] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSignupWarning, setShowSignupWarning] = useState(false);

  useEffect(() => {
    const handleOpenAdminModal = () => {
      setShowAdmin(true);
    };
    window.addEventListener('openAdminModal', handleOpenAdminModal);
    return () => window.removeEventListener('openAdminModal', handleOpenAdminModal);
  }, []);

  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-hidden">
      <div className="absolute top-6 left-6 w-20 h-20 rounded-full overflow-hidden border-4 border-white/60 shadow-xl backdrop-blur-sm bg-white/40 animate-spin" style={{animationDuration: '20s'}}>
        <img src="/rathna-logo.jpg" alt="RATHNA Logo" className="w-full h-full object-cover" />
      </div>
      
      <button 
        className="absolute bottom-6 left-6 z-50 w-16 h-16 rounded-full backdrop-blur-lg bg-gradient-to-br from-green-100/60 to-emerald-100/40 border-2 border-white/60 shadow-[0_8px_24px_rgba(34,197,94,0.3)] hover:shadow-[0_12px_32px_rgba(34,197,94,0.5)] transition-all duration-300 hover:scale-110 flex items-center justify-center group cursor-pointer"
        onClick={() => setShowSeller(true)}
      >
        <svg className="w-8 h-8 transition-transform group-hover:rotate-180 duration-500" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" fill="url(#sellerGrad)" opacity="0.3"/>
          <path d="M20 24h24v16H20z" stroke="url(#sellerGrad2)" strokeWidth="3" fill="none"/>
          <path d="M28 24v-4c0-2.2 1.8-4 4-4s4 1.8 4 4v4" stroke="url(#sellerGrad2)" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="32" cy="32" r="2" fill="url(#sellerGrad2)"/>
          <defs>
            <linearGradient id="sellerGrad" x1="0" y1="0" x2="64" y2="64">
              <stop offset="0%" stopColor="#22c55e"/>
              <stop offset="100%" stopColor="#16a34a"/>
            </linearGradient>
            <linearGradient id="sellerGrad2" x1="0" y1="0" x2="64" y2="64">
              <stop offset="0%" stopColor="#16a34a"/>
              <stop offset="100%" stopColor="#15803d"/>
            </linearGradient>
          </defs>
        </svg>
      </button>
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(5,150,105,0.1),transparent_50%)]" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000" />
      
      <svg className="absolute top-[10%] left-[15%] w-12 h-12 opacity-20 animate-[fall_15s_linear_infinite]" viewBox="0 0 64 64">
        <path d="M32 8L40 24L56 28L44 40L48 56L32 48L16 56L20 40L8 28L24 24Z" fill="#10b981" stroke="#059669" strokeWidth="2"/>
      </svg>
      <svg className="absolute top-[5%] right-[20%] w-10 h-10 opacity-15 animate-[fall_18s_linear_infinite_2s]" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="20" fill="none" stroke="#14b8a6" strokeWidth="3" strokeDasharray="8 4"/>
        <circle cx="32" cy="32" r="8" fill="#0d9488"/>
      </svg>
      <svg className="absolute top-[15%] left-[70%] w-14 h-14 opacity-20 animate-[fall_20s_linear_infinite_4s]" viewBox="0 0 64 64">
        <path d="M32 12 L44 28 L60 32 L44 36 L32 52 L20 36 L4 32 L20 28 Z" fill="#a855f7" opacity="0.6"/>
      </svg>
      <svg className="absolute top-[8%] left-[45%] w-11 h-11 opacity-18 animate-[fall_16s_linear_infinite_1s]" viewBox="0 0 64 64">
        <rect x="20" y="20" width="24" height="24" rx="4" fill="none" stroke="#3b82f6" strokeWidth="3"/>
        <circle cx="32" cy="32" r="6" fill="#2563eb"/>
      </svg>
      <svg className="absolute top-[12%] right-[40%] w-13 h-13 opacity-17 animate-[fall_22s_linear_infinite_3s]" viewBox="0 0 64 64">
        <path d="M32 16 Q40 24 32 32 Q24 24 32 16 M32 32 Q40 40 32 48 Q24 40 32 32" fill="#ec4899" stroke="#db2777" strokeWidth="2"/>
      </svg>
      <svg className="absolute top-[6%] left-[25%] w-12 h-12 opacity-16 animate-[fall_19s_linear_infinite_5s]" viewBox="0 0 64 64">
        <polygon points="32,12 42,28 58,32 42,36 32,52 22,36 6,32 22,28" fill="none" stroke="#06b6d4" strokeWidth="2.5"/>
      </svg>
      
      <div className="relative z-10 flex flex-col items-center gap-16">
        <div className="backdrop-blur-xl bg-gradient-to-br from-white/40 to-white/20 px-4 md:px-10 py-3 md:py-5 rounded-2xl md:rounded-3xl border-2 border-white/50 shadow-[0_8px_32px_rgba(16,185,129,0.15)] flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white/60 shadow-lg backdrop-blur-sm bg-white/40 animate-spin flex-shrink-0" style={{animationDuration: '15s'}}>
            <img src="/rathna-logo.jpg" alt="RATHNA Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent drop-shadow-sm">
            RATHNA Product<span 
              className="cursor-pointer hover:scale-110 transition-transform duration-300 inline-block"
              onClick={() => setShowAdmin(true)}
            >s</span>
          </h1>
        </div>
        
        {/* Inspirational Quotes Section */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="backdrop-blur-lg bg-gradient-to-br from-emerald-50/80 to-green-50/60 p-6 rounded-2xl border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-emerald-600 mb-3">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p className="text-emerald-800 text-center font-medium text-sm leading-relaxed">
                "Nourish your body with nature's gifts. Every healthy choice today creates a vibrant tomorrow."
              </p>
              <div className="text-center mt-3 text-xs text-emerald-600 font-semibold">- RATHNA Wellness</div>
            </div>
            
            <div className="backdrop-blur-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/60 p-6 rounded-2xl border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-teal-600 mb-3">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-teal-800 text-center font-medium text-sm leading-relaxed">
                "Sustainable living starts with conscious choices. Choose products that love you and the planet."
              </p>
              <div className="text-center mt-3 text-xs text-teal-600 font-semibold">- RATHNA Earth</div>
            </div>
            
            <div className="backdrop-blur-lg bg-gradient-to-br from-blue-50/80 to-indigo-50/60 p-6 rounded-2xl border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 md:col-span-2 lg:col-span-1">
              <div className="text-blue-600 mb-3">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-blue-800 text-center font-medium text-sm leading-relaxed">
                "Live longer, live better. Quality products for a quality life that spans generations."
              </p>
              <div className="text-center mt-3 text-xs text-blue-600 font-semibold">- RATHNA Life</div>
            </div>
          </div>
          
          {/* Main Tagline */}
          <div className="mt-8 text-center">
            <div className="backdrop-blur-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 px-8 py-4 rounded-full border border-emerald-200/50 shadow-lg">
              <p className="text-emerald-800 font-bold text-lg md:text-xl">
                🌱 "Empowering Sustainable Living for Future Generations" 🌱
              </p>
              <p className="text-emerald-700 text-sm mt-2 font-medium">
                Where Health Meets Sustainability - Your Journey to Longevity Starts Here
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-row gap-3 md:gap-10 px-4 md:px-0">
          <div 
            className="group relative backdrop-blur-2xl bg-gradient-to-br from-cyan-50/40 via-emerald-50/30 to-teal-50/40 p-4 md:p-14 rounded-xl md:rounded-[2rem] border-2 border-white/60 shadow-[0_20px_60px_rgba(6,182,212,0.15)] cursor-pointer transition-all duration-500 hover:shadow-[0_25px_70px_rgba(6,182,212,0.25)] hover:-translate-y-3 text-center flex-1 md:min-w-[280px]"
            onClick={() => setShowSignupWarning(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/20 via-emerald-100/15 to-transparent rounded-xl md:rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <svg className="relative w-8 h-8 md:w-20 md:h-20 mx-auto mb-2 md:mb-6 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 drop-shadow-lg" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" fill="url(#signupGrad)" opacity="0.3"/>
              <path d="M32 16v32M16 32h32" stroke="url(#signupGrad2)" strokeWidth="4" strokeLinecap="round"/>
              <circle cx="32" cy="32" r="24" stroke="url(#signupGrad2)" strokeWidth="3" strokeDasharray="4 4"/>
              <defs>
                <linearGradient id="signupGrad" x1="0" y1="0" x2="64" y2="64">
                  <stop offset="0%" stopColor="#06b6d4"/>
                  <stop offset="50%" stopColor="#10b981"/>
                  <stop offset="100%" stopColor="#14b8a6"/>
                </linearGradient>
                <linearGradient id="signupGrad2" x1="0" y1="0" x2="64" y2="64">
                  <stop offset="0%" stopColor="#0891b2"/>
                  <stop offset="50%" stopColor="#059669"/>
                  <stop offset="100%" stopColor="#0d9488"/>
                </linearGradient>
              </defs>
            </svg>
            <h2 className="relative text-lg md:text-4xl font-bold text-cyan-900 mb-1 md:mb-4">Sign Up</h2>
            <p className="relative text-cyan-700 font-semibold text-xs md:text-lg">Create account</p>
          </div>
          <div 
            className="group relative backdrop-blur-2xl bg-gradient-to-br from-cyan-50/40 via-emerald-50/30 to-teal-50/40 p-4 md:p-14 rounded-xl md:rounded-[2rem] border-2 border-white/60 shadow-[0_20px_60px_rgba(6,182,212,0.15)] cursor-pointer transition-all duration-500 hover:shadow-[0_25px_70px_rgba(6,182,212,0.25)] hover:-translate-y-3 text-center flex-1 md:min-w-[280px]"
            onClick={() => setShowLogin(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/20 via-emerald-100/15 to-transparent rounded-xl md:rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <svg className="relative w-8 h-8 md:w-20 md:h-20 mx-auto mb-2 md:mb-6 transition-transform duration-500 group-hover:scale-110 drop-shadow-lg" viewBox="0 0 64 64" fill="none">
              <rect x="20" y="28" width="24" height="20" rx="2" fill="url(#loginGrad)" opacity="0.3"/>
              <rect x="20" y="28" width="24" height="20" rx="2" stroke="url(#loginGrad2)" strokeWidth="3"/>
              <path d="M26 28V20c0-3.3 2.7-6 6-6s6 2.7 6 6v8" stroke="url(#loginGrad2)" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="32" cy="38" r="3" fill="url(#loginGrad2)"/>
              <path d="M32 41v4" stroke="url(#loginGrad2)" strokeWidth="2" strokeLinecap="round"/>
              <defs>
                <linearGradient id="loginGrad" x1="0" y1="0" x2="64" y2="64">
                  <stop offset="0%" stopColor="#06b6d4"/>
                  <stop offset="50%" stopColor="#10b981"/>
                  <stop offset="100%" stopColor="#14b8a6"/>
                </linearGradient>
                <linearGradient id="loginGrad2" x1="0" y1="0" x2="64" y2="64">
                  <stop offset="0%" stopColor="#0891b2"/>
                  <stop offset="50%" stopColor="#059669"/>
                  <stop offset="100%" stopColor="#0d9488"/>
                </linearGradient>
              </defs>
            </svg>
            <h2 className="relative text-lg md:text-4xl font-bold text-cyan-900 mb-1 md:mb-4">Login</h2>
            <p className="relative text-cyan-700 font-semibold text-xs md:text-lg">Access account</p>
          </div>
        </div>
      </div>

      <SignupWarningModal 
        isOpen={showSignupWarning} 
        onClose={() => setShowSignupWarning(false)} 
        onConfirm={() => { setShowSignupWarning(false); setShowSignup(true); }}
      />
      <SignupModal 
        isOpen={showSignup} 
        onClose={() => setShowSignup(false)} 
        onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }}
        onSwitchToForgotPassword={() => { setShowSignup(false); setShowForgotPassword(true); }}
      />
      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        onSwitchToSignup={() => { setShowLogin(false); setShowSignup(true); }}
        onSwitchToForgotPassword={() => { setShowLogin(false); setShowForgotPassword(true); }}
      />
      <ForgotPasswordModal 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
        onSwitchToLogin={() => { setShowForgotPassword(false); setShowLogin(true); }}
      />
      <AdminModal isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
      <SellerModal isOpen={showSeller} onClose={() => setShowSeller(false)} />
    </div>
  );
};

export default UserPreHome;
