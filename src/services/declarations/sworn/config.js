export const swornDeclarationsConfig = {
  id: 'sworn_declarations',
  title: 'الإقرارات المشفوعة باليمين',
  description: 'إصدار إقرارات مشفوعة باليمين للأغراض القانونية',
  icon: 'Scale',
  category: 'legal',
  requirements: [
    'حضور المقر شخصياً',
    'إثبات الهوية',
    'شهود (عند الحاجة)',
    'تحديد موضوع الإقرار بوضوح'
  ],
  fees: { base: 120, currency: 'ريال سعودي' },
  duration: '1 يوم عمل',
  process: [
    'تحديد نوع الإقرار المطلوب',
    'ملء البيانات المطلوبة',
    'حضور المقر شخصياً مع الشهود',
    'أداء اليمين والتوقيع',
    'ختم وتوثيق الإقرار'
  ],
  steps: [
    {
      id: 'declaration-details',
      title: 'تفاصيل الإقرار المشفوع باليمين',
      fields: [
        {
          name: 'declarationAuthority',
          label: 'جهة الإقرار',
          type: 'text',
          required: true,
          validation: { required: 'جهة الإقرار مطلوبة' }
        },
        {
          name: 'swornSubtype',
          label: 'نوع الإقرار المشفوع باليمين',
          type: 'searchable-select',
          options: [
            { value: "general_sworn", label: "إقرار مشفوع باليمين", description: "إقرار عام مشفوع باليمين" },
            { value: "age_of_majority", label: "إقرار مشفوع باليمين (بلوغ سن الرشد)", description: "إثبات بلوغ سن الرشد" },
            { value: "paternity_proof", label: "إقرار مشفوع باليمين (إقرار إثبات نسب)", description: "إثبات النسب والقرابة" },
            { value: "partial_exit_exemption", label: "إقرار مشفوع باليمين (إعفاء خروج جزئي)", description: "إقرار إعفاء خروج جزئي" },
            { value: "proof_of_life", label: "إقرار مشفوع باليمين (إثبات حياة)", description: "إثبات أن الشخص على قيد الحياة" },
            { value: "craftsmen_lands", label: "إقرار مشفوع باليمين (أراضي الحرفيين)", description: "إقرار خاص بأراضي الحرفيين" },
            { value: "general_sworn_2", label: "إقرار مشفوع باليمين", description: "إقرار عام مشفوع باليمين" },
            { value: "marriage_no_objection_sworn", label: "استمارة عدم ممانعة وشهادة كفاءة زواج", description: "إقرار عدم ممانعة الزواج مشفوع باليمين" },
            { value: "marital_status_single", label: "إثبات حالة إجتماعية (غير متزوج/ة)", description: "إثبات الحالة الاجتماعية - أعزب" },
            { value: "agent_dismissal", label: "إقرار مشفوع باليمين (إقرار بعزل موكل من وكالة)", description: "إقرار عزل موكل من وكالة" },
            { value: "marital_status_widow", label: "إقرار مشفوع باليمين (إثبات حالة إجتماعية أرملة)", description: "إثبات الحالة الاجتماعية - أرملة" },
            { value: "sworn_english", label: "إقرار باليمين (باللغة الانجليزية)", description: "إقرار مشفوع باليمين باللغة الإنجليزية" },
            { value: "marital_status_single_2", label: "إقرار مشفوع باليمين (إثبات حالة إجتماعية غير متزوج)", description: "إثبات الحالة الاجتماعية - غير متزوج" },
            { value: "agent_dismissal_2", label: "إقرار مشفوع باليمين (إقرار عزل موكل)", description: "إقرار عزل موكل" },
            { value: "document_authenticity", label: "إقرار مشفوع باليمين (إثبات صحة وثائق)", description: "إثبات صحة الوثائق والمستندات" },
            { value: "name_identity", label: "إقرار مشفوع باليمين (إثبات اسمان لذات واحدة)", description: "إثبات أن اسمين لشخص واحد" },
            { value: "housing_plan", label: "إقرار مشفوع باليمين (خطة إسكانية)", description: "إقرار خاص بالخطة الإسكانية" },
            { value: "other_sworn", label: "اخرى", description: "إقرارات أخرى مشفوعة باليمين" }
          ],
          required: true,
          validation: { required: 'نوع الإقرار المشفوع باليمين مطلوب' }
        },
        // حقول عامة للإقرارات المشفوعة
        {
          name: 'declarationSubject',
          label: 'موضوع الإقرار',
          type: 'text',
          required: true,
          conditional: { field: 'swornSubtype', values: ['general_sworn', 'general_sworn_2'] },
          validation: { required: 'موضوع الإقرار مطلوب' }
        },
        {
          name: 'declarationContent',
          label: 'نص الإقرار',
          type: 'textarea',
          required: true,
          rows: 5,
          conditional: { field: 'swornSubtype', values: ['general_sworn', 'general_sworn_2'] },
          validation: { required: 'نص الإقرار مطلوب' }
        },
        {
          name: 'declarationContentEnglish',
          label: 'Declaration Content (in English)',
          type: 'textarea',
          required: true,
          rows: 5,
          conditional: { field: 'swornSubtype', values: ['sworn_english'] },
          help: 'Please enter all the declaration details in English',
          validation: { required: 'Declaration content is required' }
        },
        // حقول بلوغ سن الرشد
        {
          name: 'personName',
          label: 'اسم الشخص',
          type: 'text',
          required: true,
          conditional: { field: 'swornSubtype', values: ['age_of_majority', 'proof_of_life', 'marital_status_single', 'marital_status_widow', 'marital_status_single_2'] },
          validation: { required: 'اسم الشخص مطلوب' }
        },
        {
          name: 'personNationalId',
          label: 'رقم الهوية',
          type: 'text',
          required: true,
          conditional: { field: 'swornSubtype', values: ['age_of_majority', 'proof_of_life', 'marital_status_single', 'marital_status_widow', 'marital_status_single_2'] },
          validation: { required: 'رقم الهوية مطلوب' }
        },
        {
          name: 'currentAge',
          label: 'العمر الحالي',
          type: 'number',
          required: true,
          conditional: { field: 'swornSubtype', values: ['age_of_majority'] },
          validation: { required: 'العمر الحالي مطلوب' }
        },
        {
          name: 'majorityPurpose',
          label: 'الغرض من إثبات بلوغ سن الرشد',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'swornSubtype', values: ['age_of_majority'] },
          validation: { required: 'الغرض من الإثبات مطلوب' }
        },
        // حقول إثبات النسب
        {
          name: 'childName',
          label: 'اسم الطفل/الشخص',
          type: 'text',
          required: true,
          conditional: { field: 'swornSubtype', values: ['paternity_proof'] },
          validation: { required: 'اسم الطفل مطلوب' }
        },
        {
          name: 'fatherName',
          label: 'اسم الوالد',
          type: 'text',
          required: true,
          conditional: { field: 'swornSubtype', values: ['paternity_proof'] },
          validation: { required: 'اسم الوالد مطلوب' }
        },
        {
          name: 'motherName',
          label: 'اسم الوالدة',
          type: 'text',
          required: true,
          conditional: { field: 'swornSubtype', values: ['paternity_proof'] },
          validation: { required: 'اسم الوالدة مطلوب' }
        },
        {
          name: 'birthDate',
          label: 'تاريخ الميلاد',
          type: 'date',
          required: true,
          conditional: { field: 'swornSubtype', values: ['paternity_proof'] },
          validation: { required: 'تاريخ الميلاد مطلوب' }
        },
        {
          name: 'birthPlace',
          label: 'مكان الميلاد',
          type: 'text',
          required: true,
          conditional: { field: 'swornSubtype', values: ['paternity_proof'] },
          validation: { required: 'مكان الميلاد مطلوب' }
        },
        {
          name: 'paternityReason',
          label: 'سبب طلب إثبات النسب',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'swornSubtype', values: ['paternity_proof'] },
          validation: { required: 'سبب طلب إثبات النسب مطلوب' }
        },
        // حقول إثبات الحياة
        {
          name: 'lastSeenDate',
          label: 'تاريخ آخر مشاهدة',
          type: 'date',
          required: true,
          conditional: { field: 'swornSubtype', values: ['proof_of_life'] },
          validation: { required: 'تاريخ آخر مشاهدة مطلوب' }
        },
        {
          name: 'currentLocation',
          label: 'المكان الحالي للشخص',
          type: 'text',
          required: true,
          conditional: { field: 'swornSubtype', values: ['proof_of_life'] },
          validation: { required: 'المكان الحالي مطلوب' }
        },
        {
          name: 'proofPurpose',
          label: 'الغرض من إثبات الحياة',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'swornSubtype', values: ['proof_of_life'] },
          validation: { required: 'الغرض من الإثبات مطلوب' }
        },
        // حقول الحالة الاجتماعية
        {
          name: 'statusPurpose',
          label: 'الغرض من إثبات الحالة الاجتماعية',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'swornSubtype', values: ['marital_status_single', 'marital_status_widow', 'marital_status_single_2'] },
          validation: { required: 'الغرض من الإثبات مطلوب' }
        },
        // حقول عزل الموكل
        {
          name: 'agentName',
          label: 'اسم الموكل المراد عزله',
          type: 'text',
          required: true,
          conditional: { field: 'swornSubtype', values: ['agent_dismissal', 'agent_dismissal_2'] },
          validation: { required: 'اسم الموكل مطلوب' }
        },
        {
          name: 'agentDismissalReason',
          label: 'سبب عزل الموكل',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'swornSubtype', values: ['agent_dismissal', 'agent_dismissal_2'] },
          validation: { required: 'سبب عزل الموكل مطلوب' }
        },
        // حقول إثبات صحة الوثائق
        {
          name: 'documentsDetails',
          label: 'تفاصيل الوثائق',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'swornSubtype', values: ['document_authenticity'] },
          validation: { required: 'تفاصيل الوثائق مطلوبة' }
        },
        {
          name: 'documentIssueAuthority',
          label: 'جهة إصدار الوثائق',
          type: 'text',
          required: true,
          conditional: { field: 'swornSubtype', values: ['document_authenticity'] },
          validation: { required: 'جهة إصدار الوثائق مطلوبة' }
        },
        {
          name: 'documentIssueDate',
          label: 'تاريخ إصدار الوثائق',
          type: 'date',
          required: true,
          conditional: { field: 'swornSubtype', values: ['document_authenticity'] },
          validation: { required: 'تاريخ إصدار الوثائق مطلوب' }
        },
        // حقول إثبات الأسماء
        {
          name: 'correctName',
          label: 'الاسم الصحيح',
          type: 'text',
          required: true,
          conditional: { field: 'swornSubtype', values: ['name_identity'] },
          validation: { required: 'الاسم الصحيح مطلوب' }
        },
        {
          name: 'incorrectName',
          label: 'الاسم الخطأ',
          type: 'text',
          required: true,
          conditional: { field: 'swornSubtype', values: ['name_identity'] },
          validation: { required: 'الاسم الخطأ مطلوب' }
        },
        {
          name: 'nameIdentityDetails',
          label: 'تفاصيل الأسماء',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'swornSubtype', values: ['name_identity'] },
          validation: { required: 'تفاصيل الأسماء مطلوبة' }
        },
        // حقول الخطة الإسكانية
        {
          name: 'housingPlanDetails',
          label: 'تفاصيل الخطة الإسكانية',
          type: 'textarea',
          required: true,
          rows: 4,
          conditional: { field: 'swornSubtype', values: ['housing_plan'] },
          validation: { required: 'تفاصيل الخطة الإسكانية مطلوبة' }
        },
        // حقول أراضي الحرفيين
        {
          name: 'landDetails',
          label: 'تفاصيل أراضي الحرفيين',
          type: 'textarea',
          required: true,
          rows: 4,
          conditional: { field: 'swornSubtype', values: ['craftsmen_lands'] },
          validation: { required: 'تفاصيل أراضي الحرفيين مطلوبة' }
        },
        // حقول الإعفاء الجزئي
        {
          name: 'exemptionReason',
          label: 'سبب الإعفاء',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'swornSubtype', values: ['partial_exit_exemption'] },
          validation: { required: 'سبب الإعفاء مطلوب' }
        },
        // حقول أخرى
        {
          name: 'otherDetails',
          label: 'تفاصيل أخرى',
          type: 'textarea',
          required: true,
          rows: 4,
          conditional: { field: 'swornSubtype', values: ['other_sworn'] },
          validation: { required: 'التفاصيل مطلوبة' }
        }
      ]
    },
    {
      id: 'witnesses-info',
      title: 'بيانات الشهود',
      fields: [
        {
          name: 'witnessName1',
          label: 'اسم الشاهد الأول',
          type: 'text',
          required: true,
          validation: { required: 'اسم الشاهد الأول مطلوب' }
        },
        {
          name: 'witnessId1',
          label: 'رقم هوية الشاهد الأول',
          type: 'text',
          required: true,
          validation: { required: 'رقم هوية الشاهد الأول مطلوب' }
        },
        {
          name: 'witnessName2',
          label: 'اسم الشاهد الثاني',
          type: 'text',
          required: false
        },
        {
          name: 'witnessId2',
          label: 'رقم هوية الشاهد الثاني',
          type: 'text',
          required: false
        }
      ]
    },
    {
      id: 'documents-upload',
      title: 'المستندات المطلوبة',
      fields: [
        {
          name: 'passportCopy',
          label: 'صورة الجواز أو الإقامة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة الجواز أو الإقامة مطلوبة' }
        },
        {
          name: 'witnessId1Copy',
          label: 'صورة هوية الشاهد الأول',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة هوية الشاهد الأول مطلوبة' }
        },
        {
          name: 'witnessId2Copy',
          label: 'صورة هوية الشاهد الثاني',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: false,
          maxSize: '5MB'
        },
        {
          name: 'supportingDocs',
          label: 'مستندات داعمة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          multiple: true,
          required: false,
          maxSize: '5MB',
          help: 'أي مستندات إضافية تدعم الإقرار'
        }
      ]
    }
  ]
};