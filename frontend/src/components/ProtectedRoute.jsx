import { useEffect } from 'react';

const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
  useEffect(() => {
    const checkAuth = () => {
      let token, user;
      
      switch (requiredRole) {
        case 'admin':
          token = localStorage.getItem('adminToken');
          user = localStorage.getItem('admin');
          break;
        case 'seller':
          token = localStorage.getItem('sellerToken');
          user = localStorage.getItem('seller');
          break;
        default:
          token = localStorage.getItem('token');
          user = localStorage.getItem('user');
      }

      if (!token || !user) {
        localStorage.clear();
        window.location.href = '/';
        return;
      }

      // Validate token format
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.clear();
          window.location.href = '/';
          return;
        }
      } catch (error) {
        localStorage.clear();
        window.location.href = '/';
        return;
      }
    };

    checkAuth();
  }, [requiredRole]);

  return children;
};

export default ProtectedRoute;