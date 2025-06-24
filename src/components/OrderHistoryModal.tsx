import React, { useState, useEffect } from 'react';
import { X, Package, Clock, Truck, CheckCircle, XCircle, Eye, MapPin, Phone, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { orderService, type Order, type OrderStatus } from '../services/orderService';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getStatusInfo = (status: OrderStatus) => {
  switch (status) {
    case 'pending_payment':
      return {
        label: 'รอชำระเงิน',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        description: 'รอการชำระเงิน'
      };
    case 'confirmed':
      return {
        label: 'ยืนยันแล้ว',
        color: 'bg-blue-100 text-blue-800',
        icon: CheckCircle,
        description: 'ยืนยันคำสั่งซื้อแล้ว'
      };
    case 'preparing':
      return {
        label: 'กำลังจัดสินค้า',
        color: 'bg-orange-100 text-orange-800',
        icon: Package,
        description: 'กำลังจัดสินค้า'
      };
    case 'shipping':
      return {
        label: 'กำลังจัดส่ง',
        color: 'bg-purple-100 text-purple-800',
        icon: Truck,
        description: 'กำลังจัดส่ง'
      };
    case 'delivered':
      return {
        label: 'จัดส่งเสร็จแล้ว',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        description: 'จัดส่งเสร็จแล้ว'
      };
    case 'cancelled':
      return {
        label: 'ยกเลิกแล้ว',
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        description: 'ยกเลิกคำสั่งซื้อ'
      };
    case 'refunded':
      return {
        label: 'คืนเงินแล้ว',
        color: 'bg-gray-100 text-gray-800',
        icon: XCircle,
        description: 'คืนเงินแล้ว'
      };
    default:
      return {
        label: 'ไม่ทราบสถานะ',
        color: 'bg-gray-100 text-gray-800',
        icon: Clock,
        description: 'ไม่ทราบสถานะ'
      };
  }
};

const getPaymentMethodName = (method: string) => {
  switch (method) {
    case 'credit_card':
      return 'บัตรเครดิต/เดบิต';
    case 'bank_transfer':
      return 'โอนผ่านธนาคาร';
    case 'cod':
      return 'เก็บเงินปลายทาง';
    case 'wallet':
      return 'กระเป๋าเงินอิเล็กทรอนิกส์';
    default:
      return method;
  }
};

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadOrders();
    }
  }, [isOpen, user]);

  const loadOrders = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      const customerOrders = await orderService.getOrdersByCustomer(user.id);
      setOrders(customerOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการโหลดประวัติการสั่งซื้อ');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleBackToList = () => {
    setShowOrderDetail(false);
    setSelectedOrder(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-beige">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-nature-green rounded-lg flex items-center justify-center shadow-md">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-nature-dark-green">
              {showOrderDetail ? `คำสั่งซื้อ #${selectedOrder?.orderNumber.split('-').pop()}` : 'ประวัติการสั่งซื้อ'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {showOrderDetail && (
              <button
                onClick={handleBackToList}
                className="px-4 py-2 text-nature-green hover:bg-nature-green/10 rounded-lg transition-colors duration-200"
              >
                ← กลับ
              </button>
            )}
            <button
              onClick={onClose}
              className="text-cool-gray hover:text-nature-dark-green p-1 hover:bg-soft-beige/50 rounded transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {showOrderDetail && selectedOrder ? (
            /* Order Detail View */
            <div className="p-6">
              {/* Order Status */}
              <div className="bg-soft-beige/30 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-nature-dark-green">
                      สถานะคำสั่งซื้อ
                    </h3>
                    <p className="text-sm text-cool-gray">
                      สั่งซื้อเมื่อ {selectedOrder.createdAt.toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-fresh-orange">
                      ฿{selectedOrder.finalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="space-y-3">
                  {[
                    { status: 'confirmed', label: 'ยืนยันคำสั่งซื้อ', timestamp: selectedOrder.confirmedAt },
                    { status: 'preparing', label: 'กำลังจัดสินค้า', timestamp: null },
                    { status: 'shipping', label: 'กำลังจัดส่ง', timestamp: selectedOrder.shippedAt },
                    { status: 'delivered', label: 'จัดส่งเสร็จแล้ว', timestamp: selectedOrder.deliveredAt }
                  ].map((step, index) => {
                    const isCompleted = selectedOrder.status === step.status || 
                      (selectedOrder.status === 'delivered' && index < 4) ||
                      (selectedOrder.status === 'shipping' && index < 3) ||
                      (selectedOrder.status === 'preparing' && index < 2);
                    
                    const isCurrent = selectedOrder.status === step.status;

                    return (
                      <div key={step.status} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          isCompleted 
                            ? 'bg-nature-green border-nature-green' 
                            : isCurrent
                            ? 'bg-yellow-400 border-yellow-400'
                            : 'bg-white border-cool-gray/30'
                        }`} />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            isCompleted ? 'text-nature-dark-green' : 'text-cool-gray'
                          }`}>
                            {step.label}
                          </p>
                          {step.timestamp && (
                            <p className="text-xs text-cool-gray">
                              {step.timestamp.toLocaleDateString('th-TH', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white border border-border-beige rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-nature-dark-green mb-4">รายการสินค้า</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-soft-beige/20 rounded-lg">
                      <div className="w-12 h-12 bg-cool-gray/20 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-cool-gray" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-nature-dark-green">{item.productName}</h4>
                        <p className="text-sm text-cool-gray">จำนวน: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-nature-dark-green">
                          ฿{item.totalPrice.toLocaleString()}
                        </p>
                        <p className="text-sm text-cool-gray">
                          ฿{item.unitPrice} x {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="border-t border-border-beige mt-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>ราคาสินค้า</span>
                      <span>฿{selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>ค่าจัดส่ง</span>
                      <span>฿{selectedOrder.shippingFee.toLocaleString()}</span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>ส่วนลด</span>
                        <span>-฿{selectedOrder.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-border-beige pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>รวมทั้งหมด</span>
                        <span className="text-fresh-orange">฿{selectedOrder.finalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              {selectedOrder.shipping && (
                <div className="bg-white border border-border-beige rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-nature-dark-green mb-4">ข้อมูลการจัดส่ง</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-nature-green" />
                        <span className="font-medium text-nature-dark-green">ที่อยู่จัดส่ง</span>
                      </div>
                      <div className="text-sm text-cool-gray space-y-1">
                        <p>{selectedOrder.shipping.fullName}</p>
                        <p>{selectedOrder.shipping.address}</p>
                        <p>{selectedOrder.shipping.district}, {selectedOrder.shipping.province} {selectedOrder.shipping.postalCode}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4 text-nature-green" />
                        <span className="font-medium text-nature-dark-green">เบอร์ติดต่อ</span>
                      </div>
                      <p className="text-sm text-cool-gray">{selectedOrder.shipping.phone}</p>
                      
                      {selectedOrder.shipping.trackingNumber && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Truck className="w-4 h-4 text-nature-green" />
                            <span className="font-medium text-nature-dark-green">หมายเลขติดตาม</span>
                          </div>
                          <p className="text-sm text-cool-gray font-mono">
                            {selectedOrder.shipping.trackingNumber}
                          </p>
                          {selectedOrder.shipping.carrier && (
                            <p className="text-xs text-cool-gray">
                              ขนส่งโดย: {selectedOrder.shipping.carrier}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedOrder.shipping.notes && (
                    <div className="mt-4 p-3 bg-soft-beige/30 rounded-lg">
                      <p className="text-sm text-cool-gray">
                        <strong>หมายเหตุ:</strong> {selectedOrder.shipping.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Information */}
              {selectedOrder.payment && (
                <div className="bg-white border border-border-beige rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-nature-dark-green mb-4">ข้อมูลการชำระเงิน</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-nature-green" />
                        <span className="font-medium text-nature-dark-green">วิธีการชำระเงิน</span>
                      </div>
                      <p className="text-sm text-cool-gray">
                        {getPaymentMethodName(selectedOrder.payment.paymentMethod)}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-nature-green" />
                        <span className="font-medium text-nature-dark-green">วันที่ชำระเงิน</span>
                      </div>
                      <p className="text-sm text-cool-gray">
                        {selectedOrder.payment.paidAt?.toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) || 'ยังไม่ได้ชำระ'}
                      </p>
                    </div>
                  </div>
                  
                  {selectedOrder.payment.transactionId && (
                    <div className="mt-4 p-3 bg-soft-beige/30 rounded-lg">
                      <p className="text-sm text-cool-gray">
                        <strong>หมายเลขธุรกรรม:</strong> 
                        <span className="font-mono ml-2">{selectedOrder.payment.transactionId}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Order List View */
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-nature-green" />
                    <span className="text-cool-gray">กำลังโหลดประวัติการสั่งซื้อ...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-nature-dark-green mb-2">เกิดข้อผิดพลาด</h3>
                  <p className="text-cool-gray mb-4">{error}</p>
                  <button
                    onClick={loadOrders}
                    className="px-6 py-3 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    ลองใหม่
                  </button>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-cool-gray/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-cool-gray/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-nature-dark-green mb-2">
                    ยังไม่มีประวัติการสั่งซื้อ
                  </h3>
                  <p className="text-cool-gray mb-4">
                    เริ่มเลือกซื้อสินค้าเกษตรคุณภาพดีจากเกษตรกรทั่วประเทศ
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-nature-green hover:bg-nature-dark-green text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    เลือกซื้อสินค้า
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <div
                        key={order.id}
                        className="bg-white border border-border-beige rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                      >
                        {/* Order Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-nature-green/10 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-nature-green" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-nature-dark-green">
                                คำสั่งซื้อ #{order.orderNumber.split('-').pop()}
                              </h3>
                              <p className="text-sm text-cool-gray">
                                {order.createdAt.toLocaleDateString('th-TH', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-fresh-orange">
                              ฿{order.finalAmount.toLocaleString()}
                            </p>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </div>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="mb-3">
                          <div className="flex items-center gap-2 text-sm text-cool-gray">
                            <Package className="w-4 h-4" />
                            <span>
                              {order.items.length} รายการ: {order.items.slice(0, 2).map(item => item.productName).join(', ')}
                              {order.items.length > 2 && ` และอีก ${order.items.length - 2} รายการ`}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleViewOrderDetail(order)}
                            className="flex items-center gap-2 px-4 py-2 text-nature-green hover:bg-nature-green/10 rounded-lg transition-colors duration-200"
                          >
                            <Eye className="w-4 h-4" />
                            ดูรายละเอียด
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};