import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, FileText, Upload, CheckCircle, AlertCircle, User, Calendar, Phone, Mail, MapPin, BookOpen, Camera, Car as IdCard, Users, Clock, Star, Send, Beaker, PenTool } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { getRegionsList, getCitiesByRegion, getDistrictsByCity } from '../data/saudiRegions';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProgressSteps from '../components/ProgressSteps';
import FormStep from '../components/FormStep';
import SidebarSummary from '../components/SidebarSummary';

const SecondaryEducation = () => {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('science'); // science or arts
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const breadcrumbs = [
    { label: 'الرئيسية', href: '/' },
    { label: 'الخدمات', href: '/services' },
    { label: 'التعليم', href: '/services/education' },
    { label: 'الشهادة الثانوية', href: '/services/education/secondary' }
  ];

  // Science Section Subjects
  const scienceSubjects = {
    core: [
      'اللغة العربية',
      'اللغة الإنجليزية', 
      'التربية الإسلامية',
      'الرياضيات المتخصصة',
      'الفيزياء',
      'الكيمياء'
    ],
    elective: [
      { value: 'biology', label: 'الأحياء' },
      { value: 'computer', label: 'علوم الحاسوب' },
      { value: 'engineering', label: 'العلوم الهندسية' },
      { value: 'arts_design', label: 'الفنون والتصميم' }
    ]
  };

  // Arts Section Subjects
  const artsSubjects = {
    core: [
      'اللغة العربية',
      'اللغة الإنجليزية',
      'التربية الإسلامية', 
      'الرياضيات',
      'الجغرافيا',
      'التاريخ'
    ],
    elective: [
      { value: 'islamic_studies', label: 'الدراسات الإسلامية' },
      { value: 'english_literature', label: 'الأدب الإنجليزي' },
      { value: 'french', label: 'اللغة الفرنسية' },
      { value: 'arts_design', label: 'الفنون والتصميم' }
    ]
  };

  // Service configuration for Secondary Education
  const getService = () => ({
    id: 'secondary',
    title: `امتحانات الشهادة الثانوية - ${activeSection === 'science' ? 'القسم العلمي' : 'القسم الأدبي'}`,
    description: `التقديم لامتحانات الشهادة الثانوية (${activeSection === 'science' ? 'القسم العلمي' : 'القسم الأدبي'})`,
    icon: 'BookOpen',
    category: 'education',
    requirements: [
      'إرفاق الشهادة المتوسطة أو ما يعادلها مرّ عليها ثلاث سنوات',
      'إرفاق الشهادة الثانوية لمن سبق له الجلوس',
      'صورة شخصية حديثة',
      'الرقم الوطني، ولغير السودانيين الجواز',
      'التأكد من صحة البيانات',
      'لن يكتمل التسجيل إن كانت المستندات غير مكتملة'
    ],
    fees: '500 ريال',
    duration: '3-4 أشهر',
    steps: [
      {
        id: 'personal-info',
        title: 'بيانات المتقدم',
        fields: [
          {
            name: 'gender',
            label: 'النوع',
            type: 'radio',
            options: [
              { value: 'male', label: 'ذكر' },
              { value: 'female', label: 'أنثى' }
            ],
            required: true,
            validation: { required: 'النوع مطلوب' }
          },
          {
            name: 'nationality',
            label: 'الجنسية',
            type: 'radio',
            options: [
              { value: 'sudanese', label: 'سوداني' },
              { value: 'non-sudanese', label: 'غير سوداني' }
            ],
            required: true,
            validation: { required: 'الجنسية مطلوبة' }
          },
          {
            name: 'specificNationality',
            label: 'نوع الجنسية',
            type: 'text',
            required: true,
            conditional: { field: 'nationality', values: ['non-sudanese'] },
            validation: { required: 'نوع الجنسية مطلوب' },
            pattern: '[\u0600-\u06FF\s]+',
            help: 'أدخل الحروف فقط'
          },
          {
            name: 'fullName',
            label: 'الاسم الرباعي مطابقاً للرقم الوطني',
            type: 'text',
            required: true,
            className: 'md:col-span-2',
            pattern: '^[\u0600-\u06ff\s]+$',
            help: 'يجب إدخال الأحرف العربية فقط',
            validation: { required: 'الاسم الرباعي مطلوب' }
          },
          {
            name: 'nationalId',
            label: 'الرقم الوطني / رقم الجواز',
            type: 'text',
            required: true,
            pattern: '^[A-Za-z0-9]+$',
            help: 'يجب إدخال أرقام وحروف إنجليزية فقط',
            validation: { required: 'الرقم الوطني أو رقم الجواز مطلوب' }
          },
          {
            name: 'dateOfBirth',
            label: 'تاريخ الميلاد',
            type: 'date',
            required: true,
            validation: { required: 'تاريخ الميلاد مطلوب' }
          },
          {
            name: 'motherName',
            label: 'اسم الأم رباعي',
            type: 'text',
            required: true,
            className: 'md:col-span-2',
            pattern: '^[\u0600-\u06ff\s]+$',
            help: 'يجب إدخال الأحرف العربية فقط',
            validation: { required: 'اسم الأم مطلوب' }
          },
          {
            name: 'mobileNumber',
            label: 'رقم هاتف جوال',
            type: 'tel',
            required: true,
            pattern: '^[0-9+\s()-]+$',
            help: 'يجب إدخال أرقام فقط',
            validation: { required: 'رقم الجوال مطلوب' }
          },
          {
            name: 'addressRegion',
            label: 'المنطقة',
            type: 'select',
            options: getRegionsList(),
            required: true,
            validation: { required: 'المنطقة مطلوبة' }
          },
          {
            name: 'addressCity',
            label: 'المدينة',
            type: 'select',
            options: [],
            required: true,
            conditional: { field: 'addressRegion', values: getRegionsList().map(r => r.value) },
            validation: { required: 'المدينة مطلوبة' }
          },
          {
            name: 'addressDistrict',
            label: 'الحي',
            type: 'select',
            options: [],
            required: false,
            conditional: { field: 'addressCity', values: [] }
          },
          {
            name: 'addressLandmark',
            label: 'أقرب معلم',
            type: 'text',
            required: true,
            conditional: { field: 'addressCity', values: [] },
            validation: { required: 'أقرب معلم مطلوب' }
          }
        ]
      },
      {
        id: 'service-details',
        title: 'تفاصيل الخدمة',
        fields: [
          {
            name: 'qualificationType',
            label: 'نوع المؤهل',
            type: 'select',
            options: [
              { value: 'basic', label: 'أساس' },
              { value: 'intermediate', label: 'متوسطة' },
              { value: 'secondary', label: 'ثانوي' }
            ],
            required: true,
            validation: { required: 'نوع المؤهل مطلوب' }
          },
          {
            name: 'schoolName',
            label: 'المدرسة',
            type: 'text',
            required: true,
            pattern: '^[\u0600-\u06ff\s]+$',
            help: 'يجب إدخال الأحرف العربية فقط',
            validation: { required: 'اسم المدرسة مطلوب' }
          },
          {
            name: 'year',
            label: 'العام',
            type: 'text',
            required: true,
            pattern: '^[0-9]+$',
            help: 'يجب إدخال أرقام فقط',
            validation: { required: 'العام مطلوب' }
          },
          {
            name: 'priorSeatNumber',
            label: 'رقم الجلوس الذي جلست به للمؤهل',
            type: 'text',
            required: false
          },
          {
            name: 'examLanguage',
            label: 'لغة الامتحان',
            type: 'radio',
            options: [
              { value: 'arabic', label: 'عربي' },
              { value: 'english', label: 'إنجليزي' }
            ],
            required: true,
            validation: { required: 'لغة الامتحان مطلوبة' }
          },
          {
            name: 'specialCase',
            label: 'حالة خاصة',
            type: 'select',
            options: [
              { value: '', label: 'لا توجد' },
              { value: 'mobility', label: 'إعاقة حركية' },
              { value: 'hearing', label: 'إعاقة سمعية' },
              { value: 'visual', label: 'إعاقة بصرية' },
              { value: 'learning', label: 'صعوبة تعلم' },
              { value: 'attention', label: 'تشتت انتباه' }
            ],
            required: false
          },
          {
            name: 'specialCaseDescription',
            label: 'وصف الحالة الخاصة',
            type: 'textarea',
            required: false,
            conditional: { field: 'specialCase', values: ['mobility', 'hearing', 'visual', 'learning', 'attention'] },
            className: 'md:col-span-2'
          }
        ]
      },
      {
        id: 'guardian-info',
        title: 'معلومات ولي الأمر',
        fields: [
          {
            name: 'guardianRelation',
            label: 'صلة القرابة',
            type: 'select',
            options: [
              { value: 'father', label: 'والد' },
              { value: 'mother', label: 'والدة' },
              { value: 'guardian', label: 'ولي أمر' },
              { value: 'other', label: 'أخرى' }
            ],
            required: true,
            validation: { required: 'صلة القرابة مطلوبة' }
          },
          {
            name: 'guardianPhone',
            label: 'رقم الهاتف',
            type: 'tel',
            required: true,
            pattern: '^[0-9+\s()-]+$',
            help: 'يجب إدخال أرقام فقط',
            validation: { required: 'رقم هاتف ولي الأمر مطلوب' }
          },
          {
            name: 'guardianWorkplace',
            label: 'مكان العمل',
            type: 'text',
            required: true,
            validation: { required: 'مكان عمل ولي الأمر مطلوب' }
          },
          {
            name: 'referencePerson',
            label: 'اسم شخص للرجوع إليه',
            type: 'text',
            required: true,
            validation: { required: 'اسم الشخص المرجعي مطلوب' }
          },
          {
            name: 'referencePhone',
            label: 'رقم هاتف الشخص للرجوع إليه',
            type: 'tel',
            required: true,
            validation: { required: 'رقم هاتف الشخص المرجعي مطلوب' },
            pattern: '[0-9+\s-]+',
            help: 'أدخل الأرقام فقط'
          }
        ]
      },
      {
        id: 'subjects-selection',
        title: 'اختيار المواد',
        fields: [
          {
            name: 'electiveSubject',
            label: `المادة الاختيارية - ${activeSection === 'science' ? 'القسم العلمي' : 'القسم الأدبي'}`,
            type: 'radio',
            options: activeSection === 'science' ? scienceSubjects.elective : artsSubjects.elective,
            required: true,
            validation: { required: 'يجب اختيار مادة اختيارية واحدة' },
            help: 'الاختيار لمادة واحدة فقط',
            className: 'md:col-span-2'
          }
        ]
      },
      {
        id: 'documents-upload',
        title: 'المستندات المطلوبة',
        fields: [
          {
            name: 'intermediateCertificate',
            label: 'الشهادة المتوسطة أو ما يعادلها',
            type: 'file',
            accept: '.pdf,.jpg,.jpeg,.png',
            required: true,
            maxSize: '5MB',
            validation: { required: 'الشهادة المتوسطة مطلوبة' }
          },
          {
            name: 'secondaryCertificate',
            label: 'الشهادة الثانوية لمن سبق له الجلوس',
            type: 'file',
            accept: '.pdf,.jpg,.jpeg,.png',
            required: false,
            maxSize: '5MB',
            help: 'مطلوبة فقط للمعيدين الذين سبق لهم الجلوس لامتحان الشهادة الثانوية'
          },
          {
            name: 'personalPhoto',
            label: 'صورة شخصية حديثة بمقاس صورة الجواز',
            type: 'file',
            accept: '.jpg,.jpeg,.png',
            required: true,
            maxSize: '2MB',
            help: 'يجب أن تكون الصورة بمقاس 4×6 سم (مقاس صورة جواز السفر)، خلفية بيضاء، وواضحة',
            validation: { required: 'الصورة الشخصية مطلوبة' }
          },
          {
            name: 'nationalIdOrPassport',
            label: 'الرقم الوطني للسودانيين - الجواز لغير السودانيين',
            type: 'file',
            accept: '.pdf,.jpg,.jpeg,.png',
            required: true,
            maxSize: '5MB',
            help: 'السودانيون: إرفاق صورة الرقم الوطني | غير السودانيين: إرفاق صورة جواز السفر',
            validation: { required: 'إرفاق الرقم الوطني أو الجواز مطلوب' }
          }
        ]
      }
    ]
  });

  const service = getService();
  const steps = service.steps.map(step => ({
    id: step.id,
    title: step.title
  }));

  const fillTestData = () => {
    setFormData({
      gender: 'male',
      nationality: 'sudanese',
      fullName: 'محمد أحمد عبدالله حسن',
      nationalId: '3234567892',
      dateOfBirth: '2006-08-10',
      motherName: 'زينب محمد أحمد علي',
      qualificationType: 'intermediate',
      schoolName: 'مدرسة الخرطوم الثانوية',
      year: '2024',
      priorSeatNumber: '12345',
      examLanguage: 'arabic',
      specialCase: '',
      specialCaseDescription: '',
      mobileNumber: '+966505678901',
      addressRegion: 'riyadh',
      addressCity: 'الرياض',
      addressDistrict: 'العليا',
      addressLandmark: 'بجانب برج المملكة',
      guardianRelation: 'father',
      guardianPhone: '+966506789012',
      guardianWorkplace: 'وزارة الصحة',
      referencePerson: 'أحمد عبدالله حسن',
      referencePhone: '+966507890123',
      electiveSubject: activeSection === 'science' ? 'biology' : 'islamic_studies'
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
      const referenceNumber = `EDU-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      console.log('Secondary Education Application:', { 
        ...formData, 
        section: activeSection,
        referenceNumber 
      });
      setIsSubmitting(false);
      
      navigate('/success', { 
        state: { 
          referenceNumber, 
          serviceTitle: `امتحانات الشهادة الثانوية - ${activeSection === 'science' ? 'القسم العلمي' : 'القسم الأدبي'}` 
        } 
      });
    }, 2000);
  };

  const handleInputChange = (field, value) => {
    const updates = { [field]: value };

    if (field === 'addressRegion') {
      updates.addressCity = '';
      updates.addressDistrict = '';
      updates.addressLandmark = '';
    } else if (field === 'addressCity') {
      updates.addressDistrict = '';
      updates.addressLandmark = '';
    }

    setFormData(prev => ({ ...prev, ...updates }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setCurrentStep(0);
    setFormData({});
    setErrors({});
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
              <h1 className="text-2xl sm:text-3xl font-bold">امتحانات الشهادة الثانوية</h1>
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

      {/* Section Tabs */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-6 shadow-lg">
              <div className="flex items-start space-x-4 rtl:space-x-reverse">
                <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-amber-900 mb-3">تنبيه مهم: يجب اختيار المثاق قبل البدء</h3>
                  <p className="text-amber-800 mb-3 leading-relaxed">
                    <strong>يرجى اختيار المثاق الدراسي (العلمي أو الأدبي) أولاً قبل البدء بتعبئة البيانات.</strong>
                  </p>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    <Star className="w-4 h-4 inline ml-2" />
                    القسم العلمي: يشمل الرياضيات المتخصصة، الفيزياء، الكيمياء، والأحياء أو الحاسوب<br/>
                    <Star className="w-4 h-4 inline ml-2" />
                    القسم الأدبي: يشمل التاريخ، الجغرافيا، الدراسات الإسلامية، والآداب
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-gray-50 p-2 rounded-2xl shadow-lg border border-gray-200 inline-flex">
              <button
                onClick={() => handleSectionChange('science')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 rtl:space-x-reverse ${
                  activeSection === 'science'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-gray-400 hover:to-gray-500 bg-white shadow-md hover:shadow-lg'
                }`}
              >
                <Beaker className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-bold text-lg">المثاق العلمي</div>
                  <div className="text-sm opacity-90">Science Section</div>
                </div>
              </button>

              <button
                onClick={() => handleSectionChange('arts')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 rtl:space-x-reverse ${
                  activeSection === 'arts'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-gray-400 hover:to-gray-500 bg-white shadow-md hover:shadow-lg'
                }`}
              >
                <PenTool className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-bold text-lg">المثاق الأدبي</div>
                  <div className="text-sm opacity-90">Arts Section</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12" dir="rtl">
              {/* Form */}
              <div className="lg:col-span-2 lg:order-2">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  {/* Progress Steps */}
                  <div className="p-6 border-b border-gray-200">
                    <ProgressSteps steps={steps} currentStep={currentStep} />
                  </div>

                  {/* Test Data Button */}
                  <div className={`p-6 ${
                    activeSection === 'science' ? 'bg-blue-50 border-b border-blue-200' : 'bg-purple-50 border-b border-purple-200'
                  }`}>
                    <button
                      type="button"
                      onClick={fillTestData}
                      className={`${
                        activeSection === 'science' 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      } text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse`}
                    >
                      <Star className="w-4 h-4" />
                      <span>ملء البيانات التجريبية</span>
                    </button>
                  </div>

                  {/* Form Content */}
                  <div className="p-6">
                    {currentStepConfig.id === 'subjects-selection' ? (
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-4">
                          {currentStepConfig.title}
                        </h3>

                        {/* Core Subjects Display */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">المواد الأساسية (ثابتة):</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                            {(activeSection === 'science' ? scienceSubjects.core : artsSubjects.core).map((subject, index) => (
                              <div key={index} className={`p-3 ${
                                activeSection === 'science' ? 'bg-blue-50 border border-blue-200' : 'bg-purple-50 border border-purple-200'
                              } rounded-lg text-center`}>
                                <span className="text-sm font-medium text-gray-900">{subject}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Elective Subjects */}
                        <FormStep
                          fields={currentStepConfig.fields}
                          formData={formData}
                          errors={errors}
                          onChange={handleInputChange}
                        />

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="text-amber-700 text-sm font-medium">
                            ⚠️ يجب اختيار مادة اختيارية واحدة فقط من القائمة أعلاه
                          </p>
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
                      className={`px-6 py-3 ${
                        activeSection === 'science' 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      } disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse`}
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
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 lg:order-1">
                <div className="space-y-6 sticky top-8">
                  <SidebarSummary service={service} formData={formData} />
                  
                  {/* Subjects Summary */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2 rtl:space-x-reverse">
                      <BookOpen className={`w-5 h-5 ${activeSection === 'science' ? 'text-blue-600' : 'text-purple-600'}`} />
                      <span>المواد الدراسية</span>
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">المواد الأساسية:</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          {(activeSection === 'science' ? scienceSubjects.core : artsSubjects.core).map((subject, index) => (
                            <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                              <div className={`w-1.5 h-1.5 ${
                                activeSection === 'science' ? 'bg-blue-500' : 'bg-purple-500'
                              } rounded-full`} />
                              <span>{subject}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">المواد الاختيارية:</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          {(activeSection === 'science' ? scienceSubjects.elective : artsSubjects.elective).map((subject, index) => (
                            <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                              <div className={`w-1.5 h-1.5 ${
                                activeSection === 'science' ? 'bg-blue-300' : 'bg-purple-300'
                              } rounded-full`} />
                              <span>{subject.label}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-amber-600 mt-2 font-medium">
                          * اختيار مادة واحدة فقط
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Back Button */}
                  <button
                    onClick={() => navigate('/services/education')}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse"
                  >
                    <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                    <span>العودة لخدمات التعليم</span>
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

export default SecondaryEducation;