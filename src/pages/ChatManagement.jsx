import { useState, useEffect } from 'react';
import { MessageCircle, Users, Clock, CheckCircle, X, Send, User, Bot, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function ChatManagement() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    waiting: 0,
    closed: 0,
    total: 0,
  });
  const [filter, setFilter] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalConversations, setTotalConversations] = useState(0);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filter changes
  }, [filter]);

  useEffect(() => {
    loadConversations();
    loadStaff();
    loadStats();

    if (!supabase) return;

    const conversationsChannel = supabase.channel('conversations-changes');

    conversationsChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations',
        },
        () => {
          loadConversations();
          loadStats();
        }
      )
      .subscribe();

    return () => {
      if (conversationsChannel) {
        supabase.removeChannel(conversationsChannel);
      }
    };
  }, [filter, currentPage]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);

      if (!supabase) return;

      const messagesChannel = supabase.channel(`messages:${selectedConversation.id}`);

      messagesChannel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `conversation_id=eq.${selectedConversation.id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new]);
          }
        )
        .subscribe();

      return () => {
        if (messagesChannel) {
          supabase.removeChannel(messagesChannel);
        }
      };
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    if (!supabase) return;

    // First, get total count
    let countQuery = supabase
      .from('chat_conversations')
      .select('*', { count: 'exact', head: true });

    if (filter !== 'all') {
      countQuery = countQuery.eq('status', filter);
    }

    const { count } = await countQuery;

    if (count !== null) {
      setTotalConversations(count);
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
    }

    // Then, get paginated data
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false })
      .range(from, to);

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;
    if (!error) {
      setConversations(data || []);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error) {
      setMessages(data || []);
    }
  };

  const loadStaff = async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('chat_staff')
      .select('*')
      .order('name');

    if (!error) {
      setStaff(data || []);
    }
  };

  const loadStats = async () => {
    if (!supabase) return;

    const { data: allConversations } = await supabase
      .from('chat_conversations')
      .select('status');

    if (allConversations) {
      const active = allConversations.filter((c) => c.status === 'active').length;
      const waiting = allConversations.filter((c) => c.status === 'waiting').length;
      const closed = allConversations.filter((c) => c.status === 'closed').length;

      setStats({
        active,
        waiting,
        closed,
        total: allConversations.length,
      });
    }
  };

  const sendStaffMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !supabase) return;

    const { error } = await supabase.from('chat_messages').insert({
      conversation_id: selectedConversation.id,
      sender_type: 'staff',
      sender_name: 'موظف الدعم',
      message: newMessage.trim(),
      message_type: 'text',
    });

    if (!error) {
      setNewMessage('');

      await supabase
        .from('chat_conversations')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedConversation.id);
    }
  };

  const updateConversationStatus = async (conversationId, status) => {
    if (!supabase) return;

    const { error } = await supabase
      .from('chat_conversations')
      .update({ status })
      .eq('id', conversationId);

    if (!error) {
      loadConversations();
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation({ ...selectedConversation, status });
      }
    }
  };

  const assignToStaff = async (conversationId, staffEmail) => {
    if (!supabase) return;

    const { error } = await supabase
      .from('chat_conversations')
      .update({ assigned_to: staffEmail, status: 'waiting' })
      .eq('id', conversationId);

    if (!error) {
      loadConversations();
    }
  };

  const getServiceCategoryLabel = (category) => {
    const labels = {
      education: 'التعليم',
      poa: 'التوكيلات',
      passports: 'جوازات السفر',
      documents: 'الوثائق',
      legal: 'الخدمات القانونية',
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-800">إدارة المحادثات</h1>
          </div>
          <button
            onClick={() => navigate('/admin/chatbot')}
            className="flex items-center gap-2 px-4 py-2 bg-[#276073] text-white rounded-lg hover:bg-[#1e4a5a] transition-colors"
            title="إعدادات الشات بوت"
          >
            <Settings className="w-5 h-5" />
            <span>إعدادات الشات بوت</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">محادثات نشطة</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
              </div>
              <div className="bg-[#276073]/10 p-3 rounded-full">
                <MessageCircle className="w-6 h-6 text-[#276073]" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">في الانتظار</p>
                <p className="text-3xl font-bold text-amber-600">{stats.waiting}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">مغلقة</p>
                <p className="text-3xl font-bold text-gray-600">{stats.closed}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">المجموع</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4">
          <div className="flex gap-2 p-4 border-b border-gray-200">
            {['all', 'active', 'waiting', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' && 'الكل'}
                {status === 'active' && 'نشطة'}
                {status === 'waiting' && 'في الانتظار'}
                {status === 'closed' && 'مغلقة'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">المحادثات</h2>
              <span className="text-sm text-gray-600">
                {totalConversations} محادثة
              </span>
            </div>
            <div className="divide-y divide-gray-200 overflow-y-auto flex-1">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>لا توجد محادثات</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-emerald-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{conv.user_name}</p>
                        <p className="text-sm text-gray-500">{conv.user_email}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          conv.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : conv.status === 'waiting'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {conv.status === 'active' && 'نشطة'}
                        {conv.status === 'waiting' && 'انتظار'}
                        {conv.status === 'closed' && 'مغلقة'}
                      </span>
                    </div>
                    {conv.service_category && (
                      <p className="text-xs text-gray-600 mb-1">
                        {getServiceCategoryLabel(conv.service_category)}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(conv.updated_at).toLocaleString('ar-SA')}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      صفحة {currentPage} من {totalPages}
                    </span>
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>

                {/* Page Numbers */}
                <div className="flex items-center justify-center gap-1 mt-3">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-gray-800">{selectedConversation.user_name}</h2>
                      <p className="text-sm text-gray-500">{selectedConversation.user_email}</p>
                    </div>
                    <div className="flex gap-2">
                      {selectedConversation.status !== 'closed' && (
                        <button
                          onClick={() => updateConversationStatus(selectedConversation.id, 'closed')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                          إغلاق المحادثة
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 max-h-[450px]">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.sender_type === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          msg.sender_type === 'user'
                            ? 'bg-blue-100'
                            : msg.sender_type === 'bot'
                            ? 'bg-emerald-100'
                            : 'bg-purple-100'
                        }`}
                      >
                        {msg.sender_type === 'user' ? (
                          <User className="w-4 h-4 text-blue-600" />
                        ) : msg.sender_type === 'bot' ? (
                          <Bot className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <User className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          msg.sender_type === 'user'
                            ? 'bg-blue-500 text-white rounded-tr-none'
                            : msg.sender_type === 'bot'
                            ? 'bg-emerald-500 text-white rounded-tl-none'
                            : 'bg-purple-500 text-white rounded-tl-none'
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">{msg.sender_name}</p>
                        <p className="text-sm whitespace-pre-line">{msg.message}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {new Date(msg.created_at).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedConversation.status !== 'closed' && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendStaffMessage()}
                        placeholder="اكتب ردك..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                      <button
                        onClick={sendStaffMessage}
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>اختر محادثة لعرضها</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
