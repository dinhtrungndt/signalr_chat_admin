import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1411/api';
const TOKEN_KEY = 'dvn_admin_token';

const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { TOKEN_KEY };
export default axiosClient;
