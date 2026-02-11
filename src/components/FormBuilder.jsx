import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Copy,
  Settings2,
  Eye,
  EyeOff
} from 'lucide-react';

const FIELD_TYPES = [
  { value: 'text', label: 'نص', icon: '📝' },
  { value: 'textarea', label: 'نص طويل', icon: '📄' },
  { value: 'number', label: 'رقم', icon: '🔢' },
  { value: 'email', label: 'بريد إلكتروني', icon: '📧' },
  { value: 'phone', label: 'هاتف', icon: '📱' },
  { value: 'date', label: 'تاريخ', icon: '📅' },
  { value: 'select', label: 'قائمة منسدلة', icon: '📋' },
  { value: 'radio', label: 'اختيار واحد', icon: '🔘' },
  { value: 'checkbox', label: 'اختيار متعدد', icon: '☑️' },
  { value: 'file', label: 'ملف', icon: '📎' },
  { value: 'dynamic-list', label: 'قائمة ديناميكية', icon: '📝' },
  { value: 'searchable-select', label: 'قائمة بحث', icon: '🔍' },
  { value: 'info', label: 'نص معلوماتي', icon: 'ℹ️' }
];

const FieldEditor = ({ field, index, onUpdate, onDelete, onDuplicate, onDragStart, onDragEnd, onDragOver, onDrop }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFieldChange = (property, value) => {
    onUpdate(index, { ...field, [property]: value });
  };

  const handleOptionsChange = (newOptions) => {
    onUpdate(index, { ...field, options: newOptions });
  };

  const handleValidationChange = (property, value) => {
    const validation = field.validation_rules || {};
    onUpdate(index, {
      ...field,
      validation_rules: { ...validation, [property]: value }
    });
  };

  const addOption = () => {
    const options = Array.isArray(field.options) ? field.options : [];
    handleOptionsChange([
      ...options,
      { label_ar: '', label_en: '', value: '' }
    ]);
  };

  const updateOption = (optionIndex, property, value) => {
    const options = Array.isArray(field.options) ? [...field.options] : [];
    options[optionIndex] = { ...options[optionIndex], [property]: value };
    handleOptionsChange(options);
  };

  const removeOption = (optionIndex) => {
    const options = Array.isArray(field.options) ? field.options : [];
    handleOptionsChange(options.filter((_, i) => i !== optionIndex));
  };

  const needsOptions = ['select', 'radio', 'checkbox', 'searchable-select'].includes(field.field_type);
  const fieldTypeLabel = FIELD_TYPES.find(t => t.value === field.field_type)?.label || field.field_type;
  const options = Array.isArray(field.options) ? field.options : [];

  const isFieldActive = field.is_active !== false;

  return (
    <div
      className={`border rounded-lg shadow-sm transition-all ${
        isFieldActive
          ? 'border-gray-200 bg-white'
          : 'border-gray-300 bg-gray-50 opacity-60'
      }`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="mt-2 cursor-move text-gray-400 hover:text-gray-600"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{FIELD_TYPES.find(t => t.value === field.field_type)?.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">
                      {field.label_ar || 'حقل جديد'}
                    </h4>
                    {!isFieldActive && (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-semibold rounded">
                        مخفي
                      </span>
                    )}
                    {field.is_required && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
                        إجباري
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{fieldTypeLabel} • {field.field_name || 'غير محدد'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFieldChange('is_active', !(field.is_active !== false))}
                  className={`p-2 rounded transition-colors ${
                    field.is_active !== false
                      ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                  title={field.is_active !== false ? 'إخفاء الحقل' : 'إظهار الحقل'}
                >
                  {field.is_active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicate(index)}
                  className="p-2 text-gray-400 hover:text-[#276073] hover:bg-gray-50 rounded"
                  title="نسخ"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 text-gray-400 hover:text-[#276073] hover:bg-gray-50 rounded"
                  title={isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                >
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(index)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      اسم الحقل (مفتاح)*
                    </label>
                    <input
                      type="text"
                      value={field.field_name || ''}
                      onChange={(e) => handleFieldChange('field_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent text-sm"
                      placeholder="full_name"
                    />
                    <p className="text-xs text-gray-500 mt-1">استخدم أحرف إنجليزية صغيرة و underscore فقط</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      التسمية (عربي)*
                    </label>
                    <input
                      type="text"
                      value={field.label_ar || ''}
                      onChange={(e) => handleFieldChange('label_ar', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent text-sm"
                      placeholder="الاسم الكامل"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      التسمية (إنجليزي)
                    </label>
                    <input
                      type="text"
                      value={field.label_en || ''}
                      onChange={(e) => handleFieldChange('label_en', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent text-sm"
                      placeholder="Full Name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      نوع الحقل*
                    </label>
                    <select
                      value={field.field_type}
                      onChange={(e) => handleFieldChange('field_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent text-sm"
                    >
                      {FIELD_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      النص التوضيحي (عربي)
                    </label>
                    <input
                      type="text"
                      value={field.placeholder_ar || ''}
                      onChange={(e) => handleFieldChange('placeholder_ar', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent text-sm"
                      placeholder="أدخل الاسم الكامل"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      نص المساعدة (عربي)
                    </label>
                    <input
                      type="text"
                      value={field.help_text_ar || ''}
                      onChange={(e) => handleFieldChange('help_text_ar', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent text-sm"
                      placeholder="نص توضيحي إضافي"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      نص المساعدة (إنجليزي)
                    </label>
                    <input
                      type="text"
                      value={field.help_text_en || ''}
                      onChange={(e) => handleFieldChange('help_text_en', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent text-sm"
                      placeholder="Additional help text"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.is_required || false}
                      onChange={(e) => handleFieldChange('is_required', e.target.checked)}
                      className="w-4 h-4 text-[#276073] rounded focus:ring-[#276073]"
                    />
                    <span className="text-sm font-semibold text-gray-700">حقل إجباري</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.is_active !== false}
                      onChange={(e) => handleFieldChange('is_active', e.target.checked)}
                      className="w-4 h-4 text-[#276073] rounded focus:ring-[#276073]"
                    />
                    <span className="text-sm font-semibold text-gray-700">مفعل</span>
                  </label>
                </div>

                {needsOptions && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-gray-900">الخيارات</h5>
                      <button
                        type="button"
                        onClick={addOption}
                        className="flex items-center gap-2 text-sm text-[#276073] hover:text-[#1e4a5a] font-semibold"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة خيار
                      </button>
                    </div>

                    {options.length === 0 && (
                      <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-sm text-gray-600">لا توجد خيارات. انقر "إضافة خيار" للبدء</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={option.label_ar || ''}
                              onChange={(e) => updateOption(optIndex, 'label_ar', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="التسمية (عربي)"
                            />
                            <input
                              type="text"
                              value={option.label_en || ''}
                              onChange={(e) => updateOption(optIndex, 'label_en', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="التسمية (English)"
                            />
                            <input
                              type="text"
                              value={option.value || ''}
                              onChange={(e) => updateOption(optIndex, 'value', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="القيمة"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeOption(optIndex)}
                            className="p-2 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-semibold"
                  >
                    {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showAdvanced ? 'إخفاء' : 'عرض'} الإعدادات المتقدمة
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            القيمة الافتراضية
                          </label>
                          <input
                            type="text"
                            value={field.default_value || ''}
                            onChange={(e) => handleFieldChange('default_value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            الترتيب
                          </label>
                          <input
                            type="number"
                            value={field.order_index || 0}
                            onChange={(e) => handleFieldChange('order_index', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      {field.field_type === 'text' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              الحد الأدنى للطول
                            </label>
                            <input
                              type="number"
                              value={field.validation_rules?.minLength || ''}
                              onChange={(e) => handleValidationChange('minLength', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              الحد الأقصى للطول
                            </label>
                            <input
                              type="number"
                              value={field.validation_rules?.maxLength || ''}
                              onChange={(e) => handleValidationChange('maxLength', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      )}

                      {field.field_type === 'number' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              الحد الأدنى
                            </label>
                            <input
                              type="number"
                              value={field.validation_rules?.min || ''}
                              onChange={(e) => handleValidationChange('min', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              الحد الأقصى
                            </label>
                            <input
                              type="number"
                              value={field.validation_rules?.max || ''}
                              onChange={(e) => handleValidationChange('max', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      )}

                      {field.field_type === 'file' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              أنواع الملفات المقبولة
                            </label>
                            <input
                              type="text"
                              value={field.validation_rules?.acceptedFormats?.join(', ') || ''}
                              onChange={(e) => handleValidationChange('acceptedFormats', e.target.value.split(',').map(s => s.trim()))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="pdf, jpg, png"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              الحد الأقصى للحجم (MB)
                            </label>
                            <input
                              type="number"
                              value={field.validation_rules?.maxSize || 5}
                              onChange={(e) => handleValidationChange('maxSize', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FormBuilder = ({ fields, onChange }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleAddField = () => {
    const newField = {
      field_name: `field_${Date.now()}`,
      label_ar: '',
      label_en: '',
      field_type: 'text',
      placeholder_ar: '',
      placeholder_en: '',
      help_text_ar: '',
      help_text_en: '',
      is_required: false,
      is_active: true,
      order_index: fields.length,
      step_id: 'step_1',
      step_title_ar: 'معلومات أساسية',
      step_title_en: 'Basic Information',
      options: [],
      validation_rules: {},
      default_value: ''
    };
    onChange([...fields, newField]);
  };

  const handleUpdateField = (index, updatedField) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    onChange(newFields);
  };

  const handleDeleteField = (index) => {
    const field = fields[index];
    if (field.id) {
      const newFields = [...fields];
      newFields[index] = { ...field, _deleted: true };
      onChange(newFields);
    } else {
      onChange(fields.filter((_, i) => i !== index));
    }
  };

  const handleDuplicateField = (index) => {
    const fieldToDuplicate = { ...fields[index] };
    delete fieldToDuplicate.id;
    fieldToDuplicate.field_name = `${fieldToDuplicate.field_name}_copy_${Date.now()}`;
    fieldToDuplicate.label_ar = `${fieldToDuplicate.label_ar} (نسخة)`;
    fieldToDuplicate.order_index = fields.length;
    onChange([...fields, fieldToDuplicate]);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleContainerDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleContainerDrop = (e) => {
    e.preventDefault();
    if (draggedIndex !== null) {
      handleDrop(e, activeFields.length - 1);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    const newFields = [...activeFields];
    const draggedField = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(dropIndex, 0, draggedField);

    newFields.forEach((field, idx) => {
      field.order_index = idx;
    });

    onChange(newFields);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const activeFields = fields.filter(f => !f._deleted);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">بناء النموذج</h3>
          <p className="text-sm text-gray-600 mt-1">
            قم بإضافة وتخصيص الحقول التي سيتم عرضها في نموذج الخدمة
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddField}
          className="flex items-center gap-2 bg-[#276073] text-white px-4 py-2 rounded-lg hover:bg-[#1e4a5a] font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة حقل
        </button>
      </div>

      {activeFields.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Settings2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">لا توجد حقول</h4>
          <p className="text-gray-600 mb-4">ابدأ ببناء النموذج بإضافة حقل جديد</p>
          <button
            type="button"
            onClick={handleAddField}
            className="inline-flex items-center gap-2 bg-[#276073] text-white px-6 py-3 rounded-lg hover:bg-[#1e4a5a] font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            إضافة حقل
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {activeFields.map((field, index) => (
            <div key={field.id || index}>
              {dragOverIndex === index && draggedIndex !== index && (
                <div className="h-16 mb-3 border-2 border-dashed border-blue-500 bg-blue-50 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">📍 أفلت الحقل هنا</span>
                </div>
              )}
              <div
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={`transition-all ${
                  draggedIndex === index ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <FieldEditor
                  field={field}
                  index={index}
                  onUpdate={handleUpdateField}
                  onDelete={handleDeleteField}
                  onDuplicate={handleDuplicateField}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => e.preventDefault()}
                />
              </div>
            </div>
          ))}
          {dragOverIndex === activeFields.length && (
            <div className="h-16 border-2 border-dashed border-blue-500 bg-blue-50 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">📍 أفلت الحقل هنا</span>
            </div>
          )}
        </div>
      )}

      {activeFields.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-lg">ℹ️</div>
            <div className="flex-1">
              <h5 className="font-semibold text-blue-900 mb-2">نصائح لبناء النموذج</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• استخدم أسماء فريدة لكل حقل باللغة الإنجليزية (مثل: full_name, email, phone)</li>
                <li>• تأكد من إضافة التسمية بالعربي والإنجليزي لدعم اللغتين</li>
                <li>• استخدم الحقول الإجبارية للبيانات المهمة فقط</li>
                <li>• رتب الحقول بشكل منطقي لتسهيل التعبئة على المستخدم</li>
                <li>• يمكنك سحب الحقول وإفلاتها لإعادة ترتيبها</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
