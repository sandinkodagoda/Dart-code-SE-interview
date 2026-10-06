import { apiClient } from './client';
import {
  ApiResponse,
  AdminUser,
  LoginResponse,
  DashboardMetrics,
  Product,
  Category,
  Brand,
  InventoryTransaction,
  CreateProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateBrandInput,
  UpdateBrandInput,
  AdjustStockInput,
  UpdateOrderStatusInput,
  Order,
} from '@/types';

export const adminApi = {
  // ── Authentication ───────────────────────────────────────────
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    });
    return res.data.data;
  },

  getProfile: async (): Promise<AdminUser> => {
    const res = await apiClient.get<ApiResponse<AdminUser>>('/auth/me');
    return res.data.data;
  },

  // ── Dashboard Metrics ────────────────────────────────────────
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const res = await apiClient.get<ApiResponse<DashboardMetrics>>('/admin/dashboard');
    return res.data.data;
  },

  // ── Products Management ──────────────────────────────────────
  getProducts: async (params?: {
    search?: string;
    category?: string;
    brand?: string;
    isActive?: boolean;
    stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<{ data: Product[]; pagination: any }> => {
    const res = await apiClient.get<ApiResponse<Product[]>>('/admin/products', {
      params,
    });
    return {
      data: res.data.data,
      pagination: res.data.pagination,
    };
  },

  getProductById: async (id: string): Promise<Product> => {
    const res = await apiClient.get<ApiResponse<Product>>(`/admin/products/${id}`);
    return res.data.data;
  },

  createProduct: async (payload: CreateProductInput): Promise<Product> => {
    const res = await apiClient.post<ApiResponse<Product>>('/admin/products', payload);
    return res.data.data;
  },

  updateProduct: async (id: string, payload: UpdateProductInput): Promise<Product> => {
    const res = await apiClient.patch<ApiResponse<Product>>(`/admin/products/${id}`, payload);
    return res.data.data;
  },

  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<ApiResponse<any>>(`/admin/products/${id}`);
    return { success: res.data.success, message: res.data.message || 'Deactivated' };
  },

  addProductImage: async (
    productId: string,
    data: { imageUrl: string; altText?: string; displayOrder?: number; isPrimary?: boolean },
  ): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>(`/admin/products/${productId}/images`, data);
    return res.data.data;
  },

  deleteProductImage: async (productId: string, imageId: string): Promise<any> => {
    const res = await apiClient.delete<ApiResponse<any>>(`/admin/products/${productId}/images/${imageId}`);
    return res.data.data;
  },

  setPrimaryImage: async (productId: string, imageId: string): Promise<any> => {
    const res = await apiClient.patch<ApiResponse<any>>(
      `/admin/products/${productId}/images/${imageId}/primary`,
    );
    return res.data.data;
  },

  // ── Image Uploads (WebP 1:1 format) ──────────────────────────
  uploadImage: async (
    file: File,
    folder: 'products' | 'categories' | 'general' = 'general',
    isSquare: boolean = false,
  ): Promise<{ url: string; fullUrl: string; filename: string; format: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<{ url: string; fullUrl: string; filename: string; format: string }>>(
      '/uploads/image',
      formData,
      {
        params: { folder, isSquare: isSquare ? 'true' : 'false' },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return res.data.data;
  },

  // ── Categories Management ────────────────────────────────────
  getCategories: async (params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: Category[]; pagination?: any }> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/admin/categories', {
      params,
    });
    return {
      data: res.data.data,
      pagination: res.data.pagination,
    };
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const res = await apiClient.get<ApiResponse<Category>>(`/admin/categories/${id}`);
    return res.data.data;
  },

  createCategory: async (payload: CreateCategoryInput): Promise<Category> => {
    const res = await apiClient.post<ApiResponse<Category>>('/admin/categories', payload);
    return res.data.data;
  },

  updateCategory: async (id: string, payload: UpdateCategoryInput): Promise<Category> => {
    const res = await apiClient.patch<ApiResponse<Category>>(`/admin/categories/${id}`, payload);
    return res.data.data;
  },

  deleteCategory: async (id: string): Promise<any> => {
    const res = await apiClient.delete<ApiResponse<any>>(`/admin/categories/${id}`);
    return res.data;
  },

  // ── Brands Management ────────────────────────────────────────
  getBrands: async (params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: Brand[]; pagination?: any }> => {
    const res = await apiClient.get<ApiResponse<Brand[]>>('/admin/brands', {
      params,
    });
    return {
      data: res.data.data,
      pagination: res.data.pagination,
    };
  },

  getBrandById: async (id: string): Promise<Brand> => {
    const res = await apiClient.get<ApiResponse<Brand>>(`/admin/brands/${id}`);
    return res.data.data;
  },

  createBrand: async (payload: CreateBrandInput): Promise<Brand> => {
    const res = await apiClient.post<ApiResponse<Brand>>('/admin/brands', payload);
    return res.data.data;
  },

  updateBrand: async (id: string, payload: UpdateBrandInput): Promise<Brand> => {
    const res = await apiClient.patch<ApiResponse<Brand>>(`/admin/brands/${id}`, payload);
    return res.data.data;
  },

  deleteBrand: async (id: string): Promise<any> => {
    const res = await apiClient.delete<ApiResponse<any>>(`/admin/brands/${id}`);
    return res.data;
  },

  // ── Inventory Management ─────────────────────────────────────
  getLowStock: async (threshold: number = 5): Promise<Product[]> => {
    const res = await apiClient.get<ApiResponse<Product[]>>('/admin/inventory/low-stock', {
      params: { threshold },
    });
    return res.data.data;
  },

  getTransactions: async (params?: {
    productId?: string;
    type?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: InventoryTransaction[]; pagination?: any }> => {
    const res = await apiClient.get<ApiResponse<InventoryTransaction[]>>(
      '/admin/inventory/transactions',
      { params },
    );
    return {
      data: res.data.data,
      pagination: res.data.pagination,
    };
  },

  adjustStock: async (payload: AdjustStockInput): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>('/admin/inventory/adjust', payload);
    return res.data.data;
  },

  // ── Orders Management ────────────────────────────────────────
  getOrders: async (params?: {
    orderStatus?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    search?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: Order[]; pagination?: any }> => {
    const res = await apiClient.get<ApiResponse<Order[]>>('/admin/orders', {
      params,
    });
    return {
      data: res.data.data,
      pagination: res.data.pagination,
    };
  },

  getOrderById: async (id: string): Promise<Order> => {
    const res = await apiClient.get<ApiResponse<Order>>(`/admin/orders/${id}`);
    return res.data.data;
  },

  updateOrderStatus: async (id: string, payload: UpdateOrderStatusInput): Promise<Order> => {
    const res = await apiClient.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, payload);
    return res.data.data;
  },
};
