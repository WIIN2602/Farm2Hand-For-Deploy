import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { CheckoutModal } from './CheckoutModal';

export const CartSidebar: React.FC = () => {
  const { items, isOpen, total, itemCount, removeFromCart, updateQuantity, closeCart, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const shippingFee = total > 500 ? 0 : 50;
  const finalTotal = total + shippingFee;

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleCheckoutComplete = () => {
    setShowCheckout(false);
    clearCart();
    closeCart();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-beige">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-nature-green" />
            <h2 className="text-lg font-semibold text-nature-dark-green">
              ตะกร้าสินค้า ({itemCount})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-soft-beige/50 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-cool-gray" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <ShoppingBag className="w-16 h-16 text-cool-gray/30 mb-4" />
              <h3 className="text-lg font-semibold text-nature-dark-green mb-2">
                ตะกร้าว่างเปล่า
              </h3>
              <p className="text-cool-gray mb-4">
                เพิ่มสินค้าลงในตะกร้าเพื่อเริ่มการสั่งซื้อ
              </p>
              <button
                onClick={closeCart}
                className="px-6 py-3 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg font-medium transition-colors duration-200"
              >
                เลือกซื้อสินค้า
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-soft-beige/30 rounded-lg">
                  {/* Product Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-nature-dark-green text-sm truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-cool-gray mb-1">{item.farmer}</p>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-fresh-orange font-bold text-sm">
                        ฿{item.price}
                      </span>
                      <span className="text-xs text-cool-gray">/{item.unit}</span>
                      {item.organic && (
                        <span className="text-xs px-1 py-0.5 bg-nature-green text-white rounded">
                          ออร์แกนิค
                        </span>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center bg-white border border-border-beige rounded hover:bg-soft-beige/50 transition-colors duration-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="w-6 h-6 flex items-center justify-center bg-white border border-border-beige rounded hover:bg-soft-beige/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Stock Warning */}
                    {item.quantity >= item.maxStock && (
                      <p className="text-xs text-red-500 mt-1">
                        สินค้าคงเหลือ {item.maxStock} {item.unit}
                      </p>
                    )}
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-bold text-nature-dark-green">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border-beige p-4 bg-white">
            {/* Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>ราคาสินค้า</span>
                <span>฿{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>ค่าจัดส่ง</span>
                <span className={shippingFee === 0 ? 'text-nature-green' : ''}>
                  {shippingFee === 0 ? 'ฟรี' : `฿${shippingFee}`}
                </span>
              </div>
              {total < 500 && (
                <p className="text-xs text-cool-gray">
                  สั่งซื้อเพิ่ม ฿{(500 - total).toLocaleString()} เพื่อได้ส่งฟรี
                </p>
              )}
              <div className="border-t border-border-beige pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>รวมทั้งหมด</span>
                  <span className="text-fresh-orange">฿{finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg font-medium transition-colors duration-200"
              >
                <CreditCard className="w-4 h-4" />
                ดำเนินการสั่งซื้อ
              </button>
              
              <button
                onClick={clearCart}
                className="w-full px-4 py-2 border border-border-beige text-cool-gray hover:bg-soft-beige/30 rounded-lg font-medium transition-colors duration-200"
              >
                ล้างตะกร้า
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onComplete={handleCheckoutComplete}
        cartItems={items}
        total={finalTotal}
      />
    </>
  );
};