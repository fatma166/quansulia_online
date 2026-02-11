import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Edit,
  Eye,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Settings,
  Globe,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  Palette,
  FileText,
  Layout,
  BarChart3,
  FileCode,
  Users,
  User,
  TrendingUp,
  Award,
  Calendar,
  Handshake,
  FileCheck,
  Newspaper,
  CalendarDays,
  Wrench,
  Bell,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  renderCountersSection,
  renderPageSectionsManager,
  renderFooterContentSection
} from './ContentManagementSections';
import {
  CounterModal,
  PageSectionModal,
  FooterContentModal
} from './ContentManagementModals';
import {
  renderNewsSection,
  renderEventsSection
} from './ContentManagementNewsEvents';
import {
  NewsModal,
  EventModal
} from '../components/NewsEventsModals';
import {
  renderAnnouncementsSection,
  renderMaintenanceSection,
  AnnouncementModal
} from './ContentManagementAnnouncementsMaintenance';
import ContentManagementAboutSudan from './ContentManagementAboutSudan';
import SliderImageUploader from '../components/SliderImageUploader';

const ContentManagement = () => {
  const { user, isSuperAdmin, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('slider');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // State for different content types
  const [sliderItems, setSliderItems] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [contactInfo, setContactInfo] = useState([]);
  const [siteSettings, setSiteSettings] = useState([]);
  const [footerContent, setFooterContent] = useState([]);
  const [counters, setCounters] = useState([]);
  const [pageSections, setPageSections] = useState([]);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [breakingNews, setBreakingNews] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [maintenanceSettings, setMaintenanceSettings] = useState(null);
  const [contactMessages, setContactMessages] = useState([]);
  const [staff, setStaff] = useState([]);

  // Edit states
  const [editingItem, setEditingItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({});

  // Contact messages states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Content sections configuration
  const contentSections = [
    {
      id: 'slider',
      title: 'إدارة السلايدر',
      icon: Layout,
      description: 'إدارة صور وعناوين السلايدر الرئيسي'
    },
    {
      id: 'news',
      title: 'إدارة الأخبار',
      icon: Newspaper,
      description: 'إدارة الأخبار والبيانات الرسمية'
    },
    {
      id: 'events',
      title: 'إدارة الفعاليات',
      icon: CalendarDays,
      description: 'إدارة الفعاليات والأنشطة'
    },
    {
      id: 'breaking-news',
      title: 'شريط الأخبار العاجلة',
      icon: TrendingUp,
      description: 'إدارة شريط الأخبار المتحرك في أعلى الموقع'
    },
    {
      id: 'announcements',
      title: 'الإشعارات والتنبيهات',
      icon: Bell,
      description: 'إدارة الإشعارات والتنبيهات التي تظهر للمستخدمين'
    },
    {
      id: 'maintenance',
      title: 'وضع الصيانة',
      icon: Wrench,
      description: 'تفعيل وإدارة وضع الصيانة للموقع'
    },
    {
      id: 'counters',
      title: 'إنجازاتنا بالأرقام',
      icon: BarChart3,
      description: 'إدارة قسم الإحصائيات والأرقام'
    },
    {
      id: 'about-sudan',
      title: 'صفحة عن السودان',
      icon: Globe,
      description: 'إدارة محتوى صفحة "عن السودان" بالكامل'
    },
    {
      id: 'pages',
      title: 'الصفحات الداخلية الأخرى',
      icon: FileCode,
      description: 'إدارة محتوى الصفحات الداخلية للموقع'
    },
    {
      id: 'social',
      title: 'روابط التواصل الاجتماعي',
      icon: Globe,
      description: 'إدارة روابط مواقع التواصل الاجتماعي'
    },
    {
      id: 'contact',
      title: 'معلومات التواصل',
      icon: Phone,
      description: 'إدارة بيانات التواصل (هاتف، إيميل، عنوان)'
    },
    {
      id: 'contact-messages',
      title: 'رسائل التواصل',
      icon: Mail,
      description: 'إدارة ومتابعة رسائل الزوار من صفحة تواصل معنا'
    },
    {
      id: 'footer',
      title: 'محتوى الفوتر',
      icon: FileText,
      description: 'إدارة محتوى التذييل'
    },
    {
      id: 'site',
      title: 'إعدادات الموقع',
      icon: Settings,
      description: 'الإعدادات العامة للموقع'
    }
  ];

  // Load data on component mount and when section changes
  useEffect(() => {
    loadData();
  }, [activeSection]);

  // Reset contact messages filters when changing sections
  useEffect(() => {
    if (activeSection !== 'contact-messages') {
      setSearchTerm('');
      setFilterStatus('all');
      setFilterUrgency('all');
      setSelectedMessage(null);
      setShowDetailsModal(false);
    }
  }, [activeSection]);

  // Load data from database
  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeSection) {
        case 'slider':
          await loadSliderItems();
          break;
        case 'news':
          await loadNews();
          break;
        case 'events':
          await loadEvents();
          break;
        case 'breaking-news':
          await loadBreakingNews();
          break;
        case 'announcements':
          await loadAnnouncements();
          break;
        case 'maintenance':
          await loadMaintenanceSettings();
          break;
        case 'counters':
          await loadCounters();
          break;
        case 'about-sudan':
          // No initial load needed for about-sudan (it loads its own data)
          break;
        case 'contact-messages':
          await loadContactMessages();
          break;
        case 'pages':
          await loadPageSections();
          break;
        case 'social':
          await loadSocialLinks();
          break;
        case 'contact':
          await loadContactInfo();
          break;
        case 'footer':
          await loadFooterContent();
          break;
        case 'site':
          await loadSiteSettings();
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('error', 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Load slider items
  const loadSliderItems = async () => {
    const { data, error } = await supabase
      .from('slider_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Process image URLs for items from Supabase Storage
    const processedItems = (data || []).map(item => {
      if (item.image_url && !item.image_url.startsWith('http') && !item.image_url.startsWith('/')) {
        const { data: urlData } = supabase.storage
          .from('slider-images')
          .getPublicUrl(item.image_url);

        return {
          ...item,
          image_url: urlData?.publicUrl || item.image_url
        };
      }
      return item;
    });

    setSliderItems(processedItems);
  };

  // Load social links
  const loadSocialLinks = async () => {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    setSocialLinks(data || []);
  };

  // Load contact info
  const loadContactInfo = async () => {
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    setContactInfo(data || []);
  };

  // Load site settings
  const loadSiteSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    setSiteSettings(data || []);
  };

  // Load footer content
  const loadFooterContent = async () => {
    const { data, error } = await supabase
      .from('footer_content')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    setFooterContent(data || []);
  };

  // Load counters
  const loadCounters = async () => {
    const { data, error } = await supabase
      .from('counters')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    setCounters(data || []);
  };

  // Load page sections
  const loadPageSections = async () => {
    const { data, error } = await supabase
      .from('page_sections')
      .select('*')
      .order('page_name, display_order', { ascending: true });

    if (error) throw error;
    setPageSections(data || []);
  };

  // Load news
  const loadNews = async () => {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('published_date', { ascending: false });

    if (error) throw error;
    setNews(data || []);
  };

  // Load events
  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) throw error;
    setEvents(data || []);
  };

  // Load breaking news ticker
  const loadBreakingNews = async () => {
    const { data, error } = await supabase
      .from('breaking_news_ticker')
      .select('*')
      .order('priority', { ascending: false });

    if (error) throw error;
    setBreakingNews(data || []);
  };

  // Load announcements
  const loadAnnouncements = async () => {
    const { data, error } = await supabase
      .from('system_announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setAnnouncements(data || []);
  };

  // Load maintenance settings
  const loadMaintenanceSettings = async () => {
    const { data, error } = await supabase
      .from('system_maintenance')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;
    setMaintenanceSettings(data || {
      id: 1,
      is_enabled: false,
      start_time: null,
      end_time: null,
      message_ar: 'الموقع تحت الصيانة حالياً. سنعود قريباً.',
      message_en: 'The site is currently under maintenance. We will be back soon.'
    });
  };

  // Load contact messages
  const loadContactMessages = async () => {
    const { data: messagesData, error: messagesError } = await supabase
      .from('contact_messages')
      .select(`
        *,
        assigned_staff:staff(id, full_name_ar, email)
      `)
      .order('created_at', { ascending: false });

    if (messagesError) throw messagesError;
    setContactMessages(messagesData || []);

    // Load active staff for assignment
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('id, full_name_ar, email')
      .eq('is_active', true)
      .order('full_name_ar');

    if (staffError) throw staffError;
    setStaff(staffData || []);
  };

  // Show message
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Contact Messages Management Functions
  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'resolved' || newStatus === 'closed') {
        updateData.responded_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('contact_messages')
        .update(updateData)
        .eq('id', messageId);

      if (error) throw error;

      await loadContactMessages();
      showMessage('success', 'تم تحديث حالة الرسالة بنجاح');
    } catch (error) {
      console.error('Error updating message status:', error);
      showMessage('error', 'حدث خطأ أثناء تحديث حالة الرسالة');
    }
  };

  const assignMessage = async (messageId, staffId) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({
          assigned_to: staffId,
          status: 'in_progress'
        })
        .eq('id', messageId);

      if (error) throw error;

      await loadContactMessages();
      showMessage('success', 'تم إسناد الرسالة بنجاح');
    } catch (error) {
      console.error('Error assigning message:', error);
      showMessage('error', 'حدث خطأ أثناء إسناد الرسالة');
    }
  };

  const updateMessageNotes = async (messageId, notes) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ admin_notes: notes })
        .eq('id', messageId);

      if (error) throw error;

      await loadContactMessages();
      showMessage('success', 'تم حفظ الملاحظات بنجاح');
    } catch (error) {
      console.error('Error updating notes:', error);
      showMessage('error', 'حدث خطأ أثناء حفظ الملاحظات');
    }
  };

  const deleteContactMessage = async (messageId) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      await loadContactMessages();
      showMessage('success', 'تم حذف الرسالة بنجاح');
    } catch (error) {
      console.error('Error deleting message:', error);
      showMessage('error', 'حدث خطأ أثناء حذف الرسالة');
    }
  };

  // Save or update item
  const saveItem = async (item, table) => {
    setSaving(true);
    try {
      const dataToSave = {
        ...item,
        updated_at: new Date().toISOString()
      };

      // Clean up empty time fields for events table (convert empty strings to null)
      if (table === 'events') {
        if (dataToSave.event_time === '') dataToSave.event_time = null;
        if (dataToSave.end_time === '') dataToSave.end_time = null;
      }

      // Clean up empty date fields for breaking_news_ticker table
      if (table === 'breaking_news_ticker') {
        if (dataToSave.start_date === '' || dataToSave.start_date === undefined) dataToSave.start_date = null;
        if (dataToSave.end_date === '' || dataToSave.end_date === undefined) dataToSave.end_date = null;
        if (dataToSave.link === '' || dataToSave.link === undefined) dataToSave.link = null;

        // Add created_by for breaking news
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser && !item.id) {
          dataToSave.created_by = authUser.id;
        }
      }

      // Clean up empty date fields for system_announcements table
      if (table === 'system_announcements') {
        if (dataToSave.start_time === '' || dataToSave.start_time === undefined) dataToSave.start_time = null;
        if (dataToSave.end_time === '' || dataToSave.end_time === undefined) dataToSave.end_time = null;
        if (dataToSave.title_ar === '' || dataToSave.title_ar === undefined) dataToSave.title_ar = null;
        if (dataToSave.title_en === '' || dataToSave.title_en === undefined) dataToSave.title_en = null;

        // Remove updated_by as it expects staff id
        delete dataToSave.updated_by;
      }

      // Only add updated_by/created_by for tables that have this field
      if (table === 'news' || table === 'events') {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          if (item.id) {
            // For updates
            dataToSave.updated_by = authUser.id;
          } else {
            // For inserts
            dataToSave.created_by = authUser.id;
            dataToSave.updated_by = authUser.id;
          }
        }
      }

      let result;
      if (item.id) {
        // Update existing
        result = await supabase
          .from(table)
          .update(dataToSave)
          .eq('id', item.id);
      } else {
        // Insert new
        result = await supabase
          .from(table)
          .insert([dataToSave]);
      }

      if (result.error) throw result.error;

      showMessage('success', 'تم الحفظ بنجاح');
      setShowAddModal(false);
      setEditingItem(null);
      setNewItem({});
      await loadData();
    } catch (error) {
      console.error('Error saving:', error);
      showMessage('error', 'حدث خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  // Save maintenance settings
  const saveMaintenanceSettings = async () => {
    setSaving(true);
    try {
      const dataToSave = {
        ...maintenanceSettings,
        updated_at: new Date().toISOString()
      };

      // Clean up empty date fields
      if (dataToSave.start_time === '' || dataToSave.start_time === undefined) dataToSave.start_time = null;
      if (dataToSave.end_time === '' || dataToSave.end_time === undefined) dataToSave.end_time = null;

      // Remove updated_by as it expects staff id, not auth.users id
      delete dataToSave.updated_by;

      const { error } = await supabase
        .from('system_maintenance')
        .update(dataToSave)
        .eq('id', 1);

      if (error) throw error;

      showMessage('success', 'تم حفظ إعدادات الصيانة بنجاح');
      await loadMaintenanceSettings();
    } catch (error) {
      console.error('Error saving maintenance settings:', error);
      showMessage('error', 'حدث خطأ في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  // Delete item
  const deleteItem = async (id, table) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      showMessage('success', 'تم الحذف بنجاح');
      await loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      showMessage('error', 'حدث خطأ في الحذف');
    }
  };

  // Toggle active status
  const toggleActive = async (id, table, currentStatus) => {
    try {
      // system_announcements uses 'is_enabled' instead of 'is_active'
      const statusField = table === 'system_announcements' ? 'is_enabled' : 'is_active';

      const updateData = {
        [statusField]: !currentStatus,
        updated_at: new Date().toISOString()
      };

      // Only add updated_by for tables that have this field
      if (table === 'news' || table === 'events') {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          updateData.updated_by = authUser.id;
        }
      }

      // Remove updated_by for system_announcements as it references staff table
      if (table === 'system_announcements') {
        delete updateData.updated_by;
      }

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      showMessage('success', 'تم التحديث بنجاح');
      await loadData();
    } catch (error) {
      console.error('Error toggling active:', error);
      showMessage('error', 'حدث خطأ في التحديث');
    }
  };

  // Toggle featured status
  const toggleFeatured = async (id, table, currentStatus) => {
    try {
      const updateData = {
        is_featured: !currentStatus,
        updated_at: new Date().toISOString()
      };

      // Only add updated_by for tables that have this field
      if (table === 'news' || table === 'events') {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          updateData.updated_by = authUser.id;
        }
      }

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      showMessage('success', 'تم التحديث بنجاح');
      await loadData();
    } catch (error) {
      console.error('Error toggling featured:', error);
      showMessage('error', 'حدث خطأ في التحديث');
    }
  };

  // Move item up/down
  const moveItem = async (index, direction, items, table) => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= items.length) return;

    // Swap display_order
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];

    const temp = newItems[index].display_order;
    newItems[index].display_order = newItems[targetIndex].display_order;
    newItems[targetIndex].display_order = temp;

    try {
      // Update both items
      await supabase
        .from(table)
        .update({ display_order: newItems[index].display_order })
        .eq('id', newItems[index].id);

      await supabase
        .from(table)
        .update({ display_order: newItems[targetIndex].display_order })
        .eq('id', newItems[targetIndex].id);

      await loadData();
    } catch (error) {
      console.error('Error moving item:', error);
      showMessage('error', 'حدث خطأ في الترتيب');
    }
  };

  // Helper functions for contact messages
  const getStatusBadge = (status) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const labels = {
      new: 'جديدة',
      in_progress: 'قيد المعالجة',
      resolved: 'تم الحل',
      closed: 'مغلقة'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      normal: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };

    const labels = {
      low: 'عادي',
      normal: 'متوسط',
      high: 'عاجل'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[urgency]}`}>
        {labels[urgency]}
      </span>
    );
  };

  const getServiceTypeLabel = (type) => {
    const labels = {
      passport: 'جوازات السفر',
      visa: 'التأشيرات',
      attestation: 'التصديقات',
      civil: 'الأحوال المدنية',
      legal: 'خدمات قانونية',
      investment: 'استثمار',
      tourism: 'سياحة',
      other: 'أخرى'
    };
    return labels[type] || type;
  };

  // Render contact messages section
  const renderContactMessagesSection = () => {
    // Calculate stats
    const stats = {
      total: contactMessages.length,
      new: contactMessages.filter(m => m.status === 'new').length,
      in_progress: contactMessages.filter(m => m.status === 'in_progress').length,
      resolved: contactMessages.filter(m => m.status === 'resolved').length,
      high_urgency: contactMessages.filter(m => m.urgency === 'high').length
    };

    // Filter messages
    let filteredMessages = contactMessages;
    if (filterStatus !== 'all') {
      filteredMessages = filteredMessages.filter(m => m.status === filterStatus);
    }
    if (filterUrgency !== 'all') {
      filteredMessages = filteredMessages.filter(m => m.urgency === filterUrgency);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredMessages = filteredMessages.filter(m =>
        m.name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        m.subject.toLowerCase().includes(term) ||
        m.message.toLowerCase().includes(term)
      );
    }

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي الرسائل</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <MessageCircle className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">رسائل جديدة</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.new}</p>
              </div>
              <Mail className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">قيد المعالجة</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.in_progress}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">تم الحل</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">رسائل عاجلة</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.high_urgency}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                بحث
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث في الرسائل..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                الحالة
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع الحالات</option>
                <option value="new">جديدة</option>
                <option value="in_progress">قيد المعالجة</option>
                <option value="resolved">تم الحل</option>
                <option value="closed">مغلقة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TrendingUp className="w-4 h-4 inline mr-2" />
                الأولوية
              </label>
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع الأولويات</option>
                <option value="high">عاجل</option>
                <option value="normal">متوسط</option>
                <option value="low">عادي</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterUrgency('all');
                }}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
              >
                إعادة تعيين
              </button>
            </div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredMessages.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">لا توجد رسائل</p>
                <p className="text-gray-500 text-sm mt-2">لم يتم استلام أي رسائل بعد</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">الاسم</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">الموضوع</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">نوع الخدمة</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">الأولوية</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">الحالة</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">مسند إلى</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">التاريخ</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMessages.map((message) => (
                    <tr key={message.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{message.name}</div>
                          <div className="text-sm text-gray-500">{message.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{message.subject}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{getServiceTypeLabel(message.service_type)}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getUrgencyBadge(message.urgency)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(message.status)}
                      </td>
                      <td className="px-6 py-4">
                        {message.assigned_staff ? (
                          <div className="text-sm text-gray-700">{message.assigned_staff.full_name_ar}</div>
                        ) : (
                          <span className="text-sm text-gray-400">غير مسندة</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">
                          {new Date(message.created_at).toLocaleDateString('ar-SA')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-150"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">تفاصيل الرسالة</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    تم الإرسال في {new Date(selectedMessage.created_at).toLocaleString('ar-SA')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedMessage(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-8 py-6 space-y-6">
                {/* Sender Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    معلومات المرسل
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">الاسم</p>
                      <p className="text-gray-900 font-medium">{selectedMessage.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                      <p className="text-gray-900 font-medium">{selectedMessage.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">رقم الهاتف</p>
                      <p className="text-gray-900 font-medium">{selectedMessage.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">نوع الخدمة</p>
                      <p className="text-gray-900 font-medium">{getServiceTypeLabel(selectedMessage.service_type)}</p>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    محتوى الرسالة
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">الموضوع:</p>
                    <p className="text-gray-900 font-semibold mb-4">{selectedMessage.subject}</p>
                    <p className="text-sm text-gray-600 mb-2">الرسالة:</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Status and Assignment */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">حالة الرسالة</h3>
                    <select
                      value={selectedMessage.status}
                      onChange={(e) => {
                        updateMessageStatus(selectedMessage.id, e.target.value);
                        setSelectedMessage({ ...selectedMessage, status: e.target.value });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="new">جديدة</option>
                      <option value="in_progress">قيد المعالجة</option>
                      <option value="resolved">تم الحل</option>
                      <option value="closed">مغلقة</option>
                    </select>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">إسناد إلى</h3>
                    <select
                      value={selectedMessage.assigned_to || ''}
                      onChange={(e) => {
                        assignMessage(selectedMessage.id, e.target.value || null);
                        setShowDetailsModal(false);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">غير مسندة</option>
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name_ar}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    ملاحظات الإدارة
                  </h3>
                  <textarea
                    value={selectedMessage.admin_notes || ''}
                    onChange={(e) => {
                      setSelectedMessage({ ...selectedMessage, admin_notes: e.target.value });
                    }}
                    onBlur={(e) => updateMessageNotes(selectedMessage.id, e.target.value)}
                    rows={4}
                    placeholder="أضف ملاحظات داخلية هنا..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      deleteContactMessage(selectedMessage.id);
                      setShowDetailsModal(false);
                      setSelectedMessage(null);
                    }}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف الرسالة</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedMessage(null);
                    }}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors duration-200"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render slider section
  const renderSliderSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">إدارة السلايدر</h3>
        <button
          onClick={() => {
            setNewItem({
              title_ar: '',
              title_en: '',
              subtitle_ar: '',
              subtitle_en: '',
              description_ar: '',
              description_en: '',
              image_url: '',
              button_text_ar: '',
              button_text_en: '',
              button_link: '',
              display_order: sliderItems.length,
              is_active: true
            });
            setShowAddModal(true);
          }}
          className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة سلايد جديد</span>
        </button>
      </div>

      <div className="space-y-3">
        {sliderItems.map((item, index) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 rtl:space-x-reverse flex-1">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title_ar}
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg mb-1">{item.title_ar}</h4>
                  <p className="text-sm text-gray-600 mb-2">{item.subtitle_ar}</p>
                  <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs text-gray-500">
                    <span>الترتيب: {item.display_order}</span>
                    <span className={`px-2 py-1 rounded ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.is_active ? 'مفعّل' : 'معطّل'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => moveItem(index, 'up', sliderItems, 'slider_items')}
                  disabled={index === 0}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveItem(index, 'down', sliderItems, 'slider_items')}
                  disabled={index === sliderItems.length - 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleActive(item.id, 'slider_items', item.is_active)}
                  className="p-2 text-gray-400 hover:text-blue-600"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setNewItem(item);
                    setShowAddModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-green-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem(item.id, 'slider_items')}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {newItem.id ? 'تعديل السلايد' : 'إضافة سلايد جديد'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">العنوان (عربي)</label>
                  <input
                    type="text"
                    value={newItem.title_ar || ''}
                    onChange={(e) => setNewItem({ ...newItem, title_ar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">العنوان (English)</label>
                  <input
                    type="text"
                    value={newItem.title_en || ''}
                    onChange={(e) => setNewItem({ ...newItem, title_en: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">العنوان الفرعي (عربي)</label>
                  <input
                    type="text"
                    value={newItem.subtitle_ar || ''}
                    onChange={(e) => setNewItem({ ...newItem, subtitle_ar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">العنوان الفرعي (English)</label>
                  <input
                    type="text"
                    value={newItem.subtitle_en || ''}
                    onChange={(e) => setNewItem({ ...newItem, subtitle_en: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الوصف (عربي)</label>
                  <textarea
                    value={newItem.description_ar || ''}
                    onChange={(e) => setNewItem({ ...newItem, description_ar: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الوصف (English)</label>
                  <textarea
                    value={newItem.description_en || ''}
                    onChange={(e) => setNewItem({ ...newItem, description_en: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>

              <div>
                <SliderImageUploader
                  currentImageUrl={newItem.image_url}
                  onImageUploaded={(url) => setNewItem({ ...newItem, image_url: url })}
                  onImageRemoved={() => setNewItem({ ...newItem, image_url: '' })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نص الزر (عربي)</label>
                  <input
                    type="text"
                    value={newItem.button_text_ar || ''}
                    onChange={(e) => setNewItem({ ...newItem, button_text_ar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نص الزر (English)</label>
                  <input
                    type="text"
                    value={newItem.button_text_en || ''}
                    onChange={(e) => setNewItem({ ...newItem, button_text_en: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رابط الزر</label>
                  <input
                    type="text"
                    value={newItem.button_link || ''}
                    onChange={(e) => setNewItem({ ...newItem, button_link: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItem.is_active || false}
                    onChange={(e) => setNewItem({ ...newItem, is_active: e.target.checked })}
                    className="w-5 h-5 text-[#276073] border-gray-300 rounded focus:ring-[#276073]"
                  />
                  <span className="text-sm font-medium text-gray-700">مفعّل</span>
                </label>

                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => saveItem(newItem, 'slider_items')}
                    disabled={saving}
                    className="px-6 py-2 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render breaking news ticker section
  const renderBreakingNewsSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">إدارة شريط الأخبار العاجلة</h3>
          <p className="text-sm text-gray-600 mt-1">إدارة الأخبار التي تظهر في الشريط المتحرك أعلى الموقع</p>
        </div>
        <button
          onClick={() => {
            setNewItem({
              title_ar: '',
              title_en: '',
              link: '',
              is_active: true,
              priority: 50,
              start_date: '',
              end_date: ''
            });
            setShowAddModal(true);
          }}
          className="px-6 py-2 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة خبر عاجل</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {breakingNews.map((item, index) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.is_active ? 'مفعّل' : 'معطّل'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                    الأولوية: {item.priority}
                  </span>
                  {item.start_date && (
                    <span className="text-xs text-gray-500">
                      من: {new Date(item.start_date).toLocaleDateString('ar-EG')}
                    </span>
                  )}
                  {item.end_date && (
                    <span className="text-xs text-gray-500">
                      إلى: {new Date(item.end_date).toLocaleDateString('ar-EG')}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-gray-900 text-lg mb-1">{item.title_ar}</h4>
                <p className="text-sm text-gray-600 mb-2">{item.title_en}</p>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-[#276073] hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    {item.link}
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 mr-4">
                <button
                  onClick={() => toggleActive(item.id, 'breaking_news_ticker', item.is_active)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title={item.is_active ? 'تعطيل' : 'تفعيل'}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setNewItem(item);
                    setShowAddModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                  title="تعديل"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem(item.id, 'breaking_news_ticker')}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {breakingNews.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">لا توجد أخبار عاجلة بعد</p>
          <p className="text-sm text-gray-500 mt-2">ابدأ بإضافة خبر عاجل جديد</p>
        </div>
      )}

      {/* Add/Edit Modal for Breaking News */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {newItem.id ? 'تعديل خبر عاجل' : 'إضافة خبر عاجل جديد'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الخبر (عربي) *</label>
                <input
                  type="text"
                  value={newItem.title_ar || ''}
                  onChange={(e) => setNewItem({ ...newItem, title_ar: e.target.value })}
                  placeholder="أدخل عنوان الخبر بالعربية"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الخبر (English) *</label>
                <input
                  type="text"
                  value={newItem.title_en || ''}
                  onChange={(e) => setNewItem({ ...newItem, title_en: e.target.value })}
                  placeholder="Enter news title in English"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الرابط (اختياري)</label>
                <input
                  type="url"
                  value={newItem.link || ''}
                  onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">اترك فارغاً إذا لم يكن هناك رابط</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الأولوية</label>
                <input
                  type="number"
                  value={newItem.priority || 50}
                  onChange={(e) => setNewItem({ ...newItem, priority: parseInt(e.target.value) })}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">الأرقام الأعلى تظهر أولاً (0-100)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ البدء (اختياري)</label>
                  <input
                    type="datetime-local"
                    value={newItem.start_date ? new Date(newItem.start_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setNewItem({ ...newItem, start_date: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الانتهاء (اختياري)</label>
                  <input
                    type="datetime-local"
                    value={newItem.end_date ? new Date(newItem.end_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setNewItem({ ...newItem, end_date: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={newItem.is_active || false}
                  onChange={(e) => setNewItem({ ...newItem, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#276073] border-gray-300 rounded focus:ring-[#276073]"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  تفعيل الخبر
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => saveItem(newItem, 'breaking_news_ticker')}
                  disabled={saving || !newItem.title_ar || !newItem.title_en}
                  className="px-6 py-2 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render social links section
  const renderSocialSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">روابط التواصل الاجتماعي</h3>
        <button
          onClick={() => {
            setNewItem({
              platform: '',
              label: '',
              label_ar: '',
              label_en: '',
              url: '',
              icon: '',
              color: '#000000',
              display_order: socialLinks.length,
              is_active: true
            });
            setShowAddModal(true);
          }}
          className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة رابط جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {socialLinks.map((item, index) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse flex-1">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: item.color }}
                >
                  {item.icon === 'Facebook' && <Facebook className="w-5 h-5" />}
                  {item.icon === 'Twitter' && <Twitter className="w-5 h-5" />}
                  {item.icon === 'Instagram' && <Instagram className="w-5 h-5" />}
                  {item.icon === 'MessageCircle' && <MessageCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{item.label_ar}</h4>
                  <p className="text-sm text-gray-600 truncate">{item.url}</p>
                  <span className={`text-xs px-2 py-1 rounded ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.is_active ? 'مفعّل' : 'معطّل'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => moveItem(index, 'up', socialLinks, 'social_links')}
                  disabled={index === 0}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveItem(index, 'down', socialLinks, 'social_links')}
                  disabled={index === socialLinks.length - 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleActive(item.id, 'social_links', item.is_active)}
                  className="p-2 text-gray-400 hover:text-blue-600"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setNewItem(item);
                    setShowAddModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-green-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem(item.id, 'social_links')}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal for Social Links */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {newItem.id ? 'تعديل الرابط' : 'إضافة رابط جديد'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المنصة</label>
                <select
                  value={newItem.platform || ''}
                  onChange={(e) => setNewItem({ ...newItem, platform: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                >
                  <option value="">اختر المنصة</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter</option>
                  <option value="instagram">Instagram</option>
                  <option value="telegram">Telegram</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم (عربي)</label>
                  <input
                    type="text"
                    value={newItem.label_ar || ''}
                    onChange={(e) => setNewItem({ ...newItem, label_ar: e.target.value, label: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم (English)</label>
                  <input
                    type="text"
                    value={newItem.label_en || ''}
                    onChange={(e) => setNewItem({ ...newItem, label_en: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الرابط</label>
                <input
                  type="url"
                  value={newItem.url || ''}
                  onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الأيقونة</label>
                  <select
                    value={newItem.icon || ''}
                    onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  >
                    <option value="">اختر الأيقونة</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Twitter">Twitter</option>
                    <option value="Instagram">Instagram</option>
                    <option value="MessageCircle">MessageCircle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اللون</label>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <input
                      type="color"
                      value={newItem.color || '#000000'}
                      onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newItem.color || ''}
                      onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItem.is_active || false}
                    onChange={(e) => setNewItem({ ...newItem, is_active: e.target.checked })}
                    className="w-5 h-5 text-[#276073] border-gray-300 rounded focus:ring-[#276073]"
                  />
                  <span className="text-sm font-medium text-gray-700">مفعّل</span>
                </label>

                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => saveItem(newItem, 'social_links')}
                    disabled={saving}
                    className="px-6 py-2 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render contact info section
  const renderContactSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">معلومات التواصل</h3>
        <button
          onClick={() => {
            setNewItem({
              type: 'phone',
              label: '',
              label_ar: '',
              label_en: '',
              value: '',
              icon: 'Phone',
              display_order: contactInfo.length,
              is_active: true
            });
            setShowAddModal(true);
          }}
          className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة معلومة جديدة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contactInfo.map((item, index) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 rtl:space-x-reverse flex-1">
                <div className="w-10 h-10 bg-[#276073] rounded-lg flex items-center justify-center text-white">
                  {item.icon === 'Phone' && <Phone className="w-5 h-5" />}
                  {item.icon === 'Mail' && <Mail className="w-5 h-5" />}
                  {item.icon === 'MapPin' && <MapPin className="w-5 h-5" />}
                  {item.icon === 'Clock' && <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">{item.label_ar}</h4>
                  <p className="text-sm text-gray-600">{item.value}</p>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
                    <span className="text-xs text-gray-500">النوع: {item.type}</span>
                    <span className={`text-xs px-2 py-1 rounded ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.is_active ? 'مفعّل' : 'معطّل'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => moveItem(index, 'up', contactInfo, 'contact_info')}
                  disabled={index === 0}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveItem(index, 'down', contactInfo, 'contact_info')}
                  disabled={index === contactInfo.length - 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleActive(item.id, 'contact_info', item.is_active)}
                  className="p-2 text-gray-400 hover:text-blue-600"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setNewItem(item);
                    setShowAddModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-green-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem(item.id, 'contact_info')}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal for Contact Info */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {newItem.id ? 'تعديل معلومة التواصل' : 'إضافة معلومة جديدة'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">النوع</label>
                  <select
                    value={newItem.type || ''}
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  >
                    <option value="phone">هاتف</option>
                    <option value="email">بريد إلكتروني</option>
                    <option value="address">عنوان</option>
                    <option value="working_hours">ساعات العمل</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الأيقونة</label>
                  <select
                    value={newItem.icon || ''}
                    onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  >
                    <option value="Phone">Phone</option>
                    <option value="Mail">Mail</option>
                    <option value="MapPin">MapPin</option>
                    <option value="Clock">Clock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">التسمية (عربي)</label>
                  <input
                    type="text"
                    value={newItem.label_ar || ''}
                    onChange={(e) => setNewItem({ ...newItem, label_ar: e.target.value, label: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">التسمية (English)</label>
                  <input
                    type="text"
                    value={newItem.label_en || ''}
                    onChange={(e) => setNewItem({ ...newItem, label_en: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">القيمة</label>
                <textarea
                  value={newItem.value || ''}
                  onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItem.is_active || false}
                    onChange={(e) => setNewItem({ ...newItem, is_active: e.target.checked })}
                    className="w-5 h-5 text-[#276073] border-gray-300 rounded focus:ring-[#276073]"
                  />
                  <span className="text-sm font-medium text-gray-700">مفعّل</span>
                </label>

                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => saveItem(newItem, 'contact_info')}
                    disabled={saving}
                    className="px-6 py-2 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render site settings section
  const renderSiteSettingsSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">إعدادات الموقع العامة</h3>
        <button
          onClick={() => {
            setNewItem({
              key: '',
              value: '',
              value_ar: '',
              value_en: '',
              type: 'text',
              category: 'general',
              description: ''
            });
            setShowAddModal(true);
          }}
          className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة إعداد جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {siteSettings.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                  <h4 className="font-bold text-gray-900">{item.key}</h4>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                    {item.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">القيمة (عربي):</span>
                    <p className="text-sm font-medium text-gray-900">{item.value_ar || item.value}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">القيمة (English):</span>
                    <p className="text-sm font-medium text-gray-900">{item.value_en || item.value}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => {
                    setNewItem(item);
                    setShowAddModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-green-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal for Site Settings */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {newItem.id ? 'تعديل الإعداد' : 'إضافة إعداد جديد'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المفتاح (Key)</label>
                  <input
                    type="text"
                    value={newItem.key || ''}
                    onChange={(e) => setNewItem({ ...newItem, key: e.target.value })}
                    disabled={!!newItem.id}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
                  <select
                    value={newItem.category || 'general'}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  >
                    <option value="general">عام</option>
                    <option value="design">تصميم</option>
                    <option value="contact">اتصال</option>
                    <option value="social">سوشيال ميديا</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                <input
                  type="text"
                  value={newItem.description || ''}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">القيمة (عربي)</label>
                  <input
                    type="text"
                    value={newItem.value_ar || ''}
                    onChange={(e) => setNewItem({ ...newItem, value_ar: e.target.value, value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">القيمة (English)</label>
                  <input
                    type="text"
                    value={newItem.value_en || ''}
                    onChange={(e) => setNewItem({ ...newItem, value_en: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => saveItem(newItem, 'site_settings')}
                  disabled={saving}
                  className="px-6 py-2 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render section content based on active section
  const renderSectionContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#276073] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'slider':
        return renderSliderSection();
      case 'news':
        return renderNewsSection({
          news,
          setNewItem,
          setShowAddModal,
          toggleActive,
          toggleFeatured,
          deleteItem
        });
      case 'events':
        return renderEventsSection({
          events,
          setNewItem,
          setShowAddModal,
          toggleActive,
          toggleFeatured,
          deleteItem,
          navigate
        });
      case 'breaking-news':
        return renderBreakingNewsSection();
      case 'announcements':
        return renderAnnouncementsSection({
          announcements,
          setNewItem,
          setShowAddModal,
          toggleActive,
          deleteItem
        });
      case 'maintenance':
        return renderMaintenanceSection({
          maintenanceSettings,
          setMaintenanceSettings,
          saveMaintenanceSettings,
          saving
        });
      case 'counters':
        return renderCountersSection({
          counters,
          loading,
          saving,
          setNewItem,
          setShowAddModal,
          moveItem,
          toggleActive,
          deleteItem
        });
      case 'about-sudan':
        return <ContentManagementAboutSudan />;
      case 'contact-messages':
        return renderContactMessagesSection();
      case 'pages':
        return renderPageSectionsManager({
          pageSections,
          loading,
          saving,
          setNewItem,
          setShowAddModal,
          deleteItem,
          toggleActive
        });
      case 'social':
        return renderSocialSection();
      case 'contact':
        return renderContactSection();
      case 'footer':
        return renderFooterContentSection({
          footerContent,
          loading,
          saving,
          setNewItem,
          setShowAddModal,
          moveItem,
          toggleActive,
          deleteItem
        });
      case 'site':
        return renderSiteSettingsSection();
      default:
        return null;
    }
  };

  if (!isSuperAdmin && !hasPermission('content')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-200 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">غير مصرح</h2>
          <p className="text-gray-600 mb-4">
            ليس لديك صلاحية الوصول لهذه الصفحة
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Message Toast */}
      {message.text && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 rtl:space-x-reverse ${
            message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg border-l border-gray-200 min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 mb-2">إدارة المحتوى</h1>
            <p className="text-sm text-gray-600">تحكم في محتوى الموقع الديناميكي</p>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              {contentSections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg transition-colors duration-200 text-right ${
                      activeSection === section.id
                        ? 'bg-[#276073] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-medium">{section.title}</div>
                      <div className={`text-xs ${
                        activeSection === section.id ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {section.description}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {renderSectionContent()}
          </div>
        </div>
      </div>

      {/* Modals for different sections */}
      {showAddModal && activeSection === 'news' && (
        <NewsModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setNewItem({});
          }}
          newsItem={newItem}
          onSave={async (data) => {
            await saveItem(data, 'news');
          }}
          saving={saving}
        />
      )}

      {showAddModal && activeSection === 'events' && (
        <EventModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setNewItem({});
          }}
          eventItem={newItem}
          onSave={async (data) => {
            await saveItem(data, 'events');
          }}
          saving={saving}
        />
      )}

      {showAddModal && activeSection === 'counters' && (
        <CounterModal
          newItem={newItem}
          setNewItem={setNewItem}
          saving={saving}
          setShowAddModal={setShowAddModal}
          saveItem={saveItem}
        />
      )}

      {showAddModal && activeSection === 'pages' && (
        <PageSectionModal
          newItem={newItem}
          setNewItem={setNewItem}
          saving={saving}
          setShowAddModal={setShowAddModal}
          saveItem={saveItem}
        />
      )}

      {showAddModal && activeSection === 'footer' && (
        <FooterContentModal
          newItem={newItem}
          setNewItem={setNewItem}
          saving={saving}
          setShowAddModal={setShowAddModal}
          saveItem={saveItem}
        />
      )}

      {showAddModal && activeSection === 'announcements' && (
        <AnnouncementModal
          newItem={newItem}
          setNewItem={setNewItem}
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
          saveItem={saveItem}
          saving={saving}
        />
      )}
    </div>
  );
};

export default ContentManagement;
