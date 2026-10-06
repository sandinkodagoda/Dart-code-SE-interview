export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY_TO_SHIP'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type PaymentMethod = 'PAYHERE' | 'WHATSAPP';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
  _count?: {
    products: number;
  };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  createdAt?: string;
  _count?: {
    products: number;
  };
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  inStock: boolean;
  warranty?: string | null;
  specifications?: Record<string, any>;
  isFeatured: boolean;
  isActive?: boolean;
  category: Category;
  brand: Brand;
  images: ProductImage[];
  primaryImage?: ProductImage;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  total: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  provider?: string;
  transactionId?: string;
  providerReference?: string;
  paidAt?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  customerNotes?: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  payments?: Payment[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
  pagination?: PaginationMeta;
}

export interface ProductFilterParams {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'name-asc';
  page?: number;
  limit?: number;
}

export interface CreateOrderPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode?: string;
  paymentMethod: PaymentMethod;
  items: {
    productId: string;
    quantity: number;
  }[];
  customerNotes?: string;
}

export interface WhatsAppOrderResponse {
  order: Order;
  whatsappUrl: string;
  whatsappMessage: string;
  businessNumber: string;
}

export interface PayHerePaymentData {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export interface PayHereInitiateResponse {
  paymentData: PayHerePaymentData;
  checkoutUrl: string;
  orderNumber: string;
  amount: number;
  currency: string;
}

// ── Admin Management Types ─────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  admin: AdminUser;
}

export interface DashboardMetrics {
  orders: {
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    delivered: number;
    cancelled: number;
  };
  products: {
    total: number;
    active: number;
    lowStock: number;
    outOfStock: number;
  };
  customers: {
    total: number;
  };
  revenue: {
    total: number;
    currency: string;
  };
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    total: number;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    createdAt: string;
    items: { id: string; productName: string; quantity: number }[];
  }[];
}

export type InventoryTransactionType =
  | 'STOCK_IN'
  | 'RESTOCK'
  | 'SALE'
  | 'ADJUSTMENT'
  | 'CANCELLATION';

export interface InventoryTransaction {
  id: string;
  productId: string;
  type: InventoryTransactionType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reference?: string | null;
  reason?: string | null;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  sku: string;
  description: string;
  categoryId: string;
  brandId: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity?: number;
  warranty?: string;
  specifications?: Record<string, any>;
  isFeatured?: boolean;
  isActive?: boolean;
  images?: {
    imageUrl: string;
    altText?: string;
    displayOrder?: number;
    isPrimary?: boolean;
  }[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

export interface CreateBrandInput {
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive?: boolean;
}

export interface UpdateBrandInput extends Partial<CreateBrandInput> {}

export interface AdjustStockInput {
  productId: string;
  quantity: number;
  type: 'RESTOCK' | 'ADJUSTMENT' | 'STOCK_IN';
  reason?: string;
  reference?: string;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  note?: string;
  cancellationReason?: string;
}

