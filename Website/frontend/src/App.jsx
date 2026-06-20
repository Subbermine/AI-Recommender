import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/ui/Toast';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-brand-brown border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Admin-only route wrapper
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-brand-brown border-t-transparent rounded-full animate-spin" /></div>;
  if (!user || !user.isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppLayout = () => (
  <div className="min-h-screen bg-brand-cream/50  flex flex-col transition-colors duration-300">
    <Header />
    <main className="flex-1 py-8">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
    <Footer />
  </div>
);

const App = () => (
  <Router>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <AppLayout />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </Router>
);

export default App;

