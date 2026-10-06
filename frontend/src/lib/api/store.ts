import { apiClient } from './client';
import {
  Category,
  Brand,
  Product,
  ProductFilterParams,
  CreateOrderPayload,
  Order,
  WhatsAppOrderResponse,
  PayHereInitiateResponse,
  PaginationMeta,
} from '@/types';

export const storeApi = {
  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await apiClient.get('/categories');
    return res.data.data;
  },

  async getCategoryBySlug(slug: string): Promise<Category> {
    const res = await apiClient.get(`/categories/${slug}`);
    return res.data.data;
  },

  // Brands
  async getBrands(): Promise<Brand[]> {
    const res = await apiClient.get('/brands');
    return res.data.data;
  },

  async getBrandBySlug(slug: string): Promise<Brand> {
    const res = await apiClient.get(`/brands/${slug}`);
    return res.data.data;
  },

  // Products
  async getProducts(params?: ProductFilterParams): Promise<{
    items: Product[];
    pagination: PaginationMeta;
  }> {
    const res = await apiClient.get('/products', { params });
    return {
      items: res.data.data,
      pagination: res.data.pagination || {
        page: 1,
        limit: 10,
        total: res.data.data.length,
        totalPages: 1,
      },
    };
  },

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const res = await apiClient.get('/products/featured', {
      params: { limit },
    });
    return res.data.data;
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const res = await apiClient.get(`/products/${slug}`);
    return res.data.data;
  },

  // Checkout & Orders
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const res = await apiClient.post('/orders/checkout', payload);
    return res.data.data;
  },

  async createWhatsAppOrder(
    payload: CreateOrderPayload,
  ): Promise<WhatsAppOrderResponse> {
    const res = await apiClient.post('/orders/whatsapp/checkout', payload);
    return res.data.data;
  },

  async initiatePayHere(orderId: string): Promise<PayHereInitiateResponse> {
    const res = await apiClient.post('/payments/payhere/initiate', { orderId });
    return res.data.data;
  },

  async getOrderByNumber(orderNumber: string): Promise<Order> {
    const res = await apiClient.get(`/orders/${orderNumber}`);
    return res.data.data;
  },

  async getPaymentByOrderId(orderId: string): Promise<any> {
    const res = await apiClient.get(`/payments/order/${orderId}`);
    return res.data.data;
  },
};
