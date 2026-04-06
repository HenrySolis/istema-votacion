import axios from 'axios';

/**
 * Construye la baseURL de axios de forma segura:
 * - Desarrollo:  sin VITE_API_URL → '/api'  (el proxy de Vite redirige a localhost:3000)
 * - Producción:  VITE_API_URL puede venir con o sin '/api' al final;
 *                esta función garantiza que siempre termine en '/api'
 *                y nunca se duplique ('/api/api').
 */
function buildApiBase() {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw) return '/api';
  const base = raw.replace(/\/+$/, '');        // quitar barras finales
  return base.endsWith('/api') ? base : `${base}/api`;
}

const API_URL = buildApiBase();

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000
});

// Adjuntar JWT a las peticiones admin
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejar 401 globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
