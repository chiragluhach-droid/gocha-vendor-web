import axios from 'axios';

const API_BASE_URL = 'https://ware-mental-progressive-sensors.trycloudflare.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  vendorLogin: async (restaurantId, passkey) => {
    const response = await api.post('/api/auth/vendor-login', { restaurantId, passkey });
    return response.data;
  },
  // validateToken: async () => {
  //   const response = await api.get('/api/auth/me');
  //   return response.data;
  // },
};

export const restaurantAPI = {
  getDetails: async (restaurantId) => {
    const response = await api.get(`/api/restaurants/${restaurantId}`);
    return response.data;
  },
  getMenu: async (restaurantId, includeUnavailable = false) => {
    const response = await api.get(`/api/restaurants/${restaurantId}/menu${includeUnavailable ? '?includeUnavailable=true' : ''}`);
    return response.data;
  },
  addMenuItem: async (restaurantId, item) => {
    const response = await api.post(`/api/restaurants/${restaurantId}/menu/items`, item);
    return response.data;
  },
  updateMenuItem: async (itemId, updates) => {
    const response = await api.put(`/api/restaurants/menu/items/${itemId}`, updates);
    return response.data;
  },
  updateRestaurant: async (id, updates) => {
    const response = await api.put(`/api/restaurants/${id}`, updates);
    return response.data;
  },
};

export const orderAPI = {
  getByRestaurant: async (restaurantId) => {
    const response = await api.get(`/api/orders/restaurant/${restaurantId}`);
    return response.data;
  },
  updateStatus: async (orderId, status) => {
    const response = await api.patch(`/api/orders/${orderId}/status`, { status });
    return response.data;
  },
};

export default api;
