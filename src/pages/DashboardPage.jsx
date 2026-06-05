import { useQuery } from '@tanstack/react-query';
import { Users, MessageSquare, LayoutDashboard, TrendingUp } from 'lucide-react';
import adminApi from '../services/adminApi';

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value ?? '—'}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard().then(r => r.data.data),
  });

  const { data: groups, isLoading: loadingGroups } = useQuery({
    queryKey: ['admin-groups'],
    queryFn: () => adminApi.getAllGroups().then(r => r.data.data),
  });

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <LayoutDashboard className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        </div>
        <p className="text-slate-400 text-sm">Tổng quan hệ thống DVN Chat</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={MessageSquare}
          label="Tổng số nhóm"
          value={isLoading ? '...' : data?.totalGroups}
          color="text-indigo-400"
          bgColor="bg-indigo-600"
        />
        <StatCard
          icon={Users}
          label="Tổng số user"
          value={isLoading ? '...' : data?.totalUsers}
          color="text-emerald-400"
          bgColor="bg-emerald-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Tổng tin nhắn"
          value={isLoading ? '...' : data?.totalMessages?.toLocaleString()}
          color="text-amber-400"
          bgColor="bg-amber-600"
        />
      </div>

      {/* Groups list */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h2 className="font-semibold text-white">Danh sách nhóm chat</h2>
        </div>
        {loadingGroups ? (
          <div className="p-8 text-center text-slate-500">Đang tải...</div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {(groups || []).map((group) => (
              <div key={group.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/40 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                    {group.name?.charAt(0) || '#'}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{group.name}</p>
                    <p className="text-slate-500 text-xs">Mã: {group.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-white text-sm font-medium">{group.memberCount}</p>
                    <p className="text-slate-500 text-xs">thành viên</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    group.status === 'ACTIVE' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {group.status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
