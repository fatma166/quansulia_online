import React, { useRef } from 'react';
import { AlertCircle, Upload, X, FileText } from 'lucide-react';

const FileField = ({ field, value, error, onChange, heightClass }) => {
  const fileInputRef = useRef(null);
  const files = Array.isArray(value) ? value : [];

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (field.multiple) {
      onChange([...files, ...selectedFiles]);
    } else {
      onChange(selectedFiles);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 mr-1">*</span>}
      </label>
      
      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        } ${heightClass || ''} flex flex-col items-center justify-center`}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-1">
          اضغط لاختيار الملفات أو اسحبها هنا
        </p>
        <p className="text-xs text-gray-500">
          {field.accept && `الأنواع المدعومة: ${field.accept}`}
          {field.maxSize && ` • الحد الأقصى: ${field.maxSize}`}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={field.accept}
        multiple={field.multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-2 border-green-400"
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">{file.name}</p>
                  <p className="text-xs text-green-700">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

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

export default FileField;