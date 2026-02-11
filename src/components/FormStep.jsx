import React from 'react';
import { motion } from 'framer-motion';
import TextField from './fields/TextField';
import NumberField from './fields/NumberField';
import SelectField from './fields/SelectField';
import RadioGroupField from './fields/RadioGroupField';
import DateField from './fields/DateField';
import FileField from './fields/FileField';
import TextareaField from './fields/TextareaField';
import CheckboxField from './fields/CheckboxField';
import SearchableSelectField from './fields/SearchableSelectField';
import DynamicListField from './fields/DynamicListField';
import InfoField from './fields/InfoField';
import { poaSubtypes } from '../services';
import { getCitiesByRegion, getDistrictsByCity } from '../data/saudiRegions';

// Ajax function to load conditional fields
const loadConditionalFields = async (poaType, poaSubtype) => {
  console.log('🔄 Ajax call started for:', poaType, poaSubtype);
  
  try {
    const response = await fetch('/src/data/poaFields.json', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    console.log('📡 Ajax response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const fieldsData = await response.json();
    console.log('📦 Ajax response data:', fieldsData);

    if (fieldsData[poaType] && fieldsData[poaType][poaSubtype]) {
      const subtypeData = fieldsData[poaType][poaSubtype];
      console.log('✅ Conditional fields loaded:', subtypeData.fields);
      return subtypeData.fields || [];
    } else {
      console.log('❌ No fields found for:', poaType, poaSubtype);
      return [];
    }
  } catch (err) {
    console.error('💥 Ajax error:', err);
    throw err;
  }
};

const FormStep = ({
  title,
  fields,
  formData,
  errors,
  onChange,
  serviceId,
  conditionalFields = [],
  loadingConditional = false,
  conditionalError = null,
  service
}) => {

  // Function to check if field should be visible based on conditions
  const isFieldVisible = (field) => {
    if (!field.conditional) return true;

    if (field.name === 'addressCity') {
      return !!formData.addressRegion;
    }

    if (field.name === 'addressDistrict') {
      return !!formData.addressCity;
    }

    if (field.name === 'addressLandmark') {
      return !!formData.addressCity;
    }

    // Handle complex conditional (array with AND/OR operators)
    if (Array.isArray(field.conditional)) {
      return field.conditional.some(conditionGroup => {
        if (conditionGroup.operator === 'AND') {
          const result = conditionGroup.conditions.every(condition => {
            const currentValue = formData[condition.field];
            if (condition.values) {
              return condition.values.includes(currentValue);
            }
            if (condition.notIn) {
              return !condition.notIn.includes(currentValue);
            }
            if (condition.hasOwnProperty('value')) {
              return currentValue === condition.value;
            }
            return true;
          });
          return conditionGroup.exclude ? !result : result;
        } else if (conditionGroup.operator === 'OR') {
          const result = conditionGroup.conditions.some(condition => {
            const currentValue = formData[condition.field];
            if (condition.values) {
              return condition.values.includes(currentValue);
            }
            if (condition.notIn) {
              return !condition.notIn.includes(currentValue);
            }
            if (condition.hasOwnProperty('value')) {
              return currentValue === condition.value;
            }
            return true;
          });
          return conditionGroup.exclude ? !result : result;
        }
        return false;
      });
    }

    // Handle simple conditional (object with field and values)
    const cond = field.conditional;
    const conditionField = cond.field;
    const currentValue = formData[conditionField];

    // إذا الحقل الأساسي فاضي أو غير موجود، الحقل الشرطي مينفعش يظهر
    if (!currentValue || currentValue === '' || currentValue === undefined) {
      return false;
    }

    // دعم كل من value و values مع exclude
    if (cond.hasOwnProperty('value')) {
      const matches = currentValue === cond.value;
      return cond.exclude ? !matches : matches;
    }

    if (cond.values && Array.isArray(cond.values)) {
      const matches = cond.values.includes(currentValue);
      return cond.exclude ? !matches : matches;
    }

    if (cond.notIn && Array.isArray(cond.notIn)) {
      return !cond.notIn.includes(currentValue);
    }

    return true;
  };

  // Function to get dynamic options for POA subtypes and cascading address fields
  const getDynamicOptions = (field) => {
    if (field.name === 'poaSubtype' && formData.poaType) {
      const subtypes = poaSubtypes[formData.poaType] || [];
      return subtypes.map(subtype => ({
        value: subtype.value,
        label: subtype.label,
        description: subtype.description || ''
      }));
    }

    if (field.name === 'addressCity' && formData.addressRegion) {
      return getCitiesByRegion(formData.addressRegion);
    }

    if (field.name === 'addressDistrict' && formData.addressRegion && formData.addressCity) {
      return getDistrictsByCity(formData.addressRegion, formData.addressCity);
    }

    return field.options || [];
  };

  const renderField = (field) => {
    // Check if field should be visible
    if (!isFieldVisible(field)) {
      return null;
    }

    // Update field options if dynamic
    const updatedField = {
      ...field,
      options: getDynamicOptions(field)
    };

    const commonProps = {
      field: updatedField,
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

      case 'searchable-select':
        return <SearchableSelectField key={field.name} {...commonProps} serviceId={serviceId} formData={formData} />;

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

      case 'info':
        return <InfoField key={field.name} field={updatedField} />;

      default:
        return <TextField key={field.name} {...commonProps} />;
    }
  };

  // رندر الحقول الشرطية
  const renderConditionalFields = () => {
    if (serviceId !== 'powerOfAttorney' || !formData.poaType || !formData.poaSubtype) {
      return null;
    }

    if (loadingConditional) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-8"
        >
          <div className="w-6 h-6 border-2 border-[#276073] border-t-transparent rounded-full animate-spin mr-2" />
          <span className="text-gray-600">جاري تحميل الحقول...</span>
        </motion.div>
      );
    }

    if (conditionalError) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <span className="text-red-700">{conditionalError}</span>
        </motion.div>
      );
    }

    if (conditionalFields.length > 0) {
      return (
        <motion.div
          key="conditional-fields"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
            {conditionalFields.map(field => {
                return <SearchableSelectField 
                  key={field.name} 
                  {...commonProps} 
                  serviceId={serviceId}
                  onPOASubtypeChange={field.name === 'poaSubtype' ? handlePOASubtypeChange : undefined}
                />;
              
              const commonProps = {
                field,
                value: formData[field.name] || '',
                error: errors[field.name],
                onChange: (value) => handleFieldChange(field.name, value)
              };

              switch (field.type) {
                case 'text':
                case 'email':
                case 'tel':
                  return <TextField key={field.name} {...commonProps} />;
                case 'select':
                  return <SelectField key={field.name} {...commonProps} />;
                case 'file':
                  return <FileField key={field.name} {...commonProps} />;
                case 'textarea':
                  return <TextareaField key={field.name} {...commonProps} />;
                case 'date':
                  return <DateField key={field.name} {...commonProps} />;
                default:
                  return <TextField key={field.name} {...commonProps} />;
              }
            })}
          </div>
        </motion.div>
      );
    }

    return null;
  };

  // دالة لعرض المتطلبات حسب نوع الخدمة المختار
  const getRequirements = () => {
    if (!service || !service.requirements) return null;

    // للسجل المدني
    if (serviceId === 'civilRegistry' && formData.recordType === 'national_id' && formData.idType) {
      const requirementKey = `national_id_${formData.idType}`;
      return service.requirements[requirementKey];
    }

    // للخدمات الأخرى
    return null;
  };

  const requirements = getRequirements();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {title && (
        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-4">
          {title}
        </h3>
      )}

      <div className="space-y-6">
        {(() => {
          const regularFields = [];
          const elements = [];

          fields.forEach(field => {
            if (!isFieldVisible(field)) return;

            if (field.type === 'dynamic-list') {
              if (regularFields.length > 0) {
                elements.push(
                  <div key={`grid-${elements.length}`} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {regularFields.map(f => renderField(f))}
                  </div>
                );
                regularFields.length = 0;
              }

              const fieldElement = renderField(field);
              if (fieldElement) {
                elements.push(
                  <div key={field.name} className="w-full">
                    {fieldElement}
                  </div>
                );
              }
            } else {
              regularFields.push(field);
            }
          });

          if (regularFields.length > 0) {
            elements.push(
              <div key={`grid-${elements.length}`} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {regularFields.map(f => renderField(f))}
              </div>
            );
          }

          return elements;
        })()}
      </div>
      
      {/* قسم بيانات الخدمة - الحقول الشرطية */}
      {serviceId === 'powerOfAttorney' && formData.poaType && formData.poaSubtype && (
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-lg font-bold text-blue-800 mb-4">
            بيانات الخدمة المحددة
          </h4>
          
          {loadingConditional && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
              <span className="text-blue-700">جاري تحميل الحقول...</span>
            </div>
          )}
          
          {conditionalError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-red-700">{conditionalError}</span>
            </div>
          )}
          
          {!loadingConditional && !conditionalError && conditionalFields.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {conditionalFields.map(field => {
                if (!isFieldVisible(field)) return null;
                
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
                  case 'select':
                    return <SelectField key={field.name} {...commonProps} />;
                  case 'file':
                    return <FileField key={field.name} {...commonProps} />;
                  case 'textarea':
                    return <TextareaField key={field.name} {...commonProps} />;
                  case 'date':
                    return <DateField key={field.name} {...commonProps} />;
                  default:
                    return <TextField key={field.name} {...commonProps} />;
                }
              })}
            </motion.div>
          )}
          
          {!loadingConditional && !conditionalError && conditionalFields.length === 0 && formData.poaSubtype && (
            <p className="text-blue-600 text-center py-4">
              لا توجد حقول إضافية مطلوبة لهذا النوع من التوكيل
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default FormStep;