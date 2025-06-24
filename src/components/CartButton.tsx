import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export const CartButton: React.FC = () => {
  const { itemCount, toggleCart } = useCart();

  return (
    <button
      onClick={toggleCart}
      className="relative flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-nature-green/20 rounded-lg text-sm font-medium transition-colors duration-200"
    >
      <div className="relative">
        <ShoppingCart className="w-5 h-5" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-fresh-orange text-white text-xs font-bold rounded-full flex items-center justify-center">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </div>
      <span className="hidden sm:block">ตะกร้า</span>
    </button>
  );
};