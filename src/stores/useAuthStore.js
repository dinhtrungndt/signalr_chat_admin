import { create } from 'zustand';
import { TOKEN_KEY } from '../services/axiosClient';
import adminApi from '../services/adminApi';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (credentials) => {
    const { data } = await adminApi.login(credentials);
    const { user, accessToken } = data.data;

    if (!user.isSystemAdmin) {
      throw new Error('Tài khoản không có quyền truy cập trang quản trị');
    }

    localStorage.setItem(TOKEN_KEY, accessToken);
    set({ user, isAuthenticated: true });
    return data;
  },

  checkAuth: async () => {
    set({ isLoading: true });
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const { data } = await adminApi.getMe();
      const user = data.data;
      if (!user.isSystemAdmin) {
        localStorage.removeItem(TOKEN_KEY);
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
