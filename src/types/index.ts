export type MenuCategory = 'appetizers' | 'mains' | 'desserts' | 'drinks';
export type OrderType = 'table' | 'takeaway' | 'delivery';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  price: number;
  description?: string;
  available: boolean;
  image?: string;
  isDeal?: boolean;
  dealItems?: string[]; // IDs of items in the deal
}

export type OrderStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  orderType: OrderType;
  tableNumber?: number;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  subtotal?: number;
  discount?: number; // percentage
  createdAt: Date;
  completedAt?: Date;
  estimatedTime?: number; // in minutes
  customerName?: string;
  customerContact?: string;
  deliveryAddress?: string;
}

export interface Sale {
  id: string;
  orderId: string;
  amount: number;
  date: Date;
  items: OrderItem[];
}

export interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  popularItems: { item: MenuItem; quantity: number }[];
}
