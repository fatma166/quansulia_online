import React from 'react';
import { AlertCircle } from 'lucide-react';

const TextField = ({ field, value, error, onChange }) => {
  // Use custom className if provided, otherwise use default based on field type
  const colSpanClass = field.className || (field.type === 'email' || field.type === 'tel' ? 'md:col-span-1' : 'md:col-span-2');

  const handleInputChange = (e) => {
    const inputValue = e.target.value;

    // Block Arabic characters in email fields
    if (field.type === 'email') {
      const arabicRegex = /[\u0600-\u06FF]/;
      if (arabicRegex.test(inputValue)) {
        return;
      }
    }

    // حقول تقبل أرقام إنجليزية فقط (بدون أحرف)
    const numbersOnlyFields = [
      'nationalId',
      'iqamaNumber',
      'accountNumber',
      'referenceNumber',
      'transactionId',
      'certificateNumber',
      'registrationNumber',
      'licenseNumber',
      'phoneNumber',
      'faxNumber',
      'postalCode',
      'buildingNumber',
      'streetNumber',
      'unitNumber'
    ];

    if (numbersOnlyFields.includes(field.name)) {
      // السماح بالأرقام الإنجليزية فقط
      if (inputValue && !/^[0-9]*$/.test(inputValue)) {
        return;
      }
    }

    // حقول جواز السفر: حرف كبير واحد ثم أرقام
    const passportLikeFields = ['passportNumber', 'oldPassportNumber'];
    if (passportLikeFields.includes(field.name)) {
      if (inputValue && !/^[A-Z]?[0-9]*$/.test(inputValue)) {
        return;
      }
    }

    // حقول تقبل أحرف عربية فقط (بدون أرقام)
    const arabicOnlyFields = [
      'fullName',
      'fatherName',
      'motherName',
      'grandfatherName',
      'spouseName',
      'witnessName',
      'principalName',
      'agentName',
      'studentName',
      'applicantName',
      'beneficiaryName',
      'ownerName',
      'sellerName',
      'buyerName',
      'heirName',
      'deceasedName',
      'profession',
      'nationality',
      'placeOfBirth',
      'employerName',
      'companyName',
      'organizationName'
    ];

    if (arabicOnlyFields.includes(field.name)) {
      // السماح بالأحرف العربية والمسافات فقط
      if (inputValue && !/^[\u0600-\u06FF\s]*$/.test(inputValue)) {
        return;
      }
    }

    // حقول تقبل أحرف وأرقام عربية
    const arabicAlphanumericFields = [
      'address',
      'workplace',
      'district',
      'city',
      'region',
      'addressLandmark',
      'notes',
      'description',
      'subject',
      'propertyDescription',
      'vehicleDescription',
      'documentDescription'
    ];

    if (arabicAlphanumericFields.includes(field.name)) {
      // السماح بالأحرف العربية والأرقام العربية/الإنجليزية والمسافات والرموز الأساسية
      if (inputValue && !/^[\u0600-\u06FF\u0660-\u0669\u06F0-\u06F90-9\s\-\/\.,،؛:]+$/.test(inputValue)) {
        return;
      }
    }

    // حقول تقبل أحرف إنجليزية وأرقام فقط
    const englishAlphanumericFields = [
      'principalId',
      'agentId',
      'studentId',
      'employeeId',
      'memberId',
      'userId'
    ];

    if (englishAlphanumericFields.includes(field.name)) {
      // السماح بالأحرف الإنجليزية والأرقام فقط
      if (inputValue && !/^[A-Za-z0-9]*$/.test(inputValue)) {
        return;
      }
    }

    onChange(inputValue);
  };

  return (
    <div className={colSpanClass}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 mr-1">*</span>}
      </label>
      
      {field.prefix ? (
        <div className="relative">
          <div className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-3 rtl:pr-0 rtl:pl-3 pointer-events-none">
            <span className="text-gray-500 text-sm font-medium">{field.prefix}</span>
          </div>
          <input
            type={field.type}
            value={value || ''}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            required={field.required}
            className={`w-full px-4 py-3 pr-16 rtl:pr-4 rtl:pl-16 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 ${
              error ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>
      ) : (
        <input
          type={field.type}
          value={value || ''}
          onChange={handleInputChange}
          placeholder={field.placeholder}
          required={field.required}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 ${
            error ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
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

export default TextField;