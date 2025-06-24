import React, { useState } from 'react';
import { ShoppingBag, Search, ShoppingCart, HelpCircle, Package, ArrowLeft, Star, MapPin, CreditCard, Truck, CheckCircle, Clock, AlertCircle, Plus, Minus, Trash2, Heart, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { productService, type Product } from '../services/productService';
import { orderService, type CreateOrderData } from '../services/orderService';
import type { ShippingInfo, PaymentMethodType } from '../types/cart';

interface RecommendedQuestionsProps {
  onQuestionClick: (question: string) => void;
}

const questions = [
  {
    text: 'ดูสินค้า',
    icon: ShoppingBag,
    color: 'bg-nature-green hover:bg-nature-dark-green'
  },
  {
    text: 'ค้นหาสินค้า',
    icon: Search,
    color: 'bg-fresh-orange hover:bg-fresh-orange-hover'
  },
  {
    text: 'สั่งซื้อ',
    icon: ShoppingCart,
    color: 'bg-nature-brown hover:bg-nature-brown/90'
  },
  {
    text: 'ถามวิธีซื้อ',
    icon: HelpCircle,
    color: 'bg-sun-yellow hover:bg-sun-yellow/90 text-nature-dark-green'
  },
  {
    text: 'ติดตามออเดอร์',
    icon: Package,
    color: 'bg-cool-gray hover:bg-cool-gray/90'
  }
];

const productCategories = [
  {
    emoji: '🥬',
    name: 'Fresh vegetables',
    description: 'ผักสดใหม่จากเกษตรกร'
  },
  {
    emoji: '🍌',
    name: 'Fruits',
    description: 'ผลไม้หวานฉ่ำ'
  },
  {
    emoji: '🌾',
    name: 'Rice',
    description: 'ข้าวคุณภาพดี'
  },
  {
    emoji: '🥚',
    name: 'Chicken eggs',
    description: 'ไข่ไก่สดใหม่'
  },
  {
    emoji: '❄️',
    name: 'Out-of-season products',
    description: 'สินค้านอกฤดูกาล'
  }
];

// Payment methods
const paymentMethods = [
  {
    id: 'credit_card',
    name: 'บัตรเครดิต/เดบิต',
    description: 'Visa, Mastercard, JCB',
    icon: CreditCard
  },
  {
    id: 'bank_transfer',
    name: 'โอนผ่านธนาคาร',
    description: 'ธนาคารไทยพาณิชย์, กสิกรไทย, กรุงเทพ',
    icon: () => (
      <div className="w-5 h-5 bg-nature-green rounded flex items-center justify-center">
        <span className="text-white text-xs font-bold">฿</span>
      </div>
    )
  },
  {
    id: 'cod',
    name: 'เก็บเงินปลายทาง',
    description: 'ชำระเมื่อได้รับสินค้า',
    icon: () => (
      <div className="w-5 h-5 bg-fresh-orange rounded flex items-center justify-center">
        <span className="text-white text-xs font-bold">$</span>
      </div>
    )
  }
];

export const RecommendedQuestions: React.FC<RecommendedQuestionsProps> = ({ onQuestionClick }) => {
  const { user, isAuthenticated } = useAuth();
  const { items: cartItems, addToCart, updateQuantity, removeFromCart, total: cartTotal } = useCart();
  
  const [showProducts, setShowProducts] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showCategoryProducts, setShowCategoryProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  
  // Product data
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Checkout data
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: user?.location || '',
    district: '',
    province: '',
    postalCode: '',
    notes: ''
  });
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [processingOrder, setProcessingOrder] = useState(false);

  // Load products when showing products
  const loadProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await productService.getAllProducts();
      setProducts(allProducts.slice(0, 6)); // Show first 6 products
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load products by category
  const loadCategoryProducts = async (category: string) => {
    setLoading(true);
    try {
      const categoryProductsData = await productService.getProductsByCategory(category);
      setCategoryProducts(categoryProductsData.slice(0, 6));
    } catch (error) {
      console.error('Failed to load category products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = (questionText: string) => {
    if (questionText === 'ดูสินค้า') {
      setShowProducts(true);
      setShowCategories(false);
      setShowCategoryProducts(false);
      setShowOrderSummary(false);
      setShowCheckout(false);
      setShowOrderSuccess(false);
      loadProducts();
    } else if (questionText === 'ค้นหาสินค้า') {
      setShowCategories(true);
      setShowProducts(false);
      setShowCategoryProducts(false);
      setShowOrderSummary(false);
      setShowCheckout(false);
      setShowOrderSuccess(false);
    } else if (questionText === 'สั่งซื้อ') {
      if (!isAuthenticated) {
        onQuestionClick('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
        return;
      }
      setShowOrderSummary(true);
      setShowProducts(false);
      setShowCategories(false);
      setShowCategoryProducts(false);
      setShowCheckout(false);
      setShowOrderSuccess(false);
    } else {
      onQuestionClick(questionText);
    }
  };

  const handleBackToQuestions = () => {
    setShowProducts(false);
    setShowCategories(false);
    setShowCategoryProducts(false);
    setShowOrderSummary(false);
    setShowCheckout(false);
    setShowOrderSuccess(false);
    setSelectedCategory('');
    setSelectedPaymentMethod('');
  };

  const handleBackToCategories = () => {
    setShowCategoryProducts(false);
    setShowCategories(true);
    setSelectedCategory('');
  };

  const handleBackToOrderSummary = () => {
    setShowCheckout(false);
    setShowOrderSummary(true);
  };

  const handleProductClick = (product: Product) => {
    if (!product.inStock) {
      onQuestionClick(`ขออภัย ${product.name} หมดสต็อกแล้ว`);
      return;
    }
    onQuestionClick(`ขอดูรายละเอียด${product.name} - ราคา ฿${product.price}/${product.unit} จาก ${product.farmer} (${product.location})`);
  };

  const handleCategoryClick = (category: typeof productCategories[0]) => {
    setSelectedCategory(category.name);
    setShowCategoryProducts(true);
    setShowCategories(false);
    loadCategoryProducts(category.name);
  };

  const handleAddToCart = (product: Product) => {
    if (!product.inStock) return;
    addToCart(product);
    onQuestionClick(`เพิ่ม ${product.name} ลงในตะกร้าแล้ว`);
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      onQuestionClick('ตะกร้าสินค้าว่างเปล่า กรุณาเลือกสินค้าก่อน');
      return;
    }
    if (!isAuthenticated) {
      onQuestionClick('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
      return;
    }
    setShowCheckout(true);
    setShowOrderSummary(false);
  };

  const handleShippingInfoChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirmOrder = async () => {
    if (!selectedPaymentMethod) {
      onQuestionClick('กรุณาเลือกวิธีการชำระเงิน');
      return;
    }

    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address) {
      onQuestionClick('กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วน');
      return;
    }

    if (!user) {
      onQuestionClick('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
      return;
    }

    setProcessingOrder(true);
    try {
      const orderData: CreateOrderData = {
        cartItems,
        shippingInfo,
        paymentMethod: selectedPaymentMethod as PaymentMethodType,
        notes: shippingInfo.notes
      };

      // Create order
      const order = await orderService.createOrder(user.id, orderData);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process payment
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await orderService.processPayment(order.id, user.id, transactionId);

      setOrderNumber(order.orderNumber);
      setShowOrderSuccess(true);
      setShowCheckout(false);
      
      // Clear cart after successful order
      cartItems.forEach(item => removeFromCart(item.id));
      
      onQuestionClick(`สั่งซื้อสำเร็จ! หมายเลขคำสั่งซื้อ: ${order.orderNumber}`);
      
    } catch (error) {
      console.error('Order failed:', error);
      onQuestionClick('เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setProcessingOrder(false);
    }
  };

  // Calculate totals
  const shippingFee = cartTotal > 500 ? 0 : 50;
  const finalTotal = cartTotal + shippingFee;

  // Show order success
  if (showOrderSuccess) {
    return (
      <div className="px-2 py-3">
        <div className="max-w-sm mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-border-beige p-6 text-center">
            <CheckCircle className="w-16 h-16 text-nature-green mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-nature-dark-green mb-2">
              สั่งซื้อสำเร็จ!
            </h3>
            <p className="text-sm text-cool-gray mb-4">
              ขอบคุณสำหรับการสั่งซื้อ
            </p>
            <div className="bg-nature-green/10 rounded-lg p-3 mb-4">
              <p className="text-xs text-nature-dark-green">
                หมายเลขคำสั่งซื้อ: <strong>{orderNumber}</strong>
              </p>
            </div>
            <button
              onClick={handleBackToQuestions}
              className="w-full px-4 py-2 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg font-medium transition-colors duration-200"
            >
              เสร็จสิ้น
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show checkout
  if (showCheckout) {
    return (
      <div className="px-2 py-3">
        <div className="max-w-sm mx-auto">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={handleBackToOrderSummary}
              className="flex items-center gap-1 px-2 py-1 text-nature-green hover:bg-nature-green/10 rounded text-xs transition-colors duration-200"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="font-medium">กลับ</span>
            </button>
            <h3 className="text-sm font-semibold text-nature-dark-green">
              ข้อมูลการจัดส่ง
            </h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-border-beige p-4 space-y-3">
            {/* Shipping Form */}
            <div>
              <label className="block text-xs font-medium text-nature-dark-green mb-1">
                ชื่อ-นามสกุล *
              </label>
              <input
                type="text"
                value={shippingInfo.fullName}
                onChange={(e) => handleShippingInfoChange('fullName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border-beige rounded focus:outline-none focus:ring-1 focus:ring-nature-green"
                placeholder="กรอกชื่อ-นามสกุล"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-nature-dark-green mb-1">
                เบอร์โทรศัพท์ *
              </label>
              <input
                type="tel"
                value={shippingInfo.phone}
                onChange={(e) => handleShippingInfoChange('phone', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border-beige rounded focus:outline-none focus:ring-1 focus:ring-nature-green"
                placeholder="กรอกเบอร์โทรศัพท์"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-nature-dark-green mb-1">
                ที่อยู่ *
              </label>
              <textarea
                value={shippingInfo.address}
                onChange={(e) => handleShippingInfoChange('address', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border-beige rounded focus:outline-none focus:ring-1 focus:ring-nature-green resize-none"
                rows={2}
                placeholder="กรอกที่อยู่"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-nature-dark-green mb-1">
                  อำเภอ/เขต
                </label>
                <input
                  type="text"
                  value={shippingInfo.district}
                  onChange={(e) => handleShippingInfoChange('district', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border-beige rounded focus:outline-none focus:ring-1 focus:ring-nature-green"
                  placeholder="อำเภอ/เขต"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-nature-dark-green mb-1">
                  จังหวัด
                </label>
                <input
                  type="text"
                  value={shippingInfo.province}
                  onChange={(e) => handleShippingInfoChange('province', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border-beige rounded focus:outline-none focus:ring-1 focus:ring-nature-green"
                  placeholder="จังหวัด"
                />
              </div>
            </div>

            {/* Payment Methods */}
            <div className="pt-3 border-t border-border-beige">
              <h4 className="text-xs font-medium text-nature-dark-green mb-2">วิธีการชำระเงิน</h4>
              <div className="space-y-2">
                {paymentMethods.slice(0, 2).map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-all duration-200 ${
                        selectedPaymentMethod === method.id
                          ? 'border-nature-green bg-nature-green/10'
                          : 'border-border-beige hover:bg-soft-beige/30'
                      }`}
                    >
                      <IconComponent />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-nature-dark-green text-xs truncate">{method.name}</p>
                        <p className="text-xs text-cool-gray truncate">{method.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Total */}
            <div className="pt-3 border-t border-border-beige">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>ราคาสินค้า</span>
                  <span>฿{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าจัดส่ง</span>
                  <span>{shippingFee === 0 ? 'ฟรี' : `฿${shippingFee}`}</span>
                </div>
                <div className="border-t border-border-beige pt-1">
                  <div className="flex justify-between font-semibold">
                    <span>รวมทั้งหมด</span>
                    <span className="text-fresh-orange">฿{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmOrder}
              disabled={processingOrder || !selectedPaymentMethod}
              className={`w-full px-4 py-2 rounded font-medium text-xs transition-colors duration-200 ${
                processingOrder || !selectedPaymentMethod
                  ? 'bg-cool-gray/30 text-cool-gray cursor-not-allowed'
                  : 'bg-nature-green hover:bg-nature-dark-green text-white'
              }`}
            >
              {processingOrder ? 'กำลังดำเนินการ...' : 'ยืนยันการสั่งซื้อ'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show order summary
  if (showOrderSummary) {
    if (cartItems.length === 0) {
      return (
        <div className="px-2 py-3">
          <div className="max-w-sm mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={handleBackToQuestions}
                className="flex items-center gap-1 px-2 py-1 text-nature-green hover:bg-nature-green/10 rounded text-xs transition-colors duration-200"
              >
                <ArrowLeft className="w-3 h-3" />
                <span className="font-medium">กลับ</span>
              </button>
              <h3 className="text-sm font-semibold text-nature-dark-green">
                ตะกร้าสินค้า
              </h3>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-border-beige p-4 text-center">
              <ShoppingCart className="w-8 h-8 text-cool-gray/50 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-nature-dark-green mb-1">
                ตะกร้าว่างเปล่า
              </h4>
              <p className="text-xs text-cool-gray mb-3">
                ยังไม่มีสินค้าในตะกร้า
              </p>
              <button
                onClick={() => handleQuestionClick('ดูสินค้า')}
                className="px-4 py-2 bg-nature-green hover:bg-nature-dark-green text-white rounded text-xs font-medium transition-colors duration-200"
              >
                เลือกซื้อสินค้า
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="px-2 py-3">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={handleBackToQuestions}
              className="flex items-center gap-1 px-2 py-1 text-nature-green hover:bg-nature-green/10 rounded text-xs transition-colors duration-200"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="font-medium">กลับ</span>
            </button>
            <h3 className="text-sm font-semibold text-nature-dark-green">
              ตะกร้าสินค้า ({cartItems.length})
            </h3>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-border-beige overflow-hidden">
            {/* Cart Items */}
            <div className="p-3 space-y-2">
              {cartItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-nature-dark-green text-xs truncate">{item.name}</h5>
                    <p className="text-xs text-cool-gray">
                      ฿{item.price} x {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-5 h-5 flex items-center justify-center bg-cool-gray/20 rounded text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="w-5 h-5 flex items-center justify-center bg-cool-gray/20 rounded text-xs disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-fresh-orange text-xs">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="border-t border-border-beige p-3 bg-soft-beige/30">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>ราคาสินค้า</span>
                  <span>฿{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าจัดส่ง</span>
                  <span>{shippingFee === 0 ? 'ฟรี' : `฿${shippingFee}`}</span>
                </div>
                <div className="border-t border-border-beige pt-1">
                  <div className="flex justify-between font-semibold">
                    <span>รวมทั้งหมด</span>
                    <span className="text-fresh-orange">฿{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="border-t border-border-beige p-3">
              <button
                onClick={handleProceedToCheckout}
                className="w-full px-4 py-2 bg-nature-green hover:bg-nature-dark-green text-white rounded font-medium text-xs transition-colors duration-200"
              >
                ดำเนินการสั่งซื้อ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show category-specific products
  if (showCategoryProducts && selectedCategory) {
    const categoryInfo = productCategories.find(cat => cat.name === selectedCategory);

    return (
      <div className="px-2 py-3">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={handleBackToCategories}
              className="flex items-center gap-1 px-2 py-1 text-nature-green hover:bg-nature-green/10 rounded text-xs transition-colors duration-200"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="font-medium">กลับ</span>
            </button>
            <div className="flex items-center gap-1">
              <span className="text-lg">{categoryInfo?.emoji}</span>
              <h3 className="text-sm font-semibold text-nature-dark-green">
                {categoryInfo?.description}
              </h3>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="text-xs text-cool-gray">กำลังโหลด...</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {categoryProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-border-beige overflow-hidden"
                >
                  <div className="relative h-20 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-red-500 px-2 py-1 rounded-full">
                          หมด
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-2">
                    <h4 className="font-semibold text-nature-dark-green mb-1 text-xs truncate">
                      {product.name}
                    </h4>
                    
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-fresh-orange">
                        ฿{product.price}
                      </span>
                      <span className="text-xs text-cool-gray">
                        /{product.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-sun-yellow text-sun-yellow" />
                      <span className="text-xs font-medium text-cool-gray">
                        {product.rating}
                      </span>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleProductClick(product)}
                        className="flex-1 px-2 py-1 border border-nature-green text-nature-green hover:bg-nature-green/10 rounded text-xs font-medium transition-colors duration-200"
                      >
                        ดูรายละเอียด
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className="px-2 py-1 bg-nature-green hover:bg-nature-dark-green disabled:bg-cool-gray/30 text-white rounded text-xs font-medium transition-colors duration-200"
                      >
                        <ShoppingCart className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show product categories
  if (showCategories) {
    return (
      <div className="px-2 py-3">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={handleBackToQuestions}
              className="flex items-center gap-1 px-2 py-1 text-nature-green hover:bg-nature-green/10 rounded text-xs transition-colors duration-200"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="font-medium">กลับ</span>
            </button>
            <h3 className="text-sm font-semibold text-nature-dark-green">
              หมวดหมู่สินค้า
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {productCategories.map((category, index) => (
              <div
                key={index}
                onClick={() => handleCategoryClick(category)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-border-beige overflow-hidden p-3"
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{category.emoji}</div>
                  <h4 className="font-semibold text-nature-dark-green text-xs mb-1">
                    {category.name}
                  </h4>
                  <p className="text-xs text-cool-gray">
                    {category.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show products
  if (showProducts) {
    return (
      <div className="px-2 py-3">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={handleBackToQuestions}
              className="flex items-center gap-1 px-2 py-1 text-nature-green hover:bg-nature-green/10 rounded text-xs transition-colors duration-200"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="font-medium">กลับ</span>
            </button>
            <h3 className="text-sm font-semibold text-nature-dark-green">
              สินค้าแนะนำ
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="text-xs text-cool-gray">กำลังโหลด...</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`bg-white rounded-lg shadow-sm border border-border-beige overflow-hidden transition-all duration-200 ${
                    product.inStock 
                      ? 'hover:shadow-md cursor-pointer' 
                      : 'cursor-not-allowed opacity-75'
                  }`}
                >
                  <div className="relative h-20 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`w-full h-full object-cover ${!product.inStock ? 'grayscale' : ''}`}
                    />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-red-500 px-2 py-1 rounded-full">
                          หมด
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-2">
                    <h4 className={`font-semibold mb-1 text-xs truncate ${
                      product.inStock ? 'text-nature-dark-green' : 'text-cool-gray'
                    }`}>
                      {product.name}
                    </h4>
                    
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-bold ${
                        product.inStock ? 'text-fresh-orange' : 'text-cool-gray'
                      }`}>
                        ฿{product.price}
                      </span>
                      <span className="text-xs text-cool-gray">
                        /{product.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      <Star className={`w-3 h-3 ${
                        product.inStock 
                          ? 'fill-sun-yellow text-sun-yellow' 
                          : 'fill-cool-gray text-cool-gray'
                      }`} />
                      <span className="text-xs font-medium text-cool-gray">
                        {product.rating}
                      </span>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleProductClick(product)}
                        disabled={!product.inStock}
                        className="flex-1 px-2 py-1 border border-nature-green text-nature-green hover:bg-nature-green/10 disabled:border-cool-gray disabled:text-cool-gray rounded text-xs font-medium transition-colors duration-200"
                      >
                        ดูรายละเอียด
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className="px-2 py-1 bg-nature-green hover:bg-nature-dark-green disabled:bg-cool-gray/30 text-white rounded text-xs font-medium transition-colors duration-200"
                      >
                        <ShoppingCart className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show recommended questions (default view)
  return (
    <div className="px-2 py-3">
      <div className="max-w-sm mx-auto">
        <h3 className="text-xs font-medium text-cool-gray mb-2 text-center">
          คำถามยอดนิยม
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {questions.slice(0, 4).map((question, index) => {
            const IconComponent = question.icon;
            return (
              <button
                key={index}
                onClick={() => handleQuestionClick(question.text)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-xs ${question.color} ${
                  question.color.includes('sun-yellow') ? 'text-nature-dark-green' : 'text-white'
                }`}
              >
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium truncate">{question.text}</span>
              </button>
            );
          })}
        </div>
        
        <div className="text-center mt-2">
          <button
            onClick={() => onQuestionClick('ดูตัวเลือกเพิ่มเติม')}
            className="text-xs text-nature-green hover:text-nature-dark-green font-medium"
          >
            ดูเพิ่มเติม...
          </button>
        </div>
      </div>
    </div>
  );
};