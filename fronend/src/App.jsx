import { useState, useEffect } from 'react';
import SignupModal from './feature/auth/component/SignupModal';
import LoginModal from './feature/auth/component/LoginModal';
import AdminModal from './feature/auth/component/AdminModal';
import SellerModal from './feature/auth/component/SellerModal';

const UserPreHome = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSeller, setShowSeller] = useState(false);

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
        <div className="backdrop-blur-xl bg-gradient-to-br from-white/40 to-white/20 px-10 py-5 rounded-3xl border-2 border-white/50 shadow-[0_8px_32px_rgba(16,185,129,0.15)]">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent drop-shadow-sm">
            RATHNA Product<span 
              className="cursor-pointer hover:scale-110 transition-transform duration-300 inline-block"
              onClick={() => setShowAdmin(true)}
            >s</span>
          </h1>
        </div>
        
        <div className="flex gap-10">
          <div 
            className="group relative backdrop-blur-2xl bg-gradient-to-br from-purple-50/60 to-pink-50/40 p-14 rounded-[2rem] border-2 border-white/60 shadow-[0_20px_60px_rgba(168,85,247,0.2)] cursor-pointer transition-all duration-500 hover:shadow-[0_25px_70px_rgba(168,85,247,0.35)] hover:-translate-y-3 text-center min-w-[280px]"
            onClick={() => setShowSignup(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <svg className="relative w-20 h-20 mx-auto mb-6 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 drop-shadow-lg" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" fill="url(#signupGrad)" opacity="0.3"/>
              <path d="M32 16v32M16 32h32" stroke="url(#signupGrad2)" strokeWidth="4" strokeLinecap="round"/>
              <circle cx="32" cy="32" r="24" stroke="url(#signupGrad2)" strokeWidth="3" strokeDasharray="4 4"/>
              <defs>
                <linearGradient id="signupGrad" x1="0" y1="0" x2="64" y2="64">
                  <stop offset="0%" stopColor="#a855f7"/>
                  <stop offset="100%" stopColor="#9333ea"/>
                </linearGradient>
                <linearGradient id="signupGrad2" x1="0" y1="0" x2="64" y2="64">
                  <stop offset="0%" stopColor="#9333ea"/>
                  <stop offset="100%" stopColor="#7e22ce"/>
                </linearGradient>
              </defs>
            </svg>
            <h2 className="relative text-4xl font-bold text-purple-900 mb-4">Sign Up</h2>
            <p className="relative text-purple-700 font-semibold text-lg">Create a new account</p>
          </div>
          <div 
            className="group relative backdrop-blur-2xl bg-gradient-to-br from-blue-50/60 to-cyan-50/40 p-14 rounded-[2rem] border-2 border-white/60 shadow-[0_20px_60px_rgba(59,130,246,0.2)] cursor-pointer transition-all duration-500 hover:shadow-[0_25px_70px_rgba(59,130,246,0.35)] hover:-translate-y-3 text-center min-w-[280px]"
            onClick={() => setShowLogin(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <svg className="relative w-20 h-20 mx-auto mb-6 transition-transform duration-500 group-hover:scale-110 drop-shadow-lg" viewBox="0 0 64 64" fill="none">
              <rect x="20" y="28" width="24" height="20" rx="2" fill="url(#loginGrad)" opacity="0.3"/>
              <rect x="20" y="28" width="24" height="20" rx="2" stroke="url(#loginGrad2)" strokeWidth="3"/>
              <path d="M26 28V20c0-3.3 2.7-6 6-6s6 2.7 6 6v8" stroke="url(#loginGrad2)" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="32" cy="38" r="3" fill="url(#loginGrad2)"/>
              <path d="M32 41v4" stroke="url(#loginGrad2)" strokeWidth="2" strokeLinecap="round"/>
              <defs>
                <linearGradient id="loginGrad" x1="0" y1="0" x2="64" y2="64">
                  <stop offset="0%" stopColor="#3b82f6"/>
                  <stop offset="100%" stopColor="#2563eb"/>
                </linearGradient>
                <linearGradient id="loginGrad2" x1="0" y1="0" x2="64" y2="64">
                  <stop offset="0%" stopColor="#2563eb"/>
                  <stop offset="100%" stopColor="#1d4ed8"/>
                </linearGradient>
              </defs>
            </svg>
            <h2 className="relative text-4xl font-bold text-blue-900 mb-4">Login</h2>
            <p className="relative text-blue-700 font-semibold text-lg">Access your account</p>
          </div>
        </div>
      </div>

      <SignupModal 
        isOpen={showSignup} 
        onClose={() => setShowSignup(false)} 
        onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }}
      />
      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        onSwitchToSignup={() => { setShowLogin(false); setShowSignup(true); }}
      />
      <AdminModal isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
      <SellerModal isOpen={showSeller} onClose={() => setShowSeller(false)} />
    </div>
  );
};

export default UserPreHome;
