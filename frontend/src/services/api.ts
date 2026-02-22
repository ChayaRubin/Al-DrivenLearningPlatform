import axios from 'axios';

const RENDER_BACKEND = 'https://ai-driven-learning-backend.onrender.com';
const envUrl = import.meta.env.VITE_API_URL as string | undefined;
const API_BASE =
  import.meta.env.MODE === 'development'
    ? '/api'
    : (envUrl?.startsWith('http') ? envUrl : RENDER_BACKEND);

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isAuthRequest =
        err.config?.url?.includes('/auth/login') || err.config?.url?.includes('/auth/register');
      if (!isAuthRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export type User = { id: string; email: string; name?: string | null; phone?: string | null; role: string; createdAt: string };
export type Category = { id: string; name: string; imageUrl?: string | null; subCategories: SubCategory[] };
export type SubCategory = { id: string; name: string; categoryId: string };
export type PromptItem = {
  id: string;
  userPrompt: string;
  generatedLesson: string;
  categoryId: string;
  subCategoryId: string;
  createdAt: string;
  category?: { name: string };
  subCategory?: { name: string };
};

export const authApi = {
  register: (name: string, phone: string) =>
    api.post<{ data: { user: User; token: string } }>('/auth/register', { name, phone }),
  login: (name: string, phone: string) =>
    api.post<{ data: { user: User; token: string } }>('/auth/login', { name, phone }),
};

export const usersApi = {
  me: () => api.get<{ data: User }>('/users/me'),
  myHistory: (page = 1, limit = 10) =>
    api.get<{ data: PromptItem[]; total: number; page: number; limit: number }>(
      '/users/me/history',
      { params: { page, limit } }
    ),
};

export const categoriesApi = {
  list: () => api.get<{ data: Category[] }>('/categories'),
  subCategories: (categoryId: string) =>
    api.get<{ data: SubCategory[] }>(`/categories/${categoryId}/subcategories`),
};

export const promptsApi = {
  create: (categoryId: string, subCategoryId: string, prompt: string) =>
    api.post<{ data: PromptItem }>('/prompts', { categoryId, subCategoryId, prompt }),
};

export const adminApi = {
  users: (page = 1, limit = 10, filters?: { search?: string; role?: string }) =>
    api.get<{ data: User[]; total: number; page: number; limit: number }>('/admin/users', {
      params: { page, limit, ...filters },
    }),
  createUser: (data: { name: string; phone: string; role?: string }) =>
    api.post<{ data: User }>('/admin/users', data),
  updateUser: (id: string, data: { name?: string; phone?: string; role?: string }) =>
    api.patch<{ data: User }>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  prompts: (page = 1, limit = 10, search?: string) =>
    api.get<{
      data: (PromptItem & { user?: { id: string; email: string } })[];
      total: number;
      page: number;
      limit: number;
    }>('/admin/prompts', { params: { page, limit, search: search || undefined } }),
  categories: () => api.get<{ data: Category[] }>('/admin/categories'),
  createCategory: (name: string, imageUrl?: string | null) =>
    api.post<{ data: Category }>('/admin/categories', { name, imageUrl }),
  updateCategory: (id: string, name: string, imageUrl?: string | null) =>
    api.patch<{ data: Category }>(`/admin/categories/${id}`, { name, imageUrl }),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
  generateCategoryImage: (id: string) =>
    api.post<{ data: Category }>(`/admin/categories/${id}/generate-image`, {}, { timeout: 90000 }),
  uploadCategoryImage: (id: string, file: File) => {
    const form = new FormData();
    form.append('image', file);
    return api.post<{ data: Category }>(`/admin/categories/${id}/image`, form, { timeout: 120000 });
  },
  createSubCategory: (categoryId: string, name: string) =>
    api.post<{ data: SubCategory }>(`/admin/categories/${categoryId}/subcategories`, { name }),
  updateSubCategory: (id: string, name: string) => api.patch<{ data: SubCategory }>(`/admin/subcategories/${id}`, { name }),
  deleteSubCategory: (id: string) => api.delete(`/admin/subcategories/${id}`),
};
