import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Trash2, Edit2, Search, X, Check, UserCheck, UserX } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import adminApi from '../services/adminApi';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:1411';
const formatDate = (d) => { try { return format(new Date(d), 'dd/MM/yyyy', { locale: vi }); } catch { return '—'; } };

const CreateUserModal = ({ onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await adminApi.createUser(data);
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Tạo user thất bại');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl transition-colors">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700/50">
          <h2 className="font-semibold text-slate-900 dark:text-white">Tạo user mới</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Họ và tên *</label>
              <input {...register('fullName', { required: true })} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors" placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Tên đăng nhập *</label>
              <input {...register('username', { required: true })} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors" placeholder="ten_dang_nhap" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Mật khẩu *</label>
              <input type="password" {...register('password', { required: true, minLength: 6 })} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors" placeholder="••••••" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Số điện thoại</label>
              <input {...register('phone')} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors" placeholder="0901234567" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Mã đơn vị</label>
            <input {...register('unitCode')} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors" placeholder="VD: DV001" />
            <p className="text-slate-500 dark:text-slate-600 text-xs mt-1">Hệ thống sẽ tự động tạo nhóm nếu chưa tồn tại</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isSystemAdmin" {...register('isSystemAdmin')} className="rounded" />
            <label htmlFor="isSystemAdmin" className="text-sm text-slate-600 dark:text-slate-300">Cấp quyền System Admin</label>
          </div>
          {serverError && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/40 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3">{serverError}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Hủy</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium disabled:opacity-60 transition-colors">
              {isSubmitting ? 'Đang tạo...' : 'Tạo user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditUnitCodeModal = ({ user, onClose, onSuccess }) => {
  const [value, setValue] = useState(user.unitCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true); setError('');
    try {
      await adminApi.updateUser(user.id, { unitCode: value || null });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 transition-colors">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-1">Đổi mã đơn vị</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">User: <span className="text-slate-900 dark:text-white font-medium">{user.fullName}</span></p>
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors mb-3"
          placeholder="Mã đơn vị (để trống = xóa)"
        />
        {error && <p className="text-red-600 dark:text-red-400 text-xs mb-3">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Hủy</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium disabled:opacity-60 transition-colors">
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};

const UsersPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => adminApi.getAllUsers({ search: search || undefined }).then(r => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setDeletingId(null);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.updateUser(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return (
    <div className="p-6 lg:p-8">
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] }); }}
        />
      )}
      {editUser && (
        <EditUnitCodeModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý User</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{users.length} tài khoản trong hệ thống</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> Tạo user mới
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc username..."
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700/50">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mã đơn vị</th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tham gia</th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Đang tải...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Không có user nào</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img src={`${SOCKET_URL}${u.avatar}`} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-white font-semibold text-sm flex-shrink-0">
                          {u.fullName?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-slate-900 dark:text-white font-medium">{u.fullName}</p>
                        <p className="text-slate-500 text-xs">@{u.username} · ID: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {u.unitCode ? (
                        <code className="text-indigo-600 dark:text-indigo-400 text-xs bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">{u.unitCode}</code>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-600 text-xs">Chưa gán</span>
                      )}
                      <button onClick={() => setEditUser(u)} className="p-1 text-slate-500 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      u.status === 'ACTIVE' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                    }`}>
                      {u.status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {u.isSystemAdmin ? (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400">System Admin</span>
                    ) : (
                      <span className="text-xs text-slate-500 dark:text-slate-600">User</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{formatDate(u.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      {/* Toggle status */}
                      <button
                        onClick={() => toggleStatusMutation.mutate({ id: u.id, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                        className={`p-1.5 rounded-lg transition-colors ${u.status === 'ACTIVE' ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:text-amber-400 dark:hover:bg-amber-900/20' : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20'}`}
                        title={u.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      >
                        {u.status === 'ACTIVE' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>

                      {/* Delete */}
                      {deletingId === u.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => deleteMutation.mutate(u.id)} className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors" disabled={deleteMutation.isPending}>
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeletingId(null)} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeletingId(u.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
