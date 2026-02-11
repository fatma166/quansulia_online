import React, { useState, useEffect } from 'react';
import { Calendar, Package, Truck, CheckCircle, Clock, AlertCircle, Search, Plus, MapPin, Phone, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';

const AppointmentsShipmentsManagement = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateShipmentModal, setShowCreateShipmentModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'appointments') {
        await loadAppointments();
      } else {
        await loadShipments();
      }
      await loadReadyApplications();
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        applications (
          reference_number,
          service_title,
          status
        )
      `)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (error) throw error;
    setAppointments(data || []);
  };

  const loadShipments = async () => {
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        applications (
          reference_number,
          service_title,
          applicant_phone,
          form_data
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setShipments(data || []);
  };

  const loadReadyApplications = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('status', 'ready')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    setApplications(data || []);
  };

  const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;
      await loadAppointments();
      alert('تم تحديث حالة الموعد بنجاح');
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert('حدث خطأ في تحديث حالة الموعد');
    }
  };

  const handleCreateShipment = async (formData) => {
    try {
      const trackingNumber = `TRK-${Date.now()}`;

      const { error } = await supabase
        .from('shipments')
        .insert({
          application_id: selectedApplication.id,
          tracking_number: trackingNumber,
          carrier: formData.carrier,
          shipping_address: {
            city: formData.city,
            district: formData.district,
            street: formData.street,
            postal_code: formData.postal_code
          },
          current_status: 'processing',
          status_history: [
            {
              status: 'processing',
              timestamp: new Date().toISOString(),
              notes: 'تم إنشاء الشحنة'
            }
          ],
          estimated_delivery: formData.estimated_delivery
        });

      if (error) throw error;

      await supabase
        .from('applications')
        .update({ status: 'shipping' })
        .eq('id', selectedApplication.id);

      setShowCreateShipmentModal(false);
      setSelectedApplication(null);
      await loadData();
      alert('تم إنشاء الشحنة بنجاح');
    } catch (err) {
      console.error('Error creating shipment:', err);
      alert('حدث خطأ في إنشاء الشحنة');
    }
  };

  const handleUpdateShipmentStatus = async (shipmentId, newStatus, notes = '') => {
    try {
      const shipment = shipments.find(s => s.id === shipmentId);
      if (!shipment) return;

      const updatedHistory = [
        ...shipment.status_history,
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          notes
        }
      ];

      const updateData = {
        current_status: newStatus,
        status_history: updatedHistory
      };

      if (newStatus === 'delivered') {
        updateData.actual_delivery = new Date().toISOString();

        await supabase
          .from('applications')
          .update({ status: 'delivered' })
          .eq('id', shipment.application_id);
      }

      const { error } = await supabase
        .from('shipments')
        .update(updateData)
        .eq('id', shipmentId);

      if (error) throw error;
      await loadShipments();
      alert('تم تحديث حالة الشحنة بنجاح');
    } catch (err) {
      console.error('Error updating shipment:', err);
      alert('حدث خطأ في تحديث حالة الشحنة');
    }
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.applications?.reference_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredShipments = shipments.filter(ship =>
    ship.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ship.applications?.reference_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusNames = {
    confirmed: 'مؤكد',
    cancelled: 'ملغي',
    completed: 'مكتمل',
    processing: 'قيد التجهيز',
    shipped: 'تم الشحن',
    in_transit: 'في الطريق',
    delivered: 'تم التوصيل'
  };

  const statusColors = {
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    shipped: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800'
  };

  return (
    <AdminLayout>
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">إدارة المواعيد والشحنات</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'appointments'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-5 h-5 inline-block ml-2" />
              المواعيد
            </button>
            <button
              onClick={() => setActiveTab('shipments')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'shipments'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Truck className="w-5 h-5 inline-block ml-2" />
              الشحنات
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`بحث في ${activeTab === 'appointments' ? 'المواعيد' : 'الشحنات'}...`}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4">جاري التحميل...</p>
              </div>
            ) : activeTab === 'appointments' ? (
              <div className="space-y-4">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">لا توجد مواعيد</p>
                  </div>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <div key={appointment.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{appointment.applicant_name}</h3>
                          <p className="text-sm text-gray-600">
                            {appointment.applications?.reference_number} - {appointment.applications?.service_title}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[appointment.status]}`}>
                          {statusNames[appointment.status]}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>
                            {new Date(appointment.appointment_date).toLocaleDateString('ar-SA', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{appointment.appointment_time}</span>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{appointment.applicant_phone}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm mb-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{appointment.region}</span>
                      </div>

                      {appointment.status === 'confirmed' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateAppointmentStatus(appointment.id, 'completed')}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 inline ml-1" />
                            تأكيد الحضور
                          </button>
                          <button
                            onClick={() => handleUpdateAppointmentStatus(appointment.id, 'cancelled')}
                            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
                          >
                            إلغاء الموعد
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {applications.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">طلبات جاهزة للشحن ({applications.length})</h3>
                    <div className="space-y-2">
                      {applications.map((app) => (
                        <div key={app.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-900">{app.reference_number}</p>
                            <p className="text-sm text-gray-600">{app.service_title}</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowCreateShipmentModal(true);
                            }}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
                          >
                            <Plus className="w-4 h-4 inline ml-1" />
                            إنشاء شحنة
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {filteredShipments.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">لا توجد شحنات</p>
                    </div>
                  ) : (
                    filteredShipments.map((shipment) => (
                      <div key={shipment.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {shipment.applications?.reference_number}
                            </h3>
                            <p className="text-sm text-gray-600">{shipment.applications?.service_title}</p>
                            <p className="text-xs text-gray-500 font-mono mt-1">{shipment.tracking_number}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[shipment.current_status]}`}>
                            {statusNames[shipment.current_status]}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                            <Truck className="w-4 h-4 text-gray-500" />
                            <span>{shipment.carrier}</span>
                          </div>
                          {shipment.shipping_address && (
                            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span>{shipment.shipping_address.city}</span>
                            </div>
                          )}
                        </div>

                        {shipment.current_status !== 'delivered' && (
                          <div className="flex gap-2">
                            {shipment.current_status === 'processing' && (
                              <button
                                onClick={() => handleUpdateShipmentStatus(shipment.id, 'shipped', 'تم شحن الطلب')}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
                              >
                                تأكيد الشحن
                              </button>
                            )}
                            {shipment.current_status === 'shipped' && (
                              <button
                                onClick={() => handleUpdateShipmentStatus(shipment.id, 'in_transit', 'الشحنة في الطريق')}
                                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold"
                              >
                                في الطريق
                              </button>
                            )}
                            {shipment.current_status === 'in_transit' && (
                              <button
                                onClick={() => handleUpdateShipmentStatus(shipment.id, 'delivered', 'تم التوصيل بنجاح')}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold"
                              >
                                <CheckCircle className="w-4 h-4 inline ml-1" />
                                تأكيد التوصيل
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {showCreateShipmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">إنشاء شحنة جديدة</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  handleCreateShipment({
                    carrier: formData.get('carrier'),
                    city: formData.get('city'),
                    district: formData.get('district'),
                    street: formData.get('street'),
                    postal_code: formData.get('postal_code'),
                    estimated_delivery: formData.get('estimated_delivery')
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">شركة الشحن</label>
                  <select name="carrier" required className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="aramex">أرامكس</option>
                    <option value="smsa">سمسا</option>
                    <option value="ups">UPS</option>
                    <option value="dhl">DHL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">المدينة</label>
                  <input type="text" name="city" required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الحي</label>
                  <input type="text" name="district" required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الشارع</label>
                  <input type="text" name="street" required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الرمز البريدي</label>
                  <input type="text" name="postal_code" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ التوصيل المتوقع</label>
                  <input type="date" name="estimated_delivery" required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                  >
                    إنشاء
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateShipmentModal(false);
                      setSelectedApplication(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AppointmentsShipmentsManagement;
