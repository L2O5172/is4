
export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface MenuItem {
  name: string;
  price: number;
  icon: string;
  status: '供應中' | '售完' | '季節限定';
  image?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderData {
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  pickupTime: string;
  deliveryAddress: string;
  notes: string;
}

export interface SubmittedOrderData extends OrderData {
  orderId: string;
  totalAmount: number;
}

export interface HistoryOrder {
  orderId: string;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  pickupTime: string;
  items: string; // The API returns items as a string
  status: 'pending_customer' | 'pending_store' | 'confirmed' | 'completed' | 'cancelled_by_customer' | 'cancelled_by_store';
  deliveryAddress?: string;
  notes?: string;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
