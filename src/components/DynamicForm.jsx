// src/components/DynamicForm.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Save, Printer, CheckCircle, AlertCircle, TestTube2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import ProgressSteps from './ProgressSteps';
import { getRegionsList, getCitiesByRegion, getDistrictsByCity } from '../data/saudiRegions';
import FormStep from './FormStep';
import SidebarSummary from './SidebarSummary';
import { validateForm } from '../lib/validation';
import { saveDraft, autoSave } from '../lib/storage';
import { submitApplication } from '../lib/api';
import { useServiceData, getVisibleItems } from '../hooks/useServiceData';
import ConditionalDocuments from './ConditionalDocuments';

// Import POA configurations
import { poaSubtypes } from '../services';

// Import field components
import TextField from './fields/TextField';
import SelectField from './fields/SelectField';
import SearchableSelectField from './fields/SearchableSelectField';
import RadioGroupField from './fields/RadioGroupField';
import CheckboxField from './fields/CheckboxField';
import TextareaField from './fields/TextareaField';
import DateField from './fields/DateField';
import NumberField from './fields/NumberField';
import FileField from './fields/FileField';
import DynamicListField from './fields/DynamicListField';

const fieldComponents = {
  text: TextField,
  select: SelectField,
  'searchable-select': SearchableSelectField,
  radio: RadioGroupField,
  checkbox: CheckboxField,
  textarea: TextareaField,
  date: DateField,
  number: NumberField,
  tel: TextField,
  email: TextField,
  file: FileField,
  'dynamic-list': DynamicListField,
};

// بيانات تجريبية للملء التلقائي
const testData = {
  fullName: 'أحمد محمد علي حسن',
  nationalId: '1234567890',
  phoneNumber: '0501234567',
  email: 'ahmed.mohamed@example.com',
  dob: '1990-05-15',
  isAdult: 'yes',
  profession: 'مهندس برمجيات',
  workplace: 'شركة التقنية المتقدمة',
  region: 'riyadh',
  city: 'الرياض',
  district: 'النخيل',
  address: 'شارع الملك فهد، حي النخيل، الرياض'
};

// ✅ دالة عامة لفحص شرط الظهور من ملف الإعدادات
const passesConditional = (field, data) => {
  const cond = field?.conditional;
  if (!cond) return true;

  // لو دالة: ننفذها بأمان
  if (typeof cond === 'function') {
    try { return !!cond(data); } catch { return true; }
  }

  // لو مصفوفة: دعم الشروط المتعددة بـ AND/OR
  if (Array.isArray(cond)) {
    return cond.some(condGroup => {
      if (!condGroup.conditions) return true;
      const operator = condGroup.operator || 'AND';

      if (operator === 'AND') {
        return condGroup.conditions.every(c => {
          const currentValue = data?.[c.field];
          if (c.values) return c.values.includes(currentValue);
          if (c.notIn) return !c.notIn.includes(currentValue);
          if (Object.prototype.hasOwnProperty.call(c, 'value')) return currentValue === c.value;
          return true;
        });
      } else if (operator === 'OR') {
        return condGroup.conditions.some(c => {
          const currentValue = data?.[c.field];
          if (c.values) return c.values.includes(currentValue);
          if (c.notIn) return !c.notIn.includes(currentValue);
          if (Object.prototype.hasOwnProperty.call(c, 'value')) return currentValue === c.value;
          return true;
        });
      }

      return true;
    });
  }

  // لو كائن: دعم صيغ متعددة
  if (typeof cond === 'object') {
    // النسق الجديد من قاعدة البيانات: { operator: "AND", conditions: [{field, values}, ...] }
    if (cond.operator && cond.conditions && Array.isArray(cond.conditions)) {
      const operator = cond.operator || 'AND';
      const conditions = cond.conditions;

      // دالة مساعدة لفحص شرط واحد
      const checkCondition = (condition) => {
        const fieldValue = data?.[condition.field];

        // إذا كان الشرط يحتوي على values (قائمة قيم)
        if (condition.values && Array.isArray(condition.values)) {
          return condition.values.includes(fieldValue);
        }

        // إذا كان الشرط يحتوي على value (قيمة واحدة)
        if (Object.prototype.hasOwnProperty.call(condition, 'value')) {
          return fieldValue === condition.value;
        }

        return true;
      };

      // تطبيق المنطق (AND / OR)
      if (operator === 'AND') {
        return conditions.every(checkCondition);
      } else if (operator === 'OR') {
        return conditions.some(checkCondition);
      }

      return true;
    }

    // صيغة جديدة من قاعدة البيانات: { show_when: [...], logic: 'AND' }
    if (cond.show_when && Array.isArray(cond.show_when)) {
      const logic = cond.logic || 'AND';
      const conditions = cond.show_when;

      // دالة مساعدة لفحص شرط واحد
      const checkCondition = (condition) => {
        const fieldValue = data?.[condition.field];
        const operator = condition.operator || 'equals';
        const expectedValue = condition.value;

        switch (operator) {
          case 'equals':
            return fieldValue === expectedValue;
          case 'not_equals':
            return fieldValue !== expectedValue;
          case 'contains':
            return String(fieldValue || '').includes(String(expectedValue));
          case 'not_contains':
            return !String(fieldValue || '').includes(String(expectedValue));
          case 'in':
            return Array.isArray(expectedValue) && expectedValue.includes(fieldValue);
          case 'not_in':
            return Array.isArray(expectedValue) && !expectedValue.includes(fieldValue);
          case 'greater_than':
            return Number(fieldValue) > Number(expectedValue);
          case 'less_than':
            return Number(fieldValue) < Number(expectedValue);
          case 'greater_than_or_equal':
            return Number(fieldValue) >= Number(expectedValue);
          case 'less_than_or_equal':
            return Number(fieldValue) <= Number(expectedValue);
          case 'is_empty':
            return !fieldValue || fieldValue === '';
          case 'is_not_empty':
            return fieldValue && fieldValue !== '';
          default:
            return true;
        }
      };

      // تطبيق المنطق (AND / OR)
      if (logic === 'AND') {
        return conditions.every(checkCondition);
      } else if (logic === 'OR') {
        return conditions.some(checkCondition);
      }

      return true;
    }

    // صيغة قديمة: { field, values, notIn, value, exclude }
    const target = cond.field;
    if (!target) return true;
    const current = data ? data[target] : undefined;

    // إذا الحقل الأساسي فاضي أو غير موجود، الحقل الشرطي مينفعش يظهر
    if (!current || current === '' || current === undefined) {
      return false;
    }

    // دعم exclude: true (يعني الحقل يظهر إلا في الحالات المذكورة)
    if (Array.isArray(cond.values)) {
      const matches = cond.values.includes(current);
      return cond.exclude ? !matches : matches;
    }

    if (Array.isArray(cond.notIn))  return !cond.notIn.includes(current);

    if (Object.prototype.hasOwnProperty.call(cond, 'value')) {
      const matches = current === cond.value;
      return cond.exclude ? !matches : matches;
    }
  }

  // أي صيغة غير معروفة: لا نكسر الريندر
  return true;
};

const DynamicForm = ({ service: serviceProp, config, onBack, onFormChange, onSubmit }) => {
  // Support both 'service' and 'config' props for backwards compatibility
  const service = serviceProp || config;
  const navigate = useNavigate();

  // Only load service data from database if:
  // 1. We have a slug AND
  // 2. We don't have ANY config data (no steps AND no requirements AND no documents)
  const shouldFetchFromDB = service?.slug && !service?.steps && !service?.requirements && !service?.documents;

  // Load service data from database only if needed
  const {
    service: dbService,
    requirements: dbRequirements,
    documents: dbDocuments,
    fields: dbFields,
    pricingRules: dbPricingRules,
    loading: dbLoading,
    error: dbError
  } = useServiceData(shouldFetchFromDB ? service.slug : null);

  // Merge database data into service object for SidebarSummary
  const mergedService = React.useMemo(() => {
    const base = dbService || service;
    if (!base) return null;

    const finalRequirements = dbRequirements && dbRequirements.length > 0 ? dbRequirements : base.requirements;

    return {
      ...base,
      requirements: finalRequirements,
      documents: dbDocuments && dbDocuments.length > 0 ? dbDocuments : base.documents
    };
  }, [dbService, service, dbRequirements, dbDocuments]);

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [poaSubtypeOptions, setPoaSubtypeOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conditionalFields, setConditionalFields] = useState([]);
  const [loadingConditional, setLoadingConditional] = useState(false);
  const [conditionalError, setConditionalError] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState({
    dataAccuracy: false,
    termsAndConditions: false,
    communicationConsent: false
  });

  // Ajax للحقول الشرطية في التوكيلات (كما هو)
  const handlePOASubtypeChange = async (subtypeValue) => {
    if (!formData.poaType || !subtypeValue) {
      setConditionalFields([]);
      return;
    }
    setLoadingConditional(true);
    setConditionalError(null);
    try {
      const response = await fetch('/src/data/poaFields.json', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const allData = await response.json();
      if (allData[formData.poaType] && allData[formData.poaType][subtypeValue]) {
        const specificData = allData[formData.poaType][subtypeValue];
        setConditionalFields(specificData.fields || []);
      } else {
        setConditionalFields([]);
      }
    } catch (error) {
      setConditionalError('حدث خطأ في تحميل الحقول');
      setConditionalFields([]);
    } finally {
      setLoadingConditional(false);
    }
  };

  const loadConditionalFields = async (poaType, poaSubtype) => {
    if (!poaType || !poaSubtype) {
      setConditionalFields([]);
      return;
    }
    setLoadingConditional(true);
    setConditionalError(null);
    try {
      // تحديد الملف المناسب حسب نوع الخدمة
      const dataFile = service.id === 'declarations' 
        ? '/public/declarationFields.json'
        : '/src/data/poaFields.json';
        
      const response = await fetch(dataFile, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const fieldsData = await response.json();
      if (fieldsData[poaType] && fieldsData[poaType][poaSubtype]) {
        const subtypeData = fieldsData[poaType][poaSubtype];
        setConditionalFields(subtypeData.fields || []);
      } else {
        setConditionalFields([]);
      }
    } catch (err) {
      setConditionalError('حدث خطأ في تحميل الحقول');
      setConditionalFields([]);
    } finally {
      setLoadingConditional(false);
    }
  };

  const [showReview, setShowReview] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);

  // تحديث خيارات subtype عند تغيير poaType
  useEffect(() => {
    if (formData.poaType) {
      const options = poaSubtypes[formData.poaType] || [];
      setPoaSubtypeOptions(options);

      if (formData.poaSubtype) {
        setFormData(prev => ({ ...prev, poaSubtype: '' }));
      }
    }
    
    // تحديث خيارات declaration subtype عند تغيير declarationType
    if (formData.declarationType && service.id === 'declarations') {
      // Reset declaration subtype when declaration type changes
      if (formData.declarationSubtype) {
        setFormData(prev => ({ ...prev, declarationSubtype: '' }));
      }
    }
  }, [formData.poaType]);

  // ملء بيانات عامة
  const fillTestData = () => {
    setFormData(prev => ({ ...prev, ...testData }));
    const cities = getCitiesByRegion(testData.region);
    setAvailableCities(cities);
    const districts = getDistrictsByCity(testData.region, testData.city);
    setAvailableDistricts(districts);
    setErrors({});

    // إظهار رسالة نجاح
    alert('✅ تم ملء البيانات الشخصية التجريبية بنجاح!\n\nيمكنك الآن المتابعة للخطوة التالية.');
  };

  // ملء بيانات الخدمة التجريبية (مثال)
  const fillServiceTestData = () => {
    let serviceTestData = {};

    // بيانات وهمية لملفات تجريبية
    const createDummyFile = (name, type) => {
      const blob = new Blob(['بيانات تجريبية'], { type });
      return new File([blob], name, { type });
    };

    if (service.id === 'passports') {
      serviceTestData = {
        passportType: 'new',
        nationalIdCopy: [createDummyFile('national-id.pdf', 'application/pdf')],
        personalPhoto: [createDummyFile('photo.jpg', 'image/jpeg')],
        oldPassportNumber: 'P1234567',
        lossDate: '2024-01-15',
        lossLocation: 'جدة - حي النعيم'
      };
    } else if (service.id === 'civilRegistry') {
      serviceTestData = {
        recordType: 'birth',
        relationToApplicant: 'self',
        birthDate: '1990-05-15',
        birthPlace: 'الخرطوم',
        fatherName: 'محمد أحمد علي',
        motherName: 'فاطمة حسن محمود',
        attachments: [createDummyFile('birth-certificate.pdf', 'application/pdf')]
      };
    } else if (service.id === 'powerOfAttorney') {
      serviceTestData = {
        poaType: 'general',
        poaSubtype: 'new_id_card',
        principalName: 'محمد أحمد علي حسن',
        principalId: 'P1234567',
        principalPhone: '0501234567',
        agentName: 'علي محمد أحمد',
        agentId: 'P0987654',
        agentPhone: '0507654321',
        poaScope: 'توكيل عام في جميع الأمور المالية والإدارية والقانونية',
        duration: '1year',
        witness1Name: 'عبدالرحمن أحمد محمد حسن',
        witness1Id: 'P1111111',
        witness2Name: 'فاطمة علي حسن محمود',
        witness2Id: 'P2222222',
        attachments: [createDummyFile('principal-id.pdf', 'application/pdf')]
      };
    } else if (service.id === 'realEstate') {
      serviceTestData = {
        principalName: 'محمد أحمد علي حسن',
        principalId: 'P1234567',
        phone: '0501234567',
        email: 'mohamed.ahmed@example.com',
        propertyType: 'residential',
        propertyLocation: 'الرياض - حي النخيل',
        propertyArea: '500',
        deedNumber: '123456789',
        poaScope: 'توكيل عام للتصرف في العقار السكني الكائن في حي النخيل بالرياض، رقم الصك 123456789، يشمل البيع والشراء والتأجير وكافة التصرفات القانونية',
        agentName: 'علي محمد أحمد حسن',
        agentId: 'P0987654',
        witness1Name: 'خالد عبدالله محمد علي',
        witness1Id: 'P3333333',
        witness2Name: 'نورة حسن أحمد محمد',
        witness2Id: 'P4444444',
        principalIdCopy: [createDummyFile('principal-id.pdf', 'application/pdf')],
        agentIdCopy: [createDummyFile('agent-id.pdf', 'application/pdf')]
      };
    } else if (service.id === 'vehicles') {
      serviceTestData = {
        principalName: 'محمد أحمد علي حسن',
        principalId: 'P1234567',
        phone: '0501234567',
        email: 'mohamed.ahmed@example.com',
        vehicleType: 'car',
        vehicleMake: 'تويوتا',
        vehicleModel: 'كامري',
        vehicleYear: '2023',
        plateNumber: 'أ ب ج 1234',
        sequenceNumber: '987654321',
        poaScope: 'توكيل عام للتصرف في المركبة تويوتا كامري موديل 2023، رقم اللوحة أ ب ج 1234، رقم التسلسل 987654321، يشمل البيع والشراء والنقل والتسجيل',
        agentName: 'علي محمد أحمد حسن',
        agentId: 'P0987654',
        witness1Name: 'سعد محمد علي حسن',
        witness1Id: 'P5555555',
        witness2Name: 'ليلى أحمد حسن محمد',
        witness2Id: 'P6666666',
        principalIdCopy: [createDummyFile('principal-id.pdf', 'application/pdf')],
        agentIdCopy: [createDummyFile('agent-id.pdf', 'application/pdf')]
      };
    } else if (service.id === 'companies') {
      serviceTestData = {
        principalName: 'محمد أحمد علي حسن',
        principalId: 'P1234567',
        phone: '0501234567',
        email: 'mohamed.ahmed@example.com',
        companyName: 'شركة التقنية المتقدمة المحدودة',
        crNumber: '1010123456',
        companyType: 'limited_liability',
        poaScope: 'توكيل عام لتمثيل الموكل في شركة التقنية المتقدمة المحدودة (س.ت 1010123456)، يشمل التوقيع على العقود والمعاملات البنكية والتعامل مع الجهات الحكومية',
        agentName: 'علي محمد أحمد حسن',
        agentId: 'P0987654',
        witness1Name: 'عمر علي حسن محمد',
        witness1Id: 'P7777777',
        witness2Name: 'منى محمد أحمد علي',
        witness2Id: 'P8888888',
        principalIdCopy: [createDummyFile('principal-id.pdf', 'application/pdf')],
        agentIdCopy: [createDummyFile('agent-id.pdf', 'application/pdf')]
      };
    } else if (service.id === 'general') {
      // بيانات تجريبية شاملة للتوكيل العام - يمكن التبديل بين الأنواع
      const generalTypes = {
        account_management: {
          generalType: 'account_management',
          bankName: 'alrajhi',
          accountNumber: 'SA0310000000000000000000',
          poaScope: 'توكيل عام لإدارة حساب بنكي رقم SA0310000000000000000000 في مصرف الراجحي، يشمل الصلاحيات التالية:\n- الاستعلام عن الرصيد\n- السحب والإيداع\n- التحويلات البنكية\n- استلام كشف الحساب\n- تحديث البيانات الشخصية'
        },
        replacement_sim: {
          generalType: 'replacement_sim',
          telecomCompany: 'stc',
          phoneNumber: '0501234567',
          poaScope: 'توكيل عام لاستخراج شريحة بدل فاقد لرقم 0501234567 من شركة الاتصالات السعودية STC، مع كافة الإجراءات المتعلقة بذلك'
        },
        transfer_error_form: {
          generalType: 'transfer_error_form',
          bankName: 'alahli',
          transferAmount: '5000',
          beneficiaryName: 'خالد عبدالله محمد',
          beneficiaryAccount: 'SA4510000000000000000000',
          poaScope: 'توكيل عام لمعالجة تحويل مبلغ 5000 ريال تم بالخطأ إلى حساب خالد عبدالله محمد رقم SA4510000000000000000000، واسترداد المبلغ وكافة الإجراءات اللازمة'
        },
        saudi_insurance_form: {
          generalType: 'saudi_insurance_form',
          bankName: 'riyad',
          insuranceCompany: 'tawuniya',
          iban: 'SA0310000000000000000000',
          insuranceNote: 'طلب تعويض عن حادث مروري بتاريخ 2025-01-15',
          poaScope: 'توكيل عام لمتابعة طلب التعويض من شركة التعاونية للتأمين، وتحويل المبلغ إلى الآيبان SA0310000000000000000000، وكافة الإجراءات اللازمة'
        },
        new_id_card: {
          generalType: 'new_id_card',
          telecomCompany: 'mobily',
          poaScope: 'توكيل عام لاستخراج بطاقة/هوية جديدة من شركة موبايلي Mobily، وكافة الإجراءات المتعلقة بذلك'
        },
        foreign_embassy_memo: {
          generalType: 'foreign_embassy_memo',
          embassyName: 'السفارة المصرية',
          procedureDescription: 'مخاطبة السفارة المصرية بخصوص تجديد جواز السفر',
          poaScope: 'توكيل عام لمخاطبة السفارة المصرية في الرياض، وتقديم الطلبات والمستندات المطلوبة لتجديد جواز السفر، ومتابعة الإجراءات',
          witness1Name: 'عبدالرحمن محمد أحمد حسن',
          witness1Id: 'P1111111',
          witness2Name: 'فاطمة علي حسن محمود',
          witness2Id: 'P2222222'
        },
        document_authentication: {
          generalType: 'document_authentication',
          documentType: 'educational',
          poaScope: 'توكيل عام لتوثيق وتصديق الشهادة التعليمية، وإثبات صحتها لدى الجهات المختصة، وكافة الإجراءات اللازمة',
          witness1Name: 'عبدالله أحمد محمد علي',
          witness1Id: 'P3333333',
          witness2Name: 'مريم حسن علي أحمد',
          witness2Id: 'P4444444'
        },
        general_procedure_form: {
          generalType: 'general_procedure_form',
          procedureDescription: 'إنهاء إجراء إداري لدى وزارة الداخلية - إصدار شهادة حسن سيرة وسلوك',
          poaScope: 'توكيل عام لاستخراج شهادة حسن السيرة والسلوك من وزارة الداخلية، وكافة الإجراءات الإدارية المتعلقة بذلك'
        },
        other_general: {
          generalType: 'other_general',
          procedureDescription: 'إجراء عام - استلام شحنة من الجمارك',
          poaScope: 'توكيل عام لاستلام شحنة واردة من الجمارك، ودفع الرسوم المستحقة، وإنهاء كافة الإجراءات الجمركية'
        }
      };

      // اختر نوع عشوائي أو الأول (account_management)
      const selectedType = generalTypes.account_management;

      // بيانات الشهود الافتراضية (للأنواع التي تحتاج شهود)
      const defaultWitnesses = {
        witness1Name: 'حسن محمد عبدالله أحمد',
        witness1Id: 'P5555555',
        witness2Name: 'سارة علي حسن محمد',
        witness2Id: 'P6666666'
      };

      serviceTestData = {
        principalName: 'محمد أحمد علي حسن',
        principalId: 'P1234567',
        phone: '0501234567',
        email: 'mohamed.ahmed@example.com',
        ...selectedType,
        // إضافة بيانات الشهود إذا لم تكن موجودة في النوع المحدد
        ...(selectedType.witness1Name ? {} : defaultWitnesses),
        agentName: 'علي محمد أحمد حسن',
        agentId: 'P0987654',
        principalIdCopy: [createDummyFile('principal-id.pdf', 'application/pdf')],
        agentIdCopy: [createDummyFile('agent-id.pdf', 'application/pdf')]
      };
    } else if (service.id === 'attestations') {
      serviceTestData = {
        docType: 'educational',
        docTitle: 'شهادة البكالوريوس في الهندسة',
        issuingAuthority: 'جامعة الخرطوم',
        issueDate: '2015-06-20',
        docNumber: 'DEG-2015-1234',
        purpose: 'للعمل في المملكة العربية السعودية',
        files: [createDummyFile('degree-certificate.pdf', 'application/pdf')]
      };
    } else if (service.id === 'endorsements') {
      serviceTestData = {
        endorseType: 'conduct',
        purpose: 'للحصول على وظيفة في شركة خاصة',
        destinationCountry: 'السعودية',
        copiesNeeded: '3',
        urgency: 'normal',
        notes: 'يرجى المعالجة في أقرب وقت ممكن'
      };
    } else if (service.id === 'familyAffairs') {
      serviceTestData = {
        serviceType: 'marriageProof',
        applicantType: 'husband',
        nationality: 'sudanese',
        religion: 'islam',
        passportNumber: 'A1234567',
        passportExpiry: '2028-12-31',
        residencyId: '2234567890',
        residencyExpiry: '2026-06-30',
        maritalStatus: 'married',
        marriageDate: '2018-03-15',
        placeOfBirth: 'الخرطوم، السودان',
        spouseName: 'سارة محمد أحمد',
        spouseNationality: 'سودانية',
        relationToCase: 'direct',
        attachments: [createDummyFile('marriage-contract.pdf', 'application/pdf')]
      };
    } else if (service.id === 'visas') {
      serviceTestData = {
        visitType: 'family',
        passportNo: 'A1234567',
        passportIssueDate: '2023-01-15',
        passportExpiry: '2028-12-31',
        visitDuration: '3months',
        entryType: 'single',
        inviterName: 'أحمد محمد علي',
        inviterNationalId: '1234567890',
        inviterPhone: '0501234567',
        relationshipToInviter: 'brother',
        purposeOfVisit: 'زيارة عائلية',
        accommodationAddress: 'جدة - حي النعيم - شارع الملك عبدالعزيز',
        attachments: [createDummyFile('passport-copy.pdf', 'application/pdf')]
      };
    } else if (service.id === 'declarations') {
      serviceTestData = {
        declarationType: 'regular',
        declarationSubtype: 'income',
        declarationTitle: 'إقرار الدخل الشهري',
        declarationContent: 'أقر بأن دخلي الشهري يبلغ 15000 ريال سعودي',
        purpose: 'للتقديم على قرض بنكي',
        witnessName: 'علي محمد حسن',
        witnessId: '0987654321',
        attachments: [createDummyFile('supporting-docs.pdf', 'application/pdf')]
      };
    }

    setFormData(prev => ({ ...prev, ...serviceTestData }));
    setErrors({});

    // إظهار رسالة نجاح
    alert('✅ تم ملء بيانات الخدمة التجريبية بنجاح!\n\nيمكنك الآن المتابعة للخطوة التالية.');
  };

  // إذا كان config يحتوي على skipPersonalStep: true، ندمج الخطوات
  const skipPersonalStep = service?.skipPersonalStep === true;

  const steps = skipPersonalStep
    ? [
        { id: 'details', title: 'تفاصيل الخدمة', completed: false },
        { id: 'review', title: 'المراجعة والدفع', completed: false }
      ]
    : [
        { id: 'personal', title: 'بيانات المتقدم', completed: false },
        { id: 'details', title: 'تفاصيل الخدمة', completed: false },
        { id: 'review', title: 'المراجعة والدفع', completed: false }
      ];

  // Auto-save
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      autoSave(service.id, formData);
    }
  }, [formData, service.id]);

  const handleInputChange = (fieldName, value) => {
    // تناسق السن
    if (fieldName === 'dob' || fieldName === 'isAdult') {
      const newFormData = { ...formData, [fieldName]: value };
      if (newFormData.dob && newFormData.isAdult) {
        const birthDate = new Date(newFormData.dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const actualAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) ? age - 1 : age;
        const isActuallyAdult = actualAge >= 18;
        const selectedAdult = newFormData.isAdult === 'yes';
        if (isActuallyAdult !== selectedAdult) {
          setErrors(prev => ({ ...prev, ageConsistency: ['تاريخ الميلاد لا يتطابق مع الإجابة المختارة'] }));
        } else {
          setErrors(prev => { const ne = { ...prev }; delete ne.ageConsistency; return ne; });
        }
      }
    }

    const updatedFormData = { ...formData, [fieldName]: value };
    setFormData(updatedFormData);

    // Call parent callback if provided
    if (onFormChange) {
      onFormChange(updatedFormData);
    }

    // عند تغيير نوع التوكيل نعيد تعيين subtype
    if (fieldName === 'poaType') {
      setFormData(prev => ({ ...prev, poaSubtype: '' }));
    }

    // عند اختيار subtype للتوكيل حمّل الحقول الشرطية (لو بتستخدم JSON الخارجي)
    if (fieldName === 'poaSubtype' && value) {
      handlePOASubtypeChange(value);
    }
    
    // عند اختيار declaration subtype للإقرارات حمّل الحقول الشرطية
    if (fieldName === 'declarationSubtype' && value && service.id === 'declarations') {
      loadConditionalFields(formData.declarationType, value);
    }

    // المناطق -> مدن
    if (fieldName === 'region') {
      const cities = getCitiesByRegion(value);
      setAvailableCities(cities);
      setFormData(prev => ({ ...prev, [fieldName]: value, city: '', district: '' }));
      setAvailableDistricts([]);
    }
    if (fieldName === 'city') {
      const districts = getDistrictsByCity(formData.region, value);
      setAvailableDistricts(districts);
      setFormData(prev => ({ ...prev, [fieldName]: value, district: '' }));
    }

    // تنظيف أخطاء الحقل
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  const handleFieldChange = (fieldName, value) => {
    handleInputChange(fieldName, value);
  };

  const validateFields = (fields) => {
    const stepErrors = {};
    fields.forEach(field => {
      // منتحقق فقط في الحقول الظاهرة (تمت فلترتها بالفعل)
      const value = formData[field.name];

      if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
        stepErrors[field.name] = [`${field.label || field.name} مطلوب`];
      }

      // التحقق من pattern - يدعم string و RegExp
      if (value && field.pattern && typeof value === 'string') {
        let regex;
        if (typeof field.pattern === 'string') {
          // تحويل string إلى RegExp
          regex = new RegExp(field.pattern);
        } else if (field.pattern instanceof RegExp) {
          regex = field.pattern;
        }

        if (regex && !regex.test(value)) {
          stepErrors[field.name] = [`${field.label || field.name} غير صحيح`];
        }
      }
    });
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const validateCurrentStep = () => {
    const actualStep = skipPersonalStep ? currentStep + 1 : currentStep;

    if (actualStep === 0) {
      const currentFields = [
        { name: 'fullName', required: true },
        { name: 'nationalId', required: true, pattern: /^\d{10,11}$/ },
        { name: 'phoneNumber', required: true, pattern: /^(05|5)\d{8}$/ },
        { name: 'email', required: true },
        { name: 'dob', required: true },
        { name: 'isAdult', required: true },
        { name: 'region', required: true },
        { name: 'city', required: true },
        { name: 'district', required: true },
        { name: 'address', required: true },
        { name: 'profession', required: true },
        { name: 'workplace', required: true }
      ];
      const isValid = validateFields(currentFields);
      if (errors.ageConsistency) return false;
      return isValid;
    }
    if (actualStep === 1) {
      return validateServiceSpecificFields();
    }
    if (actualStep === 2) return true;
    return true;
  };

  // قراءة حقول من Step في config
  const getFieldsFromConfigStep = (stepIdCandidates) => {
    if (!service?.steps?.length) return null;

    const ids = Array.isArray(stepIdCandidates) ? stepIdCandidates : [stepIdCandidates];

    // الأولوية: أول step يطابق أحد المعرفات المقترحة
    let step =
      service.steps.find(s => ids.includes(s.id)) ||
      // فولباك: أي step عنوانه فيه "تفاصيل"
      service.steps.find(s =>
        (s.title || '').toLowerCase().includes('details') || (s.title || '').includes('تفاصيل')
      );

    if (!step) return null;

    // تحقق من شرط الخطوة نفسها
    if (step.conditional && !passesConditional(step, formData)) {
      return null;
    }

    // ننسخ ونفلتر حسب conditional
    const fields = (step.fields || []).map(f => ({ ...f }));
    return fields.filter(f => passesConditional(f, formData));
  };

  const validateServiceSpecificFields = () => {
    if (service?.steps?.length) {
      const details =
        getFieldsFromConfigStep([
          'poa-details',
          'details',
          'passport-details',
          'service-details'
        ]) || [];

      const docs =
        getFieldsFromConfigStep(['documents-upload', 'documents', 'attachments']) || [];

      return validateFields([...details, ...docs]);
    }

    // -------- فولباك القديم كما هو (لو مفيش config) --------
    let currentFields = [];
    if (service.id === 'passports') {
      const passportType = formData.passportType;
      if (passportType === 'new') {
        currentFields = [{ name: 'nationalIdCopy', required: true }];
      } else if (passportType === 'renewal') {
        currentFields = [
          { name: 'oldPassportOriginal', required: true },
          { name: 'oldPassportElectronic', required: true },
          { name: 'oldPassportNumber', required: true }
        ];
      } else if (passportType === 'replacement') {
        currentFields = [
          { name: 'policeReport', required: true },
          { name: 'oldPassportNumber', required: true },
          { name: 'lossDate', required: true },
          { name: 'lossLocation', required: true }
        ];
      }
    } else if (service.id === 'civilRegistry') {
      currentFields = [
        { name: 'recordType', required: true },
        { name: 'relationToApplicant', required: true }
      ];
    } else if (service.id === 'powerOfAttorney') {
      currentFields = [
        { name: 'poaType', required: true },
        { name: 'principalName', required: true },
        { name: 'principalId', required: true, pattern: /^\d{10,11}$/ },
        { name: 'agentName', required: true },
        { name: 'agentId', required: true, pattern: /^\d{10,11}$/ },
        { name: 'poaScope', required: true }
      ];
    } else if (service.id === 'attestations') {
      currentFields = [
        { name: 'docType', required: true },
        { name: 'docTitle', required: true },
        { name: 'issuingAuthority', required: true },
        { name: 'files', required: true }
      ];
    } else if (service.id === 'endorsements') {
      currentFields = [
        { name: 'endorseType', required: true },
        { name: 'purpose', required: true }
      ];
    } else if (service.id === 'familyAffairs') {
      currentFields = [
        { name: 'serviceType', required: true },
        { name: 'applicantType', required: true },
        { name: 'nationality', required: true },
        { name: 'religion', required: true },
        { name: 'passportNumber', required: true },
        { name: 'passportExpiry', required: true },
        { name: 'maritalStatus', required: true },
        { name: 'placeOfBirth', required: true },
        { name: 'relationToCase', required: true }
      ];
    } else if (service.id === 'visas') {
      currentFields = [
        { name: 'visitType', required: true },
        { name: 'passportNo', required: true, pattern: /^[A-Z0-9]{7,9}$/ },
        { name: 'passportExpiry', required: true },
        { name: 'visitDuration', required: true }
      ];
    }
    return validateFields(currentFields);
  };

  const shouldShowStep = (step) => {
    if (currentStep === 0) return true;
    if (step.id === 'poa-subtype-selection') {
      return formData.poaType && formData.poaType !== '';
    }
    for (let i = 0; i < currentStep; i++) {
      const prevStep = service.steps[i];
      if (!prevStep) continue;
      const hasUnfilledRequired = prevStep.fields.some(field => {
        if (!field.required) return false;
        const value = formData[field.name];
        return !value || (Array.isArray(value) && value.length === 0);
      });
      if (hasUnfilledRequired) return false;
    }
    return true;
  };

  const canProceedToNext = () => {
    const currentStepConfig = service.steps[currentStep];
    if (!currentStepConfig) return true;

    if (currentStepConfig.id === 'poa-type-selection') {
      return formData.poaType && formData.poaType !== '';
    }
    if (currentStepConfig.id === 'poa-subtype-selection') {
      return formData.poaSubtype && formData.poaSubtype !== '';
    }

    return currentStepConfig.fields.every(field => {
      if (field.conditional) {
        const show = typeof field.conditional === 'function'
          ? field.conditional(formData)
          : passesConditional(field, formData);
        if (!show) return true;
      }
      if (!field.required) return true;
      const value = formData[field.name];
      return value && (!Array.isArray(value) || value.length > 0);
    });
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        const newSteps = [...steps];
        if (newSteps[currentStep + 1]) newSteps[currentStep + 1].completed = true;
      } else {
        setShowReview(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSaveDraft = () => {
    const saved = saveDraft(service.id, formData);
    if (saved) alert('تم حفظ المسودة بنجاح');
  };

  const handlePrint = () => window.print();

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);

    try {
      // If onSubmit prop is provided, use it (for ServicePage integration)
      if (onSubmit) {
        await onSubmit(formData);
        setIsSubmitting(false);
        return;
      }

      // Otherwise, use default submission logic
      const applicationData = {
        serviceId: service.id,
        serviceTitle: service.title,
        formData,
        submissionDate: new Date().toISOString()
      };
      const result = await submitApplication(applicationData);
      if (result.success) {
        localStorage.removeItem('consular_service_draft');
        navigate('/success', {
          state: {
            referenceNumber: result.data.referenceNumber,
            serviceTitle: service.title
          }
        });
      } else {
        alert(result.error || 'حدث خطأ في الإرسال');
      }
    } catch (error) {
      alert('حدث خطأ في النظام');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    // حساب الخطوة الفعلية (مع مراعاة skipPersonalStep)
    const actualStep = skipPersonalStep ? currentStep + 1 : currentStep;

    switch (actualStep) {
      case 0:
        // بيانات المتقدم الموحدة
        return (
          <div>
            <div className="mb-6 text-center">
              <button
                type="button"
                onClick={fillTestData}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse mx-auto shadow-sm"
              >
                <span>⚡</span>
                <span>ملء البيانات الشخصية التجريبية</span>
              </button>
              <p className="text-xs text-gray-500 mt-2">ملء تلقائي للبيانات الشخصية للتجربة السريعة</p>
            </div>

            <FormStep
              title="بيانات المتقدم"
              fields={[
                { name: 'fullName', label: 'الاسم الرباعي حسب جواز السفر', type: 'text', required: true, validation: { required: 'الاسم الرباعي مطلوب' } },
                { name: 'nationalId', label: 'رقم الجواز', type: 'text', required: true, validation: { required: 'رقم الجواز مطلوب' } },
                { name: 'phoneNumber', label: 'رقم الجوال', type: 'tel', pattern: /^(05|5)\d{8}$/, required: true, help: '+966 - رقم سعودي يبدأ بـ 05', prefix: '+966', validation: { required: 'رقم الجوال مطلوب', pattern: 'رقم الجوال غير صحيح' } },
                { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true, pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', help: 'يجب إدخال الإيميل بالأحرف الإنجليزية فقط', validation: { required: 'البريد الإلكتروني مطلوب' } },
                { name: 'isAdult', label: 'هل المتقدم أكثر من 18 سنة؟', type: 'radio', options: [{ value: 'yes', label: 'نعم' }, { value: 'no', label: 'لا' }], required: true, validation: { required: 'يرجى تحديد ما إذا كان المتقدم أكثر من 18 سنة' } },
                { name: 'dob', label: 'تاريخ الميلاد', type: 'date', required: true, className: 'md:col-span-2', validation: { required: 'تاريخ الميلاد مطلوب' } },
                { name: 'profession', label: 'المهنة', type: 'text', className: 'md:col-span-1', required: true, validation: { required: 'المهنة مطلوبة' } },
                { name: 'region', label: 'المنطقة', type: 'searchable-select', options: getRegionsList(), required: true, validation: { required: 'المنطقة مطلوبة' } },
                { name: 'city', label: 'المدينة', type: 'searchable-select', options: availableCities, required: true, validation: { required: 'المدينة مطلوبة' } },
                { name: 'district', label: 'الحي', type: 'searchable-select', options: availableDistricts, required: true, validation: { required: 'الحي مطلوب' } },
                { name: 'address', label: 'العنوان / أقرب معلم', type: 'textarea', required: true, rows: 3, validation: { required: 'العنوان / أقرب معلم مطلوب' } },
                { name: 'workplace', label: 'مكان العمل', type: 'text', className: 'md:col-span-2', required: true, validation: { required: 'مكان العمل مطلوب' } }
              ]}
              serviceId={service.id}
              formData={formData}
              errors={errors}
              onChange={handleFieldChange}
            />
          </div>
        );
      case 1:
        return (
          <div>
            <div className="mb-6 text-center">
              <button
                type="button"
                onClick={fillServiceTestData}
                className="bg-green-100 hover:bg-green-200 text-green-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse mx-auto shadow-sm"
              >
                <span>⚡</span>
                <span>ملء بيانات الخدمة التجريبية</span>
              </button>
              <p className="text-xs text-gray-500 mt-2">ملء تلقائي لبيانات {service.title} للتجربة السريعة</p>
            </div>
            {renderServiceSpecificFields()}
          </div>
        );
      case 2:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderServiceSpecificFields = () => {
    // Check if we have database fields first
    const hasDBFields = dbFields && dbFields.length > 0;
    const hasDBDocuments = dbDocuments && dbDocuments.length > 0;

    // If we have database data, render it using the database fields
    if (hasDBFields || hasDBDocuments) {
      const visibleFields = getVisibleItems(dbFields || [], formData);
      const visibleDocuments = getVisibleItems(dbDocuments || [], formData);

      console.log('🟢🟢🟢 [DynamicForm - DB Data] Rendering with:', {
        dbDocumentsTotal: (dbDocuments || []).length,
        visibleDocumentsCount: visibleDocuments.length,
        visibleDocumentsNames: visibleDocuments.map(d => d.document_name_ar),
        dbFieldsTotal: (dbFields || []).length,
        visibleFieldsCount: visibleFields.length,
        formData_isAdult: formData.isAdult,
        formData_passportType: formData.passportType
      });

      if (visibleFields.length === 0 && visibleDocuments.length === 0) {
        console.log('🔴🔴🔴 [DynamicForm] Showing "no details" message');
        return (
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد تفاصيل إضافية</h3>
            <p className="text-gray-600">هذه الخدمة تتطلب البيانات الأساسية فقط</p>
          </div>
        );
      }

      return (
        <div className="space-y-8">
          {visibleFields.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">تفاصيل الخدمة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {visibleFields.map(field => {
                  const FieldComponent = fieldComponents[field.field_type];
                  if (!FieldComponent) return null;

                  return (
                    <div key={field.id} className={field.field_type === 'textarea' ? 'md:col-span-2' : ''}>
                      <FieldComponent
                        field={{
                          ...field,
                          name: field.field_name,
                          label: field.label_ar,
                          placeholder: field.placeholder_ar,
                          help: field.help_text_ar,
                          required: field.is_required,
                          subfields: field.subfields
                        }}
                        name={field.field_name}
                        label={field.label_ar}
                        placeholder={field.placeholder_ar}
                        help={field.help_text_ar}
                        options={field.options}
                        required={field.is_required}
                        value={formData[field.field_name]}
                        onChange={(value) => handleInputChange(field.field_name, value)}
                        error={errors[field.field_name]}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {visibleDocuments.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#276073]" />
                المستندات المطلوبة
              </h3>
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-base font-bold text-amber-900 mb-2">
                      يرجى رفع جميع المستندات المطلوبة
                    </p>
                    <p className="text-sm text-amber-800">
                      تأكد من وضوح الصور والمستندات، والصيغ المقبولة: PDF, JPG, JPEG, PNG
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {visibleDocuments.map(doc => (
                  <div key={doc.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#276073] transition-colors duration-200">
                    <div className="mb-4">
                      <div className="flex items-start gap-3 mb-2">
                        {doc.is_required ? (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            إلزامي
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                            اختياري
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{doc.document_name_ar}</h4>
                      {doc.description_ar && (
                        <p className="text-sm text-gray-600 mb-2">{doc.description_ar}</p>
                      )}
                      {doc.accepted_formats && (
                        <p className="text-xs text-gray-500">
                          الصيغ المقبولة: {doc.accepted_formats.join(', ').toUpperCase()}
                        </p>
                      )}
                    </div>
                    <FileField
                      field={{
                        name: `document_${doc.id}`,
                        label: '',
                        required: doc.is_required,
                        accept: doc.accepted_formats ? doc.accepted_formats.map(f => `.${f}`).join(',') : '.pdf,.jpg,.jpeg,.png'
                      }}
                      name={`document_${doc.id}`}
                      required={doc.is_required}
                      value={formData[`document_${doc.id}`]}
                      onChange={(value) => handleInputChange(`document_${doc.id}`, value)}
                      error={errors[`document_${doc.id}`]}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Fallback to config-based rendering
    if (service?.steps?.length) {
      const serviceSteps = service.steps.filter(step => {
        // استبعاد الخطوات الإدارية
        const excludedSteps = ['acknowledgment', 'witnesses', 'documents'];
        if (excludedSteps.includes(step.id)) return false;

        // تحقق من الشروط
        if (step.conditional && !passesConditional(step, formData)) {
          return false;
        }

        return true;
      });

      if (serviceSteps.length === 0) {
        return (
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد تفاصيل إضافية</h3>
            <p className="text-gray-600">هذه الخدمة تتطلب البيانات الأساسية فقط</p>
          </div>
        );
      }

      // خطوات الشهود والمستندات والإقرار
      const witnessesStep = service.steps.find(s => s.id === 'witnesses');
      const documentsStep = service.steps.find(s => s.id === 'documents');
      const acknowledgmentStep = service.steps.find(s => s.id === 'acknowledgment');

      return (
        <div className="space-y-8">
          {serviceSteps.map((step, index) => {
            const fields = (step.fields || []).filter(f => passesConditional(f, formData));
            if (fields.length === 0) return null;

            return (
              <div key={step.id || index}>
                {step.title && <h3 className="text-xl font-bold text-gray-900 mb-6">{step.title}</h3>}
                <FormStep
                  fields={fields}
                  serviceId={service.id}
                  service={service}
                  formData={formData}
                  errors={errors}
                  onChange={(field, value) => {
                    handleInputChange(field, value);
                    if (field === 'poaSubtype') {
                      handlePOASubtypeChange(value);
                    }
                    if (field === 'declarationSubtype' && service.id === 'declarations') {
                      loadConditionalFields(formData.declarationType, value);
                    }
                  }}
                />
              </div>
            );
          })}

          {/* خطوة الشهود */}
          {witnessesStep && passesConditional(witnessesStep, formData) && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">{witnessesStep.title}</h3>
              <FormStep
                fields={(witnessesStep.fields || []).filter(f => passesConditional(f, formData))}
                serviceId={service.id}
                formData={formData}
                errors={errors}
                onChange={handleFieldChange}
              />
            </div>
          )}

          {/* خطوة المستندات */}
          {documentsStep && passesConditional(documentsStep, formData) && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">{documentsStep.title}</h3>
              <div className="space-y-6">
                {(documentsStep.fields || []).filter(f => passesConditional(f, formData)).map((field, index) => (
                  <div key={field.name} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3 rtl:space-x-reverse mb-4">
                      <div className="w-8 h-8 bg-[#276073] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {field.label}
                          {field.required && <span className="text-red-500 mr-1">*</span>}
                        </h4>
                        {field.description && <p className="text-sm text-gray-600 mb-3">{field.description}</p>}
                        {field.help && <p className="text-xs text-blue-600 mb-3">💡 {field.help}</p>}
                      </div>
                    </div>
                    <FormStep
                      fields={[field]}
                      serviceId={service.id}
                      formData={formData}
                      errors={errors}
                      onChange={handleFieldChange}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* خطوة الإقرار */}
          {acknowledgmentStep && passesConditional(acknowledgmentStep, formData) && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">{acknowledgmentStep.title}</h3>
              <FormStep
                fields={(acknowledgmentStep.fields || []).filter(f => passesConditional(f, formData))}
                serviceId={service.id}
                formData={formData}
                errors={errors}
                onChange={handleFieldChange}
              />
            </div>
          )}
        </div>
      );
    }

    // فولباك للخدمات القديمة
    const detailsFields = getServiceDetailsFields();
    const documentFields = getDocumentFields();

    if (detailsFields.length === 0 && documentFields.length === 0) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد تفاصيل إضافية</h3>
          <p className="text-gray-600">هذه الخدمة تتطلب البيانات الأساسية فقط</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Service Specific Details */}
        {detailsFields.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">تفاصيل الخدمة</h3>
            <FormStep
              fields={detailsFields}
              serviceId={service.id}
              formData={formData}
              errors={errors}
              onChange={(field, value) => {
                handleInputChange(field, value);
                if (field === 'poaSubtype') {
                  handlePOASubtypeChange(value);
                }
                if (field === 'declarationSubtype' && service.id === 'declarations') {
                  loadConditionalFields(formData.declarationType, value);
                }
              }}
            />
          </div>
        )}

        {/* Service-specific conditional fields (من JSON خارجي للتوكيلات) */}
        {((formData.poaType && formData.poaSubtype) || (formData.declarationType && formData.declarationSubtype)) ? (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-lg font-bold text-blue-800 mb-4">بيانات الخدمة المحددة</h4>
            {loadingConditional && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                <span className="text-blue-700">جاري تحميل الحقول...</span>
              </div>
            )}
            {conditionalError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2 rtl:space-x-reverse">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{conditionalError}</span>
              </div>
            )}
            {!loadingConditional && !conditionalError && conditionalFields.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormStep
                  fields={conditionalFields}
                  formData={formData}
                  errors={errors}
                  onChange={handleFieldChange}
                  serviceId={service.id}
                />
              </motion.div>
            )}
            {!loadingConditional && !conditionalError && conditionalFields.length === 0 && (formData.poaSubtype || formData.declarationSubtype) && (
              <p className="text-blue-600 text-center py-4">لا توجد حقول إضافية مطلوبة لهذا النوع</p>
            )}
          </div>
        ) : null}

        {/* Documents Upload Section */}
        {documentFields.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">المستندات المطلوبة</h3>
            <div className="space-y-6">
              {documentFields.map((field, index) => (
                <div key={field.name} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3 rtl:space-x-reverse mb-4">
                    <div className="w-8 h-8 bg-[#276073] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-500 mr-1">*</span>}
                      </h4>
                      {field.description && <p className="text-sm text-gray-600 mb-3">{field.description}</p>}
                      {field.help && <p className="text-xs text-blue-600 mb-3">💡 {field.help}</p>}
                    </div>
                  </div>
                  <FormStep
                    fields={[field]}
                    serviceId={service.id}
                    formData={formData}
                    errors={errors}
                    onChange={handleFieldChange}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============== توجيه مصادر الحقول ==============

  const getServiceDetailsFields = () => {
    // 1) من ملف الإعدادات إن وجد
    if (service?.steps?.length) {
      const fields =
        getFieldsFromConfigStep([
          'poa-details',
          'details',
          'passport-details',
          'service-details'
        ]) || [];
      if (fields.length) return fields;
    }

    // 2) فولباك لمنطقك القديم
    return getServiceDetailsFieldsFallback();
  };

  const getDocumentFields = () => {
    // 1) من ملف الإعدادات إن وجد
    if (service?.steps?.length) {
      const fields =
        getFieldsFromConfigStep(['documents-upload', 'documents', 'attachments']) || [];
      if (fields.length) return fields;
    }

    // 2) فولباك لمنطقك القديم
    return getDocumentFieldsFallback();
  };

  // ============== فولباك المنطق القديم كما هو ==============

  const getServiceDetailsFieldsFallback = () => {
    if (service.id === 'declarations') {
      return [
        {
          name: 'declarationType',
          label: 'نوع الإقرار الرئيسي',
          type: 'searchable-select',
          options: [
            { value: 'regular', label: 'إقرار', description: 'إقرارات عادية لمختلف الأغراض' },
            { value: 'sworn', label: 'إقرار مشفوع باليمين', description: 'إقرارات مشفوعة باليمين للأغراض القانونية' }
          ],
          required: true,
          validation: { required: 'نوع الإقرار مطلوب' }
        },
        ...(formData.declarationType ? [{
          name: 'declarationSubtype',
          label: 'التفاصيل المحددة',
          type: 'searchable-select',
          options: [], // Will be populated dynamically
          required: true,
          validation: { required: 'يرجى اختيار تفاصيل الإقرار' }
        }] : [])
      ];
    }
    if (service.id === 'powerOfAttorney') {
      return [
        {
          name: 'poaType',
          label: 'نوع التوكيل الرئيسي',
          type: 'radio',
          options: [
            { value: 'general', label: 'توكيل عام', description: 'للمعاملات العامة والإجراءات المختلفة' },
            { value: 'courts', label: 'محاكم وقضايا ودعاوي', description: 'للمرافعات والقضايا القانونية' },
            { value: 'inheritance', label: 'الورثة', description: 'لشؤون التركات والورثة' },
            { value: 'real_estate', label: 'عقارات وأراضي', description: 'للمعاملات العقارية' },
            { value: 'vehicles', label: 'سيارات', description: 'لمعاملات السيارات والمركبات' },
            { value: 'companies', label: 'الشركات', description: 'للمعاملات التجارية' },
            { value: 'marriage_divorce', label: 'إجراءات الزواج والطلاق', description: 'لشؤون الأحوال الشخصية' },
            { value: 'birth_certificates', label: 'شهادات ميلاد', description: 'لاستلام شهادات الميلاد' },
            { value: 'educational', label: 'شهادة دراسية', description: 'للشهادات التعليمية' }
          ],
          required: true,
          validation: { required: 'يرجى اختيار نوع التوكيل' }
        },
        ...(formData.poaType && poaSubtypes[formData.poaType] ? [{
          name: 'poaSubtype',
          label: `تفاصيل ${getPoaTypeLabel(formData.poaType)}`,
          type: 'searchable-select',
          options: poaSubtypes[formData.poaType] || [],
          required: true,
          validation: { required: 'يرجى اختيار التفاصيل المحددة' }
        }] : []),
        { name: 'principalName', label: 'اسم الموكل (رباعي)', type: 'text', required: true, validation: { required: 'اسم الموكل مطلوب' } },
        { name: 'principalId', label: 'رقم هوية الموكل', type: 'text', pattern: /^\d{10,11}$/, required: true, validation: { required: 'رقم هوية الموكل مطلوب', pattern: 'رقم الهوية غير صحيح' } },
        { name: 'passportNumber', label: 'رقم الجواز', type: 'text', required: true, validation: { required: 'رقم الجواز مطلوب' } },
        { name: 'poaScope', label: 'الغرض من التوكيل', type: 'textarea', required: true, rows: 4, className: 'md:col-span-2', help: 'حدد بوضوح الصلاحيات الممنوحة للوكيل', validation: { required: 'الغرض من التوكيل مطلوب' } },
        { name: 'agentName', label: 'اسم الوكيل (رباعي)', type: 'text', required: true, validation: { required: 'اسم الوكيل مطلوب' } },
        { name: 'agentId', label: 'رقم هوية الوكيل', type: 'text', pattern: /^\d{10,11}$/, required: true, validation: { required: 'رقم هوية الوكيل مطلوب', pattern: 'رقم الهوية غير صحيح' } }
      ];
    } else if (service.id === 'general' || service.id === 'educational') {
      // For general and educational POA, use the service config directly
      const detailsStep = service.steps?.find(step =>
        step.id === 'general-details' || step.id === 'service-details'
      );
      return detailsStep?.fields || [];
    }
    return [];
  };

  const getDocumentFieldsFallback = () => {
    if (service.id === 'passports' || service.id === 'general' || service.id === 'educational') {
      // Use service config for document fields
      const docsStep = service.steps?.find(step =>
        step.id === 'documents-upload' || step.id === 'documents'
      );
      return docsStep?.fields || [];
    } else if (service.id === 'passports') {
      const fields = [
        {
          name: 'nationalIdCopy',
          label: 'نسخة من الجواز',
          description: 'صورة واضحة من جواز السفر (الصفحة الأولى)',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          help: 'تأكد من وضوح جميع البيانات في الصورة',
          validation: { required: 'نسخة الجواز مطلوبة' }
        }
      ];
      return fields;
    }
    return [];
  };

  const getPoaTypeLabel = (poaType) => {
    const typeLabels = {
      general: 'التوكيل العام',
      courts: 'المحاكم والقضايا',
      inheritance: 'الورثة',
      real_estate: 'العقارات والأراضي',
      vehicles: 'السيارات',
      companies: 'الشركات',
      marriage_divorce: 'الزواج والطلاق',
      birth_certificates: 'شهادات الميلاد',
      educational: 'الشهادات التعليمية'
    };
    return typeLabels[poaType] || 'غير محدد';
  };

  const renderReviewStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          مراجعة البيانات
        </h3>

        {/* بيانات المتقدم */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">بيانات المتقدم</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-b border-gray-200 pb-2">
              <dt className="text-sm font-medium text-gray-600">الاسم الرباعي</dt>
              <dd className="text-sm text-gray-900">{formData.fullName || '-'}</dd>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <dt className="text-sm font-medium text-gray-600">رقم الجواز</dt>
              <dd className="text-sm text-gray-900">{formData.nationalId || '-'}</dd>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <dt className="text-sm font-medium text-gray-600">رقم الجوال</dt>
              <dd className="text-sm text-gray-900">{formData.phoneNumber || '-'}</dd>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <dt className="text-sm font-medium text-gray-600">البريد الإلكتروني</dt>
              <dd className="text-sm text-gray-900">{formData.email || '-'}</dd>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <dt className="text-sm font-medium text-gray-600">المنطقة</dt>
              <dd className="text-sm text-gray-900">
                {getRegionsList().find(r => r.value === formData.region)?.label || '-'}
              </dd>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <dt className="text-sm font-medium text-gray-600">المدينة</dt>
              <dd className="text-sm text-gray-900">{formData.city || '-'}</dd>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <dt className="text-sm font-medium text-gray-600">الحي</dt>
              <dd className="text-sm text-gray-900">{formData.district || '-'}</dd>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <dt className="text-sm font-medium text-gray-600">المهنة</dt>
              <dd className="text-sm text-gray-900">{formData.profession || '-'}</dd>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <dt className="text-sm font-medium text-gray-600">محل العمل</dt>
              <dd className="text-sm text-gray-900">{formData.workplace || '-'}</dd>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <dt className="text-sm font-medium text-gray-600">العنوان</dt>
              <dd className="text-sm text-gray-900">{formData.address || '-'}</dd>
            </div>
          </div>
        </div>

        {/* خطأ تناسق السن */}
        {errors.ageConsistency && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">خطأ في البيانات</span>
            </div>
            <p className="text-red-600 text-sm mt-2">
              {errors.ageConsistency[0]}
            </p>
          </div>
        )}

        {/* تفاصيل الخدمة */}
        {Object.keys(formData).some(key => !['fullName', 'nationalId', 'phoneNumber', 'email', 'dob', 'isAdult', 'region', 'city', 'district', 'address', 'profession', 'workplace'].includes(key)) && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">تفاصيل الخدمة</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData)
                .filter(([key]) => !['fullName', 'nationalId', 'phoneNumber', 'email', 'dob', 'isAdult', 'region', 'city', 'district', 'address', 'profession', 'workplace'].includes(key))
                .map(([key, value]) => (
                <div key={key} className="border-b border-gray-200 pb-2">
                  <dt className="text-sm font-medium text-gray-600">{key}</dt>
                  <dd className="text-sm text-gray-900">
                    {Array.isArray(value) ? value.length + ' ملف' : String(value)}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* الشروط والأحكام */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">الشروط والأحكام</h4>
          <div className="space-y-4">
            <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg border transition-all ${
              termsAccepted.dataAccuracy
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}>
              <input
                type="checkbox"
                checked={termsAccepted.dataAccuracy}
                onChange={(e) => setTermsAccepted(prev => ({ ...prev, dataAccuracy: e.target.checked }))}
                className="w-5 h-5 text-green-600 border-2 border-gray-400 rounded cursor-pointer flex-shrink-0"
              />
              <span className="text-gray-800 text-base flex-1 text-right">
                أقر بأن جميع البيانات المدخلة صحيحة ودقيقة
              </span>
            </label>
            <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg border transition-all ${
              termsAccepted.termsAndConditions
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}>
              <input
                type="checkbox"
                checked={termsAccepted.termsAndConditions}
                onChange={(e) => setTermsAccepted(prev => ({ ...prev, termsAndConditions: e.target.checked }))}
                className="w-5 h-5 text-green-600 border-2 border-gray-400 rounded cursor-pointer flex-shrink-0"
              />
              <span className="text-gray-800 text-base flex-1 text-right">
                أوافق على الشروط والأحكام الخاصة بالخدمة
              </span>
            </label>
            <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg border transition-all ${
              termsAccepted.communicationConsent
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}>
              <input
                type="checkbox"
                checked={termsAccepted.communicationConsent}
                onChange={(e) => setTermsAccepted(prev => ({ ...prev, communicationConsent: e.target.checked }))}
                className="w-5 h-5 text-green-600 border-2 border-gray-400 rounded cursor-pointer flex-shrink-0"
              />
              <span className="text-gray-800 text-base flex-1 text-right">
                أوافق على التواصل معي عبر البريد الإلكتروني أو الهاتف لمتابعة الطلب
              </span>
            </label>
          </div>

          {!Object.values(termsAccepted).every(v => v === true) && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800 mb-1">
                    تنبيه هام
                  </p>
                  <p className="text-sm text-yellow-700">
                    لن تتمكن من إرسال الطلب إلا بعد الموافقة على جميع الشروط والأحكام أعلاه. يرجى قراءة كل شرط بعناية والتأشير عليه.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Show loading state while fetching database data
  if (dbLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-[#276073] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل بيانات الخدمة...</p>
        </div>
      </div>
    );
  }

  // Show error state if database fetch failed
  if (dbError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col items-center justify-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-red-600 text-lg mb-2">حدث خطأ في تحميل بيانات الخدمة</p>
          <p className="text-gray-600">{dbError?.message || 'يرجى المحاولة مرة أخرى'}</p>
        </div>
      </div>
    );
  }

  // Validate that we have service configuration with steps
  const activeService = dbService || service;
  if (!activeService || !activeService.steps || activeService.steps.length === 0) {
    console.error('[DynamicForm] Invalid service configuration:', { activeService, dbService, service });
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col items-center justify-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
          <p className="text-amber-600 text-lg mb-2">تكوين الخدمة غير صحيح</p>
          <p className="text-gray-600">لا يمكن عرض النموذج لأن بيانات الخدمة غير مكتملة</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-[#276073] text-white rounded-lg hover:bg-[#1e4a59]"
          >
            العودة للخلف
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar - Hidden on mobile and tablet, visible on desktop */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="space-y-6 sticky top-6">
            <SidebarSummary
              service={mergedService}
              formData={formData}
              pricingRules={dbPricingRules || service?.pricingRules || []}
              requirements={dbRequirements && dbRequirements.length > 0 ? dbRequirements : service?.requirements || []}
            />
            {((dbDocuments && dbDocuments.length > 0) || (service?.documents && service.documents.length > 0)) && (
              <ConditionalDocuments
                documents={dbDocuments && dbDocuments.length > 0 ? dbDocuments : service?.documents || []}
                formValues={formData}
              />
            )}
          </div>
        </div>

        {/* Main Form - Full width on mobile/tablet, 3 columns on desktop */}
        <div className="lg:col-span-3 w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Progress Steps */}
            <div className="border-b border-gray-200 p-6">
              <ProgressSteps steps={steps} currentStep={currentStep} />
            </div>

            {/* Form Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Form Actions */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                {/* Left Actions */}
                <div className="flex space-x-4 rtl:space-x-reverse">
                  <button
                    onClick={handleSaveDraft}
                    className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ كمسودة</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة</span>
                  </button>
                </div>

                {/* Navigation */}
                <div className="flex space-x-4 rtl:space-x-reverse">
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrevious}
                      className="flex items-center space-x-2 rtl:space-x-reverse bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                    >
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      <span>السابق</span>
                    </button>
                  )}

                  {currentStep < steps.length - 1 ? (
                    <button
                      onClick={handleNext}
                      className="flex items-center space-x-2 rtl:space-x-reverse bg-[#276073] hover:bg-[#1e4a5a] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                    >
                      <span>التالي</span>
                      <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !Object.values(termsAccepted).every(v => v === true)}
                      className={`flex items-center space-x-2 rtl:space-x-reverse px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                        isSubmitting || !Object.values(termsAccepted).every(v => v === true)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                      title={!Object.values(termsAccepted).every(v => v === true) ? 'يجب الموافقة على جميع الشروط والأحكام أولاً' : ''}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>جاري الإرسال...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>إرسال الطلب</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicForm;