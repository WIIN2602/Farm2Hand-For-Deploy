import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogIn, LogOut, ChevronDown, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CartButton } from './CartButton';
import { LoginModal } from './LoginModal';
import { RegisterModal } from './RegisterModal';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const navItems = [
    {
      path: '/products',
      label: 'Products',
      icon: Package,
      requireAuth: false
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: User,
      requireAuth: true
    }
  ];

  return (
    <>
      <nav className="bg-nature-dark-green border-b border-nature-green/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md overflow-hidden p-1">
                <img 
                  src="/farm2hand-logo.png" 
                  alt="Farm2Hand Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl font-semibold text-white">Farm2Hand</h1>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {/* Main Navigation Items */}
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path || 
                                (location.pathname === '/' && item.path === '/profile');
                
                if (item.requireAuth && !isAuthenticated) return null;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-nature-green text-white'
                        : 'text-white/80 hover:text-white hover:bg-nature-green/20'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Cart Button - Only show for customers */}
              {isAuthenticated && user?.role === 'customer' && <CartButton />}

              {/* Authentication Section */}
              {!isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-nature-green/20 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    <LogIn className="w-4 h-4" />
                    เข้าสู่ระบบ
                  </button>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-nature-green hover:bg-nature-green/80 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    สมัครสมาชิก
                  </button>
                </div>
              ) : (
                <>
                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white hover:bg-nature-green/20 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20">
                        {user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-white m-1" />
                        )}
                      </div>
                      <span className="hidden sm:block">{user?.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-border-beige py-1 z-50">
                        <div className="px-4 py-2 border-b border-border-beige">
                          <p className="text-sm font-medium text-nature-dark-green">{user?.name}</p>
                          <p className="text-xs text-cool-gray">{user?.email}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                            user?.role === 'farmer' 
                              ? 'bg-nature-green/10 text-nature-dark-green' 
                              : 'bg-fresh-orange/10 text-nature-brown'
                          }`}>
                            {user?.role === 'farmer' ? 'เกษตรกร' : 'ลูกค้า'}
                          </span>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          ออกจากระบบ
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
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

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};