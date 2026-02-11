import React from 'react';
import { AlertCircle, Check } from 'lucide-react';

const CheckboxField = ({ field, value, error, onChange }) => {
  const isChecked = Boolean(value);

  return (
    <div className="md:col-span-2">
      <label className="flex items-start space-x-3 rtl:space-x-reverse cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => onChange(e.target.checked)}
            required={field.required}
            className="sr-only"
          />
          <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors duration-200 ${
            isChecked
              ? 'border-[#276073] bg-[#276073]'
              : error
              ? 'border-red-500'
              : 'border-gray-300'
          }`}>
            {isChecked && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-900">
            {field.label}
            {field.required && <span className="text-red-500 mr-1">*</span>}
          </span>
          {field.help && (
            <p className="mt-1 text-xs text-gray-500">{field.help}</p>
          )}
        </div>
      </label>
      
      {error && (
        <div className="mt-2 flex items-center space-x-2 rtl:space-x-reverse text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{Array.isArray(error) ? error[0] : error}</span>
        </div>
      )}
    </div>
  );
};

export default CheckboxField;