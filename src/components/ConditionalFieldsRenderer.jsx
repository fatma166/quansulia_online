import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import TextField from './fields/TextField';
import NumberField from './fields/NumberField';
import SelectField from './fields/SelectField';
import RadioGroupField from './fields/RadioGroupField';
import DateField from './fields/DateField';
import FileField from './fields/FileField';
import TextareaField from './fields/TextareaField';
import CheckboxField from './fields/CheckboxField';
import DynamicListField from './fields/DynamicListField';

const ConditionalFieldsRenderer = ({ 
  conditionalFields, 
  loading, 
  error, 
  formData, 
  errors, 
  onChange 
}) => {
  // Debug logging
  React.useEffect(() => {
    console.log('ConditionalFieldsRenderer:', { 
      loading, 
      error, 
      fieldsCount: conditionalFields.length,
      fields: conditionalFields 
    });
  }, [loading, error, conditionalFields]);

  // دالة للتحقق من ظهور الحقل
  const isFieldVisible = (field) => {
    if (!field.conditional) return true;

    const cond = field.conditional;

    // Handle new operator-based format: { operator: "AND", conditions: [...] }
    if (cond.operator && cond.conditions && Array.isArray(cond.conditions)) {
      const results = cond.conditions.map(condition => {
        const fieldValue = formData[condition.field];

        // إذا كانت الشرط يحتوي على values
        if (condition.values && Array.isArray(condition.values)) {
          return condition.values.includes(fieldValue);
        }

        // إذا كانت الشرط يحتوي على value
        if (Object.prototype.hasOwnProperty.call(condition, 'value')) {
          return fieldValue === condition.value;
        }

        return true;
      });

      return cond.operator === 'AND'
        ? results.every(r => r === true)
        : results.some(r => r === true);
    }

    // Handle simple conditional (object with field and values)
    if (cond.field && cond.values) {
      const conditionField = cond.field;
      const conditionValues = cond.values;
      const currentValue = formData[conditionField];
      return conditionValues.includes(currentValue);
    }

    // Handle complex conditional (array with AND/OR operators)
    if (Array.isArray(cond)) {
      return cond.some(conditionGroup => {
        if (conditionGroup.operator === 'AND') {
          return conditionGroup.conditions.every(condition => {
            const currentValue = formData[condition.field];
            return condition.values.includes(currentValue);
          });
        } else if (conditionGroup.operator === 'OR') {
          return conditionGroup.conditions.some(condition => {
            const currentValue = formData[condition.field];
            return condition.values.includes(currentValue);
          });
        }
        return false;
      });
    }

    return true;
  };

  // دالة لرندر الحقل حسب نوعه
  const renderField = (field) => {
    if (!isFieldVisible(field)) {
      return null;
    }

    const commonProps = {
      field,
      value: formData[field.name] || '',
      error: errors[field.name],
      onChange: (value) => onChange(field.name, value)
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return <TextField key={field.name} {...commonProps} />;

      case 'number':
        return <NumberField key={field.name} {...commonProps} />;

      case 'select':
        return <SelectField key={field.name} {...commonProps} />;

      case 'radio':
        return <RadioGroupField key={field.name} {...commonProps} />;

      case 'date':
        return <DateField key={field.name} {...commonProps} />;

      case 'file':
        return <FileField key={field.name} {...commonProps} />;

      case 'textarea':
        return <TextareaField key={field.name} {...commonProps} />;

      case 'checkbox':
        return <CheckboxField key={field.name} {...commonProps} />;

      case 'dynamic-list':
        return <DynamicListField key={field.name} {...commonProps} />;

      default:
        return <TextField key={field.name} {...commonProps} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-8"
        >
          <Loader2 className="w-6 h-6 animate-spin text-[#276073] mr-2" />
          <span className="text-gray-600">جاري تحميل الحقول...</span>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </motion.div>
      )}

      {/* Conditional Fields */}
      <AnimatePresence mode="wait">
        {!loading && !error && conditionalFields.length > 0 && (
          <motion.div
            key="conditional-fields"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">
                حقول إضافية مطلوبة
              </h4>
              <p className="text-blue-700 text-sm">
                يرجى ملء الحقول التالية حسب نوع التوكيل المختار
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {conditionalFields.map(renderField)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!loading && !error && conditionalFields.length === 0 && formData.poaSubtype && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center"
        >
          <p className="text-gray-600">
            لا توجد حقول إضافية مطلوبة لهذا النوع من التوكيل
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ConditionalFieldsRenderer;