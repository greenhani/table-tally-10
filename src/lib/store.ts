import { MenuItem, Order, Sale } from '@/types';

// Simple in-memory store
class Store {
  private menuItems: MenuItem[] = [];
  private orders: Order[] = [];
  private sales: Sale[] = [];

  // Menu Methods
  getMenuItems(): MenuItem[] {
    return this.menuItems;
  }

  addMenuItem(item: MenuItem): void {
    this.menuItems.push(item);
  }

  updateMenuItem(id: string, updates: Partial<MenuItem>): void {
    const index = this.menuItems.findIndex(item => item.id === id);
    if (index !== -1) {
      this.menuItems[index] = { ...this.menuItems[index], ...updates };
    }
  }

  deleteMenuItem(id: string): void {
    this.menuItems = this.menuItems.filter(item => item.id !== id);
  }

  // Order Methods
  getOrders(): Order[] {
    return this.orders;
  }

  addOrder(order: Order): void {
    this.orders.push(order);
  }

  updateOrder(id: string, updates: Partial<Order>): void {
    const index = this.orders.findIndex(order => order.id === id);
    if (index !== -1) {
      this.orders[index] = { ...this.orders[index], ...updates };
    }
  }

  deleteOrder(id: string): void {
    this.orders = this.orders.filter(order => order.id !== id);
  }

  // Sales Methods
  getSales(): Sale[] {
    return this.sales;
  }

  addSale(sale: Sale): void {
    this.sales.push(sale);
  }
}

export const store = new Store();

// Initialize with sample data
const sampleMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Caesar Salad',
    category: 'appetizers',
    price: 12.99,
    description: 'Fresh romaine with parmesan and croutons',
    available: true,
  },
  {
    id: '2',
    name: 'Grilled Salmon',
    category: 'mains',
    price: 24.99,
    description: 'Atlantic salmon with seasonal vegetables',
    available: true,
  },
  {
    id: '3',
    name: 'Chocolate Lava Cake',
    category: 'desserts',
    price: 8.99,
    description: 'Warm chocolate cake with vanilla ice cream',
    available: true,
  },
  {
    id: '4',
    name: 'Craft Beer',
    category: 'drinks',
    price: 6.99,
    description: 'Local brewery selection',
    available: true,
  },
  {
    id: '5',
    name: 'Bruschetta',
    category: 'appetizers',
    price: 9.99,
    description: 'Toasted bread with tomatoes and basil',
    available: true,
  },
  {
    id: '6',
    name: 'Ribeye Steak',
    category: 'mains',
    price: 32.99,
    description: '12oz premium cut with garlic butter',
    available: true,
  },
];

sampleMenuItems.forEach(item => store.addMenuItem(item));
