import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, X, Ban } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AppointmentBooking = ({ application, onBookingComplete }) => {
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [existingAppointment, setExistingAppointment] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(null);
  const [closedDays, setClosedDays] = useState([]);
  const [appointmentCounts, setAppointmentCounts] = useState({});

  const regionNames = {
    riyadh: 'الرياض',
    jeddah: 'جدة',
    dammam: 'الدمام',
    makkah: 'مكة المكرمة',
    madinah: 'المدينة المنورة'
  };

  const timeSlots = [
    '09:00 - 09:30',
    '09:30 - 10:00',
    '10:00 - 10:30',
    '10:30 - 11:00',
    '11:00 - 11:30',
    '11:30 - 12:00',
    '12:00 - 12:30',
    '12:30 - 13:00',
    '13:00 - 13:30',
    '13:30 - 14:00'
  ];

  const getFullHijriDate = (date) => {
    try {
      const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        calendar: 'islamic-umalqura',
        numberingSystem: 'latn'
      });
      return formatter.format(date);
    } catch (error) {
      return '';
    }
  };

  const getFullGregorianDate = (date) => {
    try {
      const formatter = new Intl.DateTimeFormat('ar', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return formatter.format(date);
    } catch (error) {
      return date.toLocaleDateString('ar');
    }
  };

  useEffect(() => {
    checkExistingAppointment();
    loadSettings();
  }, [application.id]);

  const checkExistingAppointment = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('application_id', application.id)
        .eq('status', 'confirmed')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setExistingAppointment(data);
      }
    } catch (err) {
      console.error('Error checking appointment:', err);
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Load appointment settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('appointment_settings')
        .select('*')
        .maybeSingle();

      if (settingsError) throw settingsError;
      setSettings(settingsData);

      // Load closed days
      const { data: closedData, error: closedError } = await supabase
        .from('closed_days')
        .select('*');

      if (closedError) throw closedError;
      setClosedDays(closedData || []);

      // Load all appointments for the next 30 days
      const todayDate = new Date();
      const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

      const laterDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const thirtyDaysLater = `${laterDate.getFullYear()}-${String(laterDate.getMonth() + 1).padStart(2, '0')}-${String(laterDate.getDate()).padStart(2, '0')}`;

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_date')
        .gte('appointment_date', today)
        .lte('appointment_date', thirtyDaysLater)
        .in('status', ['confirmed', 'pending']);

      if (appointmentsError) throw appointmentsError;

      // Count appointments per day
      const counts = {};
      appointmentsData.forEach(apt => {
        const date = apt.appointment_date;
        counts[date] = (counts[date] || 0) + 1;
      });
      setAppointmentCounts(counts);

      // Generate available dates
      generateAvailableDates(settingsData, closedData, counts);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('حدث خطأ في تحميل المواعيد المتاحة');
    } finally {
      setLoading(false);
    }
  };

  const generateAvailableDates = (settings, closedDays, counts) => {
    if (!settings) return;

    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate next 30 days
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      // Use local date string to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const dayOfWeek = date.getDay();

      // Check if it's a weekend day
      const weekendDays = settings.weekend_days || [];
      const isWeekend = weekendDays.includes(dayOfWeek);

      // Check if it's a closed day
      const isClosed = closedDays.some(cd => cd.date === dateStr);

      // Check if it's full
      const appointmentCount = counts[dateStr] || 0;
      const isFull = appointmentCount >= settings.max_appointments_per_day;

      // Only add if not weekend, not closed, and not full
      if (!isWeekend && !isClosed && !isFull) {
        dates.push({
          date: dateStr,
          dateObj: date,
          availableSlots: settings.max_appointments_per_day - appointmentCount,
          status: 'available'
        });
      } else {
        // Add with status for display
        dates.push({
          date: dateStr,
          dateObj: date,
          availableSlots: 0,
          status: isWeekend ? 'weekend' : isClosed ? 'closed' : 'full'
        });
      }
    }

    setAvailableDates(dates);
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      setError('الرجاء اختيار التاريخ والوقت');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get service name
      let serviceName = application.service_title || 'غير محدد';

      // Try to get service name from services table if service_id is a valid UUID
      if (application.service_id) {
        try {
          const { data: serviceData, error: serviceError } = await supabase
            .from('services')
            .select('name_ar')
            .eq('id', application.service_id)
            .maybeSingle();

          if (!serviceError && serviceData) {
            serviceName = serviceData.name_ar;
          }
        } catch (err) {
          // If service_id is not a valid UUID, just use service_title
          console.log('Using service_title instead of fetching from database');
        }
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          application_id: application.id,
          applicant_name: application.form_data?.fullName || 'غير محدد',
          applicant_phone: application.applicant_phone || application.form_data?.phoneNumber || '',
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          region: application.applicant_region || 'riyadh',
          service_name: serviceName,
          status: 'confirmed'
        })
        .select()
        .single();

      if (error) throw error;

      // Update application status to "appointment_confirmed"
      const { error: statusError } = await supabase
        .from('applications')
        .update({
          status: 'appointment_confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (statusError) {
        console.error('Error updating application status:', statusError);
      }

      setExistingAppointment(data);
      setShowConfirmation(true);
      if (onBookingComplete) {
        onBookingComplete(data);
      }
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError('حدث خطأ في حجز الموعد. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!existingAppointment) return;

    if (!confirm('هل أنت متأكد من إلغاء الموعد؟')) return;

    setLoading(true);
    setError(null);

    try {
      // Cancel the appointment
      const { error: cancelError } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', existingAppointment.id);

      if (cancelError) throw cancelError;

      // Update application status back to "appointment_required"
      const { error: statusError } = await supabase
        .from('applications')
        .update({
          status: 'appointment_required',
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (statusError) {
        console.error('Error updating application status:', statusError);
      }

      setExistingAppointment(null);
      await loadSettings();

      // Notify parent component to refresh
      if (onBookingComplete) {
        onBookingComplete(null);
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('حدث خطأ في إلغاء الموعد: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (existingAppointment && !showConfirmation) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-green-500">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">تم حجز الموعد بنجاح</h3>
              <p className="text-sm text-gray-600 mt-1">موعدك محجوز في القنصلية</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-gray-50 rounded-lg p-4">
          {existingAppointment.service_name && (
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <CheckCircle className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">الخدمة</p>
                <p className="font-semibold text-gray-900">{existingAppointment.service_name}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Calendar className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">التاريخ الميلادي</p>
              <p className="font-semibold text-gray-900">
                {getFullGregorianDate(new Date(existingAppointment.appointment_date))}
              </p>
              <p className="text-sm text-gray-600 mt-2">التاريخ الهجري</p>
              <p className="text-sm text-gray-700">
                {getFullHijriDate(new Date(existingAppointment.appointment_date))} هـ
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Clock className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">الوقت</p>
              <p className="font-semibold text-gray-900">{existingAppointment.appointment_time}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <MapPin className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">الموقع</p>
              <p className="font-semibold text-gray-900">
                القنصلية - {regionNames[existingAppointment.region] || existingAppointment.region}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>ملاحظات هامة:</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1 pr-5 list-disc">
            <li>يرجى الحضور قبل الموعد بـ 15 دقيقة</li>
            <li>إحضار الهوية الوطنية الأصلية</li>
            <li>إحضار جميع المستندات المطلوبة</li>
          </ul>
        </div>

        <button
          onClick={handleCancelAppointment}
          disabled={loading}
          className="mt-4 w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? 'جاري الإلغاء...' : 'إلغاء الموعد'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">تم حجز الموعد بنجاح!</h3>
        <p className="text-gray-600 mb-6">سيتم إرسال رسالة تأكيد على رقم الهاتف المسجل</p>
        <button
          onClick={() => setShowConfirmation(false)}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
        >
          عرض تفاصيل الموعد
        </button>
      </div>
    );
  }

  const getHijriDate = (date) => {
    try {
      const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'short',
        calendar: 'islamic-umalqura',
        numberingSystem: 'latn'
      });
      return formatter.format(date);
    } catch (error) {
      return '';
    }
  };

  const getDateColor = (status) => {
    switch (status) {
      case 'available':
        return 'border-gray-200 hover:border-green-400 bg-white cursor-pointer';
      case 'weekend':
        return 'border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed';
      case 'closed':
        return 'border-red-300 bg-red-50 opacity-60 cursor-not-allowed';
      case 'full':
        return 'border-orange-300 bg-orange-50 opacity-60 cursor-not-allowed';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">حجز موعد في القنصلية</h3>
        <p className="text-gray-600">اختر الموعد المناسب لك من المواعيد المتاحة</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 rtl:space-x-reverse">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      )}

      {!loading && availableDates.filter(d => d.status === 'available').length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">لا توجد مواعيد متاحة حالياً</p>
          <p className="text-sm text-gray-500 mt-2">جميع الأيام إما مغلقة، عطلات، أو ممتلئة</p>
        </div>
      )}

      {!loading && availableDates.length > 0 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">اختر التاريخ</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
              {availableDates.map((dateInfo) => {
                const isSelected = selectedDate === dateInfo.date;
                const isDisabled = dateInfo.status !== 'available';

                return (
                  <button
                    key={dateInfo.date}
                    onClick={() => {
                      if (!isDisabled) {
                        setSelectedDate(dateInfo.date);
                        setSelectedTime(null);
                      }
                    }}
                    disabled={isDisabled}
                    className={`p-3 rounded-lg border-2 transition-all text-center relative ${
                      isSelected
                        ? 'border-green-600 bg-green-50 ring-2 ring-green-300'
                        : getDateColor(dateInfo.status)
                    }`}
                  >
                    <p className="text-xs text-gray-600">
                      {dateInfo.dateObj.toLocaleDateString('ar-SA', { weekday: 'short' })}
                    </p>
                    <p className="font-bold text-gray-900 text-lg">
                      {dateInfo.dateObj.getDate()}
                    </p>
                    <p className="text-[10px] text-gray-700 font-medium">
                      {dateInfo.dateObj.toLocaleDateString('ar', { month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {getHijriDate(dateInfo.dateObj)}
                    </p>

                    {dateInfo.status === 'available' && (
                      <p className="text-xs text-green-600 font-semibold mt-1">
                        {dateInfo.availableSlots} متاح
                      </p>
                    )}

                    {dateInfo.status === 'weekend' && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Ban className="w-3 h-3 text-gray-500" />
                        <p className="text-[10px] text-gray-600">عطلة</p>
                      </div>
                    )}

                    {dateInfo.status === 'closed' && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Ban className="w-3 h-3 text-red-500" />
                        <p className="text-[10px] text-red-600">مغلق</p>
                      </div>
                    )}

                    {dateInfo.status === 'full' && (
                      <p className="text-[10px] text-orange-600 font-semibold mt-1">
                        ممتلئ
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">الدليل:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white border-2 border-gray-200 rounded" />
                <span className="text-gray-600">متاح</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-100 border-2 border-gray-300 rounded opacity-60" />
                <span className="text-gray-600">عطلة أسبوعية</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-50 border-2 border-red-300 rounded opacity-60" />
                <span className="text-gray-600">مغلق</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-50 border-2 border-orange-300 rounded opacity-60" />
                <span className="text-gray-600">ممتلئ</span>
              </div>
            </div>
          </div>

          {selectedDate && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">اختر الوقت</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedTime === time
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-400'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{time}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedDate && selectedTime && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">الموعد المختار:</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">التاريخ الميلادي</p>
                  <p className="text-gray-800 font-semibold">
                    {getFullGregorianDate(new Date(selectedDate))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">التاريخ الهجري</p>
                  <p className="text-gray-700 font-medium">
                    {getFullHijriDate(new Date(selectedDate))} هـ
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">الوقت</p>
                  <p className="text-gray-800 font-semibold">
                    {selectedTime}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleBookAppointment}
            disabled={!selectedDate || !selectedTime || loading}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
          >
            {loading ? 'جاري الحجز...' : 'تأكيد الحجز'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentBooking;
