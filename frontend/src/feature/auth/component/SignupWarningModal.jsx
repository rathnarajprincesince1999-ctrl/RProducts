import React from 'react';

const SignupWarningModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="relative backdrop-blur-2xl bg-gradient-to-br from-red-50/80 to-orange-50/60 p-8 rounded-[2rem] border-2 border-white/60 shadow-[0_20px_60px_rgba(239,68,68,0.3)] w-full max-w-md animate-[scale_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-900 mb-4">Important Notice</h2>
          <p className="text-red-800 mb-6 leading-relaxed">
            <strong>Note:</strong> Please remember your password and double-check it carefully, because we don't currently have an OTP verification system for password recovery.
          </p>
          <button 
            onClick={onConfirm}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold hover:from-red-600 hover:to-orange-600 transition-all shadow-lg"
          >
            OK, I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupWarningModal;