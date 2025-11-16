// Database layer using localStorage with type safety
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'store_manager' | 'staff';
  store?: string;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  location: string;
  createdAt: string;
}

export interface Product {
  id: string;
  brand: string;
  model: string;
  createdAt: string;
}

export interface Stock {
  id: string;
  productId: string;
  serialNumber: string;
  storeId: string;
  status: 'available' | 'sold' | 'transferred';
  purchaseBillNo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  customerName: string;
  customerNumber: string;
  storeId: string;
  items: SaleItem[];
  totalAmount: number;
  createdAt: string;
  createdBy: string;
}

export interface SaleItem {
  stockId: string;
  brand: string;
  model: string;
  serialNumber: string;
}

export interface Transfer {
  id: string;
  fromStoreId: string;
  toStoreId: string;
  items: TransferItem[];
  createdAt: string;
  createdBy: string;
}

export interface TransferItem {
  stockId: string;
  brand: string;
  model: string;
  serialNumber: string;
}

export interface ActivityLog {
  id: string;
  type: 'stock_add' | 'sale' | 'transfer';
  description: string;
  userId: string;
  createdAt: string;
}

// Initialize default data
function initializeDB() {
  if (typeof window === 'undefined') return;
  
  const existing = localStorage.getItem('secura_users');
  if (existing) return;

  // Create stores
  const stores: Store[] = [
    { id: 'store1', name: 'Main Store', location: 'Downtown', createdAt: new Date().toISOString() },
    { id: 'store2', name: 'Branch Store', location: 'Uptown', createdAt: new Date().toISOString() },
  ];
  localStorage.setItem('secura_stores', JSON.stringify(stores));

  // Create users (2 Admin, 2 Staff)
  const users: User[] = [
    {
      id: 'admin1',
      name: 'Admin One',
      email: 'admin1@secura.com',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'admin2',
      name: 'Admin Two',
      email: 'admin2@secura.com',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'staff1',
      name: 'Staff One',
      email: 'staff1@secura.com',
      password: 'staff123',
      role: 'staff',
      store: 'store1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'staff2',
      name: 'Staff Two',
      email: 'staff2@secura.com',
      password: 'staff123',
      role: 'staff',
      store: 'store2',
      createdAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem('secura_users', JSON.stringify(users));
  localStorage.setItem('secura_products', JSON.stringify([]));
  localStorage.setItem('secura_stock', JSON.stringify([]));
  localStorage.setItem('secura_sales', JSON.stringify([]));
  localStorage.setItem('secura_transfers', JSON.stringify([]));
  localStorage.setItem('secura_activity_logs', JSON.stringify([]));
}

// DB Helper Functions
export const db = {
  init: initializeDB,

  getUsers: (): User[] => {
    const data = localStorage.getItem('secura_users');
    return data ? JSON.parse(data) : [];
  },

  getUserById: (id: string): User | undefined => {
    const users = db.getUsers();
    return users.find(u => u.id === id);
  },

  getStores: (): Store[] => {
    const data = localStorage.getItem('secura_stores');
    return data ? JSON.parse(data) : [];
  },

  getProducts: (): Product[] => {
    const data = localStorage.getItem('secura_products');
    return data ? JSON.parse(data) : [];
  },

  addProduct: (brand: string, model: string): Product => {
    const products = db.getProducts();
    const product: Product = {
      id: Date.now().toString(),
      brand,
      model,
      createdAt: new Date().toISOString(),
    };
    products.push(product);
    localStorage.setItem('secura_products', JSON.stringify(products));
    return product;
  },

  getStock: (): Stock[] => {
    const data = localStorage.getItem('secura_stock');
    return data ? JSON.parse(data) : [];
  },

  addStock: (productId: string, serialNumber: string, storeId: string, purchaseBillNo?: string): Stock => {
    const stock = db.getStock();
    const newStock: Stock = {
      id: Date.now().toString(),
      productId,
      serialNumber,
      storeId,
      status: 'available',
      purchaseBillNo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    stock.push(newStock);
    localStorage.setItem('secura_stock', JSON.stringify(stock));
    return newStock;
  },

  updateStockStatus: (stockId: string, status: Stock['status']) => {
    const stock = db.getStock();
    const item = stock.find(s => s.id === stockId);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString();
      localStorage.setItem('secura_stock', JSON.stringify(stock));
    }
  },

  updateStockStore: (stockId: string, newStoreId: string) => {
    const stock = db.getStock();
    const item = stock.find(s => s.id === stockId);
    if (item) {
      item.storeId = newStoreId;
      item.status = 'available';
      item.updatedAt = new Date().toISOString();
      localStorage.setItem('secura_stock', JSON.stringify(stock));
    }
  },

  getSales: (): Sale[] => {
    const data = localStorage.getItem('secura_sales');
    return data ? JSON.parse(data) : [];
  },

  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>): Sale => {
    const sales = db.getSales();
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    sales.push(newSale);
    localStorage.setItem('secura_sales', JSON.stringify(sales));
    return newSale;
  },

  getTransfers: (): Transfer[] => {
    const data = localStorage.getItem('secura_transfers');
    return data ? JSON.parse(data) : [];
  },

  addTransfer: (transfer: Omit<Transfer, 'id' | 'createdAt'>): Transfer => {
    const transfers = db.getTransfers();
    const newTransfer: Transfer = {
      ...transfer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    transfers.push(newTransfer);
    localStorage.setItem('secura_transfers', JSON.stringify(transfers));
    return newTransfer;
  },

  getActivityLogs: (): ActivityLog[] => {
    const data = localStorage.getItem('secura_activity_logs');
    return data ? JSON.parse(data) : [];
  },

  addActivityLog: (log: Omit<ActivityLog, 'id' | 'createdAt'>) => {
    const logs = db.getActivityLogs();
    const newLog: ActivityLog = {
      ...log,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    logs.push(newLog);
    localStorage.setItem('secura_activity_logs', JSON.stringify(logs));
  },
};
