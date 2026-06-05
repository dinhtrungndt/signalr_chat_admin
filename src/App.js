import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import useAuthStore from './stores/useAuthStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import UsersPage from './pages/UsersPage';
import AdminLayout from './components/AdminLayout';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } }
});

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
let socket = null;

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Đang xác thực...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  // Xác thực người dùng
  useEffect(() => { checkAuth(); }, [checkAuth]);

  // Quản lý Socket.io connection cho realtime updates
  useEffect(() => {
    if (isAuthenticated && token) {
      if (!socket) {
        socket = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
          console.log('Admin socket connected');
        });

        // Lắng nghe các thay đổi từ hệ thống
        socket.on('user_created', () => {
          queryClient.invalidateQueries({ queryKey: ['admin_users'] });
        });
        socket.on('user_updated', () => {
          queryClient.invalidateQueries({ queryKey: ['admin_users'] });
        });
        socket.on('user_deleted', () => {
          queryClient.invalidateQueries({ queryKey: ['admin_users'] });
        });
        socket.on('group_deleted', () => {
          queryClient.invalidateQueries({ queryKey: ['admin_groups'] });
        });
      }
    } else {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    }

    return () => {
      // Cleanup on unmount handled by global socket variable
    };
  }, [isAuthenticated, token]);

  // Lắng nghe cài đặt màu hệ thống và theme từ localStorage
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('dvn_admin_theme') || 'system';
      const isDark = savedTheme === 'dark' || (savedTheme === 'system' && mediaQuery.matches);
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme(); // Lần đầu tải trang
    
    // Lắng nghe sự kiện đổi theme thủ công từ component khác
    window.addEventListener('theme_changed', applyTheme);
    mediaQuery.addEventListener('change', applyTheme); // Khi hệ thống đổi màu
    
    return () => {
      window.removeEventListener('theme_changed', applyTheme);
      mediaQuery.removeEventListener('change', applyTheme);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="groups/:groupId" element={<GroupDetailPage />} />
            <Route path="users" element={<UsersPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
