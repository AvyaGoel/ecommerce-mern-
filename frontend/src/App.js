import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/products/ProductsPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/orders/CheckoutPage';
import OrderSuccessPage from './pages/orders/OrderSuccessPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProfilePage from './pages/user/ProfilePage';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (user) return <Navigate to="/" replace />;
  return children;
};

function AppContent() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e1e2a', color: '#f0f0f8', border: '1px solid #2a2a3a' },
        success: { iconTheme: { primary: '#10b981', secondary: '#1e1e2a' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#1e1e2a' } },
      }} />
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Main Routes */}
        <Route path="*" element={
          <>
            <Navbar />
            <div className="page-wrapper">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
                <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Footer />
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
