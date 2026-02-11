import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot';
import DynamicForm from '../components/DynamicForm';

const ExamSupervision = () => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const serviceConfig = {
    id: 'exam-supervision',
    title: 'مراقبة الامتحانات',
    description: 'التقديم للعمل كمراقب في الامتحانات الرسمية',
    icon: 'Eye',
    category: 'education',
    fees: 'مجاناً',
    duration: 'يوم واحد',
    requirements: [
      'القسيمة',
      'صورة جواز المراقب',
      'المؤهل الدراسي',
      'شهادة حسن السير والسلوك'
    ],
    process: [
      'تعبئة نموذج طلب مراقبة الامتحانات',
      'إرفاق المستندات المطلوبة',
      'مراجعة الطلب من قبل الإدارة',
      'التواصل مع المتقدم للإجراءات النهائية',
      'إصدار شهادة التعيين كمراقب'
    ],
    skipPersonalStep: false,
    steps: [
      {
        id: 'supervisor-details',
        title: 'بيانات المراقب',
        fields: [
          {
            name: 'fullNameArabic',
            label: 'الاسم الرباعي بالعربية',
            type: 'text',
            required: true,
            validation: { required: 'الاسم الرباعي بالعربية مطلوب' }
          },
          {
            name: 'fullNameEnglish',
            label: 'الاسم الرباعي بالإنجليزية',
            type: 'text',
            required: true,
            validation: { required: 'الاسم الرباعي بالإنجليزية مطلوب' }
          },
          {
            name: 'passportNumber',
            label: 'رقم الجواز',
            type: 'text',
            required: true,
            validation: { required: 'رقم الجواز مطلوب' }
          },
          {
            name: 'dateOfBirth',
            label: 'تاريخ الميلاد',
            type: 'date',
            required: true,
            validation: { required: 'تاريخ الميلاد مطلوب' }
          },
          {
            name: 'gender',
            label: 'النوع',
            type: 'radio',
            options: [
              { value: 'male', label: 'ذكر' },
              { value: 'female', label: 'أنثى' }
            ],
            required: true,
            validation: { required: 'يرجى تحديد النوع' }
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
          }
        ]
      },
      {
        id: 'educational-qualifications',
        title: 'المؤهلات التعليمية',
        fields: [
          {
            name: 'highestQualification',
            label: 'أعلى مؤهل دراسي',
            type: 'select',
            options: [
              { value: 'secondary', label: 'شهادة ثانوية' },
              { value: 'diploma', label: 'دبلوم' },
              { value: 'bachelor', label: 'بكالوريوس' },
              { value: 'master', label: 'ماجستير' },
              { value: 'phd', label: 'دكتوراه' }
            ],
            required: true,
            validation: { required: 'المؤهل الدراسي مطلوب' }
          },
          {
            name: 'specialization',
            label: 'التخصص',
            type: 'text',
            required: true,
            validation: { required: 'التخصص مطلوب' }
          },
          {
            name: 'graduationYear',
            label: 'سنة التخرج',
            type: 'text',
            pattern: /^\d{4}$/,
            placeholder: 'مثال: 2020',
            required: true,
            validation: {
              required: 'سنة التخرج مطلوبة',
              pattern: 'يرجى إدخال سنة صحيحة (4 أرقام)'
            }
          },
          {
            name: 'university',
            label: 'الجامعة/المؤسسة التعليمية',
            type: 'text',
            required: true,
            validation: { required: 'الجامعة/المؤسسة التعليمية مطلوبة' }
          },
          {
            name: 'hasTeachingExperience',
            label: 'هل لديك خبرة في التدريس أو مراقبة الامتحانات؟',
            type: 'radio',
            options: [
              { value: 'yes', label: 'نعم' },
              { value: 'no', label: 'لا' }
            ],
            required: true,
            validation: { required: 'يرجى تحديد ما إذا كان لديك خبرة' }
          },
          {
            name: 'experienceYears',
            label: 'عدد سنوات الخبرة',
            type: 'number',
            conditional: {
              field: 'hasTeachingExperience',
              value: 'yes'
            },
            required: true,
            validation: { required: 'عدد سنوات الخبرة مطلوب' }
          },
          {
            name: 'experienceDetails',
            label: 'تفاصيل الخبرة',
            type: 'textarea',
            rows: 4,
            conditional: {
              field: 'hasTeachingExperience',
              value: 'yes'
            },
            placeholder: 'اذكر الجهات التي عملت بها والمهام التي قمت بها',
            required: false
          }
        ]
      },
      {
        id: 'exam-preferences',
        title: 'تفضيلات الامتحانات',
        fields: [
          {
            name: 'examLevel',
            label: 'المرحلة التعليمية المفضلة للمراقبة',
            type: 'checkbox-group',
            options: [
              { value: 'primary', label: 'الشهادة الابتدائية (الصف الثامن)' },
              { value: 'intermediate', label: 'الشهادة المتوسطة (الصف العاشر)' },
              { value: 'secondary', label: 'الشهادة الثانوية' }
            ],
            required: true,
            validation: { required: 'يرجى اختيار مرحلة تعليمية واحدة على الأقل' }
          },
          {
            name: 'subjectsPreference',
            label: 'المواد المفضلة للمراقبة',
            type: 'textarea',
            rows: 3,
            placeholder: 'مثال: الرياضيات، العلوم، اللغة العربية',
            required: false,
            help: 'اختياري - يساعدنا في التوزيع المناسب'
          },
          {
            name: 'availableDates',
            label: 'الفترة المتاحة للعمل',
            type: 'textarea',
            rows: 3,
            placeholder: 'حدد الأيام والأوقات المتاحة لديك',
            required: true,
            validation: { required: 'الفترة المتاحة للعمل مطلوبة' }
          }
        ]
      },
      {
        id: 'documents',
        title: 'المستندات المطلوبة',
        fields: [
          {
            name: 'qaseemahDocument',
            label: 'القسيمة',
            type: 'file',
            accept: '.pdf,.jpg,.jpeg,.png',
            required: true,
            maxSize: '5MB',
            help: 'صورة واضحة من القسيمة',
            validation: { required: 'القسيمة مطلوبة' }
          },
          {
            name: 'passportCopy',
            label: 'صورة جواز المراقب',
            type: 'file',
            accept: '.pdf,.jpg,.jpeg,.png',
            required: true,
            maxSize: '5MB',
            help: 'صورة واضحة من جواز السفر (الصفحة الأولى)',
            validation: { required: 'صورة الجواز مطلوبة' }
          },
          {
            name: 'qualificationCertificate',
            label: 'المؤهل الدراسي',
            type: 'file',
            accept: '.pdf,.jpg,.jpeg,.png',
            required: true,
            maxSize: '5MB',
            help: 'صورة من الشهادة الدراسية',
            validation: { required: 'المؤهل الدراسي مطلوب' }
          },
          {
            name: 'conductCertificate',
            label: 'شهادة حسن السير والسلوك',
            type: 'file',
            accept: '.pdf,.jpg,.jpeg,.png',
            required: true,
            maxSize: '5MB',
            help: 'صورة من شهادة حسن السير والسلوك',
            validation: { required: 'شهادة حسن السير والسلوك مطلوبة' }
          },
          {
            name: 'experienceCertificates',
            label: 'شهادات الخبرة (إن وجدت)',
            type: 'file',
            accept: '.pdf,.jpg,.jpeg,.png',
            required: false,
            maxSize: '5MB',
            help: 'اختياري - يمكنك إرفاق شهادات خبرة سابقة'
          }
        ]
      },
      {
        id: 'acknowledgment',
        title: 'الإقرار',
        fields: [
          {
            name: 'dataAccuracy',
            label: 'أقر بأن جميع البيانات المدخلة صحيحة ودقيقة',
            type: 'checkbox',
            required: true,
            validation: { required: 'يجب الموافقة على صحة البيانات' }
          },
          {
            name: 'commitment',
            label: 'أتعهد بالالتزام بقواعد وأنظمة مراقبة الامتحانات',
            type: 'checkbox',
            required: true,
            validation: { required: 'يجب الموافقة على الالتزام بالقواعد' }
          },
          {
            name: 'availability',
            label: 'أؤكد توفري خلال الفترات المحددة للامتحانات',
            type: 'checkbox',
            required: true,
            validation: { required: 'يجب تأكيد التوفر' }
          }
        ]
      }
    ]
  };

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
              <h1 className="text-2xl sm:text-3xl font-bold">مراقبة الامتحانات</h1>
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

      <div className="py-8">
        <DynamicForm config={serviceConfig} />
      </div>

      <Footer />
      <ChatBot serviceCategory="education" />
    </div>
  );
};

export default ExamSupervision;
