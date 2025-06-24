import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Navigation } from './components/Navigation';
import { ChatbotPopup } from './components/ChatbotPopup';
import { CartSidebar } from './components/CartSidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ChatbotPage } from './pages/ChatbotPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProductsPage } from './pages/ProductsPage';
import { HomePage } from './pages/HomePage';
import { useAuth } from './contexts/AuthContext';

// Component to handle authenticated user redirection
const AuthenticatedLanding: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // If user is authenticated, redirect to products page
  if (isAuthenticated) {
    return <Navigate to="/products" replace />;
  }
  
  // If not authenticated, show home page
  return <HomePage />;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gradient-to-br from-soft-beige to-light-beige">
          <Navigation />
          <Routes>
            <Route path="/" element={<AuthenticatedLanding />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route path="/chatbot" element={<ChatbotPage />} />
          </Routes>
          
          {/* Floating Chatbot - Available on all pages */}
          <ChatbotPopup />
          
          {/* Cart Sidebar */}
          <CartSidebar />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;