import React from 'react';
import { AlertCircle } from 'lucide-react';

const NumberField = ({ field, value, error, onChange }) => {
  const handleInputChange = (e) => {
    const inputValue = e.target.value;

    if (inputValue && !/^\d*$/.test(inputValue)) {
      return;
    }

    onChange(inputValue);
  };

  return (
    <div className="md:col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 mr-1">*</span>}
      </label>

      <input
        type="text"
        inputMode="numeric"
        value={value || ''}
        onChange={handleInputChange}
        required={field.required}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
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

export default NumberField;