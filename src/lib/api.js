// Mock API functions for consular services
import { servicesConfig, serviceCategories } from '../services/index.js';
import { getStatusLabel } from './statuses.js';

export const fetchServices = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would fetch from an actual API
  return {
    success: true,
    data: {
      services: Object.keys(servicesConfig),
      categories: Object.keys(serviceCategories)
    }
  };
};

export const fetchServiceDetails = async (serviceId) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const service = servicesConfig[serviceId];
  if (!service) {
    return {
      success: false,
      error: 'الخدمة غير موجودة'
    };
  }
  
  return {
    success: true,
    data: service
  };
};

export const fetchRequirements = async (serviceId) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const service = servicesConfig[serviceId];
  if (!service) {
    return {
      success: false,
      error: 'الخدمة غير موجودة'
    };
  }
  
  return {
    success: true,
    data: {
      requirements: service.requirements,
      fees: service.fees,
      duration: service.duration
    }
  };
};

// Helper function to upload files to Supabase Storage
const uploadFilesToStorage = async (supabase, formData) => {
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

  for (const fieldName of fileFields) {
    const files = formData[fieldName];

    if (files && Array.isArray(files) && files.length > 0) {
      const uploadedFiles = [];

      for (const file of files) {
        // Skip if not a File object
        if (!(file instanceof File)) {
          continue;
        }

        try {
          // Generate unique file name
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(7);
          const fileExt = file.name.split('.').pop();
          const fileName = `${timestamp}_${randomStr}.${fileExt}`;
          const filePath = `applications/${fileName}`;

          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

          if (error) {
            console.error('Error uploading file:', error);
            continue;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

          uploadedFiles.push({
            name: file.name,
            size: `${(file.size / 1024).toFixed(2)} KB`,
            type: file.type,
            url: urlData.publicUrl,
            uploadDate: new Date().toLocaleDateString('ar-SA')
          });
        } catch (err) {
          console.error('Error processing file:', err);
        }
      }

      processedData[fieldName] = uploadedFiles;
    }
  }

  return processedData;
};

export const submitApplication = async (applicationData) => {
  try {
    // استيراد Supabase
    const { supabase } = await import('./supabase.js');

    if (!supabase) {
      // Fallback للنظام القديم إذا لم يكن Supabase متاحاً
      await new Promise(resolve => setTimeout(resolve, 2000));
      const refNumber = generateReferenceNumber();

      return {
        success: true,
        data: {
          referenceNumber: refNumber,
          submissionDate: new Date().toISOString(),
          estimatedCompletion: calculateEstimatedCompletion(applicationData.serviceId),
          status: 'submitted',
          message: 'تم استلام طلبكم بنجاح'
        }
      };
    }

    // Generate reference number
    const refNumber = generateReferenceNumber();
    const estimatedCompletion = calculateEstimatedCompletion(applicationData.serviceId);

    // Upload files and get processed data
    const processedFormData = await uploadFilesToStorage(supabase, applicationData.formData);

    // حفظ في Supabase
    const { data, error } = await supabase
      .from('applications')
      .insert({
        reference_number: refNumber,
        service_id: applicationData.serviceId,
        service_title: applicationData.serviceTitle,
        form_data: processedFormData,
        applicant_region: processedFormData.region || null,
        applicant_phone: processedFormData.phoneNumber || null,
        applicant_email: processedFormData.email || null,
        status: 'submitted',
        submission_date: applicationData.submissionDate || new Date().toISOString(),
        estimated_completion: estimatedCompletion
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return {
      success: true,
      data: {
        referenceNumber: data.reference_number,
        submissionDate: data.submission_date,
        estimatedCompletion: data.estimated_completion,
        status: data.status,
        message: 'تم استلام طلبكم بنجاح'
      }
    };
  } catch (error) {
    console.error('Error submitting application:', error);
    return {
      success: false,
      error: 'حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.'
    };
  }
};

export const trackApplication = async (referenceNumber) => {
  try {
    // استيراد Supabase
    const { supabase } = await import('./supabase.js');

    if (!supabase) {
      // Fallback للنظام القديم
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        data: {
          referenceNumber,
          status: 'in_review',
          statusText: 'قيد المراجعة',
          submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdate: new Date().toISOString(),
          steps: [
            { step: 'submitted', completed: true, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
            { step: 'review', completed: true, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
            { step: 'processing', completed: false, date: null },
            { step: 'ready', completed: false, date: null }
          ]
        }
      };
    }

    // البحث في Supabase
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('reference_number', referenceNumber)
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data) {
      return {
        success: false,
        error: 'لم يتم العثور على الطلب'
      };
    }

    // تحديد الخطوات المكتملة
    const steps = [
      { step: 'submitted', completed: true, date: data.submission_date },
      { step: 'review', completed: ['in_review', 'processing', 'ready', 'completed'].includes(data.status), date: data.status !== 'submitted' ? data.updated_at : null },
      { step: 'processing', completed: ['processing', 'ready', 'completed'].includes(data.status), date: data.status === 'processing' || data.status === 'ready' || data.status === 'completed' ? data.updated_at : null },
      { step: 'ready', completed: ['ready', 'completed'].includes(data.status), date: data.status === 'ready' || data.status === 'completed' ? data.updated_at : null }
    ];

    // الحصول على نص الحالة من النظام الموحد
    const statusText = await getStatusLabel(data.status, 'ar');

    return {
      success: true,
      data: {
        referenceNumber: data.reference_number,
        serviceTitle: data.service_title,
        status: data.status,
        statusText: statusText || data.status,
        submissionDate: data.submission_date,
        lastUpdate: data.updated_at,
        estimatedCompletion: data.estimated_completion,
        steps
      }
    };
  } catch (error) {
    console.error('Error tracking application:', error);
    return {
      success: false,
      error: 'حدث خطأ في تتبع الطلب'
    };
  }
};

// Helper functions
const generateReferenceNumber = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SUD-${year}-${randomNum}`;
};

const calculateEstimatedCompletion = (serviceId) => {
  const service = servicesConfig[serviceId];
  if (!service) return null;

  let maxDays = 7; // القيمة الافتراضية
  let durationString = null;

  // معالجة duration إذا كان string أو object
  if (service.duration) {
    if (typeof service.duration === 'string') {
      durationString = service.duration;
    } else if (typeof service.duration === 'object') {
      // إذا كان object، نأخذ أي قيمة منه (new, renewal, replacement)
      durationString = service.duration.new || service.duration.renewal || service.duration.replacement || Object.values(service.duration)[0];
    }
  }

  // Extract days from duration string (e.g., "7-10 أيام عمل" -> 10)
  if (durationString && typeof durationString === 'string') {
    const durationMatch = durationString.match(/(\d+)-?(\d+)?/);
    if (durationMatch) {
      maxDays = parseInt(durationMatch[2] || durationMatch[1]);
    }
  }

  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + maxDays);

  return completionDate.toISOString();
};