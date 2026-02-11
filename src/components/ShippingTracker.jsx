import React, { useState, useEffect } from 'react';
import { Package, Truck, MapPin, CheckCircle, Clock, Box, ExternalLink, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getRegionsList } from '../data/saudiRegions';

const ShippingTracker = ({ application }) => {
  const [loading, setLoading] = useState(true);
  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState(null);

  const statusIcons = {
    processing: Box,
    shipped: Package,
    in_transit: Truck,
    delivered: CheckCircle
  };

  const statusNames = {
    processing: 'جاري التجهيز',
    shipped: 'تم الشحن',
    in_transit: 'في الطريق',
    delivered: 'تم التوصيل'
  };

  const statusColors = {
    processing: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    shipped: 'text-blue-600 bg-blue-50 border-blue-200',
    in_transit: 'text-purple-600 bg-purple-50 border-purple-200',
    delivered: 'text-green-600 bg-green-50 border-green-200'
  };

  useEffect(() => {
    loadShipmentInfo();
  }, [application.id]);

  const loadShipmentInfo = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          shipping_company:shipping_companies(name, name_en, tracking_url)
        `)
        .eq('application_id', application.id)
        .maybeSingle();

      if (error) throw error;
      setShipment(data);
    } catch (err) {
      console.error('Error loading shipment:', err);
      setError('حدث خطأ في تحميل معلومات الشحن');
    } finally {
      setLoading(false);
    }
  };

  const getRegionLabel = (regionId) => {
    const region = getRegionsList().find(r => r.value === regionId);
    return region ? region.label : regionId;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">جاري تحميل معلومات الشحن...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">لم يتم الشحن بعد</h3>
          <p className="text-gray-600">سيتم تحديث معلومات الشحن عندما يتم شحن طلبك</p>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[shipment.current_status] || Package;
  const statusSteps = ['processing', 'shipped', 'in_transit', 'delivered'];
  const currentStepIndex = statusSteps.indexOf(shipment.current_status);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">تتبع الشحنة</h3>
        <p className="text-gray-600">تابع حالة شحنتك بالتفصيل</p>
      </div>

      <div className={`mb-6 p-4 rounded-lg border-2 ${statusColors[shipment.current_status]}`}>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <StatusIcon className="w-8 h-8" />
          <div className="flex-1">
            <p className="font-semibold text-lg">{statusNames[shipment.current_status]}</p>
            <p className="text-sm opacity-75">رقم التتبع: {shipment.tracking_number}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">شركة الشحن</span>
          <span className="font-semibold text-gray-900">
            {shipment.shipping_company?.name || shipment.carrier}
          </span>
        </div>

        {shipment.tracking_url && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">رابط التتبع</span>
            <a
              href={shipment.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-sm"
            >
              <span>تتبع الشحنة</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {shipment.estimated_delivery && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">التوصيل المتوقع</span>
            <span className="font-semibold text-gray-900">
              {new Date(shipment.estimated_delivery).toLocaleDateString('ar-SA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        )}

        {shipment.actual_delivery && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">تاريخ التوصيل</span>
            <span className="font-semibold text-green-600">
              {new Date(shipment.actual_delivery).toLocaleDateString('ar-SA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        )}

        <div className="pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2 font-semibold">عنوان التوصيل</p>
          <div className="flex items-start space-x-2 rtl:space-x-reverse mb-2">
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-900">
              {shipment.shipping_address?.region && (
                <p>{getRegionLabel(shipment.shipping_address.region)}</p>
              )}
              {shipment.shipping_address?.city && (
                <p>المدينة: {shipment.shipping_address.city}</p>
              )}
              {shipment.shipping_address?.district && (
                <p>الحي: {shipment.shipping_address.district}</p>
              )}
              {shipment.shipping_address?.street && (
                <p>أقرب معلم: {shipment.shipping_address.street}</p>
              )}
              {!shipment.shipping_address?.region &&
               !shipment.shipping_address?.city &&
               !shipment.shipping_address?.district && (
                <p className="text-gray-500">لم يتم تحديد العنوان</p>
              )}
            </div>
          </div>

          {shipment.shipping_address?.phone && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse mt-3 pt-3 border-t border-gray-200">
              <Phone className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-600">رقم الهاتف</p>
                <a
                  href={`tel:${shipment.shipping_address.phone}`}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                  dir="ltr"
                >
                  {shipment.shipping_address.phone}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">مراحل الشحن</h4>
        <div className="relative">
          {statusSteps.map((step, index) => {
            const StepIcon = statusIcons[step];
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step} className="relative flex items-start pb-8 last:pb-0">
                {index < statusSteps.length - 1 && (
                  <div
                    className={`absolute right-4 top-10 w-0.5 h-full ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    style={{ right: '1rem' }}
                  />
                )}

                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>

                <div className="mr-4 flex-1">
                  <p
                    className={`font-semibold ${
                      isCurrent ? 'text-green-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {statusNames[step]}
                  </p>
                  {isCompleted && shipment.status_history && shipment.status_history[index] && (
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(shipment.status_history[index].timestamp).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  {isCompleted && shipment.status_history && shipment.status_history[index]?.notes && (
                    <p className="text-sm text-gray-500 mt-1">
                      {shipment.status_history[index].notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {shipment.current_status !== 'delivered' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>تنبيه:</strong> سيتم إرسال إشعار على رقم الهاتف المسجل عند كل تحديث لحالة الشحنة
          </p>
        </div>
      )}

      {shipment.current_status === 'delivered' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800 font-semibold">
              تم توصيل الشحنة بنجاح!
            </p>
          </div>
          <p className="text-sm text-green-700 mt-2">
            شكراً لاستخدامك خدمات القنصلية السودانية
          </p>
        </div>
      )}
    </div>
  );
};

export default ShippingTracker;
