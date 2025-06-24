import React, { useEffect, useState } from 'react';
import { CheckCircle, ShoppingCart, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface AddToCartPopupProps {
  isVisible: boolean;
  productName: string;
  productImage: string;
  onClose: () => void;
}

export const AddToCartPopup: React.FC<AddToCartPopupProps> = ({
  isVisible,
  productName,
  productImage,
  onClose
}) => {
  const { openCart } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleViewCart = () => {
    openCart();
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Popup */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className={`bg-white rounded-xl shadow-2xl border border-border-beige p-6 max-w-sm w-full mx-auto pointer-events-auto transform transition-all duration-300 ${
            isAnimating
              ? 'scale-100 opacity-100 translate-y-0'
              : 'scale-95 opacity-0 translate-y-4'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 text-cool-gray hover:text-nature-dark-green rounded-full hover:bg-soft-beige/50 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-nature-green rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              {/* Animated ring */}
              <div className="absolute inset-0 w-16 h-16 border-4 border-nature-green rounded-full animate-ping opacity-20"></div>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-nature-dark-green mb-2">
              เพิ่มสินค้าสำเร็จ!
            </h3>
            <p className="text-sm text-cool-gray">
              เพิ่ม "{productName}" ลงในตะกร้าแล้ว
            </p>
          </div>

          {/* Product Preview */}
          <div className="flex items-center gap-3 p-3 bg-soft-beige/30 rounded-lg mb-4">
            <img
              src={productImage}
              alt={productName}
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-nature-dark-green text-sm truncate">
                {productName}
              </p>
              <p className="text-xs text-cool-gray">
                เพิ่มในตะกร้าแล้ว
              </p>
            </div>
            <ShoppingCart className="w-5 h-5 text-nature-green" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-border-beige text-cool-gray hover:bg-soft-beige/30 rounded-lg font-medium transition-colors duration-200"
            >
              ซื้อต่อ
            </button>
            <button
              onClick={handleViewCart}
              className="flex-1 px-4 py-2 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              ดูตะกร้า
            </button>
          </div>

          {/* Auto close indicator */}
          <div className="mt-3 text-center">
            <p className="text-xs text-cool-gray/70">
              ปิดอัตโนมัติใน 3 วินาที
            </p>
            <div className="w-full bg-cool-gray/20 rounded-full h-1 mt-1">
              <div 
                className="bg-nature-green h-1 rounded-full transition-all duration-3000 ease-linear"
                style={{
                  width: isAnimating ? '0%' : '100%',
                  transition: isAnimating ? 'width 3s linear' : 'none'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};