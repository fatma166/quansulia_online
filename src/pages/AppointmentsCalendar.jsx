import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  Check,
  AlertCircle,
  Users,
  Clock,
  Ban,
  Filter,
  Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const AppointmentsCalendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showCloseDayModal, setShowCloseDayModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data from database
  const [settings, setSettings] = useState({
    max_appointments_per_day: 20,
    weekend_days: [5, 6],
    booking_advance_days: 30,
    booking_cutoff_hours: 24,
    allow_same_day_booking: false
  });
  const [appointments, setAppointments] = useState({});
  const [closedDays, setClosedDays] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0
  });

  // Filter states
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Helper function to convert Gregorian to Hijri using Umm al-Qura calendar (official Saudi calendar)
  const getHijriDate = (gregorianDate) => {
    const date = new Date(gregorianDate);

    try {
      // Use Intl.DateTimeFormat with islamic-umalqura calendar (Saudi Arabia's official calendar)
      const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        calendar: 'islamic-umalqura',
        numberingSystem: 'latn'
      });

      const parts = formatter.formatToParts(date);
      const day = parts.find(p => p.type === 'day')?.value || '1';
      const month = parts.find(p => p.type === 'month')?.value || '';
      const year = parts.find(p => p.type === 'year')?.value || '1446';

      // Get short month name (first 6 characters)
      const shortMonth = month.substring(0, 6);

      return {
        day: parseInt(day, 10),
        month: month,
        year: parseInt(year, 10),
        short: `${day} ${shortMonth}`
      };
    } catch (error) {
      console.error('Error converting to Hijri:', error);
      return {
        day: 1,
        month: 'رجب',
        year: 1446,
        short: '1 رجب'
      };
    }
  };

  // Load settings from database
  const loadSettings = async () => {
    try {
      console.log('Loading settings from database...');
      const { data, error } = await supabase
        .from('appointment_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading settings:', error);
        throw error;
      }

      console.log('Loaded settings from database:', data);

      if (data) {
        console.log('Setting state with loaded settings');
        setSettings(data);
      } else {
        console.log('No settings found in database, using defaults');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Load appointments for current month
  const loadAppointments = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('appointment_date', firstDay.toISOString().split('T')[0])
        .lte('appointment_date', lastDay.toISOString().split('T')[0]);

      if (error) throw error;

      // Group appointments by date
      const grouped = {};
      data.forEach(apt => {
        const dateStr = apt.appointment_date;
        if (!grouped[dateStr]) {
          grouped[dateStr] = [];
        }
        grouped[dateStr].push(apt);
      });

      setAppointments(grouped);

      // Calculate stats
      const totalAppointments = data.length;
      const confirmedAppointments = data.filter(a => a.status === 'confirmed').length;
      const completedAppointments = data.filter(a => a.status === 'completed').length;
      const cancelledAppointments = data.filter(a => a.status === 'cancelled').length;

      setStats({
        totalAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments
      });
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  // Load closed days
  const loadClosedDays = async () => {
    try {
      const { data, error } = await supabase
        .from('closed_days')
        .select('*');

      if (error) throw error;

      setClosedDays(data.map(d => d.closed_date));
    } catch (error) {
      console.error('Error loading closed days:', error);
    }
  };

  // Save settings to database
  const saveSettings = async () => {
    try {
      console.log('Saving settings:', settings);

      // Prepare settings object with only the fields we want to save
      const settingsToSave = {
        max_appointments_per_day: settings.max_appointments_per_day,
        weekend_days: settings.weekend_days,
        booking_advance_days: settings.booking_advance_days || 30,
        booking_cutoff_hours: settings.booking_cutoff_hours || 24,
        allow_same_day_booking: settings.allow_same_day_booking || false
      };

      console.log('Settings to save:', settingsToSave);

      const { data: existing, error: selectError } = await supabase
        .from('appointment_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (selectError) {
        console.error('Error fetching existing settings:', selectError);
        throw selectError;
      }

      console.log('Existing settings:', existing);

      if (existing) {
        console.log('Updating existing settings with id:', existing.id);
        const { data, error } = await supabase
          .from('appointment_settings')
          .update(settingsToSave)
          .eq('id', existing.id)
          .select();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Update result:', data);
      } else {
        console.log('Inserting new settings');
        const { data, error } = await supabase
          .from('appointment_settings')
          .insert([settingsToSave])
          .select();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        console.log('Insert result:', data);
      }

      // Reload settings from database to ensure we have the latest data
      console.log('Reloading settings from database...');
      await loadSettings();

      alert('تم حفظ الإعدادات بنجاح');
      setShowSettings(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(`حدث خطأ في حفظ الإعدادات: ${error.message}`);
    }
  };

  // Toggle closed day
  const handleToggleClosedDay = async (date) => {
    const dateStr = formatDate(date);

    try {
      if (closedDays.includes(dateStr)) {
        // Remove from closed days
        const { data } = await supabase
          .from('closed_days')
          .select('id')
          .eq('closed_date', dateStr)
          .maybeSingle();

        if (data) {
          const { error } = await supabase
            .from('closed_days')
            .delete()
            .eq('id', data.id);

          if (error) throw error;
        }

        setClosedDays(closedDays.filter(d => d !== dateStr));
      } else {
        // Add to closed days
        const { error } = await supabase
          .from('closed_days')
          .insert([{
            closed_date: dateStr,
            reason: 'إغلاق يدوي'
          }]);

        if (error) throw error;

        setClosedDays([...closedDays, dateStr]);
      }

      setShowCloseDayModal(false);
      setSelectedDay(null);
    } catch (error) {
      console.error('Error toggling closed day:', error);
      alert('حدث خطأ في تحديث اليوم');
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadSettings(),
        loadAppointments(),
        loadClosedDays()
      ]);
      setLoading(false);
    };

    loadData();
  }, [currentDate]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getAppointmentCount = (date) => {
    const dateStr = formatDate(date);
    return appointments[dateStr]?.length || 0;
  };

  const isDayFull = (date) => {
    return getAppointmentCount(date) >= settings.max_appointments_per_day;
  };

  const isDayClosed = (date) => {
    return closedDays.includes(formatDate(date));
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return settings.weekend_days.includes(day);
  };

  const getDayStatus = (date) => {
    if (isWeekend(date)) return 'weekend';
    if (isDayClosed(date)) return 'closed';
    if (isDayFull(date)) return 'full';
    if (getAppointmentCount(date) > 0) return 'hasAppointments';
    return 'available';
  };

  const toggleWeekendDay = (dayIndex) => {
    console.log('Toggling weekend day:', dayIndex);
    console.log('Current weekend_days:', settings.weekend_days);

    const newWeekendDays = settings.weekend_days.includes(dayIndex)
      ? settings.weekend_days.filter(d => d !== dayIndex)
      : [...settings.weekend_days, dayIndex];

    console.log('New weekend_days:', newWeekendDays);

    setSettings({ ...settings, weekend_days: newWeekendDays });
  };

  const getDayColor = (status) => {
    switch (status) {
      case 'weekend':
        return 'bg-gray-200 border-gray-400 text-gray-600 opacity-60';
      case 'closed':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'full':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'hasAppointments':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'available':
        return 'bg-white border-gray-200 text-gray-700';
      default:
        return 'bg-white border-gray-200 text-gray-700';
    }
  };

  const handleDayClick = (date) => {
    if (!date) return;
    const count = getAppointmentCount(date);
    if (count > 0) {
      navigate(`/admin/appointments/day/${formatDate(date)}`);
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const exportToCSV = () => {
    const allAppointments = Object.values(appointments).flat();

    const csvContent = [
      ['التاريخ', 'الوقت', 'الاسم', 'الهاتف', 'المنطقة', 'الخدمة', 'الحالة', 'ملاحظات'].join(','),
      ...allAppointments.map(apt => [
        apt.appointment_date,
        apt.appointment_time,
        apt.applicant_name,
        apt.applicant_phone,
        apt.region,
        apt.service_name || '',
        apt.status,
        apt.notes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `appointments_${formatDate(currentDate)}.csv`;
    link.click();
  };

  const days = getDaysInMonth(currentDate);
  const monthNameArabic = currentDate.toLocaleDateString('ar', { month: 'long', year: 'numeric' });
  const hijriDate = getHijriDate(currentDate);
  const monthName = `${monthNameArabic} (${hijriDate.month} ${hijriDate.year} هـ)`;
  const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#276073] mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CalendarIcon className="w-8 h-8 text-[#276073]" />
                تقويم الحجوزات
              </h1>
              <p className="text-gray-600 mt-1">إدارة مواعيد الحجوزات اليومية</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                تصدير Excel
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
              >
                <Settings className="w-5 h-5" />
                الإعدادات
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">إجمالي الحجوزات</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalAppointments}</p>
                </div>
                <CalendarIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">مؤكدة</p>
                  <p className="text-2xl font-bold text-green-900">{stats.confirmedAppointments}</p>
                </div>
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">مكتملة</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.completedAppointments}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 font-medium">ملغاة</p>
                  <p className="text-2xl font-bold text-red-900">{stats.cancelledAppointments}</p>
                </div>
                <Ban className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>

            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="text-center py-3 font-bold text-gray-700 bg-gray-50 rounded-lg"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              if (!date) {
                return <div key={index} className="aspect-square" />;
              }

              const count = getAppointmentCount(date);
              const status = getDayStatus(date);
              const isToday = formatDate(date) === formatDate(new Date());
              const isClosed = isDayClosed(date);
              const hijriDate = getHijriDate(date);

              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`aspect-square border-2 rounded-xl p-2 cursor-pointer transition-all duration-200 ${getDayColor(status)} ${
                    isToday ? 'ring-2 ring-[#276073] ring-offset-2' : ''
                  }`}
                  onClick={() => handleDayClick(date)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSelectedDay(date);
                    setShowCloseDayModal(true);
                  }}
                >
                  <div className="h-full flex flex-col items-center justify-between">
                    <div className="text-center w-full">
                      <div className={`text-xl font-bold mb-0.5 ${isToday ? 'text-[#276073]' : ''}`}>
                        {date.getDate()}
                      </div>
                      <div className="text-[9px] text-gray-500 leading-tight">
                        {hijriDate.day} {hijriDate.month.substring(0, 5)}
                      </div>
                      {count > 0 && !isClosed && (
                        <div className="text-xs font-semibold mt-1">
                          {count} حجز
                        </div>
                      )}
                      {isClosed && (
                        <div className="text-[10px] font-semibold mt-1 flex items-center justify-center gap-1">
                          <Ban className="w-3 h-3" />
                          مغلق
                        </div>
                      )}
                    </div>

                    {!isClosed && count > 0 && (
                      <div className="w-full bg-white/50 rounded h-1 mt-1">
                        <div
                          className={`h-full rounded transition-all ${
                            status === 'full' ? 'bg-orange-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${(count / settings.max_appointments_per_day) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3">الدليل:</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded" />
                <span className="text-sm text-gray-600">متاح</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded" />
                <span className="text-sm text-gray-600">به حجوزات</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded" />
                <span className="text-sm text-gray-600">ممتلئ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 border-2 border-gray-400 rounded opacity-60" />
                <span className="text-sm text-gray-600">إجازة أسبوعية</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded" />
                <span className="text-sm text-gray-600">مغلق</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              انقر على أي يوم به حجوزات لعرض التفاصيل - انقر بزر الماوس الأيمن على أي يوم لإغلاقه/فتحه
            </p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-6 h-6 text-[#276073]" />
                إعدادات الحجوزات
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الحد الأقصى للحجوزات في اليوم
                </label>
                <input
                  type="number"
                  value={settings.max_appointments_per_day}
                  onChange={(e) => setSettings({ ...settings, max_appointments_per_day: Number(e.target.value) })}
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  أيام نهاية الأسبوع (إجازة)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { index: 0, name: 'الأحد' },
                    { index: 1, name: 'الإثنين' },
                    { index: 2, name: 'الثلاثاء' },
                    { index: 3, name: 'الأربعاء' },
                    { index: 4, name: 'الخميس' },
                    { index: 5, name: 'الجمعة' },
                    { index: 6, name: 'السبت' }
                  ].map((day) => (
                    <button
                      key={day.index}
                      onClick={() => toggleWeekendDay(day.index)}
                      className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                        settings.weekend_days.includes(day.index)
                          ? 'bg-[#276073] text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveSettings}
                  className="flex-1 bg-[#276073] hover:bg-[#1e4a5a] text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  حفظ التغييرات
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Close Day Modal */}
      {showCloseDayModal && selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {isDayClosed(selectedDay) ? 'فتح اليوم' : 'إغلاق اليوم'}
              </h3>
              <button
                onClick={() => {
                  setShowCloseDayModal(false);
                  setSelectedDay(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                هل تريد {isDayClosed(selectedDay) ? 'فتح' : 'إغلاق'} يوم{' '}
                <strong>{selectedDay.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                ؟
              </p>
              {!isDayClosed(selectedDay) && getAppointmentCount(selectedDay) > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>تنبيه:</strong> هذا اليوم به {getAppointmentCount(selectedDay)} حجز حالياً
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleToggleClosedDay(selectedDay)}
                className={`flex-1 ${
                  isDayClosed(selectedDay)
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-200`}
              >
                {isDayClosed(selectedDay) ? 'فتح اليوم' : 'إغلاق اليوم'}
              </button>
              <button
                onClick={() => {
                  setShowCloseDayModal(false);
                  setSelectedDay(null);
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsCalendar;
