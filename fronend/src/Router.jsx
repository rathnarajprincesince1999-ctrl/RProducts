import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserPreHome from './App';
import UserHome from './feature/auth/pages/UserHome';
import AdminHome from './feature/auth/pages/AdminHome';
import AdminCategories from './feature/auth/pages/AdminCategories';
import AdminProducts from './feature/auth/pages/AdminProducts';
import AdminUsers from './feature/auth/pages/AdminUsers';
import AdminSellers from './feature/auth/pages/AdminSellers';
import AdminOrders from './feature/auth/pages/AdminOrders';
import AdminRevenue from './feature/auth/pages/AdminRevenue';
import AdminReturns from './feature/auth/pages/AdminReturns';
import SellerHome from './feature/auth/pages/SellerHome';
import SellerProducts from './feature/auth/pages/SellerProducts';
import SellerOrders from './feature/auth/pages/SellerOrders';
import SellerRevenue from './feature/auth/pages/SellerRevenue';
import SellerReturns from './feature/auth/pages/SellerReturns';
import UserProducts from './feature/auth/pages/UserProducts';
import ProductDetail from './feature/auth/pages/ProductDetail';
import CheckoutPage from './feature/auth/pages/CheckoutPage';
import CategoryPage from './feature/auth/pages/CategoryPage';
import UserReturns from './feature/auth/pages/UserReturns';
import ProtectedRoute from './components/ProtectedRoute';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserPreHome />} />
        <Route path="/dashboard" element={<ProtectedRoute><UserHome /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><UserProducts /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><UserReturns /></ProtectedRoute>} />
        <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminHome /></ProtectedRoute>} />
        <Route path="/admin/home" element={<ProtectedRoute requiredRole="admin"><AdminHome /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute requiredRole="admin"><AdminCategories /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute requiredRole="admin"><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/sellers" element={<ProtectedRoute requiredRole="admin"><AdminSellers /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute requiredRole="admin"><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/revenue" element={<ProtectedRoute requiredRole="admin"><AdminRevenue /></ProtectedRoute>} />
        <Route path="/admin/returns" element={<ProtectedRoute requiredRole="admin"><AdminReturns /></ProtectedRoute>} />
        <Route path="/seller" element={<ProtectedRoute requiredRole="seller"><SellerHome /></ProtectedRoute>} />
        <Route path="/seller/products" element={<ProtectedRoute requiredRole="seller"><SellerProducts /></ProtectedRoute>} />
        <Route path="/seller/orders" element={<ProtectedRoute requiredRole="seller"><SellerOrders /></ProtectedRoute>} />
        <Route path="/seller/revenue" element={<ProtectedRoute requiredRole="seller"><SellerRevenue /></ProtectedRoute>} />
        <Route path="/seller/returns" element={<ProtectedRoute requiredRole="seller"><SellerReturns /></ProtectedRoute>} />
        <Route path="/category/:categoryId" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
        <Route path="/returns" element={<ProtectedRoute><UserReturns /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
