import axios from 'axios';

const API_BASE =
  import.meta.env.MODE === 'development'
    ? '/api'
    : import.meta.env.VITE_API_URL ?? 'MISSING_ENV';
    
console.log(import.meta.env);

console.log("API_BASE =", API_BASE);

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
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
export type Category = { id: string; name: string; subCategories: SubCategory[] };
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
  users: (page = 1, limit = 10) =>
    api.get<{ data: User[]; total: number; page: number; limit: number }>('/admin/users', {
      params: { page, limit },
    }),
  createUser: (data: { name: string; phone: string; role?: string }) =>
    api.post<{ data: User }>('/admin/users', data),
  updateUser: (id: string, data: { name?: string; phone?: string; role?: string }) =>
    api.patch<{ data: User }>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  prompts: (page = 1, limit = 10) =>
    api.get<{
      data: (PromptItem & { user?: { id: string; email: string } })[];
      total: number;
      page: number;
      limit: number;
    }>('/admin/prompts', { params: { page, limit } }),
  categories: () => api.get<{ data: Category[] }>('/admin/categories'),
  createCategory: (name: string) => api.post<{ data: Category }>('/admin/categories', { name }),
  updateCategory: (id: string, name: string) => api.patch<{ data: Category }>(`/admin/categories/${id}`, { name }),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
  createSubCategory: (categoryId: string, name: string) =>
    api.post<{ data: SubCategory }>(`/admin/categories/${categoryId}/subcategories`, { name }),
  updateSubCategory: (id: string, name: string) => api.patch<{ data: SubCategory }>(`/admin/subcategories/${id}`, { name }),
  deleteSubCategory: (id: string) => api.delete(`/admin/subcategories/${id}`),
};
