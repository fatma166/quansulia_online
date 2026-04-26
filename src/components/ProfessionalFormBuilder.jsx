import React, { useState } from 'react';
import {
  Search,
  Save,
  Eye,
  Undo,
  Redo,
  Monitor,
  Tablet,
  Smartphone,
  Settings,
  X,
  GripVertical,
  Copy,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  Move
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConditionalLogicBuilder from './ConditionalLogicBuilder';
import TextField from './fields/TextField';
import SelectField from './fields/SelectField';
import SearchableSelectField from './fields/SearchableSelectField';
import RadioGroupField from './fields/RadioGroupField';
import CheckboxField from './fields/CheckboxField';
import TextareaField from './fields/TextareaField';
import DateField from './fields/DateField';
import NumberField from './fields/NumberField';
import FileField from './fields/FileField';
import DynamicListField from './fields/DynamicListField';
import InfoField from './fields/InfoField';

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

// Field Components Library
const FIELD_LIBRARY = {
  fields: [
    { id: 'text', icon: '📝', label: 'حقل نصي', type: 'text' },
    { id: 'textarea', icon: '📄', label: 'نص طويل', type: 'textarea' },
    { id: 'number', icon: '🔢', label: 'رقم', type: 'number' },
    { id: 'email', icon: '📧', label: 'بريد إلكتروني', type: 'email' },
    { id: 'phone', icon: '📱', label: 'هاتف', type: 'phone' },
    { id: 'date', icon: '📅', label: 'تاريخ', type: 'date' },
    { id: 'select', icon: '📋', label: 'قائمة منسدلة', type: 'select' },
    { id: 'radio', icon: '🔘', label: 'اختيار واحد', type: 'radio' },
    { id: 'checkbox', icon: '☑️', label: 'اختيارات متعددة', type: 'checkbox' },
    { id: 'file', icon: '📎', label: 'رفع ملف', type: 'file' },
    { id: 'searchable-select', icon: '🔍', label: 'بحث', type: 'searchable-select' },
    { id: 'dynamic-list', icon: '👥', label: 'Repeatable Group', type: 'dynamic-list', description: 'حقول متكررة (مثل: أفراد العائلة)' }
  ],
  static: [
    { id: 'header', icon: 'T', label: 'عنوان', type: 'header' },
    { id: 'divider', icon: '—', label: 'فاصل', type: 'divider' },
    { id: 'info', icon: 'ℹ', label: 'نص', type: 'info' }
  ]
};

// Components Sidebar
const ComponentsSidebar = ({ onAddField }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({ fields: true, static: true });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const filteredFields = FIELD_LIBRARY.fields.filter(field =>
    field.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStatic = FIELD_LIBRARY.static.filter(field =>
    field.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-900 mb-3">المكوّنات</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث..."
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => toggleSection('fields')}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded"
          >
            {expandedSections.fields ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            الحقول
          </button>

          {expandedSections.fields && (
            <div className="mt-1 space-y-1">
              {filteredFields.map((field) => (
                <div
                  key={field.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('fieldType', field.type);
                    e.dataTransfer.effectAllowed = 'copy';
                    e.currentTarget.dataset.isDragging = 'true';
                  }}
                  onDragEnd={(e) => {
                    const target = e.currentTarget;
                    setTimeout(() => {
                      if (target && target.dataset) {
                        delete target.dataset.isDragging;
                      }
                    }, 100);
                  }}
                  onClick={(e) => {
                    if (e.currentTarget.dataset.isDragging === 'true') {
                      return;
                    }
                    onAddField(field.type);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-move hover:bg-gray-50 border border-transparent hover:border-gray-300 transition-all group relative"
                  title={field.description || field.label}
                >
                  <span className="text-xl">{field.icon}</span>
                  <div className="flex-1">
                    <span className="text-sm text-gray-700 font-medium block">{field.label}</span>
                    {field.description && (
                      <span className="text-xs text-gray-500 block mt-0.5">{field.description}</span>
                    )}
                  </div>
                  <Move className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => toggleSection('static')}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded"
          >
            {expandedSections.static ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            عناصر ثابتة
          </button>

          {expandedSections.static && (
            <div className="mt-1 space-y-1">
              {filteredStatic.map((field) => (
                <div
                  key={field.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('fieldType', field.type);
                    e.dataTransfer.effectAllowed = 'copy';
                    e.currentTarget.dataset.isDragging = 'true';
                  }}
                  onDragEnd={(e) => {
                    const target = e.currentTarget;
                    setTimeout(() => {
                      if (target && target.dataset) {
                        delete target.dataset.isDragging;
                      }
                    }, 100);
                  }}
                  onClick={(e) => {
                    if (e.currentTarget.dataset.isDragging === 'true') {
                      return;
                    }
                    onAddField(field.type);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-move hover:bg-gray-50 border border-transparent hover:border-gray-300 transition-all group"
                >
                  <span className="text-xl font-bold text-gray-600">{field.icon}</span>
                  <span className="text-sm text-gray-700 font-medium">{field.label}</span>
                  <Move className="w-3 h-3 mr-auto text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Field Preview Component
const FieldPreview = ({ field, isSelected, onClick, onDragStart }) => {
  const [isDragging, setIsDragging] = useState(false);

  const renderField = () => {
    switch (field.field_type) {
      case 'header':
        return (
          <h2 className="text-2xl font-bold text-gray-900">
            {field.label_ar || 'عنوان'}
          </h2>
        );

      case 'divider':
        return <hr className="border-t-2 border-gray-300" />;

      case 'info':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">{field.label_ar || 'نص معلوماتي'}</p>
          </div>
        );

      case 'textarea':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label_ar || 'التسمية'}
              {field.is_required && <span className="text-red-500 mr-1">*</span>}
            </label>
            <textarea
              placeholder={field.placeholder_ar || ''}
              disabled
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white resize-none"
            />
            {field.help_text_ar && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{field.help_text_ar}</p>
              </div>
            )}
          </div>
        );

      case 'select':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label_ar || 'التسمية'}
              {field.is_required && <span className="text-red-500 mr-1">*</span>}
            </label>
            <select
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
            >
              <option>{field.placeholder_ar || 'اختر...'}</option>
              {parseOptions(field.options).map((opt, idx) => (
                <option key={idx} value={opt.value}>{opt.label_ar || opt.label}</option>
              ))}
            </select>
            {field.help_text_ar && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{field.help_text_ar}</p>
              </div>
            )}
          </div>
        );

      case 'radio':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label_ar || 'التسمية'}
              {field.is_required && <span className="text-red-500 mr-1">*</span>}
            </label>
            <div className="space-y-2">
              {parseOptions(field.options).length > 0 ? parseOptions(field.options).map((opt, idx) => (
                <label key={idx} className="flex items-center gap-2">
                  <input type="radio" disabled className="w-4 h-4" />
                  <span className="text-sm text-gray-700">{opt.label_ar || opt.label}</span>
                </label>
              )) : [{ label: 'خيار 1' }, { label: 'خيار 2' }].map((opt, idx) => (
                <label key={idx} className="flex items-center gap-2">
                  <input type="radio" disabled className="w-4 h-4" />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
            {field.help_text_ar && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{field.help_text_ar}</p>
              </div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label_ar || 'التسمية'}
              {field.is_required && <span className="text-red-500 mr-1">*</span>}
            </label>
            <div className="space-y-2">
              {parseOptions(field.options).length > 0 ? parseOptions(field.options).map((opt, idx) => (
                <label key={idx} className="flex items-center gap-2">
                  <input type="checkbox" disabled className="w-4 h-4 rounded" />
                  <span className="text-sm text-gray-700">{opt.label_ar || opt.label}</span>
                </label>
              )) : [{ label: 'خيار 1' }, { label: 'خيار 2' }].map((opt, idx) => (
                <label key={idx} className="flex items-center gap-2">
                  <input type="checkbox" disabled className="w-4 h-4 rounded" />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
            {field.help_text_ar && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{field.help_text_ar}</p>
              </div>
            )}
          </div>
        );

      case 'file':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label_ar || 'التسمية'}
              {field.is_required && <span className="text-red-500 mr-1">*</span>}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
              <div className="text-3xl mb-2">📎</div>
              <p className="text-sm text-gray-600">اسحب الملف هنا أو انقر للتحميل</p>
            </div>
            {field.help_text_ar && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{field.help_text_ar}</p>
              </div>
            )}
          </div>
        );

      case 'dynamic-list':
        return (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                {field.label_ar || 'قائمة ديناميكية'}
                {field.is_required && <span className="text-red-500 mr-1">*</span>}
              </label>
              <button
                type="button"
                disabled
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {field.button_text || 'إضافة عنصر'}
                </span>
              </button>
            </div>

            {(field.subfields && field.subfields.length > 0) ? (
              <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="text-xs font-bold text-blue-900 mb-2">
                  مثال على العنصر #{1}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {field.subfields.map((subfield, idx) => (
                    <div key={idx}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {subfield.label_ar || subfield.label}
                        {subfield.required && <span className="text-red-500 mr-1">*</span>}
                      </label>
                      {subfield.type === 'select' ? (
                        <select disabled className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white">
                          <option>اختر...</option>
                          {parseOptions(subfield.options).map((opt, i) => (
                            <option key={i}>{opt.label_ar || opt.label}</option>
                          ))}
                        </select>
                      ) : subfield.type === 'date' ? (
                        <input type="date" disabled className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded" />
                      ) : (
                        <input
                          type={subfield.type === 'number' ? 'number' : 'text'}
                          disabled
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-xs text-gray-500">لا توجد حقول فرعية</p>
                <p className="text-xs text-gray-400 mt-1">أضف حقول فرعية من Properties Panel</p>
              </div>
            )}

            {field.help_text_ar && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{field.help_text_ar}</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label_ar || 'التسمية'}
              {field.is_required && <span className="text-red-500 mr-1">*</span>}
            </label>
            <input
              type={field.field_type}
              placeholder={field.placeholder_ar || ''}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
            />
            {field.help_text_ar && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{field.help_text_ar}</p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div
      className={`relative group transition-all ${
        isDragging ? 'opacity-40 scale-95' : 'opacity-100 scale-100'
      } ${isSelected ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
    >
      <div className={`
        absolute inset-0 border-2 rounded-lg pointer-events-none transition-all
        ${isSelected ? 'border-blue-500 bg-blue-50/10' : 'border-transparent group-hover:border-blue-300 group-hover:bg-blue-50/5'}
      `} />

      <div className="relative p-4" onClick={onClick}>
        {renderField()}
      </div>

      <div
        draggable
        onDragStart={onDragStart}
        className={`
          absolute top-2 left-2 p-2 bg-white border-2 rounded-lg shadow-sm cursor-move
          transition-all
          ${isSelected
            ? 'border-blue-500 text-blue-600 opacity-100'
            : 'border-gray-300 text-gray-400 opacity-0 group-hover:opacity-100'
          }
          hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700
        `}
        title="اسحب لإعادة الترتيب"
      >
        <GripVertical className="w-4 h-4" />
      </div>
    </div>
  );
};

// Drop Zone Indicator
const DropZoneIndicator = ({ show, position = 'top' }) => {
  if (!show) return null;

  return (
    <div className={`
      h-1 bg-blue-500 rounded-full my-2 animate-pulse
      ${position === 'top' ? '-mt-4' : '-mb-4'}
    `}>
      <div className="flex items-center justify-center">
        <div className="w-3 h-3 bg-blue-500 rounded-full -mt-1" />
      </div>
    </div>
  );
};

// Live Form Canvas
const FormCanvas = ({ fields, selectedField, onSelectField, onDrop, onReorder, viewMode }) => {
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const fieldType = e.dataTransfer.getData('fieldType');
    const draggedFieldId = e.dataTransfer.getData('fieldId');

    if (draggedFieldId) {
      onReorder(draggedFieldId, index);
    } else if (fieldType) {
      onDrop(fieldType, index);
    }

    setDragOverIndex(null);
  };

  const containerClass = {
    desktop: 'max-w-4xl',
    tablet: 'max-w-2xl',
    mobile: 'max-w-md'
  }[viewMode];

  const activeFields = fields.filter(f => !f._deleted);

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className={`${containerClass} mx-auto p-8`}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeFields.length === 0 ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 0)}
              className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg"
            >
              <p className="text-gray-500 text-sm">اسحب الحقول وأفلتها هنا لبدء بناء النموذج</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeFields.map((field, index) => (
                <div
                  key={field.field_name}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  className="relative"
                >
                  <DropZoneIndicator show={dragOverIndex === index} position="top" />
                  <FieldPreview
                    field={field}
                    isSelected={selectedField?.field_name === field.field_name}
                    onClick={() => onSelectField(field)}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('fieldId', field.field_name);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                  />
                </div>
              ))}
              <div
                onDragOver={(e) => handleDragOver(e, activeFields.length)}
                onDrop={(e) => handleDrop(e, activeFields.length)}
                className="h-12"
              >
                <DropZoneIndicator show={dragOverIndex === activeFields.length} position="bottom" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Dynamic List Subfields Manager
const DynamicListFieldsManager = ({ fields, onChange, buttonText, onButtonTextChange, allFields }) => {
  const [expandedField, setExpandedField] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFieldsToImport, setSelectedFieldsToImport] = useState([]);

  const addSubfield = () => {
    const newField = {
      name: `field_${Date.now()}`,
      label: 'حقل جديد',
      label_ar: 'حقل جديد',
      type: 'text',
      required: false,
      options: []
    };
    onChange([...fields, newField]);
  };

  const handleImportFields = () => {
    const importedFields = selectedFieldsToImport.map(fieldName => {
      const sourceField = allFields.find(f => f.field_name === fieldName);
      if (!sourceField) return null;

      return {
        name: sourceField.field_name,
        label: sourceField.label_ar || sourceField.label_en,
        label_ar: sourceField.label_ar,
        type: sourceField.field_type,
        required: sourceField.is_required || false,
        options: sourceField.options || []
      };
    }).filter(f => f !== null);

    onChange([...fields, ...importedFields]);
    setShowImportModal(false);
    setSelectedFieldsToImport([]);
  };

  const toggleFieldSelection = (fieldName) => {
    setSelectedFieldsToImport(prev =>
      prev.includes(fieldName)
        ? prev.filter(f => f !== fieldName)
        : [...prev, fieldName]
    );
  };

  const availableFieldsForImport = (allFields || []).filter(f =>
    f.field_type !== 'dynamic-list' &&
    !fields.some(sf => sf.name === f.field_name)
  );

  const updateSubfield = (index, property, value) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [property]: value };
    onChange(newFields);
  };

  const removeSubfield = (index) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const addSubfieldOption = (fieldIndex) => {
    const newFields = [...fields];
    const currentOptions = newFields[fieldIndex].options || [];
    newFields[fieldIndex].options = [...currentOptions, { label: '', label_ar: '', value: '' }];
    onChange(newFields);
  };

  const updateSubfieldOption = (fieldIndex, optionIndex, property, value) => {
    const newFields = [...fields];
    const options = [...(newFields[fieldIndex].options || [])];
    options[optionIndex] = { ...options[optionIndex], [property]: value };
    newFields[fieldIndex].options = options;
    onChange(newFields);
  };

  const removeSubfieldOption = (fieldIndex, optionIndex) => {
    const newFields = [...fields];
    newFields[fieldIndex].options = (newFields[fieldIndex].options || []).filter((_, i) => i !== optionIndex);
    onChange(newFields);
  };

  const fieldTypes = [
    { value: 'text', label: 'نص' },
    { value: 'number', label: 'رقم' },
    { value: 'date', label: 'تاريخ' },
    { value: 'select', label: 'قائمة منسدلة' },
    { value: 'radio', label: 'اختيار واحد' },
    { value: 'checkbox', label: 'اختيارات متعددة' }
  ];

  return (
    <div className="pt-4 border-t-2 border-gray-200 mt-4">
      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-700 mb-1.5">
          نص الزر
        </label>
        <input
          type="text"
          value={buttonText || 'إضافة عنصر'}
          onChange={(e) => onButtonTextChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
          placeholder="إضافة عنصر"
        />
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-700">
            الحقول الفرعية ({fields.length})
          </label>
          <button
            type="button"
            onClick={addSubfield}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#276073] text-white text-xs font-semibold rounded-lg hover:bg-[#1e4a5a] transition-colors"
          >
            <Plus className="w-3 h-3" />
            إضافة حقل
          </button>
        </div>

        {(allFields && allFields.length > 0) && (
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-dashed border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:border-[#276073] hover:text-[#276073] transition-colors"
          >
            <Copy className="w-3 h-3" />
            استيراد حقول من النموذج ({availableFieldsForImport.length} متاح)
          </button>
        )}
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-xs text-gray-500">لا توجد حقول فرعية</p>
          <p className="text-xs text-gray-400 mt-1">
            اضغط "إضافة حقل" لإضافة حقل يدويًا
            {availableFieldsForImport.length > 0 && <><br />أو "استيراد حقول" لنسخ حقول من النموذج</>}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {fields.map((subfield, index) => {
            const isExpanded = expandedField === index;
            const needsOptions = ['select', 'radio', 'checkbox'].includes(subfield.type);

            return (
              <div key={index} className="border border-gray-200 rounded-lg bg-white">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedField(isExpanded ? null : index)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <span className="text-sm font-semibold text-gray-700 truncate">
                      {subfield.label_ar || subfield.label || subfield.name}
                    </span>
                    <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                      {fieldTypes.find(t => t.value === subfield.type)?.label || subfield.type}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSubfield(index);
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="p-3 border-t border-gray-200 space-y-3 bg-gray-50">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">
                        اسم الحقل (name)
                      </label>
                      <input
                        type="text"
                        value={subfield.name}
                        onChange={(e) => updateSubfield(index, 'name', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                        placeholder="field_name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">
                        التسمية (عربي)
                      </label>
                      <input
                        type="text"
                        value={subfield.label_ar || ''}
                        onChange={(e) => updateSubfield(index, 'label_ar', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                        placeholder="الاسم"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">
                        نوع الحقل
                      </label>
                      <select
                        value={subfield.type}
                        onChange={(e) => updateSubfield(index, 'type', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                      >
                        {fieldTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`required_${index}`}
                        checked={subfield.required || false}
                        onChange={(e) => updateSubfield(index, 'required', e.target.checked)}
                        className="w-3 h-3 text-blue-600 rounded"
                      />
                      <label htmlFor={`required_${index}`} className="text-xs text-gray-700">
                        حقل مطلوب
                      </label>
                    </div>

                    {needsOptions && (
                      <div className="pt-2 border-t border-gray-300">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-gray-600">الخيارات</label>
                          <button
                            type="button"
                            onClick={() => addSubfieldOption(index)}
                            className="text-[#276073] hover:text-[#1e4a5a] text-xs font-semibold"
                          >
                            + خيار
                          </button>
                        </div>
                        <div className="space-y-2">
                          {parseOptions(subfield.options).map((option, optIndex) => (
                            <div key={optIndex} className="bg-gray-50 p-2 rounded border border-gray-200">
                              <div className="flex gap-1 items-start">
                                <div className="flex-1 space-y-1">
                                  <label className="block text-xs text-gray-500">
                                    ما يظهر 👁️
                                  </label>
                                  <input
                                    type="text"
                                    value={option.label_ar || option.label || ''}
                                    onChange={(e) => {
                                      updateSubfieldOption(index, optIndex, 'label', e.target.value);
                                      updateSubfieldOption(index, optIndex, 'label_ar', e.target.value);
                                    }}
                                    placeholder="مثال: تجديد"
                                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-400"
                                    dir="rtl"
                                  />
                                </div>
                                <div className="w-20 space-y-1">
                                  <label className="block text-xs text-gray-500">
                                    value 💾
                                  </label>
                                  <input
                                    type="text"
                                    value={option.value || ''}
                                    onChange={(e) => updateSubfieldOption(index, optIndex, 'value', e.target.value)}
                                    placeholder="renewal"
                                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-400 font-mono"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeSubfieldOption(index, optIndex)}
                                  className="p-1 text-red-500 hover:bg-red-100 rounded mt-5"
                                  title="حذف"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              {option.label_ar && !option.value && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded px-1.5 py-0.5 text-xs text-yellow-700 mt-1">
                                  ⚠️ أضف قيمة (value)
                                </div>
                              )}
                            </div>
                          ))}
                          {parseOptions(subfield.options).length === 0 && (
                            <div className="text-center py-4 bg-gray-50 rounded border border-dashed border-gray-300">
                              <p className="text-xs text-gray-500">اضغط "+ خيار" لإضافة اختيار</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">استيراد حقول من النموذج</h3>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedFieldsToImport([]);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {availableFieldsForImport.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-2">لا توجد حقول متاحة للاستيراد</p>
                  {!allFields || allFields.length === 0 ? (
                    <>
                      <p className="text-xs text-gray-400 mt-2">لا توجد حقول في النموذج بعد</p>
                      <p className="text-xs text-gray-400 mt-1">أضف حقول إلى النموذج أولاً، ثم يمكنك استيرادها هنا</p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2">
                      جميع الحقول ({allFields.length}) إما مستوردة بالفعل أو من نوع Dynamic List
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                    <p className="text-sm text-gray-600">
                      اختر الحقول التي تريد استيرادها ({selectedFieldsToImport.length} محدد)
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedFieldsToImport(availableFieldsForImport.map(f => f.field_name))}
                        className="text-xs text-[#276073] hover:underline font-semibold"
                      >
                        تحديد الكل
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedFieldsToImport([])}
                        className="text-xs text-gray-500 hover:underline font-semibold"
                      >
                        إلغاء التحديد
                      </button>
                    </div>
                  </div>

                  {availableFieldsForImport.map((field) => {
                    const isSelected = selectedFieldsToImport.includes(field.field_name);
                    const fieldTypeLabel = {
                      'text': 'نص',
                      'number': 'رقم',
                      'date': 'تاريخ',
                      'select': 'قائمة منسدلة',
                      'radio': 'اختيار واحد',
                      'checkbox': 'اختيارات متعددة',
                      'email': 'بريد إلكتروني',
                      'phone': 'هاتف',
                      'textarea': 'نص طويل',
                      'file': 'ملف'
                    }[field.field_type] || field.field_type;

                    return (
                      <label
                        key={field.field_name}
                        className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#276073] bg-[#276073]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFieldSelection(field.field_name)}
                          className="mt-1 w-4 h-4 text-[#276073] rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-gray-900">
                              {field.label_ar || field.label_en || field.field_name}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {fieldTypeLabel}
                            </span>
                            {field.is_required && (
                              <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded">
                                مطلوب
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {field.field_name}
                          </p>
                          {parseOptions(field.options).length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              {parseOptions(field.options).length} خيار
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedFieldsToImport([]);
                }}
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleImportFields}
                disabled={selectedFieldsToImport.length === 0}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#276073] hover:bg-[#1e4a5a] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                استيراد ({selectedFieldsToImport.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Properties Panel
const PropertiesPanel = ({ field, allFields, onUpdate, onDelete, onDuplicate }) => {
  const [activeTab, setActiveTab] = useState('main');

  if (!field) {
    return (
      <div className="w-96 bg-white border-l border-gray-200 flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">اختر عنصرًا من النموذج لتعديل خصائصه</p>
        </div>
      </div>
    );
  }

  const handleChange = (property, value) => {
    onUpdate({ ...field, [property]: value });
  };

  const addOption = () => {
    const options = parseOptions(field.options);
    onUpdate({
      ...field,
      options: [...options, { label: '', label_ar: '', label_en: '', value: '' }]
    });
  };

  const updateOption = (optionIndex, property, value) => {
    const options = [...parseOptions(field.options)];
    options[optionIndex] = { ...options[optionIndex], [property]: value };
    onUpdate({ ...field, options });
  };

  const removeOption = (optionIndex) => {
    const options = parseOptions(field.options);
    onUpdate({
      ...field,
      options: options.filter((_, i) => i !== optionIndex)
    });
  };

  const needsOptions = ['select', 'radio', 'checkbox', 'searchable-select'].includes(field.field_type);
  const availableFieldsForConditions = allFields
    .filter(f => f.field_name !== field.field_name)
    .map(f => ({
      name: f.field_name,
      label: f.label_ar || f.field_name,
      label_ar: f.label_ar || f.field_name,
      label_en: f.label_en || f.field_name,
      type: f.field_type,
      config: {
        options: f.options || []
      }
    }));

  // Debug: Log available fields and current conditions
  console.log('🔧 FormBuilder Debug:', {
    currentFieldName: field.field_name,
    availableFieldsCount: availableFieldsForConditions.length,
    availableFields: availableFieldsForConditions.map(f => ({ name: f.name, label: f.label_ar })),
    currentConditions: field.conditions
  });

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900">الخصائص</h3>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onDuplicate(field)}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
              title="نسخ"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(field)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
              title="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'main', label: 'عام' },
            { key: 'style', label: 'المظهر' },
            { key: 'actions', label: 'الإجراءات' },
            { key: 'rules', label: 'القواعد' }
          ].map((tab) => (
            <button
              type="button"
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'main' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                اسم الحقل *
              </label>
              <input
                type="text"
                value={field.field_name || ''}
                onChange={(e) => handleChange('field_name', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="field_name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                التسمية (عربي)
              </label>
              <input
                type="text"
                value={field.label_ar || ''}
                onChange={(e) => handleChange('label_ar', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                placeholder="التسمية بالعربي"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                التسمية (إنجليزي)
              </label>
              <input
                type="text"
                value={field.label_en || ''}
                onChange={(e) => handleChange('label_en', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                placeholder="التسمية بالإنجليزية"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                النص الإرشادي (عربي)
              </label>
              <input
                type="text"
                value={field.placeholder_ar || ''}
                onChange={(e) => handleChange('placeholder_ar', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                النص المساعد (عربي)
              </label>
              <textarea
                value={field.help_text_ar || ''}
                onChange={(e) => handleChange('help_text_ar', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="required"
                checked={field.is_required || false}
                onChange={(e) => handleChange('is_required', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="required" className="text-sm text-gray-700">
                حقل مطلوب
              </label>
            </div>

            {needsOptions && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700">الخيارات</label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      التسمية: ما يظهر للمستخدم | القيمة: تُحفظ في قاعدة البيانات
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-blue-600 hover:text-blue-700 text-xs font-semibold"
                  >
                    + إضافة خيار
                  </button>
                </div>

                <div className="space-y-2">
                  {parseOptions(field.options).map((option, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 mb-1">
                            التسمية (ما يظهر للمستخدم) 👁️
                          </label>
                          <input
                            type="text"
                            value={option.label_ar || option.label || ''}
                            onChange={(e) => {
                              updateOption(index, 'label', e.target.value);
                              updateOption(index, 'label_ar', e.target.value);
                            }}
                            placeholder="مثال: تجديد"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            dir="rtl"
                          />
                        </div>
                        <div className="w-32">
                          <label className="block text-xs text-gray-600 mb-1">
                            القيمة (value) 💾
                          </label>
                          <input
                            type="text"
                            value={option.value || ''}
                            onChange={(e) => updateOption(index, 'value', e.target.value)}
                            placeholder="renewal"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded mt-6"
                          title="حذف الاختيار"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {option.label_ar && !option.value && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1 text-xs text-yellow-700">
                          ⚠️ يجب إضافة قيمة (value) بالإنجليزية لهذا الاختيار
                        </div>
                      )}
                    </div>
                  ))}

                  {parseOptions(field.options).length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-sm text-gray-500 mb-2">لا توجد خيارات بعد</p>
                      <p className="text-xs text-gray-400">اضغط "+ إضافة خيار" لإضافة خيار جديد</p>
                    </div>
                  )}
                </div>

                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800 font-semibold mb-1">💡 مثال:</p>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div className="flex justify-between">
                      <span>التسمية: "تجديد"</span>
                      <span className="font-mono">value: "renewal"</span>
                    </div>
                    <div className="flex justify-between">
                      <span>التسمية: "جواز جديد"</span>
                      <span className="font-mono">value: "new"</span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    المستخدم يرى "تجديد" ولكن النظام يحفظ "renewal"
                  </p>
                </div>
              </div>
            )}

            {field.field_type === 'dynamic-list' && (
              <DynamicListFieldsManager
                fields={field.subfields || []}
                onChange={(subfields) => handleChange('subfields', subfields)}
                buttonText={field.button_text}
                onButtonTextChange={(text) => handleChange('button_text', text)}
                allFields={allFields}
              />
            )}
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800">
                <strong>التخطيط والعرض:</strong> تحكم في مظهر وموضع الحقل في النموذج
              </p>
            </div>

            {/* Field Width */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                عرض الحقل (Width)
              </label>
              <select
                value={field.field_width || 'full'}
                onChange={(e) => handleChange('field_width', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="full">عرض كامل (100%)</option>
                <option value="half">نصف العرض (50%)</option>
                <option value="third">ثلث العرض (33%)</option>
                <option value="two-thirds">ثلثي العرض (66%)</option>
                <option value="quarter">ربع العرض (25%)</option>
                <option value="three-quarters">ثلاثة أرباع (75%)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                حدد كم مساحة يأخذ الحقل من عرض الصفحة
              </p>
            </div>

            {/* Break Line */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="break_line"
                checked={field.break_line || false}
                onChange={(e) => handleChange('break_line', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded mt-0.5"
              />
              <div className="flex-1">
                <label htmlFor="break_line" className="text-sm font-medium text-gray-700 cursor-pointer">
                  بداية سطر جديد (Break Line)
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  الحقل يبدأ في سطر جديد حتى لو كان عرضه صغير
                </p>
              </div>
            </div>

            {/* Custom Height (for textarea and specific fields) */}
            {(field.field_type === 'textarea' || field.field_type === 'file') && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  الارتفاع (Height)
                </label>
                <select
                  value={field.field_height || 'medium'}
                  onChange={(e) => handleChange('field_height', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="small">صغير (80px)</option>
                  <option value="medium">متوسط (120px)</option>
                  <option value="large">كبير (200px)</option>
                  <option value="xlarge">كبير جداً (300px)</option>
                </select>
              </div>
            )}

            {/* Margin/Spacing */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                المسافة الخارجية (Margin)
              </label>
              <select
                value={field.field_margin || 'normal'}
                onChange={(e) => handleChange('field_margin', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">بدون مسافة</option>
                <option value="small">صغيرة</option>
                <option value="normal">عادية</option>
                <option value="large">كبيرة</option>
              </select>
            </div>

            {/* Visual Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">معاينة العرض:</p>
              <div className="bg-white p-2 rounded border border-gray-300">
                <div
                  className={`bg-blue-100 border border-blue-300 rounded p-2 text-center text-xs text-blue-800`}
                  style={{
                    width: field.field_width === 'full' ? '100%' :
                           field.field_width === 'half' ? '50%' :
                           field.field_width === 'third' ? '33.33%' :
                           field.field_width === 'two-thirds' ? '66.66%' :
                           field.field_width === 'quarter' ? '25%' :
                           field.field_width === 'three-quarters' ? '75%' : '100%',
                    height: field.field_height === 'small' ? '80px' :
                            field.field_height === 'large' ? '200px' :
                            field.field_height === 'xlarge' ? '300px' : '120px'
                  }}
                >
                  {field.label_ar || 'معاينة الحقل'}
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-800">
                💡 <strong>نصيحة:</strong> استخدم عرض نصف مع إيقاف "بداية سطر جديد" لوضع حقلين بجانب بعض
              </p>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">إعدادات الإجراءات ستتوفر قريبًا</p>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800">
                <strong>شروط العرض:</strong> حدد متى يظهر هذا الحقل بناءً على قيم حقول أخرى
              </p>
            </div>

            <ConditionalLogicBuilder
              value={field.conditions}
              onChange={(conditions) => handleChange('conditions', conditions)}
              availableFields={availableFieldsForConditions}
            />

            {field.conditions && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-green-800">
                  ✓ هذا الحقل سيظهر بشكل شرطي حسب القواعد المحددة
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Preview Modal Component
const PreviewModal = ({ isOpen, onClose, fields }) => {
  const [formData, setFormData] = useState({});
  const [previewDevice, setPreviewDevice] = useState('desktop');

  if (!isOpen) return null;

  const activeFields = fields.filter(f => !f._deleted);

  const fieldComponents = {
    text: TextField,
    select: SelectField,
    'searchable-select': SearchableSelectField,
    radio: RadioGroupField,
    checkbox: CheckboxField,
    textarea: TextareaField,
    date: DateField,
    number: NumberField,
    tel: TextField,
    email: TextField,
    file: FileField,
    'dynamic-list': DynamicListField,
    info: InfoField,
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const renderField = (field) => {
    const FieldComponent = fieldComponents[field.field_type];

    if (!FieldComponent) {
      if (field.field_type === 'heading') {
        return (
          <div key={field.field_name} className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 border-b-2 border-[#276073] pb-2">
              {field.label_ar}
            </h3>
            {field.description && (
              <p className="text-sm text-gray-600 mt-2">{field.description}</p>
            )}
          </div>
        );
      }
      return null;
    }

    const transformedField = {
      ...field,
      label: field.label_ar || field.label_en || field.field_name,
      type: field.field_type,
      name: field.field_name,
      placeholder: field.placeholder_ar || field.placeholder,
      help: field.help_text,
    };

    return (
      <div key={field.field_name} className="mb-4">
        <FieldComponent
          field={transformedField}
          value={formData[field.field_name] || ''}
          onChange={(value) => handleFieldChange(field.field_name, value)}
          formData={formData}
        />
      </div>
    );
  };

  const deviceStyles = {
    desktop: 'w-full max-w-5xl',
    tablet: 'w-full max-w-3xl',
    mobile: 'w-full max-w-md',
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        dir="rtl"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`bg-white rounded-lg shadow-2xl ${deviceStyles[previewDevice]} max-h-[90vh] overflow-hidden flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#276073]">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white">معاينة الفورم</h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Device Selector */}
              <div className="flex items-center gap-1 bg-white/20 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-2 rounded transition-colors ${
                    previewDevice === 'desktop'
                      ? 'bg-white text-[#276073]'
                      : 'text-white hover:bg-white/30'
                  }`}
                  title="سطح المكتب"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-2 rounded transition-colors ${
                    previewDevice === 'tablet'
                      ? 'bg-white text-[#276073]'
                      : 'text-white hover:bg-white/30'
                  }`}
                  title="جهاز لوحي"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-2 rounded transition-colors ${
                    previewDevice === 'mobile'
                      ? 'bg-white text-[#276073]'
                      : 'text-white hover:bg-white/30'
                  }`}
                  title="هاتف"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="max-w-3xl mx-auto">
                {activeFields.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg">لا توجد حقول لعرضها</p>
                    <p className="text-sm mt-2">قم بإضافة حقول من اللوحة اليمنى</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeFields.map(field => renderField(field))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{activeFields.length}</span> حقل
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-[#276073] text-white rounded-lg hover:bg-[#1e4a5a] transition-colors"
            >
              إغلاق
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Main Form Builder Component
const ProfessionalFormBuilder = ({ fields, onChange }) => {
  const [selectedField, setSelectedField] = useState(null);
  const [viewMode, setViewMode] = useState('desktop');
  const [showPreview, setShowPreview] = useState(false);

  const handleAddField = (fieldType, insertIndex = null) => {
    const allComponents = [...FIELD_LIBRARY.fields, ...FIELD_LIBRARY.static];
    const component = allComponents.find(c => c.type === fieldType);
    if (!component) return;

    const newField = {
      field_name: `field_${Date.now()}`,
      label_ar: component.label,
      label_en: component.label,
      field_type: fieldType,
      is_required: false,
      is_active: true,
      order_index: insertIndex !== null ? insertIndex : fields.length,
      step_id: 'step_1',
      step_title_ar: 'معلومات أساسية',
      step_title_en: 'Basic Information',
      options: ['select', 'radio', 'checkbox'].includes(fieldType) ? [] : undefined,
      validation_rules: {},
      conditions: null,
      subfields: fieldType === 'dynamic-list' ? [] : undefined,
      button_text: fieldType === 'dynamic-list' ? 'إضافة عنصر' : undefined
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
    console.log('🔄 Updating field:', {
      field_name: updatedField.field_name,
      label_ar: updatedField.label_ar,
      conditions: updatedField.conditions,
      hasConditions: !!updatedField.conditions && Object.keys(updatedField.conditions || {}).length > 0
    });

    const newFields = fields.map(f =>
      f.field_name === updatedField.field_name ? updatedField : f
    );
    onChange(newFields);
    setSelectedField(updatedField);
  };

  const handleDeleteField = (fieldToDelete) => {
    const newFields = fields.map(f =>
      f.field_name === fieldToDelete.field_name
        ? { ...f, _deleted: true }
        : f
    );
    onChange(newFields);
    setSelectedField(null);
  };

  const handleDuplicateField = (fieldToDuplicate) => {
    const { id, ...fieldWithoutId } = fieldToDuplicate;

    const newField = {
      ...fieldWithoutId,
      field_name: `${fieldToDuplicate.field_name}_copy_${Date.now()}`,
      label_ar: `${fieldToDuplicate.label_ar || ''} (نسخة)`,
      label_en: fieldToDuplicate.label_en ? `${fieldToDuplicate.label_en} (Copy)` : '',
      order_index: fields.length,
      // Deep copy conditions
      conditions: fieldToDuplicate.conditions
        ? JSON.parse(JSON.stringify(fieldToDuplicate.conditions))
        : null,
      // Deep copy options if exists
      options: fieldToDuplicate.options
        ? JSON.parse(JSON.stringify(fieldToDuplicate.options))
        : null,
      // Deep copy subfields for dynamic-list
      subfields: fieldToDuplicate.subfields
        ? JSON.parse(JSON.stringify(fieldToDuplicate.subfields))
        : []
    };

    console.log('🔄 Duplicating field with conditions:', {
      original_field: fieldToDuplicate.field_name,
      new_field: newField.field_name,
      original_conditions: fieldToDuplicate.conditions,
      new_conditions: newField.conditions,
      conditions_copied: !!newField.conditions
    });

    onChange([...fields, newField]);
    setSelectedField(newField);
  };

  const handleReorder = (draggedFieldId, targetIndex) => {
    const draggedIndex = fields.findIndex(f => f.field_name === draggedFieldId);
    if (draggedIndex === -1) return;

    const newFields = [...fields];
    const [draggedField] = newFields.splice(draggedIndex, 1);
    newFields.splice(targetIndex, 0, draggedField);

    newFields.forEach((field, idx) => {
      field.order_index = idx;
    });

    onChange(newFields);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ComponentsSidebar onAddField={handleAddField} />

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900">منشئ النماذج</h2>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('desktop')}
                className={`p-2 rounded ${viewMode === 'desktop' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                title="سطح المكتب"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('tablet')}
                className={`p-2 rounded ${viewMode === 'tablet' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                title="جهاز لوحي"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('mobile')}
                className={`p-2 rounded ${viewMode === 'mobile' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                title="هاتف"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              معاينة
            </button>
            <div className="px-4 py-2 text-sm text-gray-500 italic">
              التغييرات تُحفظ عند الضغط على "حفظ الخدمة" أسفل الصفحة
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <FormCanvas
            fields={fields}
            selectedField={selectedField}
            onSelectField={setSelectedField}
            onDrop={handleAddField}
            onReorder={handleReorder}
            viewMode={viewMode}
          />

          <PropertiesPanel
            field={selectedField}
            allFields={fields.filter(f => !f._deleted)}
            onUpdate={handleUpdateField}
            onDelete={handleDeleteField}
            onDuplicate={handleDuplicateField}
          />
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        fields={fields}
      />
    </div>
  );
};

export default ProfessionalFormBuilder;
