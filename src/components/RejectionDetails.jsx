import React, { useState, useEffect } from 'react';
import { XCircle, AlertTriangle, FileText, RefreshCw, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const RejectionDetails = ({ application }) => {
  const [rejectionInfo, setRejectionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRejectionDetails();
  }, [application.id]);

  const loadRejectionDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('rejection_details')
        .select('*')
        .eq('application_id', application.id)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) throw error;
      setRejectionInfo(data);
    } catch (err) {
      console.error('Error loading rejection details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResubmit = () => {
    navigate(`/services/${application.service_slug}`, {
      state: { resubmitData: application }
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-red-500">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <XCircle className="w-10 h-10 text-red-500" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">تم رفض الطلب</h3>
            <p className="text-sm text-gray-600 mt-1">للأسف، لم يتم الموافقة على طلبك</p>
          </div>
        </div>
      </div>

      {rejectionInfo && (
        <>
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-start space-x-3 rtl:space-x-reverse mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 mb-2">سبب الرفض:</h4>
                <p className="text-red-700">{rejectionInfo.reason}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-red-200">
              <p className="text-sm text-red-600">
                تاريخ الرفض:{' '}
                {new Date(rejectionInfo.rejection_date).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {rejectionInfo.required_documents && rejectionInfo.required_documents.length > 0 && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <FileText className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-800 mb-3">المستندات المطلوبة لإعادة التقديم:</h4>
                  <ul className="space-y-2">
                    {rejectionInfo.required_documents.map((doc, index) => (
                      <li key={index} className="flex items-start space-x-2 rtl:space-x-reverse text-orange-700">
                        <span className="text-orange-600 font-bold">•</span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {rejectionInfo.can_resubmit ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">يمكنك إعادة تقديم الطلب</h4>
                <p className="text-sm text-blue-700 mb-3">
                  نأسف للإزعاج. يمكنك تصحيح المعلومات المطلوبة وإعادة تقديم الطلب مرة أخرى.
                </p>
                <ul className="text-sm text-blue-700 space-y-1 pr-5 list-disc">
                  <li>تأكد من إرفاق جميع المستندات المطلوبة</li>
                  <li>راجع البيانات المدخلة بعناية</li>
                  <li>تأكد من وضوح الصور المرفقة</li>
                  <li>تواصل معنا في حالة وجود أي استفسار</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleResubmit}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>إعادة تقديم الطلب</span>
                </button>

                <a
                  href="/contact"
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>تواصل معنا</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">لا يمكن إعادة تقديم هذا الطلب</h4>
              <p className="text-sm text-gray-700 mb-4">
                للأسف، لا يمكن إعادة تقديم هذا الطلب. للمزيد من المعلومات، يرجى التواصل مع خدمة العملاء.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>تواصل معنا</span>
              </a>
            </div>
          )}
        </>
      )}

      {!rejectionInfo && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-700">
            لم يتم العثور على تفاصيل الرفض. يرجى التواصل مع خدمة العملاء للحصول على مزيد من المعلومات.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors mt-4"
          >
            <MessageCircle className="w-5 h-5" />
            <span>تواصل معنا</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default RejectionDetails;
