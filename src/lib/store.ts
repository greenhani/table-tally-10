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

  updateOrder(order: Order): void {
    const index = this.orders.findIndex((o) => o.id === order.id);
    if (index !== -1) {
      this.orders[index] = order;
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
    name: 'Chicken Biryani',
    category: 'Main Course',
    subCategory: 'Rice',
    price: 450,
    description: 'Aromatic basmati rice with tender chicken',
    available: true,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
  },
  {
    id: '2',
    name: 'Beef Karahi',
    category: 'Main Course',
    subCategory: 'Curry',
    price: 850,
    description: 'Traditional spicy beef curry',
    available: true,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
  },
  {
    id: '3',
    name: 'Chicken Tikka',
    category: 'Appetizers',
    subCategory: 'Grilled',
    price: 350,
    description: 'Marinated grilled chicken pieces',
    available: true,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
  },
  {
    id: '4',
    name: 'Samosa',
    category: 'Appetizers',
    subCategory: 'Fried',
    price: 50,
    description: 'Crispy pastry with spiced filling',
    available: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
  },
  {
    id: '5',
    name: 'Gulab Jamun',
    category: 'Desserts',
    price: 150,
    description: 'Sweet milk-solid dumplings',
    available: true,
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400',
  },
  {
    id: '6',
    name: 'Kheer',
    category: 'Desserts',
    price: 180,
    description: 'Rice pudding with cardamom',
    available: true,
    image: 'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=400',
  },
  {
    id: '7',
    name: 'Fresh Lime Soda',
    category: 'Beverages',
    price: 120,
    available: true,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
  },
  {
    id: '8',
    name: 'Kashmiri Chai',
    category: 'Beverages',
    price: 100,
    description: 'Pink tea with nuts',
    available: true,
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
  },
  {
    id: 'deal-1',
    name: 'Family Feast',
    category: 'deals',
    price: 1500,
    description: 'Perfect for family gatherings - includes Chicken Biryani, Beef Karahi, and drinks',
    available: true,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    isDeal: true,
    dealItems: ['1', '2', '7', '8'],
  },
  {
    id: 'deal-2',
    name: 'Starter Combo',
    category: 'deals',
    price: 380,
    description: 'Great appetizer combo with Chicken Tikka and Samosas',
    available: true,
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400',
    isDeal: true,
    dealItems: ['3', '4'],
  },
  {
    id: 'deal-3',
    name: 'Sweet Ending',
    category: 'deals',
    price: 280,
    description: 'Dessert combo with Gulab Jamun and Kheer',
    available: true,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    isDeal: true,
    dealItems: ['5', '6'],
  },
];

sampleMenuItems.forEach(item => store.addMenuItem(item));
