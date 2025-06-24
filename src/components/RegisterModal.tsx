import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { RegisterData } from '../types/auth';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'customer',
    phone: '',
    location: '',
    farmName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      onClose();
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        role: 'customer',
        phone: '',
        location: '',
        farmName: '',
      });
      // Navigate to products page after successful registration
      navigate('/products');
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-beige sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-nature-green rounded-lg flex items-center justify-center shadow-md overflow-hidden p-1">
              <img 
                src="/farm2hand-logo.png" 
                alt="Farm2Hand Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-xl font-semibold text-nature-dark-green">สมัครสมาชิก</h2>
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
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-nature-dark-green mb-2">
                ประเภทผู้ใช้งาน
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('role', 'customer')}
                  className={`p-3 border rounded-lg text-center transition-all duration-200 ${
                    formData.role === 'customer'
                      ? 'border-nature-green bg-nature-green/10 text-nature-dark-green'
                      : 'border-border-beige hover:bg-soft-beige/30 text-cool-gray'
                  }`}
                >
                  <User className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">ลูกค้า</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('role', 'farmer')}
                  className={`p-3 border rounded-lg text-center transition-all duration-200 ${
                    formData.role === 'farmer'
                      ? 'border-nature-green bg-nature-green/10 text-nature-dark-green'
                      : 'border-border-beige hover:bg-soft-beige/30 text-cool-gray'
                  }`}
                >
                  <Briefcase className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">เกษตรกร</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-nature-dark-green mb-2">
                ชื่อ-นามสกุล
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cool-gray" />
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                  placeholder="กรอกชื่อ-นามสกุลของคุณ"
                  required
                />
              </div>
            </div>

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
                  value={formData.email}
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
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                  placeholder="กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-nature-dark-green mb-2">
                ยืนยันรหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cool-gray" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cool-gray hover:text-nature-dark-green"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-nature-dark-green mb-2">
                เบอร์โทรศัพท์ (ไม่บังคับ)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cool-gray" />
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                  placeholder="กรอกเบอร์โทรศัพท์"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-nature-dark-green mb-2">
                ที่อยู่ (ไม่บังคับ)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cool-gray" />
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                  placeholder="กรอกจังหวัด/อำเภอ"
                />
              </div>
            </div>

            {/* Farm Name (only for farmers) */}
            {formData.role === 'farmer' && (
              <div>
                <label htmlFor="farmName" className="block text-sm font-medium text-nature-dark-green mb-2">
                  ชื่อฟาร์ม (ไม่บังคับ)
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cool-gray" />
                  <input
                    type="text"
                    id="farmName"
                    value={formData.farmName}
                    onChange={(e) => handleInputChange('farmName', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green focus:border-transparent"
                    placeholder="กรอกชื่อฟาร์มของคุณ"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-nature-green hover:bg-nature-dark-green disabled:bg-cool-gray/30 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังสมัครสมาชิก...
                </>
              ) : (
                'สมัครสมาชิก'
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-cool-gray">
              มีบัญชีอยู่แล้ว?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-nature-green hover:text-nature-dark-green font-medium hover:underline"
              >
                เข้าสู่ระบบ
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};