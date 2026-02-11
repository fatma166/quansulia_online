import React, { useState, useEffect } from 'react';
import { Copy, Upload, FileJson, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ServiceImportTool = ({ onImport, onClose, currentServiceId }) => {
  const [activeTab, setActiveTab] = useState('clone');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name_ar, name_en')
        .eq('is_active', true)
        .order('name_ar');

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const handleCloneFromService = async () => {
    if (!selectedService) {
      setError('يرجى اختيار خدمة للاستنساخ منها');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data: requirements, error: reqError } = await supabase
        .from('service_requirements')
        .select('*')
        .eq('service_id', selectedService);

      if (reqError) throw reqError;

      const { data: documents, error: docsError } = await supabase
        .from('service_documents')
        .select('*')
        .eq('service_id', selectedService);

      if (docsError) throw docsError;

      const { data: fields, error: fieldsError } = await supabase
        .from('service_fields')
        .select('*')
        .eq('service_id', selectedService)
        .order('order_index');

      if (fieldsError) throw fieldsError;

      onImport({
        requirements: requirements.map(r => ({
          requirement_ar: r.requirement_ar,
          requirement_en: r.requirement_en,
          conditions: r.conditions || {},
          order_index: r.order_index
        })),
        documents: documents.map(d => ({
          document_name_ar: d.document_name_ar,
          document_name_en: d.document_name_en,
          description_ar: d.description_ar,
          description_en: d.description_en,
          is_required: d.is_required,
          max_size_mb: d.max_size_mb,
          allowed_types: d.allowed_types,
          conditions: d.conditions || {},
          order_index: d.order_index
        })),
        fields: fields.map(f => ({
          name: f.name,
          label_ar: f.label_ar,
          label_en: f.label_en,
          type: f.type,
          is_required: f.is_required,
          placeholder_ar: f.placeholder_ar,
          placeholder_en: f.placeholder_en,
          config: f.config || {},
          validation: f.validation || {},
          conditions: f.conditions || {},
          order_index: f.order_index,
          step_number: f.step_number,
          is_active: f.is_active
        }))
      });

      setSuccess('تم الاستنساخ بنجاح!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error cloning:', err);
      setError('حدث خطأ أثناء الاستنساخ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportFromJSON = async () => {
    if (!jsonInput.trim()) {
      setError('يرجى إدخال JSON');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = JSON.parse(jsonInput);

      const importData = {
        requirements: [],
        documents: [],
        fields: []
      };

      if (data.requirements) {
        importData.requirements = data.requirements.map((r, idx) => ({
          requirement_ar: r.requirement_ar || r.ar || r.text_ar || '',
          requirement_en: r.requirement_en || r.en || r.text_en || '',
          conditions: r.conditions || {},
          order_index: r.order_index !== undefined ? r.order_index : idx
        }));
      }

      if (data.documents) {
        importData.documents = data.documents.map((d, idx) => ({
          document_name_ar: d.document_name_ar || d.name_ar || d.ar || '',
          document_name_en: d.document_name_en || d.name_en || d.en || '',
          description_ar: d.description_ar || d.desc_ar || '',
          description_en: d.description_en || d.desc_en || '',
          is_required: d.is_required !== undefined ? d.is_required : true,
          max_size_mb: d.max_size_mb || 5,
          allowed_types: d.allowed_types || ['pdf', 'jpg', 'png'],
          conditions: d.conditions || {},
          order_index: d.order_index !== undefined ? d.order_index : idx
        }));
      }

      if (data.fields) {
        importData.fields = data.fields.map((f, idx) => ({
          name: f.name,
          label_ar: f.label_ar || f.labelAr,
          label_en: f.label_en || f.labelEn,
          type: f.type,
          is_required: f.is_required !== undefined ? f.is_required : f.required !== undefined ? f.required : false,
          placeholder_ar: f.placeholder_ar || f.placeholderAr || '',
          placeholder_en: f.placeholder_en || f.placeholderEn || '',
          config: f.config || f.options ? { options: f.options } : {},
          validation: f.validation || {},
          conditions: f.conditions || {},
          order_index: f.order_index !== undefined ? f.order_index : idx,
          step_number: f.step_number || f.step || 1,
          is_active: f.is_active !== undefined ? f.is_active : true
        }));
      }

      onImport(importData);
      setSuccess('تم الاستيراد بنجاح!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error importing JSON:', err);
      setError('خطأ في تحليل JSON: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exampleJSON = {
    requirements: [
      {
        requirement_ar: "صورة من الهوية الوطنية",
        requirement_en: "Copy of National ID"
      },
      {
        requirement_ar: "صورة من الجواز القديم",
        requirement_en: "Copy of Old Passport",
        conditions: {
          show_when: [
            {
              field: "request_type",
              operator: "equals",
              value: "renewal"
            }
          ],
          logic: "AND"
        }
      }
    ],
    documents: [
      {
        document_name_ar: "صورة الهوية",
        document_name_en: "ID Photo",
        is_required: true,
        max_size_mb: 5,
        allowed_types: ["pdf", "jpg", "png"]
      }
    ],
    fields: [
      {
        name: "request_type",
        label_ar: "نوع الطلب",
        label_en: "Request Type",
        type: "select",
        is_required: true,
        config: {
          options: [
            { value: "new", label_ar: "جديد", label_en: "New" },
            { value: "renewal", label_ar: "تجديد", label_en: "Renewal" }
          ]
        }
      }
    ]
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-bold">استيراد البيانات</h2>
              <p className="text-sm text-blue-100 mt-1">
                استنسخ من خدمة أخرى أو استورد من JSON
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('clone')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'clone'
                  ? 'text-[#276073] border-b-2 border-[#276073] bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Copy className="w-5 h-5 inline-block ml-2" />
              استنساخ من خدمة
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'json'
                  ? 'text-[#276073] border-b-2 border-[#276073] bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileJson className="w-5 h-5 inline-block ml-2" />
              استيراد JSON
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {activeTab === 'clone' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">كيفية الاستنساخ</h3>
                <p className="text-sm text-blue-800">
                  اختر خدمة موجودة لنسخ جميع المتطلبات والمرفقات والحقول منها إلى الخدمة الحالية
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  اختر الخدمة
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                >
                  <option value="">-- اختر خدمة --</option>
                  {services
                    .filter(s => s.id !== currentServiceId)
                    .map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name_ar}
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={handleCloneFromService}
                disabled={loading || !selectedService}
                className="w-full bg-[#276073] text-white py-3 px-6 rounded-lg hover:bg-[#1e4a5a] disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                {loading ? 'جاري الاستنساخ...' : 'استنساخ الآن'}
              </button>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">كيفية الاستيراد</h3>
                <p className="text-sm text-blue-800 mb-3">
                  الصق JSON يحتوي على requirements، documents، أو fields
                </p>
                <details className="text-sm">
                  <summary className="cursor-pointer text-[#276073] font-semibold hover:underline">
                    عرض مثال JSON
                  </summary>
                  <pre className="mt-3 bg-white p-3 rounded border border-blue-200 overflow-x-auto text-xs">
{JSON.stringify(exampleJSON, null, 2)}
                  </pre>
                </details>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  JSON البيانات
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={12}
                  placeholder='{"requirements": [...], "documents": [...], "fields": [...]}'
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent font-mono text-sm"
                />
              </div>

              <button
                onClick={handleImportFromJSON}
                disabled={loading || !jsonInput.trim()}
                className="w-full bg-[#276073] text-white py-3 px-6 rounded-lg hover:bg-[#1e4a5a] disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                {loading ? 'جاري الاستيراد...' : 'استيراد الآن'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceImportTool;
