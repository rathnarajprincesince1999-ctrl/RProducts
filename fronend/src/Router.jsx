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

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserPreHome />} />
        <Route path="/dashboard" element={<UserHome />} />
        <Route path="/products" element={<UserProducts />} />
        <Route path="/orders" element={<UserReturns />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/sellers" element={<AdminSellers />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/revenue" element={<AdminRevenue />} />
        <Route path="/admin/returns" element={<AdminReturns />} />
        <Route path="/seller" element={<SellerHome />} />
        <Route path="/seller/products" element={<SellerProducts />} />
        <Route path="/seller/orders" element={<SellerOrders />} />
        <Route path="/seller/revenue" element={<SellerRevenue />} />
        <Route path="/seller/returns" element={<SellerReturns />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/returns" element={<UserReturns />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
