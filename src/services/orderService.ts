import { supabase } from '../lib/supabase';
import type { CartItem, ShippingInfo } from '../types/cart';

// Database types
export interface Farm2HandOrder {
  id: number;
  order_number: string;
  customer_id: number;
  total_amount: number;
  shipping_fee: number;
  discount_amount: number;
  final_amount: number;
  status: OrderStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface Farm2HandOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  farmer_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Farm2HandShipping {
  id: number;
  order_id: number;
  full_name: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  postal_code: string;
  notes?: string;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  created_at: string;
  updated_at: string;
}

export interface Farm2HandPayment {
  id: number;
  order_id: number;
  payment_method: PaymentMethodType;
  amount: number;
  status: PaymentStatus;
  transaction_id?: string;
  payment_data?: any;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

// Frontend types
export type OrderStatus = 
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded';

export type PaymentMethodType = 
  | 'credit_card'
  | 'bank_transfer'
  | 'cod'
  | 'wallet';

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  status: OrderStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  items: OrderItem[];
  shipping?: ShippingDetails;
  payment?: PaymentDetails;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  farmerId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

export interface ShippingDetails {
  id: number;
  orderId: number;
  fullName: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  postalCode: string;
  notes?: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentDetails {
  id: number;
  orderId: number;
  paymentMethod: PaymentMethodType;
  amount: number;
  status: PaymentStatus;
  transactionId?: string;
  paymentData?: any;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderData {
  cartItems: CartItem[];
  shippingInfo: ShippingInfo;
  paymentMethod: PaymentMethodType;
  notes?: string;
}

// Set user context for RLS policies
const setUserContext = async (userId: number) => {
  await supabase.rpc('set_config', {
    setting_name: 'app.current_user_id',
    setting_value: userId.toString(),
    is_local: true
  });
};

// Convert database order to frontend format
const convertToOrder = (
  dbOrder: Farm2HandOrder,
  items: Farm2HandOrderItem[] = [],
  shipping?: Farm2HandShipping,
  payment?: Farm2HandPayment
): Order => {
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    customerId: dbOrder.customer_id,
    totalAmount: dbOrder.total_amount,
    shippingFee: dbOrder.shipping_fee,
    discountAmount: dbOrder.discount_amount,
    finalAmount: dbOrder.final_amount,
    status: dbOrder.status,
    notes: dbOrder.notes,
    createdAt: new Date(dbOrder.created_at),
    updatedAt: new Date(dbOrder.updated_at),
    confirmedAt: dbOrder.confirmed_at ? new Date(dbOrder.confirmed_at) : undefined,
    shippedAt: dbOrder.shipped_at ? new Date(dbOrder.shipped_at) : undefined,
    deliveredAt: dbOrder.delivered_at ? new Date(dbOrder.delivered_at) : undefined,
    items: items.map(item => ({
      id: item.id,
      orderId: item.order_id,
      productId: item.product_id,
      farmerId: item.farmer_id,
      productName: item.product_name,
      productPrice: item.product_price,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      createdAt: new Date(item.created_at)
    })),
    shipping: shipping ? {
      id: shipping.id,
      orderId: shipping.order_id,
      fullName: shipping.full_name,
      phone: shipping.phone,
      address: shipping.address,
      district: shipping.district,
      province: shipping.province,
      postalCode: shipping.postal_code,
      notes: shipping.notes,
      trackingNumber: shipping.tracking_number,
      carrier: shipping.carrier,
      estimatedDelivery: shipping.estimated_delivery ? new Date(shipping.estimated_delivery) : undefined,
      actualDelivery: shipping.actual_delivery ? new Date(shipping.actual_delivery) : undefined,
      createdAt: new Date(shipping.created_at),
      updatedAt: new Date(shipping.updated_at)
    } : undefined,
    payment: payment ? {
      id: payment.id,
      orderId: payment.order_id,
      paymentMethod: payment.payment_method,
      amount: payment.amount,
      status: payment.status,
      transactionId: payment.transaction_id,
      paymentData: payment.payment_data,
      paidAt: payment.paid_at ? new Date(payment.paid_at) : undefined,
      createdAt: new Date(payment.created_at),
      updatedAt: new Date(payment.updated_at)
    } : undefined
  };
};

export const orderService = {
  // Create a new order
  async createOrder(customerId: number, orderData: CreateOrderData): Promise<Order> {
    try {
      // Set user context for RLS
      await setUserContext(customerId);

      // Calculate totals
      const totalAmount = orderData.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingFee = totalAmount >= 500 ? 0 : 50; // Free shipping over 500 THB
      const finalAmount = totalAmount + shippingFee;

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('Farm2Hand_order')
        .insert([{
          customer_id: customerId,
          total_amount: totalAmount,
          shipping_fee: shippingFee,
          discount_amount: 0,
          final_amount: finalAmount,
          status: 'pending_payment',
          notes: orderData.notes
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error('เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
      }

      // Create order items
      const orderItems = orderData.cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        farmer_id: item.farmerId,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { data: items, error: itemsError } = await supabase
        .from('Farm2Hand_order_item')
        .insert(orderItems)
        .select();

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw new Error('เกิดข้อผิดพลาดในการสร้างรายการสินค้า');
      }

      // Create shipping info
      const { data: shipping, error: shippingError } = await supabase
        .from('Farm2Hand_shipping')
        .insert([{
          order_id: order.id,
          full_name: orderData.shippingInfo.fullName,
          phone: orderData.shippingInfo.phone,
          address: orderData.shippingInfo.address,
          district: orderData.shippingInfo.district,
          province: orderData.shippingInfo.province,
          postal_code: orderData.shippingInfo.postalCode,
          notes: orderData.shippingInfo.notes
        }])
        .select()
        .single();

      if (shippingError) {
        console.error('Shipping creation error:', shippingError);
        throw new Error('เกิดข้อผิดพลาดในการสร้างข้อมูลการจัดส่ง');
      }

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('Farm2Hand_payment')
        .insert([{
          order_id: order.id,
          payment_method: orderData.paymentMethod,
          amount: finalAmount,
          status: 'pending'
        }])
        .select()
        .single();

      if (paymentError) {
        console.error('Payment creation error:', paymentError);
        throw new Error('เกิดข้อผิดพลาดในการสร้างข้อมูลการชำระเงิน');
      }

      return convertToOrder(order as Farm2HandOrder, items as Farm2HandOrderItem[], shipping as Farm2HandShipping, payment as Farm2HandPayment);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
    }
  },

  // Process payment and confirm order
  async processPayment(orderId: number, customerId: number, transactionId?: string): Promise<Order> {
    try {
      // Set user context for RLS
      await setUserContext(customerId);

      // Update payment status
      const { error: paymentError } = await supabase
        .from('Farm2Hand_payment')
        .update({
          status: 'completed',
          transaction_id: transactionId,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (paymentError) {
        console.error('Payment update error:', paymentError);
        throw new Error('เกิดข้อผิดพลาดในการอัปเดตสถานะการชำระเงิน');
      }

      // Update order status to confirmed (this will trigger stock update)
      const { data: order, error: orderError } = await supabase
        .from('Farm2Hand_order')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (orderError) {
        console.error('Order update error:', orderError);
        throw new Error('เกิดข้อผิดพลาดในการยืนยันคำสั่งซื้อ');
      }

      // Get complete order data
      return await this.getOrderById(orderId, customerId);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดำเนินการชำระเงิน');
    }
  },

  // Get order by ID
  async getOrderById(orderId: number, customerId: number): Promise<Order> {
    try {
      // Set user context for RLS
      await setUserContext(customerId);

      // Get order with all related data
      const { data: order, error: orderError } = await supabase
        .from('Farm2Hand_order')
        .select(`
          *,
          Farm2Hand_order_item (*),
          Farm2Hand_shipping (*),
          Farm2Hand_payment (*)
        `)
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Order fetch error:', orderError);
        throw new Error('ไม่พบคำสั่งซื้อที่ระบุ');
      }

      return convertToOrder(
        order as Farm2HandOrder,
        order.Farm2Hand_order_item as Farm2HandOrderItem[],
        order.Farm2Hand_shipping?.[0] as Farm2HandShipping,
        order.Farm2Hand_payment?.[0] as Farm2HandPayment
      );
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ');
    }
  },

  // Get orders by customer
  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    try {
      // Set user context for RLS
      await setUserContext(customerId);

      const { data: orders, error } = await supabase
        .from('Farm2Hand_order')
        .select(`
          *,
          Farm2Hand_order_item (*),
          Farm2Hand_shipping (*),
          Farm2Hand_payment (*)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Orders fetch error:', error);
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ');
      }

      if (!orders) {
        return [];
      }

      return orders.map(order => convertToOrder(
        order as Farm2HandOrder,
        order.Farm2Hand_order_item as Farm2HandOrderItem[],
        order.Farm2Hand_shipping?.[0] as Farm2HandShipping,
        order.Farm2Hand_payment?.[0] as Farm2HandPayment
      ));
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ');
    }
  },

  // Get orders by farmer (orders containing their products)
  async getOrdersByFarmer(farmerId: number): Promise<Order[]> {
    try {
      // Set user context for RLS
      await setUserContext(farmerId);

      const { data: orders, error } = await supabase
        .from('Farm2Hand_order')
        .select(`
          *,
          Farm2Hand_order_item!inner (*),
          Farm2Hand_shipping (*),
          Farm2Hand_payment (*)
        `)
        .eq('Farm2Hand_order_item.farmer_id', farmerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Farmer orders fetch error:', error);
        throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ');
      }

      if (!orders) {
        return [];
      }

      return orders.map(order => convertToOrder(
        order as Farm2HandOrder,
        order.Farm2Hand_order_item as Farm2HandOrderItem[],
        order.Farm2Hand_shipping?.[0] as Farm2HandShipping,
        order.Farm2Hand_payment?.[0] as Farm2HandPayment
      ));
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ');
    }
  },

  // Update order status
  async updateOrderStatus(orderId: number, farmerId: number, status: OrderStatus): Promise<Order> {
    try {
      // Set user context for RLS
      await setUserContext(farmerId);

      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      // Set specific timestamps based on status
      if (status === 'shipping') {
        updateData.shipped_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { data: order, error } = await supabase
        .from('Farm2Hand_order')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Order status update error:', error);
        throw new Error('เกิดข้อผิดพลาดในการอัปเดตสถานะคำสั่งซื้อ');
      }

      // Get complete order data
      return await this.getOrderById(orderId, farmerId);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการอัปเดตสถานะคำสั่งซื้อ');
    }
  },

  // Cancel order
  async cancelOrder(orderId: number, customerId: number, reason?: string): Promise<Order> {
    try {
      // Set user context for RLS
      await setUserContext(customerId);

      // Update order status to cancelled (this will trigger stock restoration)
      const { data: order, error } = await supabase
        .from('Farm2Hand_order')
        .update({
          status: 'cancelled',
          notes: reason ? `ยกเลิก: ${reason}` : 'ยกเลิกโดยลูกค้า',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Order cancellation error:', error);
        throw new Error('เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ');
      }

      return await this.getOrderById(orderId, customerId);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ');
    }
  },

  // Add tracking information
  async addTrackingInfo(orderId: number, farmerId: number, trackingNumber: string, carrier: string): Promise<Order> {
    try {
      // Set user context for RLS
      await setUserContext(farmerId);

      const { error } = await supabase
        .from('Farm2Hand_shipping')
        .update({
          tracking_number: trackingNumber,
          carrier: carrier,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (error) {
        console.error('Tracking update error:', error);
        throw new Error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลการติดตาม');
      }

      return await this.getOrderById(orderId, farmerId);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลการติดตาม');
    }
  }
};