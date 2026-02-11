import { useState, useEffect } from 'react';

// Hook لإدارة الحقول الشرطية مع Ajax
export const useConditionalFields = (serviceId, formData) => {
  const [conditionalFields, setConditionalFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // دالة لجلب الحقول الشرطية
  const fetchConditionalFields = async (serviceId, mainType, subType) => {
    if (!mainType || !subType) {
      setConditionalFields([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Ajax call حقيقي لجلب البيانات
      const dataFile = serviceId === 'powerOfAttorney' 
        ? '/src/data/poaFields.json'
        : serviceId === 'declarations'
        ? '/public/declarationFields.json'
        : '/src/data/poaFields.json';
      
      const response = await fetch(dataFile, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log(`📡 Ajax response received for ${serviceId}, status:`, response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const fieldsData = await response.json();
      console.log('Ajax response received:', fieldsData);

      if (fieldsData[mainType] && fieldsData[mainType][subType]) {
        const subtypeData = fieldsData[mainType][subType];
        console.log('✅ Conditional fields loaded for', subType, ':', subtypeData.fields);
        setConditionalFields(subtypeData.fields || []);
      } else {
        console.log('❌ No fields found for:', mainType, subType);
        setConditionalFields([]);
      }
    } catch (err) {
      console.error('Error loading conditional fields:', err);
      setError('حدث خطأ في تحميل الحقول');
      setConditionalFields([]);
    } finally {
      setLoading(false);
    }
  };

  // تشغيل Ajax عند تغيير نوع التوكيل
  useEffect(() => {
    console.log('useEffect triggered:', { serviceId, formData });
    
    // Handle Power of Attorney
    if (serviceId === 'powerOfAttorney' && formData.poaType && formData.poaSubtype) {
      console.log('Fetching POA conditional fields for:', formData.poaType, formData.poaSubtype);
      fetchConditionalFields('powerOfAttorney', formData.poaType, formData.poaSubtype);
    }
    // Handle Declarations
    else if (serviceId === 'declarations' && formData.declarationType && formData.declarationSubtype) {
      console.log('Fetching Declaration conditional fields for:', formData.declarationType, formData.declarationSubtype);
      fetchConditionalFields('declarations', formData.declarationType, formData.declarationSubtype);
    } else {
      setConditionalFields([]);
    }
  }, [serviceId, formData.poaType, formData.poaSubtype, formData.declarationType, formData.declarationSubtype]);

  return {
    conditionalFields,
    loading,
    error,
    refetch: () => {
      if (serviceId === 'powerOfAttorney') {
        fetchConditionalFields('powerOfAttorney', formData.poaType, formData.poaSubtype);
      } else if (serviceId === 'declarations') {
        fetchConditionalFields('declarations', formData.declarationType, formData.declarationSubtype);
      }
    }
  };
};