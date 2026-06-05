import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Users, MessageSquare, Trash2, UserPlus, UserMinus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import adminApi from '../services/adminApi';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:1411';
const formatTime = (d) => { try { return format(new Date(d), 'HH:mm dd/MM/yyyy', { locale: vi }); } catch { return ''; } };
const formatShortTime = (d) => { try { return format(new Date(d), 'HH:mm', { locale: vi }); } catch { return ''; } };

// ===== Render nội dung từng loại tin nhắn =====
const MessageContent = ({ msg }) => {
  switch (msg.type) {
    case 'SYSTEM':
    case 'RECALLED':
      return <p className="text-[13px] text-slate-500 dark:text-slate-400 italic">{msg.content}</p>;

    case 'TEXT':
      return <p className="text-[14px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">{msg.content}</p>;

    case 'IMAGE': {
      const urls = msg.content?.split('|') || [];
      return (
        <div className={`flex flex-wrap gap-1.5 ${urls.length > 1 ? 'max-w-[300px]' : ''}`}>
          {urls.map((url, i) => {
            const isExternal = url.startsWith('http');
            const imgUrl = isExternal ? url : `${SOCKET_URL}${url}`;
            return (
              <img
                key={i}
                src={imgUrl}
                alt="Image"
                className={`rounded-xl object-cover ${urls.length === 1 ? 'max-w-[280px] max-h-[280px]' : 'w-[130px] h-[130px]'}`}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            );
          })}
        </div>
      );
    }

    case 'AUDIO':
      return <audio controls src={`${SOCKET_URL}${msg.content}`} className="h-10 max-w-[260px]" />;

    case 'FILE':
      return (
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
          <a href={`${SOCKET_URL}${msg.content}`} target="_blank" rel="noreferrer" className="text-[13px] text-indigo-400 hover:underline truncate max-w-[200px]">
            {msg.content?.split('/').pop() || 'Tải tập tin'}
          </a>
        </div>
      );

    case 'NOTE': {
      const note = msg.noteData;
      if (!note) return <p className="text-[13px] text-slate-500">[Ghi chú đã bị xóa]</p>;
      return (
        <div className="min-w-[220px]">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-yellow-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-600 dark:text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-[13px] text-yellow-600 dark:text-yellow-400">Ghi chú</span>
          </div>
          <p className="text-[14px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{note.content}</p>
        </div>
      );
    }

    case 'REMINDER': {
      const reminder = msg.reminderData;
      if (!reminder) return <p className="text-[13px] text-slate-500">[Nhắc hẹn đã bị xóa]</p>;
      const isOverdue = new Date(reminder.dueDate) < new Date() && !reminder.isDone;
      const color = isOverdue ? 'red' : reminder.isDone ? 'emerald' : 'indigo';
      return (
        <div className={`min-w-[220px] border-l-4 border-${color}-500 pl-3 py-1`}>
          <div className="flex items-center gap-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className={`font-semibold text-[13px] text-${color}-600 dark:text-${color}-400`}>
              Nhắc hẹn
            </span>
            {isOverdue && <span className="text-[10px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded uppercase font-bold">Quá hạn</span>}
            {reminder.isDone && <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold">Hoàn thành</span>}
          </div>
          <p className="text-[14px] text-slate-900 dark:text-white font-medium">{reminder.content}</p>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1.5 flex items-center gap-1">
            📅 {formatTime(reminder.dueDate)}
          </p>
        </div>
      );
    }

    case 'POLL': {
      const poll = msg.pollData;
      if (!poll) return <p className="text-[13px] text-slate-500">[Bình chọn đã bị xóa]</p>;
      const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0) || 0;
      return (
        <div className="min-w-[260px]">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
            <span className="font-semibold text-[13px] text-emerald-600 dark:text-emerald-400">Bình chọn</span>
          </div>
          <p className="text-slate-900 dark:text-white text-[14px] font-medium mb-3">{poll.question}</p>
          <div className="space-y-2">
            {poll.options?.map((opt) => {
              const count = opt.votes?.length || 0;
              const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              return (
                <div key={opt.id} className="relative bg-slate-100 dark:bg-slate-900/80 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50">
                  <div className="absolute inset-y-0 left-0 bg-emerald-500/15 transition-all" style={{ width: `${percent}%` }} />
                  <div className="relative px-3 py-2 flex justify-between items-center text-[13px]">
                    <span className="text-slate-700 dark:text-slate-200">{opt.content}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold ml-3 whitespace-nowrap">
                      {count > 0 ? `${count} (${percent}%)` : '0%'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">{totalVotes} lượt bình chọn</p>
        </div>
      );
    }

    default:
      return <p className="text-[13px] text-slate-500 dark:text-slate-400">[{msg.type}] {msg.content}</p>;
  }
};

// ===== Component chính =====
const GroupDetailPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('members');
  const [page, setPage] = useState(1);
  const [addUserId, setAddUserId] = useState('');
  const [addSearchQuery, setAddSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [addSelectedUser, setAddSelectedUser] = useState(null);
  const [addRole, setAddRole] = useState('MEMBER');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [deletingMsgId, setDeletingMsgId] = useState(null);
  const [deletingMemberId, setDeletingMemberId] = useState(null);
  const chatEndRef = useRef(null);
  const searchRef = useRef(null);

  const gid = parseInt(groupId);

  // --- Queries ---
  const { data: group, isLoading } = useQuery({
    queryKey: ['admin-group', gid],
    queryFn: () => adminApi.getGroupDetail(gid).then(r => r.data.data),
  });

  // Tìm kiếm người dùng để thêm vào nhóm (Debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(addSearchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [addSearchQuery]);

  const { data: searchResults } = useQuery({
    queryKey: ['admin-search-users', debouncedSearchQuery],
    queryFn: () => adminApi.searchUsers(debouncedSearchQuery).then(r => r.data.data),
    enabled: debouncedSearchQuery.length >= 2,
    staleTime: 10000,
  });

  // Click bên ngoài dropdown => ẩn
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: msgData, isLoading: loadingMsgs } = useQuery({
    queryKey: ['admin-group-messages', gid, page],
    queryFn: () => adminApi.getGroupMessages(gid, page).then(r => r.data.data),
    enabled: tab === 'messages',
  });

  // --- Realtime Socket ---
  useEffect(() => {
    if (tab !== 'messages') return;

    let socket = null;
    let checkInterval = null;

    const initSocket = () => {
      if (!window.io) return; // Đợi script tải xong
      if (checkInterval) clearInterval(checkInterval);

      const token = localStorage.getItem('dvn_admin_token');
      if (!token) return;

      socket = window.io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        socket.emit('joinNewGroupRoom', gid);
      });

      let timeoutId;
      const handleNewData = () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['admin-group-messages', gid] });
        }, 1000); // Đợi 1 giây sau sự kiện cuối cùng mới gọi API để tránh ddos/429
      };

      socket.on('receiveGroupMessage', handleNewData);
      socket.on('newMessage', handleNewData); 
      socket.on('message_reacted', handleNewData);
      socket.on('poll_created', handleNewData);
      socket.on('poll_updated', handleNewData);
      socket.on('note_created', handleNewData);
      socket.on('note_deleted', handleNewData);
      socket.on('reminder_created', handleNewData);
      socket.on('reminder_updated', handleNewData);
      socket.on('reminder_deleted', handleNewData);
    };

    if (window.io) {
      initSocket();
    } else {
      checkInterval = setInterval(initSocket, 500);
    }
    
    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (socket) {
        socket.emit('leaveGroupRoom', gid);
        socket.disconnect();
      }
    };
  }, [tab, gid, queryClient]);

  // --- Mutations ---
  const deleteMsgMutation = useMutation({
    mutationFn: (msgId) => adminApi.deleteMessage(msgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-group-messages', gid] });
      setDeletingMsgId(null);
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ username, role }) => adminApi.addMember(gid, { username, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-group', gid] });
      setAddSearchQuery('');
      setAddSelectedUser(null);
      setAddRole('MEMBER');
      setAddUserId('');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId) => adminApi.removeMember(gid, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-group', gid] });
      setDeletingMemberId(null);
    },
  });

  if (isLoading) return (
    <div className="p-8 text-center text-slate-500 dark:text-slate-400">Đang tải...</div>
  );

  const members = group?.userGroups || [];
  const messages = msgData?.messages || [];
  // Đảo thứ tự tin nhắn (cũ ở trên, mới ở dưới) khi hiển thị
  const sortedMessages = [...messages].reverse();

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <button onClick={() => navigate('/groups')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách nhóm
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-600/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
          {group?.name?.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{group?.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Mã đơn vị: <code className="text-indigo-600 dark:text-indigo-400">{group?.code}</code></p>
        </div>
        <div className="ml-auto flex items-center gap-6 text-center">
          <div>
            <p className="text-slate-900 dark:text-white font-bold text-lg">{members.length}</p>
            <p className="text-slate-500 text-xs">Thành viên</p>
          </div>
          <div>
            <p className="text-slate-900 dark:text-white font-bold text-lg">{group?._count?.messages || 0}</p>
            <p className="text-slate-500 text-xs">Tin nhắn</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl p-1 w-fit mb-6 transition-colors">
        {[
          { key: 'members', icon: Users, label: 'Thành viên' },
          { key: 'messages', icon: MessageSquare, label: 'Lịch sử chat' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ===== Members Tab ===== */}
      {tab === 'members' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden transition-colors">
          {/* Add member - Search autocomplete + Role picker */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/30">
            <div className="flex gap-3 items-end">
              {/* Search input + dropdown */}
              <div className="flex-1 relative" ref={searchRef}>
                <label className="text-xs text-slate-500 mb-1 block">Tìm người dùng</label>
                {addSelectedUser ? (
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-indigo-500/50 rounded-xl px-3 py-2">
                    {addSelectedUser.avatar ? (
                      <img src={`${SOCKET_URL}${addSelectedUser.avatar}`} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-600/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                        {addSelectedUser.fullName?.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm text-slate-900 dark:text-white font-medium">{addSelectedUser.fullName}</span>
                    <span className="text-xs text-slate-500">@{addSelectedUser.username}</span>
                    <button
                      onClick={() => { setAddSelectedUser(null); setAddSearchQuery(''); }}
                      className="ml-auto text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition text-lg leading-none"
                    >&times;</button>
                  </div>
                ) : (
                  <input
                    value={addSearchQuery}
                    onChange={e => {
                      setAddSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => addSearchQuery.length >= 2 && setShowSuggestions(true)}
                    placeholder="Gõ tên hoặc username để tìm..."
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
                  />
                )}

                {/* Dropdown kết quả */}
                {showSuggestions && !addSelectedUser && searchResults && searchResults.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                    {searchResults
                      .filter(u => !members.some(m => m.userId === u.id)) // Ẩn user đã trong nhóm
                      .map(user => (
                        <button
                          key={user.id}
                          onClick={() => {
                            setAddSelectedUser(user);
                            setAddSearchQuery(user.username);
                            setShowSuggestions(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition text-left"
                        >
                          {user.avatar ? (
                            <img src={`${SOCKET_URL}${user.avatar}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-white font-semibold text-sm">
                              {user.fullName?.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-900 dark:text-white font-medium truncate">{user.fullName}</p>
                            <p className="text-xs text-slate-500 truncate">@{user.username} · {user.unitCode || 'Không có đơn vị'}</p>
                          </div>
                        </button>
                      ))}
                    {searchResults.filter(u => !members.some(m => m.userId === u.id)).length === 0 && (
                      <p className="px-4 py-3 text-sm text-slate-500 text-center">Tất cả kết quả đều đã là thành viên</p>
                    )}
                  </div>
                )}

                {showSuggestions && !addSelectedUser && addSearchQuery.length >= 2 && searchResults && searchResults.length === 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-2xl">
                    <p className="px-4 py-3 text-sm text-slate-500 text-center">Không tìm thấy người dùng nào</p>
                  </div>
                )}
              </div>

              {/* Role selector */}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Quyền</label>
                <select
                  value={addRole}
                  onChange={e => setAddRole(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition appearance-none cursor-pointer"
                >
                  <option value="MEMBER">Thành viên</option>
                  <option value="DEPUTY">Phó nhóm</option>
                  <option value="ADMIN">Trưởng nhóm</option>
                </select>
              </div>

              {/* Add button */}
              <button
                onClick={() => addSelectedUser && addMemberMutation.mutate({ username: addSelectedUser.username, role: addRole })}
                disabled={!addSelectedUser || addMemberMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                {addMemberMutation.isPending ? 'Đang thêm...' : 'Thêm'}
              </button>
            </div>
          </div>
          {addMemberMutation.isError && (
            <div className="px-6 py-2 text-red-400 text-sm border-b border-slate-700/30">
              {addMemberMutation.error?.response?.data?.message || 'Lỗi khi thêm thành viên'}
            </div>
          )}

          {/* Member list */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
            {members.map((m) => (
              <div key={m.userId} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  {m.user?.avatar ? (
                    <img src={`${SOCKET_URL}${m.user.avatar}`} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-white font-semibold text-sm">
                      {m.user?.fullName?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-slate-900 dark:text-white font-medium text-sm">{m.user?.fullName}</p>
                    <p className="text-slate-500 text-xs">@{m.user?.username} · ID: {m.userId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    m.role === 'ADMIN' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400' :
                    m.role === 'DEPUTY' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400' :
                    'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {m.role}
                  </span>
                  {deletingMemberId === m.userId ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => removeMemberMutation.mutate(m.userId)} className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-500 transition">Xác nhận</button>
                      <button onClick={() => setDeletingMemberId(null)} className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">Hủy</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeletingMemberId(m.userId)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Messages Tab - Chat Style ===== */}
      {tab === 'messages' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden transition-colors">
          {loadingMsgs ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">Đang tải...</div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">Không có tin nhắn</div>
          ) : (
            <div className="flex flex-col">
              {/* Chat Area */}
              <div className="h-[600px] overflow-y-auto p-5 space-y-4 bg-slate-50 dark:bg-[#0c1322] transition-colors" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                {sortedMessages.map((msg, idx) => {
                  // Gom nhóm: nếu cùng sender liên tiếp thì ẩn avatar/tên
                  const prevMsg = idx > 0 ? sortedMessages[idx - 1] : null;
                  const isSameSender = prevMsg && prevMsg.senderId === msg.senderId && prevMsg.type !== 'SYSTEM';
                  const isSystem = msg.type === 'SYSTEM' || msg.type === 'RECALLED';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center group/msg">
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] text-slate-500 dark:text-slate-400 italic bg-slate-200 dark:bg-slate-800/40 px-3 py-1 rounded-full">
                            {msg.content}
                          </p>
                          <button
                            onClick={() => deletingMsgId === msg.id ? deleteMsgMutation.mutate(msg.id) : setDeletingMsgId(msg.id)}
                            className="opacity-0 group-hover/msg:opacity-100 p-1 rounded text-slate-400 hover:text-red-600 dark:text-slate-600 dark:hover:text-red-400 transition"
                            title={deletingMsgId === msg.id ? 'Nhấn lần nữa để xóa' : 'Xóa'}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={`flex items-start gap-3 group/msg ${isSameSender ? 'mt-0.5' : 'mt-3'}`}>
                      {/* Avatar */}
                      {!isSameSender ? (
                        msg.sender?.avatar ? (
                          <img src={`${SOCKET_URL}${msg.sender.avatar}`} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-1" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1 shadow-md">
                            {msg.sender?.fullName?.charAt(0)}
                          </div>
                        )
                      ) : (
                        <div className="w-9 flex-shrink-0" /> /* Spacer */
                      )}

                      {/* Message body */}
                      <div className="flex flex-col items-start max-w-[75%] min-w-0">
                        {/* Tên + Thời gian */}
                        {!isSameSender && (
                          <div className="flex items-center gap-2 mb-1 ml-1">
                            <span className="text-slate-900 dark:text-white text-[13px] font-semibold">{msg.sender?.fullName}</span>
                            <span className="text-slate-500 text-[11px]">{formatTime(msg.createdAt)}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {/* Bubble */}
                          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/40 rounded-2xl rounded-tl-md px-4 py-2.5 shadow-sm transition-colors">
                            <MessageContent msg={msg} />
                          </div>

                          {/* Thời gian cho tin cùng nhóm */}
                          {isSameSender && (
                            <span className="text-slate-400 dark:text-slate-600 text-[10px] opacity-0 group-hover/msg:opacity-100 transition whitespace-nowrap">
                              {formatShortTime(msg.createdAt)}
                            </span>
                          )}

                          {/* Hover Actions */}
                          <div className="opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center gap-1 flex-shrink-0">
                            {deletingMsgId === msg.id ? (
                              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-lg animate-in">
                                <button onClick={() => deleteMsgMutation.mutate(msg.id)} className="text-[11px] px-2.5 py-1 bg-red-600 text-white rounded hover:bg-red-700 dark:hover:bg-red-500 transition font-medium">Xóa</button>
                                <button onClick={() => setDeletingMsgId(null)} className="text-[11px] px-2 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">Hủy</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingMsgId(msg.id)}
                                className="p-1.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-red-500/50 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                                title="Xóa tin nhắn"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {deletingMemberId === msg.sender?.id ? (
                              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-lg animate-in">
                                <button onClick={() => removeMemberMutation.mutate(msg.sender?.id)} className="text-[11px] px-2.5 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 dark:hover:bg-orange-500 transition font-medium">Kích</button>
                                <button onClick={() => setDeletingMemberId(null)} className="text-[11px] px-2 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">Hủy</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingMemberId(msg.sender?.id)}
                                className="p-1.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-orange-500/50 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:text-slate-500 dark:hover:text-orange-400 dark:hover:bg-orange-500/10 transition-colors"
                                title="Kích khỏi nhóm"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Pagination */}
              <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700/30 flex items-center justify-between bg-white dark:bg-slate-900 transition-colors">
                <p className="text-slate-500 dark:text-slate-400 text-xs">Trang {page} / {msgData?.totalPages || 1} · {msgData?.total?.toLocaleString()} tin nhắn</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 transition">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-slate-500 dark:text-slate-400 text-xs tabular-nums">{page}</span>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= (msgData?.totalPages || 1)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 transition">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupDetailPage;
