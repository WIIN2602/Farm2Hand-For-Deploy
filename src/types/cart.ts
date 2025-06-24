export interface CartItem {
  id: number;
  name: string;
  price: number;
  unit: string;
  image: string;
  farmer: string;
  farmerId: number;
  quantity: number;
  maxStock: number;
  organic?: boolean;
  discount?: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  total: number;
  itemCount: number;
}

export interface CartContextType extends CartState {
  addToCart: (product: any) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  postalCode: string;
  notes?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  shippingInfo: ShippingInfo;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipping' | 'delivered' | 'cancelled';
  createdAt: Date;
  estimatedDelivery?: Date;
}