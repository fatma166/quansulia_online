import React from 'react';
import { AlertCircle } from 'lucide-react';

const TextareaField = ({ field, value, error, onChange, heightClass }) => {
  const handleInputChange = (e) => {
    const inputValue = e.target.value;

    // حقول تقبل أحرف وأرقام عربية فقط
    const arabicAlphanumericFields = [
      'address',
      'workplace',
      'addressLandmark',
      'notes',
      'description',
      'subject',
      'propertyDescription',
      'vehicleDescription',
      'documentDescription',
      'details',
      'reason',
      'purpose',
      'comments'
    ];

    if (arabicAlphanumericFields.includes(field.name)) {
      // السماح بالأحرف العربية والأرقام والمسافات والرموز الأساسية
      if (inputValue && !/^[\u0600-\u06FF\u0660-\u0669\u06F0-\u06F90-9\s\-\/\.,،؛:()]+$/.test(inputValue)) {
        return;
      }
    }

    onChange(inputValue);
  };

  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 mr-1">*</span>}
      </label>

      <textarea
        value={value || ''}
        onChange={handleInputChange}
        rows={field.rows || 4}
        placeholder={field.placeholder}
        required={field.required}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 resize-none ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        } ${heightClass || ''}`}
      />

      {field.help && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">{field.help}</p>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center space-x-2 rtl:space-x-reverse text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{Array.isArray(error) ? error[0] : error}</span>
        </div>
      )}
    </div>
  );
};

export default TextareaField;