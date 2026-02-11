import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  Copy,
  Settings2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Save,
  Play,
  Layout,
  Maximize2
} from 'lucide-react';

// Helper to safely parse options (handles both arrays and JSON strings)
const parseOptions = (options) => {
  if (!options) return [];
  if (Array.isArray(options)) return options;
  if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse options:', options, e);
      return [];
    }
  }
  return [];
};

const FIELD_COMPONENTS = [
  {
    type: 'text',
    label_ar: 'حقل نصي',
    label_en: 'Text Field',
    icon: '📝',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    defaultConfig: {
      field_type: 'text',
      placeholder_ar: 'أدخل النص',
      validation_rules: {}
    }
  },
  {
    type: 'textarea',
    label_ar: 'نص طويل',
    label_en: 'Text Area',
    icon: '📄',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    defaultConfig: {
      field_type: 'textarea',
      placeholder_ar: 'أدخل النص الطويل',
      validation_rules: {}
    }
  },
  {
    type: 'number',
    label_ar: 'رقم',
    label_en: 'Number',
    icon: '🔢',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    defaultConfig: {
      field_type: 'number',
      placeholder_ar: 'أدخل الرقم',
      validation_rules: { min: 0 }
    }
  },
  {
    type: 'email',
    label_ar: 'بريد إلكتروني',
    label_en: 'Email',
    icon: '📧',
    color: 'bg-pink-50 border-pink-200 text-pink-700',
    defaultConfig: {
      field_type: 'email',
      placeholder_ar: 'example@email.com',
      validation_rules: {}
    }
  },
  {
    type: 'phone',
    label_ar: 'هاتف',
    label_en: 'Phone',
    icon: '📱',
    color: 'bg-green-50 border-green-200 text-green-700',
    defaultConfig: {
      field_type: 'phone',
      placeholder_ar: '05xxxxxxxx',
      validation_rules: {}
    }
  },
  {
    type: 'date',
    label_ar: 'تاريخ',
    label_en: 'Date',
    icon: '📅',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    defaultConfig: {
      field_type: 'date',
      validation_rules: {}
    }
  },
  {
    type: 'select',
    label_ar: 'قائمة منسدلة',
    label_en: 'Select',
    icon: '📋',
    color: 'bg-teal-50 border-teal-200 text-teal-700',
    defaultConfig: {
      field_type: 'select',
      options: [
        { label_ar: 'خيار 1', label_en: 'Option 1', value: 'opt1' },
        { label_ar: 'خيار 2', label_en: 'Option 2', value: 'opt2' }
      ],
      validation_rules: {}
    }
  },
  {
    type: 'radio',
    label_ar: 'اختيار واحد',
    label_en: 'Radio',
    icon: '🔘',
    color: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    defaultConfig: {
      field_type: 'radio',
      options: [
        { label_ar: 'نعم', label_en: 'Yes', value: 'yes' },
        { label_ar: 'لا', label_en: 'No', value: 'no' }
      ],
      validation_rules: {}
    }
  },
  {
    type: 'checkbox',
    label_ar: 'اختيار متعدد',
    label_en: 'Checkbox',
    icon: '☑️',
    color: 'bg-lime-50 border-lime-200 text-lime-700',
    defaultConfig: {
      field_type: 'checkbox',
      options: [],
      validation_rules: {}
    }
  },
  {
    type: 'file',
    label_ar: 'رفع ملف',
    label_en: 'File Upload',
    icon: '📎',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    defaultConfig: {
      field_type: 'file',
      validation_rules: {
        acceptedFormats: ['pdf', 'jpg', 'png'],
        maxSize: 5
      }
    }
  },
  {
    type: 'searchable-select',
    label_ar: 'قائمة بحث',
    label_en: 'Searchable Select',
    icon: '🔍',
    color: 'bg-sky-50 border-sky-200 text-sky-700',
    defaultConfig: {
      field_type: 'searchable-select',
      options: [],
      validation_rules: {}
    }
  },
  {
    type: 'dynamic-list',
    label_ar: 'قائمة ديناميكية',
    label_en: 'Dynamic List',
    icon: '📝',
    color: 'bg-violet-50 border-violet-200 text-violet-700',
    defaultConfig: {
      field_type: 'dynamic-list',
      validation_rules: {}
    }
  },
  {
    type: 'info',
    label_ar: 'نص معلوماتي',
    label_en: 'Info Text',
    icon: 'ℹ️',
    color: 'bg-gray-50 border-gray-200 text-gray-700',
    defaultConfig: {
      field_type: 'info',
      validation_rules: {}
    }
  }
];

const FieldToolbox = ({ onAddField }) => {
  return (
    <div className="w-64 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Layout className="w-4 h-4" />
          عناصر النموذج
        </h3>
        <p className="text-xs text-gray-600">اسحب العنصر إلى منطقة العمل</p>
      </div>

      <div className="space-y-2">
        {FIELD_COMPONENTS.map((component) => (
          <div
            key={component.type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('fieldType', component.type);
              e.dataTransfer.effectAllowed = 'copy';
            }}
            className={`${component.color} border-2 rounded-lg p-3 cursor-move hover:shadow-md transition-all group`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{component.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-bold">{component.label_ar}</div>
                <div className="text-xs opacity-70">{component.label_en}</div>
              </div>
              <GripVertical className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FieldCanvas = ({ fields, onDrop, selectedField, onSelectField, onReorder }) => {
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e, index = null) => {
    e.preventDefault();
    const fieldType = e.dataTransfer.getData('fieldType');
    const draggedIndex = e.dataTransfer.getData('draggedIndex');

    if (draggedIndex) {
      onReorder(parseInt(draggedIndex), index);
    } else if (fieldType) {
      onDrop(fieldType, index);
    }

    setDragOverIndex(null);
  };

  const handleFieldDragStart = (e, index) => {
    e.dataTransfer.setData('draggedIndex', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const activeFields = fields.filter(f => !f._deleted);

  return (
    <div
      className="flex-1 bg-gray-50 p-8 overflow-y-auto"
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e)}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 min-h-[600px] p-6">
          <div className="mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">منطقة بناء النموذج</h2>
            <p className="text-sm text-gray-600 mt-1">اسحب العناصر من القائمة الجانبية لإضافتها</p>
          </div>

          {activeFields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Layout className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ابدأ بناء النموذج</h3>
              <p className="text-gray-600 max-w-md">
                اسحب عنصراً من القائمة الجانبية وأفلته هنا لإضافته إلى النموذج
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeFields.map((field, index) => {
                const component = FIELD_COMPONENTS.find(c => c.type === field.field_type);
                const isSelected = selectedField?.id === field.id;
                const isActive = field.is_active !== false;

                return (
                  <div
                    key={field.id || index}
                    draggable
                    onDragStart={(e) => handleFieldDragStart(e, index)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverIndex(index);
                    }}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={(e) => {
                      e.stopPropagation();
                      handleDrop(e, index);
                    }}
                    onClick={() => onSelectField(field)}
                    className={`
                      relative border-2 rounded-lg p-4 cursor-pointer transition-all
                      ${isSelected
                        ? 'border-[#276073] bg-[#276073]/5 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }
                      ${!isActive && 'opacity-50 bg-gray-50'}
                      ${dragOverIndex === index && 'border-blue-400 bg-blue-50'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="cursor-move text-gray-400 hover:text-gray-600">
                        <GripVertical className="w-5 h-5" />
                      </div>

                      <div className={`w-10 h-10 rounded-lg ${component?.color || 'bg-gray-100'} flex items-center justify-center text-xl`}>
                        {component?.icon || '📋'}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {field.label_ar || 'حقل جديد'}
                          </h4>

                          {!isActive && (
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

                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-500">
                            {component?.label_ar || field.field_type}
                          </p>
                          <span className="text-gray-300">•</span>
                          <p className="text-xs text-gray-400 font-mono">
                            {field.field_name || 'غير محدد'}
                          </p>
                        </div>
                      </div>

                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        ${isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}
                      `}>
                        {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PropertiesPanel = ({ field, onUpdate, onDelete, onDuplicate }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!field) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Settings2 className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">لوحة الخصائص</h3>
          <p className="text-sm text-gray-600">
            اختر حقلاً من منطقة العمل لتعديل خصائصه
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (property, value) => {
    onUpdate({ ...field, [property]: value });
  };

  const handleValidationChange = (property, value) => {
    const validation = field.validation_rules || {};
    onUpdate({
      ...field,
      validation_rules: { ...validation, [property]: value }
    });
  };

  const addOption = () => {
    const options = Array.isArray(field.options) ? field.options : [];
    onUpdate({
      ...field,
      options: [...options, { label_ar: '', label_en: '', value: '' }]
    });
  };

  const updateOption = (optionIndex, property, value) => {
    const options = Array.isArray(field.options) ? [...field.options] : [];
    options[optionIndex] = { ...options[optionIndex], [property]: value };
    onUpdate({ ...field, options });
  };

  const removeOption = (optionIndex) => {
    const options = Array.isArray(field.options) ? field.options : [];
    onUpdate({
      ...field,
      options: options.filter((_, i) => i !== optionIndex)
    });
  };

  const needsOptions = ['select', 'radio', 'checkbox', 'searchable-select'].includes(field.field_type);
  const component = FIELD_COMPONENTS.find(c => c.type === field.field_type);

  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-lg ${component?.color || 'bg-gray-100'} flex items-center justify-center text-2xl`}>
            {component?.icon || '📋'}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900">خصائص الحقل</h3>
            <p className="text-xs text-gray-600">{component?.label_ar}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onDuplicate(field)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            <Copy className="w-3 h-3" />
            نسخ
          </button>
          <button
            type="button"
            onClick={() => onDelete(field)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100"
          >
            <Trash2 className="w-3 h-3" />
            حذف
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            اسم الحقل (Field Name) *
          </label>
          <input
            type="text"
            value={field.field_name || ''}
            onChange={(e) => handleChange('field_name', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
            placeholder="field_name"
          />
          <p className="text-xs text-gray-500 mt-1">استخدم أحرف إنجليزية و underscore فقط</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            التسمية بالعربي *
          </label>
          <input
            type="text"
            value={field.label_ar || ''}
            onChange={(e) => handleChange('label_ar', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
            placeholder="الاسم الكامل"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            التسمية بالإنجليزي
          </label>
          <input
            type="text"
            value={field.label_en || ''}
            onChange={(e) => handleChange('label_en', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
            placeholder="Full Name"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            نص توضيحي (Placeholder)
          </label>
          <input
            type="text"
            value={field.placeholder_ar || ''}
            onChange={(e) => handleChange('placeholder_ar', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
            placeholder="أدخل النص هنا..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            نص المساعدة (Help Text)
          </label>
          <textarea
            value={field.help_text_ar || ''}
            onChange={(e) => handleChange('help_text_ar', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
            rows="2"
            placeholder="نص توضيحي إضافي..."
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.is_required || false}
              onChange={(e) => handleChange('is_required', e.target.checked)}
              className="w-4 h-4 text-[#276073] rounded focus:ring-[#276073]"
            />
            <span className="text-sm font-semibold text-gray-700">حقل إجباري</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.is_active !== false}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="w-4 h-4 text-[#276073] rounded focus:ring-[#276073]"
            />
            <span className="text-sm font-semibold text-gray-700">الحقل مفعّل (ظاهر)</span>
          </label>
        </div>

        {needsOptions && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-900">الخيارات</h4>
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-1 text-xs text-[#276073] hover:text-[#1e4a5a] font-semibold"
              >
                <Plus className="w-3 h-3" />
                إضافة
              </button>
            </div>

            <div className="space-y-2">
              {parseOptions(field.options).map((option, optIndex) => (
                <div key={optIndex} className="bg-gray-50 p-2 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600">خيار {optIndex + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeOption(optIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={option.label_ar || ''}
                    onChange={(e) => updateOption(optIndex, 'label_ar', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    placeholder="التسمية (عربي)"
                  />
                  <input
                    type="text"
                    value={option.value || ''}
                    onChange={(e) => updateOption(optIndex, 'value', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    placeholder="القيمة (value)"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 font-semibold w-full"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            إعدادات متقدمة
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  القيمة الافتراضية
                </label>
                <input
                  type="text"
                  value={field.default_value || ''}
                  onChange={(e) => handleChange('default_value', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                />
              </div>

              {field.field_type === 'file' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      أنواع الملفات المقبولة
                    </label>
                    <input
                      type="text"
                      value={field.validation_rules?.acceptedFormats?.join(', ') || ''}
                      onChange={(e) => handleValidationChange('acceptedFormats', e.target.value.split(',').map(s => s.trim()))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      placeholder="pdf, jpg, png"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      الحد الأقصى للحجم (MB)
                    </label>
                    <input
                      type="number"
                      value={field.validation_rules?.maxSize || 5}
                      onChange={(e) => handleValidationChange('maxSize', parseInt(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const VisualFormBuilder = ({ fields, onChange }) => {
  const [selectedField, setSelectedField] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const handleAddField = (fieldType, insertIndex = null) => {
    const component = FIELD_COMPONENTS.find(c => c.type === fieldType);
    if (!component) return;

    const newField = {
      field_name: `field_${Date.now()}`,
      label_ar: component.label_ar,
      label_en: component.label_en,
      is_required: false,
      is_active: true,
      order_index: insertIndex !== null ? insertIndex : fields.length,
      step_id: 'step_1',
      step_title_ar: 'معلومات أساسية',
      step_title_en: 'Basic Information',
      ...component.defaultConfig
    };

    if (insertIndex !== null) {
      const newFields = [...fields];
      newFields.splice(insertIndex, 0, newField);
      newFields.forEach((field, idx) => {
        field.order_index = idx;
      });
      onChange(newFields);
    } else {
      onChange([...fields, newField]);
    }

    setSelectedField(newField);
  };

  const handleUpdateField = (updatedField) => {
    const index = fields.findIndex(f => f.id === updatedField.id || f.field_name === updatedField.field_name);
    if (index !== -1) {
      const newFields = [...fields];
      newFields[index] = updatedField;
      onChange(newFields);
      setSelectedField(updatedField);
    }
  };

  const handleDeleteField = (fieldToDelete) => {
    if (fieldToDelete.id) {
      const newFields = fields.map(f =>
        f.id === fieldToDelete.id ? { ...f, _deleted: true } : f
      );
      onChange(newFields);
    } else {
      onChange(fields.filter(f => f.field_name !== fieldToDelete.field_name));
    }
    setSelectedField(null);
  };

  const handleDuplicateField = (fieldToDuplicate) => {
    const duplicatedField = { ...fieldToDuplicate };
    delete duplicatedField.id;
    duplicatedField.field_name = `${duplicatedField.field_name}_copy_${Date.now()}`;
    duplicatedField.label_ar = `${duplicatedField.label_ar} (نسخة)`;
    duplicatedField.order_index = fields.length;
    onChange([...fields, duplicatedField]);
    setSelectedField(duplicatedField);
  };

  const handleReorder = (fromIndex, toIndex) => {
    const activeFields = fields.filter(f => !f._deleted);
    const newFields = [...activeFields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);

    newFields.forEach((field, idx) => {
      field.order_index = idx;
    });

    onChange(newFields);
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">محرر النماذج المرئي</h2>
          <p className="text-xs text-gray-600">اسحب العناصر من اليمين إلى منطقة العمل في الوسط</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-[#276073]">{fields.filter(f => !f._deleted).length}</span> حقل
          </div>
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              previewMode
                ? 'bg-gray-200 text-gray-700'
                : 'bg-[#276073] text-white hover:bg-[#1e4a5a]'
            }`}
          >
            {previewMode ? <Layout className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? 'وضع التعديل' : 'معاينة'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {!previewMode && (
          <PropertiesPanel
            field={selectedField}
            onUpdate={handleUpdateField}
            onDelete={handleDeleteField}
            onDuplicate={handleDuplicateField}
          />
        )}

        <FieldCanvas
          fields={fields}
          onDrop={handleAddField}
          selectedField={selectedField}
          onSelectField={setSelectedField}
          onReorder={handleReorder}
        />

        {!previewMode && (
          <FieldToolbox onAddField={handleAddField} />
        )}
      </div>
    </div>
  );
};

export default VisualFormBuilder;
