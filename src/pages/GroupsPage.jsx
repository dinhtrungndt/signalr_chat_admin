import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Trash2, Eye, Search, Users, PowerOff, Power } from 'lucide-react';
import adminApi from '../services/adminApi';

const GroupsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['admin-groups'],
    queryFn: () => adminApi.getAllGroups().then(r => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setDeletingId(null);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.updateGroup(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-groups'] }),
  });

  const filtered = groups.filter(g =>
    !search || g.name?.toLowerCase().includes(search.toLowerCase()) || g.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý Nhóm</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{groups.length} nhóm chat trong hệ thống</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc mã đơn vị..."
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700/50">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nhóm</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mã đơn vị</th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thành viên</th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tin nhắn</th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Không có nhóm nào</td></tr>
              ) : filtered.map((group) => (
                <tr key={group.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-600/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold flex-shrink-0">
                        {group.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-medium">{group.name}</p>
                        {group.lastMessage && (
                          <p className="text-slate-500 text-xs truncate max-w-[200px]">
                            {group.lastMessage.senderName}: {group.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-indigo-600 dark:text-indigo-400 text-xs bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">{group.code}</code>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-300">
                      <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {group.memberCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">{group.messageCount?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      group.status !== 'INACTIVE' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {group.status !== 'INACTIVE' ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/groups/${group.id}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* Toggle Active / Inactive */}
                      <button
                        onClick={() => toggleStatusMutation.mutate({
                          id: group.id,
                          status: group.status !== 'INACTIVE' ? 'INACTIVE' : 'ACTIVE'
                        })}
                        disabled={toggleStatusMutation.isPending}
                        className={`p-1.5 rounded-lg transition-colors ${
                          group.status !== 'INACTIVE'
                            ? 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:text-amber-400 dark:hover:bg-amber-900/20'
                            : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
                        }`}
                        title={group.status !== 'INACTIVE' ? 'Vô hiệu hóa nhóm' : 'Kích hoạt nhóm'}
                      >
                        {group.status !== 'INACTIVE'
                          ? <PowerOff className="w-4 h-4" />
                          : <Power className="w-4 h-4" />
                        }
                      </button>
                      {deletingId === group.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteMutation.mutate(group.id)}
                            className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 dark:hover:bg-red-500 text-white rounded-lg transition"
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? '...' : 'Xác nhận'}
                          </button>
                          <button onClick={() => setDeletingId(null)} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition hover:bg-slate-200 dark:hover:bg-slate-600">
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(group.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                          title="Xóa nhóm"
                        >
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

export default GroupsPage;
