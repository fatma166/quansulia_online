import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import TextField from './TextField';
import DateField from './DateField';
import SelectField from './SelectField';
import SearchableSelectField from './SearchableSelectField';
import NumberField from './NumberField';
import TextareaField from './TextareaField';
import CheckboxField from './CheckboxField';
import RadioGroupField from './RadioGroupField';

const DynamicListField = ({ field, value = [], onChange, error }) => {
  const [items, setItems] = useState(value.length > 0 ? value : []);
  const subfields = field.subfields || field.fields || [];

  const handleAddItem = () => {
    const newItem = {};
    subfields.forEach(f => {
      newItem[f.name] = '';
    });
    const newItems = [...items, newItem];
    setItems(newItems);
    onChange(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onChange(newItems);
  };

  const handleItemChange = (index, fieldName, fieldValue) => {
    const newItems = [...items];
    newItems[index][fieldName] = fieldValue;
    setItems(newItems);
    onChange(newItems);
  };


  const renderField = (subField, index, itemValue, hideMainLabel = false) => {
    const fieldValue = itemValue || '';
    const fieldName = `${field.name || field.field_name}[${index}].${subField.name}`;

    const commonProps = {
      field: {
        ...subField,
        name: fieldName,
        label: hideMainLabel ? '' : (subField.label_ar || subField.label),
        label_ar: subField.label_ar || subField.label,
        placeholder: subField.label_ar || subField.label,
        required: subField.required || subField.is_required,
        is_required: subField.required || subField.is_required,
        options: subField.options,
        hideLabel: hideMainLabel
      },
      value: fieldValue,
      onChange: (val) => handleItemChange(index, subField.name, val),
      error: null
    };

    const fieldType = subField.type || subField.field_type;

    switch (fieldType) {
      case 'text':
      case 'email':
      case 'phone':
        return <TextField key={fieldName} {...commonProps} />;
      case 'number':
        return <NumberField key={fieldName} {...commonProps} />;
      case 'date':
        return <DateField key={fieldName} {...commonProps} />;
      case 'select':
        return <SelectField key={fieldName} {...commonProps} />;
      case 'searchable-select':
        return <SearchableSelectField key={fieldName} {...commonProps} />;
      case 'textarea':
        return <TextareaField key={fieldName} {...commonProps} />;
      case 'checkbox':
        return <CheckboxField key={fieldName} {...commonProps} />;
      case 'radio':
        return <RadioGroupField key={fieldName} {...commonProps} />;
      default:
        return <TextField key={fieldName} {...commonProps} />;
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="w-full">
        <div className="flex items-center justify-between w-full mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {field.label_ar || field.label}
              {(field.is_required || field.required) && <span className="text-red-500 mr-1">*</span>}
            </label>
            {(field.help || field.help_text_ar) && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{field.help || field.help_text_ar}</p>
              </div>
            )}
            {items.length > 0 && (
              <p className="text-xs text-blue-600 mt-1 font-semibold">
                {items.length} {items.length === 1 ? 'عنصر' : 'عناصر'} مضافة
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {field.button_text || field.buttonText || 'إضافة عنصر'}
          </button>
        </div>
      </div>

      <div className="space-y-4 w-full">
        {items.map((item, index) => (
          <div key={index} className="relative p-6 bg-white rounded-lg border border-gray-300 w-full">
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="absolute top-5 left-5 p-1.5 text-red-500 hover:text-red-700 transition-colors"
              title="حذف"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <div className="font-medium text-gray-700 text-sm mb-5 text-right pr-8">
              {field.label_ar || field.label} #{index + 1}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subfields.map((subField) => {
                const fieldType = subField.type || subField.field_type;
                return (
                  <div key={subField.name} className={fieldType === 'text' ? 'md:col-span-3' : 'md:col-span-1'}>
                    {renderField(subField, index, item[subField.name])}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 w-full">
          <div className="text-5xl mb-3">👥</div>
          <p className="text-gray-600 font-semibold mb-1">لا توجد عناصر مضافة</p>
          <p className="text-gray-500 text-sm">
            اضغط على "<span className="text-green-600 font-semibold">{field.button_text || field.buttonText || 'إضافة عنصر'}</span>" لإضافة عنصر جديد
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default DynamicListField;
