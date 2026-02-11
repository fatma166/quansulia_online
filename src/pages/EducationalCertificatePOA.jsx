import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronRight, 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Users,
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Camera, 
  Stamp,
  PenTool,
  Clock,
  Building,
  Star,
  Send,
  Download,
  Printer as Print,
  X
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProgressSteps from '../components/ProgressSteps';
import FormStep from '../components/FormStep';
import SidebarSummary from '../components/SidebarSummary';

const EducationalCertificatePOA = () => {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const breadcrumbs = [
    { label: 'الرئيسية', href: '/' },
    { label: 'الخدمات', href: '/services' },
    { label: 'التوكيلات', href: '/services' },
    { label: 'توكيل شهادة دراسية', href: '/services/poa/educational' }
  ];

  // Service configuration for Educational Certificate POA
  const service = {
    id: 'educational_poa',
    title: 'توكيل شهادة دراسية',
    description: 'توكيل لاستلام الشهادات الدراسية والوثائق التعليمية',
    icon: 'GraduationCap',
    category: 'legal',
    requirements: [
      'صورة من الرقم الوطني للموكل',
      'صورة من هوية الوكيل',
      'تحديد نوع الشهادة المطلوبة',
      'تحديد جهة الإصدار',
      'حضور الموكل شخصياً أو إقرار خطي'
    ],
    fees: 'حسب التعرفة المعتمدة',
    duration: '1-2 يوم عمل',
    steps: [
      {
        id: 'personal-info',
        title: 'بيانات مقدم الطلب',
        fields: [
          {
            name: 'applicantType',
            label: 'نوع المتقدم',
            type: 'radio',
            options: [
              { value: 'husband', label: 'زوج' },
              { value: 'wife', label: 'زوجة' },
              { value: 'guardian', label: 'ولي' },
              { value: 'proxy', label: 'وكيل' }
            ],
            required: true,
            validation: { required: 'يرجى تحديد نوع المتقدم' }
          },
          {
            name: 'nationality',
            label: 'الجنسية',
            type: 'select',
            options: [
              { value: 'sudanese', label: 'سودانية' },
              { value: 'saudi', label: 'سعودية' },
              { value: 'egyptian', label: 'مصرية' },
              { value: 'other', label: 'أخرى' }
            ],
            required: true,
            validation: { required: 'الجنسية مطلوبة' }
          },
          {
            name: 'religion',
            label: 'الديانة',
            type: 'select',
            options: [
              { value: 'islam', label: 'الإسلام' },
              { value: 'christianity', label: 'المسيحية' },
              { value: 'other', label: 'أخرى' }
            ],
            required: true,
            validation: { required: 'الديانة مطلوبة' }
          },
          {
            name: 'passportNumber',
            label: 'رقم الجواز',
            type: 'text',
            required: true,
            validation: { required: 'رقم الجواز مطلوب' }
          },
          {
            name: 'passportExpiry',
            label: 'تاريخ انتهاء الجواز',
            type: 'date',
            required: true,
            validation: { required: 'تاريخ انتهاء الجواز مطلوب' }
          },
          {
            name: 'residencyId',
            label: 'رقم الإقامة',
            type: 'text',
            required: false,
            help: 'اختياري - للمقيمين في السعودية'
          },
          {
            name: 'maritalStatus',
            label: 'الحالة الاجتماعية',
            type: 'select',
            options: [
              { value: 'single', label: 'أعزب/عزباء' },
              { value: 'married', label: 'متزوج/متزوجة' },
              { value: 'divorced', label: 'مطلق/مطلقة' },
              { value: 'widowed', label: 'أرمل/أرملة' }
            ],
            required: true,
            validation: { required: 'الحالة الاجتماعية مطلوبة' }
          },
          {
            name: 'placeOfBirth',
            label: 'مكان الميلاد',
            type: 'text',
            required: true,
            validation: { required: 'مكان الميلاد مطلوب' }
          },
          {
            name: 'relationToCase',
            label: 'صلة القرابة بالواقعة',
            type: 'select',
            options: [
              { value: 'direct', label: 'طرف مباشر' },
              { value: 'guardian', label: 'ولي أمر' },
              { value: 'proxy', label: 'وكيل' },
              { value: 'relative', label: 'قريب' }
            ],
            required: true,
            validation: { required: 'صلة القرابة بالواقعة مطلوبة' }
          }
        ]
      },
      {
        id: 'student-info',
        title: 'بيانات الطالب',
        fields: [
          {
            name: 'studentFullName',
            label: 'الاسم الرباعي للطالب (عربي)',
            type: 'text',
            required: true,
            validation: { required: 'اسم الطالب مطلوب' }
          },
          {
            name: 'studentFullNameEn',
            label: 'الاسم الرباعي للطالب (إنجليزي)',
            type: 'text',
            required: true,
            validation: { required: 'الاسم الإنجليزي للطالب مطلوب' }
          },
          {
            name: 'studentNationalId',
            label: 'الرقم الوطني للطالب',
            type: 'text',
            required: true,
            validation: { required: 'الرقم الوطني للطالب مطلوب' }
          },
          {
            name: 'studentDateOfBirth',
            label: 'تاريخ ميلاد الطالب',
            type: 'date',
            required: true,
            validation: { required: 'تاريخ ميلاد الطالب مطلوب' }
          },
          {
            name: 'phone',
            label: 'رقم الهاتف',
            type: 'tel',
            required: true,
            validation: { required: 'رقم الهاتف مطلوب' }
          },
          {
            name: 'email',
            label: 'البريد الإلكتروني',
            type: 'email',
            required: true,
            validation: { required: 'البريد الإلكتروني مطلوب' }
          }
        ]
      },
      {
        id: 'agent-info',
        title: 'بيانات الوكيل',
        fields: [
          {
            name: 'agentName',
            label: 'اسم الوكيل (عربي)',
            type: 'text',
            required: true,
            validation: { required: 'اسم الوكيل مطلوب' }
          },
          {
            name: 'agentNameEn',
            label: 'اسم الوكيل (إنجليزي)',
            type: 'text',
            required: false
          },
          {
            name: 'agentNationalId',
            label: 'رقم هوية الوكيل',
            type: 'text',
            required: true,
            validation: { required: 'رقم هوية الوكيل مطلوب' }
          },
          {
            name: 'agentPhone',
            label: 'رقم هاتف الوكيل',
            type: 'tel',
            required: false
          },
          {
            name: 'agentRelation',
            label: 'صلة القرابة',
            type: 'select',
            options: [
              { value: 'father', label: 'والد' },
              { value: 'mother', label: 'والدة' },
              { value: 'brother', label: 'أخ' },
              { value: 'sister', label: 'أخت' },
              { value: 'spouse', label: 'زوج/زوجة' },
              { value: 'friend', label: 'صديق' },
              { value: 'other', label: 'أخرى' }
            ],
            required: true,
            validation: { required: 'صلة القرابة مطلوبة' }
          }
        ]
      },
      {
        id: 'service-details',
        title: 'تفاصيل الخدمة',
        fields: [
          {
            name: 'certificateType',
            label: 'نوع الشهادة المطلوبة',
            type: 'radio',
            options: [
              { 
                value: 'primary', 
                label: 'الشهادة الابتدائية',
                description: 'Primary Certificate'
              },
              { 
                value: 'intermediate', 
                label: 'الشهادة المتوسطة',
                description: 'Intermediate Certificate'
              },
              { 
                value: 'secondary', 
                label: 'الشهادة الثانوية',
                description: 'Secondary Certificate'
              }
            ],
            required: true,
            validation: { required: 'نوع الشهادة مطلوب' }
          },
          {
            name: 'issuingAuthority',
            label: 'جهة الإصدار',
            type: 'select',
            options: [
              { value: 'ministry_education', label: 'وزارة التربية والتعليم السودانية' },
              { value: 'exam_administration', label: 'الإدارة العامة للامتحانات' },
              { value: 'university', label: 'الجامعة' },
              { value: 'other', label: 'أخرى' }
            ],
            required: true,
            validation: { required: 'جهة الإصدار مطلوبة' }
          },
          {
            name: 'additionalDetails',
            label: 'تفاصيل إضافية',
            type: 'textarea',
            required: false,
            rows: 4,
            className: 'md:col-span-2',
            help: 'أي تفاصيل إضافية أو ملاحظات خاصة بالطلب'
          }
        ]
      },
      {
        id: 'documents-upload',
        title: 'المستندات المطلوبة',
        fields: [
          {
            name: 'nationalIdCopy',
            label: 'صورة الرقم الوطني للموكل',
            type: 'file',
            accept: '.pdf,.jpg,.jpeg,.png',
            required: true,
            maxSize: '5MB',
            validation: { required: 'صورة الرقم الوطني مطلوبة' }
          },
          {
            name: 'agentIdCopy',
            label: 'صورة هوية الوكيل',
            type: 'file',
            accept: '.pdf,.jpg,.jpeg,.png',
            required: true,
            maxSize: '5MB',
            validation: { required: 'صورة هوية الوكيل مطلوبة' }
          },
          {
            name: 'supportingDocs',
            label: 'مستندات داعمة',
            type: 'file',
            accept: '.pdf,.jpg,.jpeg,.png',
            multiple: true,
            required: false,
            maxSize: '5MB',
            help: 'أي مستندات إضافية تدعم الطلب'
          }
        ]
      },
      {
        id: 'declarations',
        title: 'الإقرارات والتوقيعات',
        fields: [
          {
            name: 'submissionDateTime',
            label: 'تاريخ ووقت التقديم',
            type: 'datetime-local',
            required: true,
            validation: { required: 'تاريخ ووقت التقديم مطلوب' }
          },
          {
            name: 'receivingDateTime',
            label: 'تاريخ ووقت الاستلام',
            type: 'datetime-local',
            required: false,
            help: 'سيتم ملؤه من قبل الموظف المختص'
          },
          {
            name: 'dataAccuracy',
            label: 'أقر بصحة جميع البيانات المقدمة وأتحمل المسؤولية القانونية الكاملة عن أي معلومات خاطئة',
            type: 'checkbox',
            required: true,
            validation: { required: 'يجب الموافقة على صحة البيانات' }
          },
          {
            name: 'legalResponsibility',
            label: 'أتحمل المسؤولية القانونية الكاملة عن هذا التوكيل وأؤكد أن الوكيل مخول قانونياً لاستلام الشهادة',
            type: 'checkbox',
            required: true,
            validation: { required: 'يجب الموافقة على المسؤولية القانونية' }
          },
          {
            name: 'contactConsent',
            label: 'أوافق على التواصل معي عبر الهاتف أو البريد الإلكتروني لمتابعة الطلب',
            type: 'checkbox',
            required: true,
            validation: { required: 'يجب الموافقة على التواصل' }
          }
        ]
      }
    ]
  };

  const steps = service.steps.map(step => ({
    id: step.id,
    title: step.title
  }));

  const fillTestData = () => {
    setFormData({
      applicantType: 'guardian',
      nationality: 'sudanese',
      religion: 'islam',
      passportNumber: 'P1234567',
      passportExpiry: '2028-12-31',
      residencyId: '2123456789',
      maritalStatus: 'married',
      placeOfBirth: 'الخرطوم',
      relationToCase: 'guardian',
      studentFullName: 'أحمد محمد علي حسن',
      studentFullNameEn: 'Ahmed Mohamed Ali Hassan',
      studentNationalId: '1234567890',
      studentDateOfBirth: '2005-05-15',
      phone: '+966501234567',
      email: 'ahmed@example.com',
      agentName: 'محمد أحمد علي',
      agentNameEn: 'Mohamed Ahmed Ali',
      agentNationalId: '0987654321',
      agentPhone: '+966502345678',
      agentRelation: 'father',
      certificateType: 'secondary',
      issuingAuthority: 'ministry_education',
      additionalDetails: 'طلب استلام شهادة ثانوية للعام 2020',
      submissionDateTime: new Date().toISOString().slice(0, 16),
      dataAccuracy: true,
      legalResponsibility: true,
      contactConsent: true
    });
  };

  const validateCurrentStep = () => {
    const currentStepConfig = service.steps[currentStep];
    const stepErrors = {};
    
    currentStepConfig.fields.forEach(field => {
      // Check conditional fields
      if (field.conditional) {
        const conditionField = field.conditional.field;
        const conditionValues = field.conditional.values;
        const currentValue = formData[conditionField];
        
        if (!conditionValues.includes(currentValue)) {
          return; // Skip validation for hidden conditional fields
        }
      }
      
      if (field.required && !formData[field.name]) {
        stepErrors[field.name] = field.validation?.required || `${field.label} مطلوب`;
      }
    });
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      const referenceNumber = `POA-EDU-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      console.log('Educational Certificate POA Application:', { ...formData, referenceNumber });
      setIsSubmitting(false);
      
      navigate('/success', { 
        state: { 
          referenceNumber, 
          serviceTitle: 'توكيل شهادة دراسية' 
        } 
      });
    }, 2000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const currentStepConfig = service.steps[currentStep];

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />

      {/* Service Title Banner */}
      <div className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] text-white py-6 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* زر العودة - يسار */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              <span>العودة</span>
            </button>

            {/* اسم الخدمة - منتصف */}
            <div className="flex-1 text-center px-4">
              <h1 className="text-2xl sm:text-3xl font-bold">توكيل شهادة دراسية</h1>
            </div>

            {/* مساحة فارغة للتوازن - يمين */}
            <div className="w-24 sm:w-32"></div>
          </div>

          {/* النص التوضيحي */}
          <div className="text-center mt-3">
            <p className="text-blue-100 text-sm">
              يرجى ملء جميع الحقول المطلوبة لإكمال طلب الخدمة
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12" dir="rtl">
              {/* Form */}
              <div className="lg:col-span-2 lg:order-2">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  {/* Official Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                    <div className="flex items-center justify-between">
                      {/* Arabic Side */}
                      <div className="text-right">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">SD</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">القنصلية العامة</h3>
                            <p className="text-sm opacity-90">لجمهورية السودان بجدة</p>
                          </div>
                        </div>
                      </div>

                      {/* English Side */}
                      <div className="text-left">
                        <div className="flex items-center space-x-3 mb-2">
                          <div>
                            <h3 className="text-lg font-bold">Consulate General</h3>
                            <p className="text-sm opacity-90">Republic of Sudan - Jeddah</p>
                          </div>
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      <h2 className="text-xl font-bold mb-1">توكيل استلام شهادة دراسية</h2>
                      <p className="text-sm opacity-90">Educational Certificate Power of Attorney</p>
                    </div>
                  </div>

                  {/* Progress Steps */}
                  <div className="p-6 border-b border-gray-200">
                    <ProgressSteps steps={steps} currentStep={currentStep} />
                  </div>

                  {/* Test Data Button */}
                  <div className="p-6 bg-blue-50 border-b border-blue-200">
                    <button
                      type="button"
                      onClick={fillTestData}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <Star className="w-4 h-4" />
                      <span>ملء البيانات التجريبية</span>
                    </button>
                  </div>

                  {/* Form Content */}
                  <div className="p-6">
                    {currentStepConfig.id === 'declarations' ? (
                      <div className="space-y-8">
                        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-4">
                          {currentStepConfig.title}
                        </h3>

                        {/* Signature Areas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Applicant Signature */}
                          <div className="text-center">
                            <h4 className="font-semibold text-gray-900 mb-4">
                              توقيع مقدم الطلب
                            </h4>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center mb-4">
                              <div className="text-center">
                                <PenTool className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">مساحة التوقيع</p>
                              </div>
                            </div>
                            <div>
                              <input
                                type="datetime-local"
                                value={formData.submissionDateTime || ''}
                                onChange={(e) => handleInputChange('submissionDateTime', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Applicant Signature & Date
                              </p>
                            </div>
                          </div>

                          {/* Staff Signature */}
                          <div className="text-center">
                            <h4 className="font-semibold text-gray-900 mb-4">
                              توقيع الموظف المختص
                            </h4>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center mb-4">
                              <div className="text-center">
                                <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">توقيع الموظف</p>
                              </div>
                            </div>
                            <div>
                              <input
                                type="datetime-local"
                                value={formData.receivingDateTime || ''}
                                onChange={(e) => handleInputChange('receivingDateTime', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Staff Signature & Date
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Official Stamp */}
                        <div className="text-center">
                          <h4 className="font-semibold text-gray-900 mb-4">
                            الختم الرسمي
                          </h4>
                          <div className="w-32 h-32 border-4 border-blue-600 rounded-full mx-auto flex items-center justify-center mb-4">
                            <div className="text-center">
                              <Stamp className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                              <p className="text-xs text-blue-600 font-semibold">الختم</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            Official Seal of the Consulate
                          </p>
                        </div>

                        {/* Declarations */}
                        <div className="space-y-6">
                          {currentStepConfig.fields.filter(field => field.type === 'checkbox').map(field => (
                            <label key={field.name} className="flex items-start space-x-3 rtl:space-x-reverse">
                              <input
                                type="checkbox"
                                checked={formData[field.name] || false}
                                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                                className="mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                              />
                              <span className="text-sm text-gray-700">
                                {field.label}
                              </span>
                            </label>
                          ))}
                          
                          {/* Show errors for checkboxes */}
                          {currentStepConfig.fields.filter(field => field.type === 'checkbox').map(field => 
                            errors[field.name] && (
                              <p key={field.name} className="text-sm text-red-600">{errors[field.name]}</p>
                            )
                          )}
                        </div>

                        {/* Date/Time Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {currentStepConfig.fields.filter(field => field.type === 'datetime-local').map(field => (
                            <div key={field.name}>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {field.label}
                                {field.required && <span className="text-red-500 mr-1">*</span>}
                              </label>
                              <input
                                type="datetime-local"
                                value={formData[field.name] || ''}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all duration-200 ${
                                  errors[field.name] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                              />
                              {field.help && (
                                <p className="mt-1 text-xs text-gray-500">{field.help}</p>
                              )}
                              {errors[field.name] && (
                                <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <FormStep
                        title={currentStepConfig.title}
                        fields={currentStepConfig.fields}
                        formData={formData}
                        errors={errors}
                        onChange={handleInputChange}
                      />
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="p-6 border-t border-gray-200 flex justify-between">
                    <button
                      onClick={handlePrevious}
                      disabled={currentStep === 0}
                      className="px-6 py-3 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-700 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                      <span>السابق</span>
                    </button>

                    <button
                      onClick={handleNext}
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>جاري الإرسال...</span>
                        </>
                      ) : currentStep === steps.length - 1 ? (
                        <>
                          <Send className="w-4 h-4" />
                          <span>إرسال الطلب</span>
                        </>
                      ) : (
                        <>
                          <span>التالي</span>
                          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Official Footer */}
                  <div className="bg-gray-100 border-t border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      {/* Arabic Information */}
                      <div className="text-right">
                        <h4 className="font-bold text-gray-900 mb-3">معلومات الاتصال:</h4>
                        <div className="space-y-2 text-gray-700">
                          <p>📍 شارع الأمير سلطان، حي الروضة، جدة</p>
                          <p>📞 +966 12 123 4567</p>
                          <p>✉️ info@sudanconsulate-jeddah.gov.sd</p>
                          <p>🕐 الأحد - الخميس: 8:00 ص - 2:00 م</p>
                        </div>
                      </div>

                      {/* English Information */}
                      <div className="text-left">
                        <h4 className="font-bold text-gray-900 mb-3">Contact Information:</h4>
                        <div className="space-y-2 text-gray-700">
                          <p>📍 Prince Sultan St., Al-Rawda, Jeddah</p>
                          <p>📞 +966 12 123 4567</p>
                          <p>✉️ info@sudanconsulate-jeddah.gov.sd</p>
                          <p>🕐 Sun - Thu: 8:00 AM - 2:00 PM</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-300 mt-6 pt-4 text-center">
                      <p className="text-xs text-gray-600">
                        © 2025 القنصلية العامة لجمهورية السودان بجدة - جميع الحقوق محفوظة
                      </p>
                      <p className="text-xs text-gray-600">
                        Consulate General of the Republic of Sudan in Jeddah - All Rights Reserved
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 lg:order-1">
                <div className="space-y-6 sticky top-8">
                  <SidebarSummary service={service} formData={formData} />
                  
                  {/* Back Button */}
                  <button
                    onClick={() => navigate('/services')}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse"
                  >
                    <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                    <span>العودة للخدمات</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EducationalCertificatePOA;