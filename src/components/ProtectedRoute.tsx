import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { RegisterModal } from './RegisterModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [showRegisterModal, setShowRegisterModal] = React.useState(false);

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-soft-beige to-light-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-nature-green rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden p-2 animate-pulse">
            <img 
              src="/farm2hand-logo.png" 
              alt="Farm2Hand Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-nature-dark-green">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-soft-beige to-light-beige flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg overflow-hidden p-3">
              <img 
                src="/farm2hand-logo.png" 
                alt="Farm2Hand Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-2xl font-semibold text-nature-dark-green mb-4">
              เข้าสู่ระบบเพื่อดำเนินการต่อ
            </h2>
            <p className="text-cool-gray mb-6">
              คุณต้องเข้าสู่ระบบก่อนเพื่อเข้าถึงหน้านี้
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-3 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg font-medium transition-colors duration-200"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-6 py-3 border border-nature-green text-nature-green hover:bg-nature-green hover:text-white rounded-lg font-medium transition-colors duration-200"
              >
                สมัครสมาชิก
              </button>
            </div>
          </div>
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={handleSwitchToRegister}
        />
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={handleSwitchToLogin}
        />
      </>
    );
  }

  return <>{children}</>;
};