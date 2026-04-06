import api from './api.js';

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('admin_token', data.token);
    }
    return data;
  },

  async me() {
    const { data } = await api.get('/auth/me');
    return data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('admin_token');
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('admin_token');
  }
};
