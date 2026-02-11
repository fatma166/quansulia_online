export const validateField = (field, value) => {
  const errors = [];

  // Required validation
  if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
    errors.push(field.validation?.required || `${field.label} مطلوب`);
  }

  if (!value) return errors;

  // Pattern validation
  if (field.pattern && typeof value === 'string' && !field.pattern.test(value)) {
    errors.push(field.validation?.pattern || `${field.label} غير صحيح`);
  }

  // Min/Max validation for numbers
  if (field.type === 'number') {
    const numValue = Number(value);
    if (field.min && numValue < field.min) {
      errors.push(`${field.label} يجب أن يكون أكبر من ${field.min}`);
    }
    if (field.max && numValue > field.max) {
      errors.push(`${field.label} يجب أن يكون أصغر من ${field.max}`);
    }
  }

  // File validation
  if (field.type === 'file' && value && value.length > 0) {
    const maxSize = parseFileSize(field.maxSize || '5MB');
    for (const file of value) {
      if (file.size > maxSize) {
        errors.push(`حجم الملف ${file.name} يتجاوز الحد المسموح (${field.maxSize || '5MB'})`);
      }
      
      if (field.accept) {
        const allowedTypes = field.accept.split(',').map(type => type.trim());
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(fileExtension)) {
          errors.push(`نوع الملف ${file.name} غير مدعوم`);
        }
      }
    }
  }

  return errors;
};

export const parseFileSize = (sizeStr) => {
  const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);
  if (!match) return 5 * 1024 * 1024; // Default 5MB
  return parseFloat(match[1]) * units[match[2].toUpperCase()];
};

export const validateForm = (formData, config) => {
  const errors = {};
  
  if (!config || !config.steps) return errors;

  config.steps.forEach(step => {
    step.fields.forEach(field => {
      const fieldErrors = validateField(field, formData[field.name]);
      if (fieldErrors.length > 0) {
        errors[field.name] = fieldErrors;
      }
    });
  });

  return errors;
};

// Arabic validation messages
export const validationMessages = {
  required: (fieldName) => `${fieldName} مطلوب`,
  email: 'البريد الإلكتروني غير صحيح',
  phone: 'رقم الهاتف غير صحيح',
  nationalId: 'الرقم الوطني غير صحيح',
  minLength: (min) => `يجب أن يكون النص ${min} أحرف على الأقل`,
  maxLength: (max) => `يجب أن لا يتجاوز النص ${max} حرف`,
  fileSize: (maxSize) => `حجم الملف يتجاوز الحد المسموح (${maxSize})`,
  fileType: 'نوع الملف غير مدعوم'
};