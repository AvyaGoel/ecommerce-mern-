import axios from 'axios';

const API = axios.create({
  baseURL: processQueue.env.ecommerce-mern-production-d024.up.railway.app ? 
  `${ecommerce-mern-production-d024.up.railway.app}`
  : '/api',
  withCredentials: true,
});

// Request interceptor - attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Response interceptor - refresh token on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return API(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post('/api/auth/refresh-token', {}, { withCredentials: true });
        localStorage.setItem('accessToken', data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default API;

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.put(`/auth/reset-password/${token}`, { password }),
};

// Products
export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getOne: (id) => API.get(`/products/${id}`),
  getCategories: () => API.get('/products/categories'),
  create: (data) => API.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => API.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => API.delete(`/products/${id}`),
  review: (id, data) => API.post(`/products/${id}/review`, data),
  getLowStock: () => API.get('/products/low-stock'),
};

// Cart
export const cartAPI = {
  get: () => API.get('/cart'),
  add: (productId, quantity) => API.post('/cart/add', { productId, quantity }),
  update: (productId, quantity) => API.put(`/cart/item/${productId}`, { quantity }),
  remove: (productId) => API.delete(`/cart/item/${productId}`),
  clear: () => API.delete('/cart/clear'),
};

// Orders
export const orderAPI = {
  create: (data) => API.post('/orders', data),
  getMyOrders: () => API.get('/orders/my-orders'),
  getOne: (id) => API.get(`/orders/${id}`),
  getAll: (params) => API.get('/orders', { params }),
  updateStatus: (id, status, note) => API.put(`/orders/${id}/status`, { status, note }),
};

// Payment
export const paymentAPI = {
  createRazorpayOrder: (orderId) => API.post('/payment/create-order', { orderId }),
  verifyPayment: (data) => API.post('/payment/verify', data),
  getKey: () => API.get('/payment/razorpay-key'),
};

// Admin
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getUsers: (params) => API.get('/admin/users', { params }),
  updateUserRole: (id, role) => API.put(`/admin/users/${id}/role`, { role }),
  toggleUserStatus: (id) => API.put(`/admin/users/${id}/toggle-status`),
};

// User
export const userAPI = {
  updateProfile: (data) => API.put('/user/profile', data),
  changePassword: (data) => API.put('/user/change-password', data),
  addAddress: (data) => API.post('/user/addresses', data),
  deleteAddress: (id) => API.delete(`/user/addresses/${id}`),
};
