import axios from 'axios';

const baseURL = process.env.ecommerce-mern-production-d024.up.railway.app
  ? process.env.ecommerce-mern-production-d024.up.railway.app + '/api'
  : '/api';

const API = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// Attach access token to every request
API.interceptors.request.use(function(config) {
  var token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

// Auto refresh token on 401
var isRefreshing = false;
var failedQueue = [];

function processQueue(error, token) {
  failedQueue.forEach(function(prom) {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

API.interceptors.response.use(
  function(response) {
    return response;
  },
  function(error) {
    var originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve: resolve, reject: reject });
        }).then(function(token) {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return API(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      return axios.post('/api/auth/refresh-token', {}, { withCredentials: true })
        .then(function(res) {
          var newToken = res.data.accessToken;
          localStorage.setItem('accessToken', newToken);
          processQueue(null, newToken);
          originalRequest.headers.Authorization = 'Bearer ' + newToken;
          return API(originalRequest);
        })
        .catch(function(err) {
          processQueue(err, null);
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return Promise.reject(err);
        })
        .finally(function() {
          isRefreshing = false;
        });
    }
    return Promise.reject(error);
  }
);

export default API;

// Auth API
export var authAPI = {
  register: function(data) { return API.post('/auth/register', data); },
  login: function(data) { return API.post('/auth/login', data); },
  logout: function() { return API.post('/auth/logout'); },
  getMe: function() { return API.get('/auth/me'); },
  forgotPassword: function(email) { return API.post('/auth/forgot-password', { email: email }); },
  resetPassword: function(token, password) { return API.put('/auth/reset-password/' + token, { password: password }); },
};

// Product API
export var productAPI = {
  getAll: function(params) { return API.get('/products', { params: params }); },
  getOne: function(id) { return API.get('/products/' + id); },
  getCategories: function() { return API.get('/products/categories'); },
  create: function(data) { return API.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }); },
  update: function(id, data) { return API.put('/products/' + id, data, { headers: { 'Content-Type': 'multipart/form-data' } }); },
  delete: function(id) { return API.delete('/products/' + id); },
  review: function(id, data) { return API.post('/products/' + id + '/review', data); },
  getLowStock: function() { return API.get('/products/low-stock'); },
};

// Cart API
export var cartAPI = {
  get: function() { return API.get('/cart'); },
  add: function(productId, quantity) { return API.post('/cart/add', { productId: productId, quantity: quantity }); },
  update: function(productId, quantity) { return API.put('/cart/item/' + productId, { quantity: quantity }); },
  remove: function(productId) { return API.delete('/cart/item/' + productId); },
  clear: function() { return API.delete('/cart/clear'); },
};

// Order API
export var orderAPI = {
  create: function(data) { return API.post('/orders', data); },
  getMyOrders: function() { return API.get('/orders/my-orders'); },
  getOne: function(id) { return API.get('/orders/' + id); },
  getAll: function(params) { return API.get('/orders', { params: params }); },
  updateStatus: function(id, status, note) { return API.put('/orders/' + id + '/status', { status: status, note: note }); },
};

// Payment API
export var paymentAPI = {
  createRazorpayOrder: function(orderId) { return API.post('/payment/create-order', { orderId: orderId }); },
  verifyPayment: function(data) { return API.post('/payment/verify', data); },
  getKey: function() { return API.get('/payment/razorpay-key'); },
};

// Admin API
export var adminAPI = {
  getDashboard: function() { return API.get('/admin/dashboard'); },
  getUsers: function(params) { return API.get('/admin/users', { params: params }); },
  updateUserRole: function(id, role) { return API.put('/admin/users/' + id + '/role', { role: role }); },
  toggleUserStatus: function(id) { return API.put('/admin/users/' + id + '/toggle-status'); },
};

// User API
export var userAPI = {
  updateProfile: function(data) { return API.put('/user/profile', data); },
  changePassword: function(data) { return API.put('/user/change-password', data); },
  addAddress: function(data) { return API.post('/user/addresses', data); },
  deleteAddress: function(id) { return API.delete('/user/addresses/' + id); },
};