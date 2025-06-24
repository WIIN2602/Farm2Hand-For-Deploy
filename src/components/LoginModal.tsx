import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { LoginCredentials } from '../types/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
      onClose();
      setCredentials({ email: '', password: '' });
      // Navigate to products page after successful login
      navigate('/products');
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-beige">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-nature-green rounded-lg flex items-center justify-center shadow-md overflow-hidden p-1">
              <img 
                src="/farm2hand-logo.png" 
                alt="Farm2Hand Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-xl font-semibold text-nature-dark-green">เข้าสู่ระบบ</h2>
          </div>
          <button
            onClick={onClose}
            className="text-cool-gray hover:text-nature-dark-green p-1 hover:bg-soft-beige/50 rounded transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-nature-dark-green mb-2">
                อีเมล
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cool-gray" />
                <input
                  type="email"
                  id="email"
                  value={credentials.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                  placeholder="กรอกอีเมลของคุณ"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-nature-dark-green mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cool-gray" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                  placeholder="กรอกรหัสผ่านของคุณ"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cool-gray hover:text-nature-dark-green"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-nature-green hover:bg-nature-dark-green disabled:bg-cool-gray/30 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-cool-gray">
              ยังไม่มีบัญชี?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-nature-green hover:text-nature-dark-green font-medium hover:underline"
              >
                สมัครสมาชิก
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};