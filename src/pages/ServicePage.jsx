import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import DynamicServiceForm from '../components/DynamicServiceForm';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot';
import { supabase } from '../lib/supabase';

// دالة لتحويل بيانات قاعدة البيانات إلى صيغة config
function buildConfigFromDatabase(service) {
  console.log('🟡 [buildConfigFromDatabase] Starting with service:', {
    slug: service.slug,
    name: service.name_ar,
    totalDocuments: (service.service_documents || []).length,
    totalFields: (service.service_fields || []).length
  });

  // تحديد الرسوم بناءً على البيانات المتوفرة
  let feesText = 'حسب نوع الخدمة';
  if (service.has_age_based_pricing) {
    feesText = `${service.price_under_18} ريال (تحت 18 سنة) / ${service.price_18_and_above} ريال (18 سنة فما فوق)`;
  } else if (service.fees) {
    feesText = service.fees;
  }

  // تجميع الحقول حسب step_id
  const fieldsByStep = {};
  (service.service_fields || [])
    .filter(field => field.is_active)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    .forEach(field => {
      const stepId = field.step_id || 'default';
      const stepTitle = field.step_title_ar || 'تفاصيل الخدمة';

      if (!fieldsByStep[stepId]) {
        fieldsByStep[stepId] = {
          id: stepId,
          title: stepTitle,
          fields: []
        };
      }

      fieldsByStep[stepId].fields.push({
        name: field.field_name,
        label: field.label_ar,
        type: field.field_type,
        required: field.is_required,
        placeholder: field.placeholder_ar,
        options: field.options || [],
        conditional: field.conditions,
        help: field.help_text_ar,
        subfields: field.subfields || []
      });
    });

  // ترتيب المتطلبات حسب order_index - الاحتفاظ بالكائنات الكاملة
  const requirements = (service.service_requirements || [])
    .filter(req => req.is_active)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  // ترتيب المستندات حسب order_index - الاحتفاظ بالكائنات الكاملة
  const documents = (service.service_documents || [])
    .filter(doc => doc.is_active)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  console.log('🟠 [buildConfigFromDatabase] After filtering documents:', {
    totalActive: documents.length,
    documents: documents.map(d => ({
      id: d.id,
      name: d.document_name_ar,
      is_required: d.is_required,
      conditions: d.conditions
    }))
  });

  // تحويل fieldsByStep إلى array
  const steps = Object.values(fieldsByStep);

  // إضافة خطوة المستندات تلقائياً إذا كان هناك مستندات
  if (documents.length > 0) {
    console.log('🟢🟢🟢 [buildConfigFromDatabase] Building documents step:', {
      totalDocuments: documents.length,
      documentNames: documents.map(d => d.document_name_ar),
      documentConditions: documents.map(d => ({
        name: d.document_name_ar,
        conditions: d.conditions
      }))
    });

    const documentsStep = {
      id: 'documents-upload',
      title: 'رفع المستندات المطلوبة',
      fields: documents.map(doc => {
        const formats = doc.accepted_formats || ['pdf', 'jpg', 'jpeg', 'png'];
        const field = {
          name: `document_${doc.id}`,
          label: doc.document_name_ar,
          type: 'file',
          required: doc.is_required,
          conditional: doc.conditions,
          help: doc.description_ar,
          accept: formats.map(f => `.${f}`).join(','),
          multiple: false
        };

        console.log('🔵 [buildConfigFromDatabase] Document field created:', {
          name: field.name,
          label: field.label,
          hasConditions: !!field.conditional,
          conditionalValue: field.conditional
        });

        return field;
      })
    };
    steps.push(documentsStep);
  }

  return {
    id: service.slug,
    title: service.name_ar,
    description: service.description_ar || '',
    fees: feesText,
    duration: service.duration,
    requirements: requirements,
    documents: documents,
    steps: steps
  };
}

export default function ServicePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [serviceName, setServiceName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loadedSlugRef = useRef(null);

  useEffect(() => {
    if (!slug) return;

    // Prevent re-loading if we already loaded this slug
    if (loadedSlugRef.current === slug) return;

    const loadServiceData = async () => {
      console.log('[ServicePage] Starting to load service:', slug);
      try {
        setLoading(true);
        setError(null);

        // جلب معرف الخدمة من query parameter إذا كان موجوداً
        const urlParams = new URLSearchParams(window.location.search);
        const serviceId = urlParams.get('type');

        // إذا كان هناك معرف UUID في الـ query parameter، استخدمه للبحث في قاعدة البيانات
        let effectiveSlug = slug;

        if (serviceId) {
          try {
            // أولاً، حاول البحث في جدول services
            const { data: service, error: serviceError } = await supabase
              .from('services')
              .select('*')
              .eq('id', serviceId)
              .maybeSingle();

            if (service) {
              // وجدنا الخدمة، جلب البيانات الكاملة مباشرة
              console.log('[ServicePage] Found service in database by ID:', service.name_ar);

              // جلب البيانات المرتبطة
              const [fieldsResult, reqResult, docResult] = await Promise.all([
                supabase
                  .from('service_fields')
                  .select('*')
                  .eq('service_id', service.id)
                  .eq('is_active', true)
                  .order('order_index'),

                supabase
                  .from('service_requirements')
                  .select('*')
                  .eq('service_id', service.id)
                  .eq('is_active', true)
                  .order('order_index'),

                supabase
                  .from('service_documents')
                  .select('*')
                  .eq('service_id', service.id)
                  .eq('is_active', true)
                  .order('order_index')
              ]);

              // Load subfields for dynamic-list fields
              const fieldsWithSubfields = await Promise.all(
                (fieldsResult.data || []).map(async (field) => {
                  if (field.field_type === 'dynamic-list') {
                    const { data: subfieldsData } = await supabase
                      .from('service_dynamic_list_fields')
                      .select('*')
                      .eq('parent_field_id', field.id)
                      .order('order_index');

                    return {
                      ...field,
                      subfields: (subfieldsData || []).map(sf => ({
                        name: sf.field_name,
                        type: sf.field_type,
                        label: sf.label_ar,
                        label_ar: sf.label_ar,
                        label_en: sf.label_en,
                        required: sf.is_required,
                        is_required: sf.is_required,
                        options: sf.options,
                        validation: sf.validation_rules
                      }))
                    };
                  }
                  return field;
                })
              );

              service.service_fields = fieldsWithSubfields;
              service.service_requirements = reqResult.data || [];
              service.service_documents = docResult.data || [];

              const config = buildConfigFromDatabase(service);
              setServiceConfig(config);
              loadedSlugRef.current = slug;
              setLoading(false);
              return;
            } else {
              // إذا لم نجد الخدمة، ابحث في جدول service_types (الخدمات الفرعية)
              const { data: serviceType, error: serviceTypeError } = await supabase
                .from('service_types')
                .select(`
                  id,
                  name_ar,
                  name_en,
                  description_ar,
                  config,
                  service_id
                `)
                .eq('id', serviceId)
                .maybeSingle();

              if (serviceType) {

                // جلب جميع متطلبات ومستندات وحقول الخدمة الفرعية من service_types
                const [reqResult, docResult, fieldResult] = await Promise.all([
                  supabase
                    .from('service_requirements')
                    .select('*')
                    .eq('service_type_id', serviceType.id)
                    .eq('is_active', true)
                    .order('order_index'),

                  supabase
                    .from('service_documents')
                    .select('*')
                    .eq('service_type_id', serviceType.id)
                    .eq('is_active', true)
                    .order('order_index'),

                  supabase
                    .from('service_fields')
                    .select('*')
                    .eq('service_type_id', serviceType.id)
                    .eq('is_active', true)
                    .order('order_index')
                ]);

                // جلب بيانات الخدمة الرئيسية
                const { data: parentService } = await supabase
                  .from('services')
                  .select('fees, duration, has_age_based_pricing, price_under_18, price_18_and_above')
                  .eq('id', serviceType.service_id)
                  .maybeSingle();

                // بناء كائن service مؤقت مع فلترة وترتيب البيانات
                const virtualService = {
                  id: serviceType.id,
                  slug: serviceType.config?.slug || 'educational',
                  name_ar: serviceType.name_ar,
                  description_ar: serviceType.description_ar,
                  fees: parentService?.fees,
                  duration: parentService?.duration,
                  has_age_based_pricing: parentService?.has_age_based_pricing,
                  price_under_18: parentService?.price_under_18,
                  price_18_and_above: parentService?.price_18_and_above,
                  service_requirements: (reqResult.data || [])
                    .filter(req => req.is_active)
                    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
                  service_documents: (docResult.data || [])
                    .filter(doc => doc.is_active)
                    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
                  service_fields: (fieldResult.data || [])
                    .filter(field => field.is_active)
                    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                };

                const config = buildConfigFromDatabase(virtualService);
                setServiceConfig(config);
                loadedSlugRef.current = slug;
                return;
              }
            }
          } catch (innerErr) {
            // Continue to try loading with slug
          }
        }

        // أولاً: جلب من قاعدة البيانات باستخدام slug (with timeout)
        console.log('[ServicePage] Fetching from database for slug:', effectiveSlug);

        const dbPromise = supabase
          .from('services')
          .select('*')
          .eq('slug', effectiveSlug)
          .maybeSingle();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        );

        let service, serviceError;
        try {
          const result = await Promise.race([dbPromise, timeoutPromise]);
          service = result.data;
          serviceError = result.error;
        } catch (timeoutErr) {
          console.log('[ServicePage] Database timeout');
          setError('فشل في تحميل بيانات الخدمة. يرجى المحاولة مرة أخرى.');
          setLoading(false);
          return;
        }

        // إذا وجدنا الخدمة في قاعدة البيانات، استخدمها
        if (service) {
          console.log('[ServicePage] Found service in database:', service.name_ar);
          setServiceName(service.name_ar);
          loadedSlugRef.current = slug;
          setLoading(false);
          return;
        }

        // لم نجد الخدمة في قاعدة البيانات
        console.error('[ServicePage] Service not found:', slug, effectiveSlug);
        setError('الخدمة غير موجودة أو غير منشورة حالياً');
      } catch (err) {
        console.error('Error loading service:', err);
        setError('حدث خطأ في تحميل بيانات الخدمة: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadServiceData();
  }, [slug]);

  // Helper function to upload files to Supabase Storage (Parallel Upload)
  const uploadFilesToStorage = async (formData) => {
    const processedData = { ...formData };

    // List of possible file fields
    const fileFields = [
      'personalPhoto',
      'nationalIdCopy',
      'nationalIdCopyAdult',
      'passportCopy',
      'residencyCopy',
      'birthCertificate',
      'marriageCertificate',
      'deathCertificate',
      'policeReport',
      'oldPassportPhoto',
      'document1',
      'document2',
      'document3',
      'additionalDocuments'
    ];

    // إضافة الحقول الديناميكية (document_xxx)
    Object.keys(formData).forEach(key => {
      if (key.startsWith('document_') && !key.endsWith('_label')) {
        fileFields.push(key);
      }
    });

    // جمع كل الملفات للرفع بالتوازي
    const uploadPromises = [];
    const fieldNameMapping = [];

    for (const fieldName of fileFields) {
      const files = formData[fieldName];

      if (files && Array.isArray(files) && files.length > 0) {
        for (const file of files) {
          // Skip if not a File object
          if (!(file instanceof File)) {
            continue;
          }

          // إنشاء promise لرفع كل ملف
          const uploadPromise = (async () => {
            try {
              // Generate unique file name
              const timestamp = Date.now();
              const randomStr = Math.random().toString(36).substring(7);
              const fileExt = file.name.split('.').pop();
              const fileName = `${timestamp}_${randomStr}.${fileExt}`;
              const filePath = `applications/${fileName}`;

              console.log(`⬆️ [Upload] Starting upload: ${file.name}`);

              // Upload to Supabase Storage
              const { data, error } = await supabase.storage
                .from('documents')
                .upload(filePath, file);

              if (error) {
                console.error(`❌ [Upload] Error uploading ${file.name}:`, error);
                return null;
              }

              // Get public URL
              const { data: urlData } = supabase.storage
                .from('documents')
                .getPublicUrl(filePath);

              console.log(`✅ [Upload] Successfully uploaded: ${file.name}`);

              return {
                fieldName,
                fileData: {
                  name: file.name,
                  size: `${(file.size / 1024).toFixed(2)} KB`,
                  type: file.type,
                  url: urlData.publicUrl,
                  uploadDate: new Date().toLocaleDateString('ar-SA')
                }
              };
            } catch (err) {
              console.error(`❌ [Upload] Error processing ${file.name}:`, err);
              return null;
            }
          })();

          uploadPromises.push(uploadPromise);
        }
      }
    }

    // رفع كل الملفات بالتوازي
    console.log(`📦 [Upload] Starting parallel upload of ${uploadPromises.length} files...`);
    const uploadResults = await Promise.all(uploadPromises);
    console.log(`✅ [Upload] Finished parallel upload`);

    // تجميع النتائج حسب fieldName
    for (const result of uploadResults) {
      if (result) {
        const { fieldName, fileData } = result;
        if (!processedData[fieldName]) {
          processedData[fieldName] = [];
        }
        if (!Array.isArray(processedData[fieldName])) {
          processedData[fieldName] = [processedData[fieldName]];
        }
        processedData[fieldName].push(fileData);
      }
    }

    // تنظيف الحقول - إزالة الملفات غير المرفوعة
    for (const fieldName of fileFields) {
      if (processedData[fieldName] && Array.isArray(processedData[fieldName])) {
        const uploaded = processedData[fieldName].filter(item => item && item.url);
        if (uploaded.length === 0) {
          delete processedData[fieldName];
        } else {
          processedData[fieldName] = uploaded;
        }
      }
    }

    return processedData;
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);

    try {
      // جلب معرف الخدمة من query parameter إذا كان موجوداً
      const urlParams = new URLSearchParams(window.location.search);
      const serviceId = urlParams.get('type');

      // الحصول على بيانات الخدمة
      let service;
      if (serviceId) {
        const { data, error: serviceError } = await supabase
          .from('services')
          .select('id, slug, name_ar')
          .eq('id', serviceId)
          .maybeSingle();

        if (serviceError) throw serviceError;
        service = data;
      } else {
        const { data, error: serviceError } = await supabase
          .from('services')
          .select('id, slug, name_ar')
          .eq('slug', slug)
          .maybeSingle();

        if (serviceError) throw serviceError;
        service = data;
      }

      // Upload files and get processed data
      const processedFormData = await uploadFilesToStorage(formData);

      // إدراج الطلب
      const { data: application, error: insertError } = await supabase
        .from('applications')
        .insert([
          {
            service_id: service.slug,
            service_title: service.name_ar,
            form_data: processedFormData,
            applicant_region: formData.region || null,
            applicant_phone: formData.phoneNumber || null,
            applicant_email: formData.email || null,
            status: 'submitted',
            submission_date: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('Application created successfully:', application);

      if (!application || !application.reference_number) {
        throw new Error('فشل في إنشاء رقم المعاملة');
      }

      // التوجيه إلى صفحة النجاح
      navigate('/success', {
        state: {
          referenceNumber: application.reference_number,
          serviceTitle: service.name_ar
        },
        replace: true
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(error.message || 'حدث خطأ أثناء إرسال الطلب');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#276073] mx-auto mb-4" />
            <p className="text-gray-600 text-lg">جاري تحميل بيانات الخدمة...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[#276073] hover:text-[#1e4a5a] mx-auto"
            >
              <ArrowRight className="w-5 h-5" />
              العودة
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
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
              <h1 className="text-2xl sm:text-3xl font-bold">{serviceName}</h1>
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DynamicServiceForm
            serviceSlug={slug}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      <Footer />
      <ChatBot serviceCategory={slug} />
    </>
  );
}
