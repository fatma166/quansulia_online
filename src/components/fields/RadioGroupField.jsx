import React from 'react';
import { AlertCircle } from 'lucide-react';

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

const RadioGroupField = ({ field, value, error, onChange }) => {
  const getOptionLabel = (option) => {
    return option.label_ar || option.label || option.value || '';
  };

  const options = parseOptions(field.options);

  return (
    <div className="md:col-span-2">
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-3">
          {field.label}
          {field.required && <span className="text-red-500 mr-1">*</span>}
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {options.map((option) => (
            <label
              key={option.value}
              className={`relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                value === option.value
                  ? 'border-[#276073] bg-[#276073]/5'
                  : 'border-gray-300'
              }`}
            >
              <input
                type="radio"
                name={field.name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
              />
              <div className={`w-4 h-4 border-2 rounded-full mr-3 rtl:mr-0 rtl:ml-3 flex items-center justify-center ${
                value === option.value
                  ? 'border-[#276073]'
                  : 'border-gray-300'
              }`}>
                {value === option.value && (
                  <div className="w-2 h-2 bg-[#276073] rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900 block">
                  {getOptionLabel(option)}
                </span>
                {option.description && (
                  <span className="text-xs text-gray-500 mt-1 block">
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
      </fieldset>

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

export default RadioGroupField;