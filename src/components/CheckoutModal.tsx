import React, { useState } from 'react';
import { X, CreditCard, Truck, MapPin, Phone, User, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import type { CartItem, ShippingInfo, PaymentMethod } from '../types/cart';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  cartItems: CartItem[];
  total: number;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'credit_card',
    name: 'บัตรเครดิต/เดบิต',
    description: 'Visa, Mastercard, JCB',
    icon: '💳'
  },
  {
    id: 'bank_transfer',
    name: 'โอนผ่านธนาคาร',
    description: 'ธนาคารไทยพาณิชย์, กสิกรไทย, กรุงเทพ',
    icon: '🏦'
  },
  {
    id: 'cod',
    name: 'เก็บเงินปลายทาง',
    description: 'ชำระเมื่อได้รับสินค้า',
    icon: '💵'
  }
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  cartItems,
  total
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    district: '',
    province: '',
    postalCode: '',
    notes: ''
  });

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitOrder = async () => {
    if (!user) {
      setError('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Create order
      const order = await orderService.createOrder(user.id, {
        cartItems,
        shippingInfo,
        paymentMethod: selectedPayment as any,
        notes: shippingInfo.notes
      });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Process payment
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await orderService.processPayment(order.id, user.id, transactionId);

      setOrderNumber(order.orderNumber);
      setCurrentStep(4); // Success step
      
      // Auto close after 5 seconds
      setTimeout(() => {
        onComplete();
        resetForm();
      }, 5000);
      
    } catch (error) {
      console.error('Order creation failed:', error);
      setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedPayment('');
    setOrderNumber('');
    setError(null);
    setShippingInfo({
      fullName: user?.name || '',
      phone: user?.phone || '',
      address: '',
      district: '',
      province: '',
      postalCode: '',
      notes: ''
    });
  };

  const isStep1Valid = shippingInfo.fullName && shippingInfo.phone && shippingInfo.address && 
                     shippingInfo.district && shippingInfo.province && shippingInfo.postalCode;
  const isStep2Valid = selectedPayment;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-beige">
          <h2 className="text-xl font-semibold text-nature-dark-green">
            {currentStep === 4 ? 'สั่งซื้อสำเร็จ' : 'ดำเนินการสั่งซื้อ'}
          </h2>
          {currentStep !== 4 && (
            <button
              onClick={onClose}
              className="text-cool-gray hover:text-nature-dark-green p-1 hover:bg-soft-beige/50 rounded transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Progress Steps */}
        {currentStep !== 4 && (
          <div className="flex items-center justify-center p-4 border-b border-border-beige">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-nature-green text-white'
                      : 'bg-cool-gray/20 text-cool-gray'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      step < currentStep ? 'bg-nature-green' : 'bg-cool-gray/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Shipping Information */}
          {currentStep === 1 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-nature-green" />
                <h3 className="text-lg font-semibold text-nature-dark-green">ข้อมูลการจัดส่ง</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nature-dark-green mb-2">
                    ชื่อ-นามสกุล *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cool-gray" />
                    <input
                      type="text"
                      value={shippingInfo.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green"
                      placeholder="กรอกชื่อ-นามสกุล"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nature-dark-green mb-2">
                    เบอร์โทรศัพท์ *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cool-gray" />
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green"
                      placeholder="กรอกเบอร์โทรศัพท์"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-nature-dark-green mb-2">
                    ที่อยู่ *
                  </label>
                  <textarea
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green resize-none"
                    rows={3}
                    placeholder="กรอกที่อยู่ เลขที่ ซอย ถนน"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nature-dark-green mb-2">
                    อำเภอ/เขต *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className="w-full px-4 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green"
                    placeholder="กรอกอำเภอ/เขต"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nature-dark-green mb-2">
                    จังหวัด *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    className="w-full px-4 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green"
                    placeholder="กรอกจังหวัด"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nature-dark-green mb-2">
                    รหัสไปรษณีย์ *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full px-4 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green"
                    placeholder="กรอกรหัสไปรษณีย์"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-nature-dark-green mb-2">
                    หมายเหตุ (ไม่บังคับ)
                  </label>
                  <textarea
                    value={shippingInfo.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-4 py-3 border border-border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-green resize-none"
                    rows={2}
                    placeholder="หมายเหตุเพิ่มเติม เช่น จุดสังเกต เวลาที่สะดวกรับ"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-nature-green" />
                <h3 className="text-lg font-semibold text-nature-dark-green">วิธีการชำระเงิน</h3>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedPayment === method.id
                        ? 'border-nature-green bg-nature-green/10'
                        : 'border-border-beige hover:bg-soft-beige/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-nature-dark-green">{method.name}</h4>
                        <p className="text-sm text-cool-gray">{method.description}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedPayment === method.id
                          ? 'border-nature-green bg-nature-green'
                          : 'border-cool-gray/30'
                      }`}>
                        {selectedPayment === method.id && (
                          <div className="w-full h-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Order Summary */}
          {currentStep === 3 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-nature-green" />
                <h3 className="text-lg font-semibold text-nature-dark-green">สรุปการสั่งซื้อ</h3>
              </div>

              {/* Order Items */}
              <div className="bg-soft-beige/30 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-nature-dark-green mb-3">รายการสินค้า</h4>
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-soft-beige/30 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-nature-dark-green mb-3">ข้อมูลการจัดส่ง</h4>
                <div className="text-sm space-y-1">
                  <p><strong>ชื่อ:</strong> {shippingInfo.fullName}</p>
                  <p><strong>โทร:</strong> {shippingInfo.phone}</p>
                  <p><strong>ที่อยู่:</strong> {shippingInfo.address}</p>
                  <p><strong>อำเภอ:</strong> {shippingInfo.district}</p>
                  <p><strong>จังหวัด:</strong> {shippingInfo.province} {shippingInfo.postalCode}</p>
                  {shippingInfo.notes && <p><strong>หมายเหตุ:</strong> {shippingInfo.notes}</p>}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-soft-beige/30 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-nature-dark-green mb-3">วิธีการชำระเงิน</h4>
                <p className="text-sm">
                  {paymentMethods.find(m => m.id === selectedPayment)?.name}
                </p>
              </div>

              {/* Total */}
              <div className="bg-nature-green/10 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-nature-dark-green">ยอดรวมทั้งหมด</span>
                  <span className="text-xl font-bold text-fresh-orange">฿{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 4 && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-nature-green mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-nature-dark-green mb-2">
                สั่งซื้อสำเร็จ!
              </h3>
              <p className="text-cool-gray mb-4">
                ขอบคุณสำหรับการสั่งซื้อ เราจะดำเนินการจัดส่งสินค้าให้คุณโดยเร็วที่สุด
              </p>
              <div className="bg-nature-green/10 rounded-lg p-4 mb-4">
                <p className="text-sm text-nature-dark-green">
                  หมายเลขคำสั่งซื้อ: <strong>{orderNumber}</strong>
                </p>
              </div>
              <p className="text-sm text-cool-gray">
                หน้าต่างนี้จะปิดอัตโนมัติใน 5 วินาที...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep !== 4 && (
          <div className="flex justify-between items-center p-6 border-t border-border-beige">
            <button
              onClick={currentStep === 1 ? onClose : handlePrevStep}
              disabled={loading}
              className="px-6 py-2 border border-border-beige text-cool-gray hover:bg-soft-beige/30 disabled:opacity-50 rounded-lg font-medium transition-colors duration-200"
            >
              {currentStep === 1 ? 'ยกเลิก' : 'ย้อนกลับ'}
            </button>

            <button
              onClick={currentStep === 3 ? handleSubmitOrder : handleNextStep}
              disabled={
                (currentStep === 1 && !isStep1Valid) ||
                (currentStep === 2 && !isStep2Valid) ||
                loading
              }
              className="px-6 py-2 bg-nature-green hover:bg-nature-dark-green disabled:bg-cool-gray/30 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังดำเนินการ...
                </>
              ) : currentStep === 3 ? (
                'ยืนยันการสั่งซื้อ'
              ) : (
                'ถัดไป'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};