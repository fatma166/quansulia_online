import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save } from 'lucide-react';

export default function CustomFiltersModal({ isOpen, onClose, onApply, serviceId, initialFilters = [] }) {
  const [filters, setFilters] = useState([]);
  const [serviceFields, setServiceFields] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && serviceId && serviceId !== 'all') {
      loadServiceFields();
    }
  }, [isOpen, serviceId]);

  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters.length > 0 ? initialFilters : []);
    }
  }, [isOpen, initialFilters]);

  const loadServiceFields = async () => {
    setLoading(true);
    try {
      const { supabase } = await import('../lib/supabase');

      // محاولة جلب حقول الخدمة المحددة
      let { data, error } = await supabase
        .from('service_fields')
        .select('*')
        .eq('service_id', serviceId)
        .order('order_index');

      if (error) throw error;

      // إذا لم توجد حقول للخدمة الأساسية، نجلب حقول الخدمات الفرعية
      if (!data || data.length === 0) {
        // جلب الخدمات الفرعية
        const { data: subServices, error: subError } = await supabase
          .from('services')
          .select('id')
          .eq('parent_id', serviceId)
          .eq('is_active', true);

        if (subError) throw subError;

        if (subServices && subServices.length > 0) {
          // جلب حقول كل الخدمات الفرعية
          const subServiceIds = subServices.map(s => s.id);

          const { data: subFieldsData, error: subFieldsError } = await supabase
            .from('service_fields')
            .select('*')
            .in('service_id', subServiceIds)
            .order('order_index');

          if (subFieldsError) throw subFieldsError;
          data = subFieldsData;
        }
      }

      // فلترة الحقول التي يمكن الفلترة عليها وإزالة التكرارات
      const uniqueFields = new Map();

      (data || [])
        .filter(field =>
          ['text', 'number', 'select', 'radio', 'date', 'email', 'tel'].includes(field.field_type)
        )
        .forEach(field => {
          if (!uniqueFields.has(field.field_name)) {
            let normalizedOptions = [];
            if (field.options && Array.isArray(field.options)) {
              normalizedOptions = field.options.map(opt => {
                if (typeof opt === 'object' && opt !== null) {
                  return opt;
                } else if (typeof opt === 'string') {
                  return opt;
                }
                return String(opt);
              });
            }

            uniqueFields.set(field.field_name, {
              name: field.field_name,
              label: field.label_ar,
              type: field.field_type,
              options: normalizedOptions
            });
          }
        });

      setServiceFields(Array.from(uniqueFields.values()));
    } catch (error) {
      console.error('Error loading service fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFilter = () => {
    setFilters([
      ...filters,
      {
        id: Date.now(),
        field: '',
        operator: 'equals',
        value: ''
      }
    ]);
  };

  const removeFilter = (filterId) => {
    setFilters(filters.filter(f => f.id !== filterId));
  };

  const updateFilter = (filterId, key, value) => {
    setFilters(filters.map(f =>
      f.id === filterId ? { ...f, [key]: value } : f
    ));
  };

  const getOperatorsForField = (fieldName) => {
    const field = serviceFields.find(f => f.name === fieldName);
    if (!field) return [];

    const operators = {
      text: [
        { value: 'equals', label: 'يساوي' },
        { value: 'contains', label: 'يحتوي على' },
        { value: 'startsWith', label: 'يبدأ بـ' },
        { value: 'endsWith', label: 'ينتهي بـ' },
        { value: 'notEquals', label: 'لا يساوي' }
      ],
      number: [
        { value: 'equals', label: 'يساوي' },
        { value: 'greaterThan', label: 'أكبر من' },
        { value: 'lessThan', label: 'أقل من' },
        { value: 'greaterThanOrEqual', label: 'أكبر من أو يساوي' },
        { value: 'lessThanOrEqual', label: 'أقل من أو يساوي' }
      ],
      select: [
        { value: 'equals', label: 'يساوي' },
        { value: 'notEquals', label: 'لا يساوي' }
      ],
      radio: [
        { value: 'equals', label: 'يساوي' },
        { value: 'notEquals', label: 'لا يساوي' }
      ],
      date: [
        { value: 'equals', label: 'يساوي' },
        { value: 'before', label: 'قبل' },
        { value: 'after', label: 'بعد' }
      ],
      email: [
        { value: 'equals', label: 'يساوي' },
        { value: 'contains', label: 'يحتوي على' }
      ],
      tel: [
        { value: 'equals', label: 'يساوي' },
        { value: 'contains', label: 'يحتوي على' }
      ]
    };

    return operators[field.type] || operators.text;
  };

  const handleApply = () => {
    // فلترة الفلاتر غير المكتملة
    const validFilters = filters.filter(f => f.field && f.operator && f.value);
    onApply(validFilters);
    onClose();
  };

  const handleClear = () => {
    setFilters([]);
    onApply([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">فلاتر مخصصة</h2>
                <p className="text-white/80 text-sm">فلترة الطلبات حسب تفاصيل الخدمة</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {serviceId === 'all' ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  اختر خدمة أولاً
                </h3>
                <p className="text-gray-600">
                  يجب اختيار خدمة محددة من الفلاتر لتتمكن من إضافة فلاتر مخصصة
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-[#276073] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">جاري تحميل حقول الخدمة...</p>
              </div>
            ) : serviceFields.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  لا توجد حقول متاحة
                </h3>
                <p className="text-gray-600">
                  الخدمة المختارة لا تحتوي على حقول يمكن الفلترة عليها
                </p>
              </div>
            ) : (
              <>
                {/* Filters List */}
                <div className="space-y-4 mb-4">
                  {filters.map((filter, index) => {
                    const selectedField = serviceFields.find(f => f.name === filter.field);
                    const operators = getOperatorsForField(filter.field);

                    return (
                      <motion.div
                        key={filter.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-[#276073] text-white rounded-lg flex items-center justify-center font-bold">
                            {index + 1}
                          </div>

                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Field Selection */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                الحقل
                              </label>
                              <select
                                value={filter.field}
                                onChange={(e) => updateFilter(filter.id, 'field', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                              >
                                <option value="">اختر الحقل</option>
                                {serviceFields.map(field => (
                                  <option key={field.name} value={field.name}>
                                    {field.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Operator Selection */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                العملية
                              </label>
                              <select
                                value={filter.operator}
                                onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                                disabled={!filter.field}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent disabled:opacity-50"
                              >
                                {operators.map(op => (
                                  <option key={op.value} value={op.value}>
                                    {op.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Value Input */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                القيمة
                              </label>
                              {selectedField && (selectedField.type === 'select' || selectedField.type === 'radio') ? (
                                <select
                                  value={filter.value}
                                  onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                                >
                                  <option value="">اختر القيمة</option>
                                  {selectedField.options.map((option, idx) => {
                                    const optionValue = typeof option === 'object' ? option.value : option;
                                    const optionLabel = typeof option === 'object' ? option.label_ar : option;
                                    return (
                                      <option key={idx} value={optionValue}>
                                        {optionLabel}
                                      </option>
                                    );
                                  })}
                                </select>
                              ) : (
                                <input
                                  type={selectedField?.type === 'number' ? 'number' : selectedField?.type === 'date' ? 'date' : 'text'}
                                  value={filter.value}
                                  onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                                  placeholder="أدخل القيمة"
                                  disabled={!filter.field}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent disabled:opacity-50"
                                />
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => removeFilter(filter.id)}
                            className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف الفلتر"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Add Filter Button */}
                <button
                  onClick={addFilter}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#276073] hover:text-[#276073] hover:bg-[#276073]/5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">إضافة فلتر جديد</span>
                </button>

                {filters.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                      <strong>ملاحظة:</strong> سيتم عرض الطلبات التي تحقق جميع الفلاتر المحددة أعلاه
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3">
            <div className="flex gap-3">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                مسح الكل
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                إلغاء
              </button>
            </div>

            <button
              onClick={handleApply}
              disabled={filters.length === 0 || serviceId === 'all'}
              className="flex items-center gap-2 px-6 py-2 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>تطبيق الفلاتر</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
