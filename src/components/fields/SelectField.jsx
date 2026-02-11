import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

const parseOptions = (options) => {
  if (!options) return [];

  let optionsArray = [];
  if (Array.isArray(options)) {
    optionsArray = options;
  } else if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options);
      optionsArray = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse options:', options, e);
      return [];
    }
  } else {
    return [];
  }

  return optionsArray.map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      return opt;
    } else if (typeof opt === 'string' || typeof opt === 'number') {
      return {
        value: String(opt),
        label_ar: String(opt),
        label: String(opt)
      };
    }
    return { value: String(opt), label_ar: String(opt), label: String(opt) };
  });
};

const SelectField = ({ field, value, error, onChange }) => {
  const getOptionLabel = (option) => {
    return option.label_ar || option.label || option.value || '';
  };

  const options = parseOptions(field.options);

  return (
    <div className="md:col-span-1">
      {!field.hideLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {field.label}
          {field.required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          disabled={field.disabled || false}
          placeholder={field.placeholder || field.label}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 appearance-none bg-white ${
            error ? 'border-red-500 bg-red-50' :
            (field.disabled || false) ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' :
            'border-gray-300'
          }`}
        >
          <option value="">{field.placeholder || field.label || 'اختر...'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {getOptionLabel(option)}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>

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

export default SelectField;