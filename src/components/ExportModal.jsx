import React, { useState, useEffect } from 'react';
import { X, FileText, Download, FileSpreadsheet, CheckSquare, Square, Save, Trash2, FolderOpen, Plus, GripVertical, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '../lib/supabase';

const AVAILABLE_FIELDS = [
  { key: 'reference_number', label: 'الرقم المرجعي', defaultSelected: true, category: 'basic' },
  { key: 'service_title', label: 'اسم الخدمة', defaultSelected: true, category: 'basic' },
  { key: 'status', label: 'الحالة', defaultSelected: true, category: 'basic' },
  { key: 'fullName', label: 'اسم المتقدم', defaultSelected: true, category: 'applicant' },
  { key: 'applicant_phone', label: 'رقم الهاتف', defaultSelected: true, category: 'applicant' },
  { key: 'applicant_email', label: 'البريد الإلكتروني', defaultSelected: false, category: 'applicant' },
  { key: 'applicant_region', label: 'المنطقة', defaultSelected: true, category: 'applicant' },
  { key: 'national_id', label: 'رقم الهوية الوطنية', defaultSelected: false, category: 'applicant' },
  { key: 'passport_number', label: 'رقم الجواز', defaultSelected: false, category: 'applicant' },
  { key: 'created_at', label: 'تاريخ التقديم', defaultSelected: true, category: 'dates' },
  { key: 'updated_at', label: 'تاريخ آخر تحديث', defaultSelected: false, category: 'dates' },
  { key: 'approved_at', label: 'تاريخ الموافقة', defaultSelected: false, category: 'dates' },
  { key: 'rejected_at', label: 'تاريخ الرفض', defaultSelected: false, category: 'dates' },
  { key: 'completed_at', label: 'تاريخ الإنجاز', defaultSelected: false, category: 'dates' },
  { key: 'total_price', label: 'إجمالي الرسوم', defaultSelected: false, category: 'financial' },
  { key: 'payment_status', label: 'حالة الدفع', defaultSelected: false, category: 'financial' },
  { key: 'payment_method', label: 'طريقة الدفع', defaultSelected: false, category: 'financial' },
  { key: 'transaction_id', label: 'رقم المعاملة', defaultSelected: false, category: 'financial' },
  { key: 'appointment_date', label: 'تاريخ الموعد', defaultSelected: false, category: 'appointment' },
  { key: 'appointment_time', label: 'وقت الموعد', defaultSelected: false, category: 'appointment' },
  { key: 'appointment_status', label: 'حالة الموعد', defaultSelected: false, category: 'appointment' },
  { key: 'shipping_company', label: 'شركة الشحن', defaultSelected: false, category: 'shipping' },
  { key: 'tracking_number', label: 'رقم التتبع', defaultSelected: false, category: 'shipping' },
  { key: 'shipping_status', label: 'حالة الشحن', defaultSelected: false, category: 'shipping' },
  { key: 'shipping_address', label: 'عنوان الشحن', defaultSelected: false, category: 'shipping' },
  { key: 'staff_name', label: 'اسم الموظف المسؤول', defaultSelected: false, category: 'processing' },
  { key: 'staff_notes', label: 'ملاحظات الموظف', defaultSelected: false, category: 'processing' },
  { key: 'rejection_reason', label: 'سبب الرفض', defaultSelected: false, category: 'processing' },
  { key: 'processing_time', label: 'مدة المعالجة (أيام)', defaultSelected: false, category: 'processing' },
];

export default function ExportModal({
  isOpen,
  onClose,
  applications,
  statuses,
  selectedMainService = 'all',
  selectedSubService = 'all',
  mainServices = [],
  subServices = []
}) {
  const [selectedFields, setSelectedFields] = useState(
    AVAILABLE_FIELDS.filter(f => f.defaultSelected).map(f => f.key)
  );
  const [exportFormat, setExportFormat] = useState('excel');
  const [isExporting, setIsExporting] = useState(false);

  // ترتيب الأعمدة
  const [columnOrder, setColumnOrder] = useState([]);
  const [draggedColumn, setDraggedColumn] = useState(null);

  // الأعمدة المخصصة
  const [customColumns, setCustomColumns] = useState([]);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnValue, setNewColumnValue] = useState('');
  const [editingColumnIndex, setEditingColumnIndex] = useState(null);

  // حقول الخدمة الديناميكية
  const [serviceFields, setServiceFields] = useState([]);
  const [selectedServiceFields, setSelectedServiceFields] = useState([]);
  const [singleServiceId, setSingleServiceId] = useState(null);
  const [loadingServiceFields, setLoadingServiceFields] = useState(false);

  // قوالب التقارير
  const [reportTemplates, setReportTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // تحديث ترتيب الأعمدة عند تغيير الحقول المختارة
  useEffect(() => {
    const allColumns = [
      ...selectedFields.map(f => ({ type: 'basic', key: f })),
      ...selectedServiceFields.map(f => ({ type: 'service', key: f })),
      ...customColumns.map((c, i) => ({ type: 'custom', key: `custom_${i}` }))
    ];

    // إزالة الأعمدة التي لم تعد محددة
    const newOrder = columnOrder.filter(col => {
      if (col.type === 'basic') return selectedFields.includes(col.key);
      if (col.type === 'service') return selectedServiceFields.includes(col.key);
      if (col.type === 'custom') {
        const idx = parseInt(col.key.split('_')[1]);
        return idx < customColumns.length;
      }
      return false;
    });

    // إضافة الأعمدة الجديدة
    allColumns.forEach(col => {
      const exists = newOrder.find(c => c.type === col.type && c.key === col.key);
      if (!exists) {
        newOrder.push(col);
      }
    });

    setColumnOrder(newOrder);
  }, [selectedFields, selectedServiceFields, customColumns]);

  // إضافة عمود مخصص
  const handleAddCustomColumn = () => {
    if (!newColumnName.trim()) {
      alert('يرجى إدخال اسم العمود');
      return;
    }

    if (editingColumnIndex !== null) {
      // تعديل عمود موجود
      const updated = [...customColumns];
      updated[editingColumnIndex] = { name: newColumnName, value: newColumnValue };
      setCustomColumns(updated);
      setEditingColumnIndex(null);
    } else {
      // إضافة عمود جديد
      setCustomColumns([...customColumns, { name: newColumnName, value: newColumnValue }]);
    }

    setNewColumnName('');
    setNewColumnValue('');
    setShowAddColumnModal(false);
  };

  // حذف عمود مخصص
  const handleDeleteCustomColumn = (index) => {
    if (!confirm('هل أنت متأكد من حذف هذا العمود؟')) return;
    setCustomColumns(customColumns.filter((_, i) => i !== index));
  };

  // تعديل عمود مخصص
  const handleEditCustomColumn = (index) => {
    setEditingColumnIndex(index);
    setNewColumnName(customColumns[index].name);
    setNewColumnValue(customColumns[index].value);
    setShowAddColumnModal(true);
  };

  // Drag & Drop handlers
  const handleDragStart = (column) => {
    setDraggedColumn(column);
  };

  const handleDragOver = (e, targetColumn) => {
    e.preventDefault();
    if (!draggedColumn || (draggedColumn.type === targetColumn.type && draggedColumn.key === targetColumn.key)) return;

    const newOrder = [...columnOrder];
    const draggedIndex = newOrder.findIndex(c => c.type === draggedColumn.type && c.key === draggedColumn.key);
    const targetIndex = newOrder.findIndex(c => c.type === targetColumn.type && c.key === targetColumn.key);

    if (draggedIndex === -1 || targetIndex === -1) return;

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedColumn);

    setColumnOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
  };

  // الحصول على label العمود
  const getColumnLabel = (column) => {
    if (column.type === 'basic') {
      const field = AVAILABLE_FIELDS.find(f => f.key === column.key);
      return field?.label || column.key;
    }
    if (column.type === 'service') {
      const field = serviceFields.find(f => f.field_name === column.key);
      return field?.label_ar || column.key;
    }
    if (column.type === 'custom') {
      const idx = parseInt(column.key.split('_')[1]);
      return customColumns[idx]?.name || column.key;
    }
    return column.key;
  };

  // التحقق إذا كانت كل النتائج من نفس الخدمة وجلب حقولها
  useEffect(() => {
    const checkAndLoadServiceFields = async () => {
      if (!applications || applications.length === 0) {
        setServiceFields([]);
        setSingleServiceId(null);
        return;
      }

      const uniqueServiceIds = [...new Set(applications.map(app => app.service_id))];

      if (uniqueServiceIds.length === 1) {
        const serviceSlug = uniqueServiceIds[0];
        setSingleServiceId(serviceSlug);
        setLoadingServiceFields(true);

        try {
          const { data: serviceData, error: serviceError } = await supabase
            .from('services')
            .select('id')
            .eq('slug', serviceSlug)
            .maybeSingle();

          if (serviceError) throw serviceError;

          if (!serviceData) {
            setServiceFields([]);
            setLoadingServiceFields(false);
            return;
          }

          const { data, error } = await supabase
            .from('service_fields')
            .select('field_name, label_ar, field_type, options')
            .eq('service_id', serviceData.id)
            .order('order_index');

          if (error) throw error;

          const filteredFields = (data || []).filter(field =>
            field.field_type !== 'file' &&
            field.field_type !== 'heading' &&
            field.field_type !== 'info' &&
            !field.field_name.startsWith('document_')
          );

          setServiceFields(filteredFields);
        } catch (error) {
          console.error('Error loading service fields:', error);
          setServiceFields([]);
        } finally {
          setLoadingServiceFields(false);
        }
      } else {
        setServiceFields([]);
        setSingleServiceId(null);
      }
    };

    if (isOpen) {
      checkAndLoadServiceFields();
    }
  }, [isOpen, applications]);

  // تحميل قوالب التقارير
  useEffect(() => {
    const loadTemplates = async () => {
      if (!isOpen) return;

      setLoadingTemplates(true);
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;

        let query = supabase
          .from('export_report_templates')
          .select('*')
          .order('created_at', { ascending: false });

        let selectedServiceSlug = null;

        if (selectedSubService !== 'all') {
          const subService = subServices.find(s => s.id === selectedSubService);
          if (subService) {
            selectedServiceSlug = subService.slug;
          }
        } else if (selectedMainService !== 'all') {
          const mainService = mainServices.find(s => s.id === selectedMainService);
          if (mainService) {
            selectedServiceSlug = mainService.slug;
          }
        }

        if (selectedServiceSlug) {
          query = query.or(`service_id.eq.${selectedServiceSlug},service_type.eq.all`);
        } else {
          query = query.eq('service_type', 'all');
        }

        const { data, error } = await query;

        if (error) throw error;

        setReportTemplates(data || []);
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    loadTemplates();
  }, [isOpen, selectedMainService, selectedSubService, mainServices, subServices]);

  // حفظ قالب
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert('يرجى إدخال اسم التقرير');
      return;
    }

    if (selectedFields.length === 0) {
      alert('يرجى اختيار حقل واحد على الأقل');
      return;
    }

    setIsSavingTemplate(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        alert('يجب تسجيل الدخول أولاً');
        return;
      }

      let selectedServiceSlug = null;
      let serviceType = 'all';

      if (selectedSubService !== 'all') {
        const subService = subServices.find(s => s.id === selectedSubService);
        if (subService) {
          selectedServiceSlug = subService.slug;
          serviceType = 'subcategory';
        }
      } else if (selectedMainService !== 'all') {
        const mainService = mainServices.find(s => s.id === selectedMainService);
        if (mainService) {
          selectedServiceSlug = mainService.slug;
          serviceType = 'primary';
        }
      }

      const { error } = await supabase
        .from('export_report_templates')
        .insert({
          name: templateName,
          description: templateDescription,
          selected_fields: selectedFields,
          selected_service_fields: selectedServiceFields,
          export_format: exportFormat,
          service_id: selectedServiceSlug,
          service_type: serviceType,
          created_by: currentUser.id,
          is_public: false,
          column_order: columnOrder,
          custom_columns: customColumns
        });

      if (error) throw error;

      alert('تم حفظ التقرير بنجاح!');
      setShowSaveTemplateModal(false);
      setTemplateName('');
      setTemplateDescription('');

      const { data } = await supabase
        .from('export_report_templates')
        .select('*')
        .eq('created_by', currentUser.id)
        .order('created_at', { ascending: false });

      setReportTemplates(data || []);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('حدث خطأ أثناء حفظ التقرير: ' + error.message);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // تطبيق قالب
  const handleApplyTemplate = (template) => {
    setSelectedFields(template.selected_fields || []);
    setSelectedServiceFields(template.selected_service_fields || []);
    setExportFormat(template.export_format || 'excel');
    setCustomColumns(template.custom_columns || []);
    if (template.column_order) {
      setColumnOrder(template.column_order);
    }
    setSelectedTemplate(template);
  };

  // حذف قالب
  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('export_report_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setReportTemplates(prev => prev.filter(t => t.id !== templateId));
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      }
      alert('تم حذف التقرير بنجاح');
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('حدث خطأ أثناء حذف التقرير: ' + error.message);
    }
  };

  // تصدير مباشر من قالب
  const handleQuickExport = async (template) => {
    handleApplyTemplate(template);
    setTimeout(() => {
      handleExport();
    }, 100);
  };

  const toggleField = (fieldKey) => {
    setSelectedFields(prev => {
      if (prev.includes(fieldKey)) {
        return prev.filter(k => k !== fieldKey);
      } else {
        return [...prev, fieldKey];
      }
    });
  };

  const toggleServiceField = (fieldName) => {
    setSelectedServiceFields(prev => {
      if (prev.includes(fieldName)) {
        return prev.filter(f => f !== fieldName);
      } else {
        return [...prev, fieldName];
      }
    });
  };

  const selectAll = () => {
    setSelectedFields(AVAILABLE_FIELDS.map(f => f.key));
  };

  const deselectAll = () => {
    setSelectedFields([]);
  };

  const getStatusLabel = (statusKey) => {
    const status = statuses.find(s => s.status_key === statusKey);
    return status ? status.label_ar : statusKey;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateProcessingTime = (createdAt, completedAt) => {
    if (!createdAt || !completedAt) return '-';
    const created = new Date(createdAt);
    const completed = new Date(completedAt);
    const diffTime = Math.abs(completed - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} يوم`;
  };

  const getFieldValue = (app, fieldKey) => {
    switch (fieldKey) {
      case 'reference_number': return app.reference_number || '-';
      case 'service_title': return app.service_title || '-';
      case 'status': return getStatusLabel(app.status);
      case 'fullName': return app.form_data?.fullName || '-';
      case 'applicant_phone': return app.applicant_phone || '-';
      case 'applicant_email': return app.applicant_email || '-';
      case 'applicant_region': return app.applicant_region || '-';
      case 'national_id': return app.form_data?.nationalId || app.form_data?.national_id || '-';
      case 'passport_number': return app.form_data?.passportNumber || app.form_data?.passport_number || '-';
      case 'created_at': return formatDate(app.created_at);
      case 'updated_at': return formatDate(app.updated_at);
      case 'approved_at': return formatDate(app.approved_at);
      case 'rejected_at': return formatDate(app.rejected_at);
      case 'completed_at': return formatDate(app.completed_at);
      case 'total_price': return app.pricing?.total_price ? `${app.pricing.total_price} ريال` : '-';
      case 'payment_status': return app.payment_status === 'paid' ? 'مدفوع' : 'غير مدفوع';
      case 'payment_method': return app.payment_method || '-';
      case 'transaction_id': return app.transaction_id || '-';
      case 'appointment_date': return app.appointment?.appointment_date ? formatDate(app.appointment.appointment_date) : '-';
      case 'appointment_time': return app.appointment?.time_slot || '-';
      case 'appointment_status':
        return app.appointment?.status === 'confirmed' ? 'مؤكد' :
               app.appointment?.status === 'cancelled' ? 'ملغي' :
               app.appointment?.status === 'completed' ? 'مكتمل' : '-';
      case 'shipping_company': return app.shipment?.company_name || '-';
      case 'tracking_number': return app.shipment?.tracking_number || '-';
      case 'shipping_status':
        return app.shipment?.status === 'pending' ? 'قيد الانتظار' :
               app.shipment?.status === 'shipped' ? 'تم الشحن' :
               app.shipment?.status === 'in_transit' ? 'في الطريق' :
               app.shipment?.status === 'delivered' ? 'تم التسليم' : '-';
      case 'shipping_address': return app.shipment?.shipping_address || '-';
      case 'staff_name': return app.staff?.full_name || '-';
      case 'staff_notes': return app.notes || '-';
      case 'rejection_reason': return app.rejection_reason || '-';
      case 'processing_time': return calculateProcessingTime(app.created_at, app.completed_at);
      default: return '-';
    }
  };

  const getServiceFieldValue = (app, fieldName) => {
    const field = serviceFields.find(f => f.field_name === fieldName);
    if (!field) return '-';

    const value = app.form_data?.[fieldName];

    let formattedValue = '-';
    if (value !== null && value !== undefined && value !== '') {
      if (field.field_type === 'date') {
        formattedValue = formatDate(value);
      } else if (field.field_type === 'checkbox') {
        formattedValue = value ? 'نعم' : 'لا';
      } else if (Array.isArray(value)) {
        if (field.options && Array.isArray(field.options)) {
          const translatedValues = value.map(v => {
            const option = field.options.find(opt => opt.value === v);
            return option?.label_ar || option?.label || v;
          });
          formattedValue = translatedValues.join(', ');
        } else {
          formattedValue = value.join(', ');
        }
      } else if (typeof value === 'object') {
        formattedValue = JSON.stringify(value);
      } else {
        if (field.options && Array.isArray(field.options)) {
          const option = field.options.find(opt => opt.value === value);
          formattedValue = option?.label_ar || option?.label || String(value);
        } else {
          formattedValue = String(value);
        }
      }
    }

    return formattedValue;
  };

  const prepareExportData = () => {
    return applications.map(app => {
      const row = {};

      // ترتيب الأعمدة حسب columnOrder
      columnOrder.forEach(column => {
        let columnLabel = '';
        let columnValue = '';

        if (column.type === 'basic') {
          const field = AVAILABLE_FIELDS.find(f => f.key === column.key);
          if (field) {
            columnLabel = field.label;
            columnValue = getFieldValue(app, column.key);
          }
        } else if (column.type === 'service') {
          const field = serviceFields.find(f => f.field_name === column.key);
          if (field) {
            columnLabel = field.label_ar;
            columnValue = getServiceFieldValue(app, column.key);
          }
        } else if (column.type === 'custom') {
          const idx = parseInt(column.key.split('_')[1]);
          const customCol = customColumns[idx];
          if (customCol) {
            columnLabel = customCol.name;
            columnValue = customCol.value || '-';
          }
        }

        if (columnLabel) {
          row[columnLabel] = columnValue;
        }
      });

      return row;
    });
  };

  const exportToExcel = () => {
    setIsExporting(true);
    try {
      const data = prepareExportData();
      const ws = XLSX.utils.json_to_sheet(data);

      const cols = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
      ws['!cols'] = cols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'الطلبات');

      const fileName = `applications_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      alert('تم تصدير الملف بنجاح!');
      onClose();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('حدث خطأ أثناء التصدير');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = () => {
    setIsExporting(true);
    try {
      const data = prepareExportData();

      if (data.length === 0) {
        alert('لا توجد بيانات للتصدير');
        setIsExporting(false);
        return;
      }

      const doc = new jsPDF('l', 'mm', 'a4');

      doc.setFont('helvetica');
      doc.setFontSize(16);

      doc.text('تقرير الطلبات', doc.internal.pageSize.width / 2, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}`, doc.internal.pageSize.width / 2, 22, { align: 'center' });

      const headers = [Object.keys(data[0] || {})];
      const rows = data.map(row => Object.values(row));

      doc.autoTable({
        head: headers,
        body: rows,
        startY: 30,
        styles: {
          font: 'helvetica',
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [39, 96, 115],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 30, right: 10, bottom: 10, left: 10 },
      });

      const fileName = `applications_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      alert('تم تصدير الملف بنجاح!');
      onClose();
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('حدث خطأ أثناء التصدير: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    if (selectedFields.length === 0 && selectedServiceFields.length === 0 && customColumns.length === 0) {
      alert('يرجى اختيار حقل واحد على الأقل للتصدير');
      return;
    }

    if (applications.length === 0) {
      alert('لا توجد بيانات للتصدير');
      return;
    }

    if (exportFormat === 'excel') {
      exportToExcel();
    } else {
      exportToPDF();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-[#276073]">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Download className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">تصدير البيانات</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Saved Templates */}
            {reportTemplates.length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-teal-900 flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    التقارير المحفوظة ({reportTemplates.length})
                  </h3>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {loadingTemplates ? (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : (
                    reportTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`flex items-center justify-between p-3 bg-white rounded-lg border-2 transition-all ${
                          selectedTemplate?.id === template.id
                            ? 'border-teal-500 shadow-md'
                            : 'border-gray-200 hover:border-teal-300'
                        }`}
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{template.name}</h4>
                          {template.description && (
                            <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {template.selected_fields?.length || 0} حقل
                            </span>
                            {template.selected_service_fields?.length > 0 && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-xs text-green-600">
                                  +{template.selected_service_fields.length} حقل خدمة
                                </span>
                              </>
                            )}
                            {template.custom_columns?.length > 0 && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-xs text-orange-600">
                                  +{template.custom_columns.length} عمود مخصص
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApplyTemplate(template)}
                            className="px-3 py-1.5 bg-teal-600 text-white text-xs rounded-lg hover:bg-teal-700 transition-colors"
                          >
                            تطبيق
                          </button>
                          <button
                            onClick={() => handleQuickExport(template)}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            تصدير
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Export Format */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                صيغة التصدير
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setExportFormat('excel')}
                  className={`flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse p-4 rounded-lg border-2 transition-all ${
                    exportFormat === 'excel'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  <span className="font-medium">Excel</span>
                </button>
                <button
                  onClick={() => setExportFormat('pdf')}
                  className={`flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse p-4 rounded-lg border-2 transition-all ${
                    exportFormat === 'pdf'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">PDF</span>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Fields Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    الحقول ({selectedFields.length} محدد)
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAll}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      الكل
                    </button>
                    <button
                      onClick={deselectAll}
                      className="text-xs text-red-600 hover:text-red-800 underline"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                  {['basic', 'applicant', 'dates', 'financial', 'appointment', 'shipping', 'processing'].map(category => {
                    const categoryFields = AVAILABLE_FIELDS.filter(f => f.category === category);
                    const categoryNames = {
                      basic: 'أساسية',
                      applicant: 'المتقدم',
                      dates: 'التواريخ',
                      financial: 'المالية',
                      appointment: 'المواعيد',
                      shipping: 'الشحن',
                      processing: 'المعالجة'
                    };

                    return (
                      <div key={category} className="space-y-1">
                        <h4 className="text-xs font-bold text-gray-600 mt-2">{categoryNames[category]}</h4>
                        {categoryFields.map(field => (
                          <button
                            key={field.key}
                            onClick={() => toggleField(field.key)}
                            className={`w-full flex items-center gap-2 p-2 rounded text-right text-xs transition-all ${
                              selectedFields.includes(field.key)
                                ? 'bg-blue-100 text-blue-700'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {selectedFields.includes(field.key) ? (
                              <CheckSquare className="w-3 h-3" />
                            ) : (
                              <Square className="w-3 h-3" />
                            )}
                            <span>{field.label}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })}

                  {/* Service Fields */}
                  {singleServiceId && serviceFields.length > 0 && (
                    <div className="space-y-1 pt-3 border-t-2 border-gray-300 mt-3">
                      <h4 className="text-xs font-bold text-green-600">حقول الخدمة</h4>
                      {serviceFields.map(field => (
                        <button
                          key={field.field_name}
                          onClick={() => toggleServiceField(field.field_name)}
                          className={`w-full flex items-center gap-2 p-2 rounded text-right text-xs transition-all ${
                            selectedServiceFields.includes(field.field_name)
                              ? 'bg-green-100 text-green-700'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {selectedServiceFields.includes(field.field_name) ? (
                            <CheckSquare className="w-3 h-3" />
                          ) : (
                            <Square className="w-3 h-3" />
                          )}
                          <span>{field.label_ar}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Column Order & Custom Columns */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    ترتيب الأعمدة والأعمدة المخصصة
                  </label>
                  <button
                    onClick={() => {
                      setEditingColumnIndex(null);
                      setNewColumnName('');
                      setNewColumnValue('');
                      setShowAddColumnModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    عمود مخصص
                  </button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                  {columnOrder.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      قم باختيار الحقول لترتيبها
                    </div>
                  ) : (
                    columnOrder.map((column, index) => {
                      const isCustom = column.type === 'custom';
                      const customIndex = isCustom ? parseInt(column.key.split('_')[1]) : null;

                      return (
                        <div
                          key={`${column.type}_${column.key}`}
                          draggable
                          onDragStart={() => handleDragStart(column)}
                          onDragOver={(e) => handleDragOver(e, column)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-center gap-2 p-2 rounded cursor-move transition-all ${
                            draggedColumn?.type === column.type && draggedColumn?.key === column.key
                              ? 'bg-blue-200'
                              : isCustom
                              ? 'bg-orange-50 hover:bg-orange-100'
                              : column.type === 'service'
                              ? 'bg-green-50 hover:bg-green-100'
                              : 'bg-white hover:bg-gray-100'
                          }`}
                        >
                          <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-xs flex-1">
                            {index + 1}. {getColumnLabel(column)}
                            {isCustom && customColumns[customIndex]?.value && (
                              <span className="text-gray-500 mr-1">
                                = "{customColumns[customIndex].value}"
                              </span>
                            )}
                          </span>
                          {isCustom && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCustomColumn(customIndex);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCustomColumn(customIndex);
                                }}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <p className="text-xs text-gray-600">
                  <GripVertical className="w-3 h-3 inline" /> اسحب الأعمدة لإعادة ترتيبها
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                سيتم تصدير {applications.length} طلب مع {columnOrder.length} عمود
                {customColumns.length > 0 && (
                  <span className="text-orange-700 font-medium">
                    {` (منها ${customColumns.length} عمود مخصص)`}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setShowSaveTemplateModal(true)}
              disabled={isExporting || columnOrder.length === 0}
              className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>حفظ كتقرير</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={isExporting}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || columnOrder.length === 0}
                className="flex items-center space-x-2 rtl:space-x-reverse px-6 py-2 bg-[#276073] text-white rounded-lg hover:bg-[#1e4a5a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري التصدير...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>تصدير</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Add/Edit Custom Column Modal */}
        {showAddColumnModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center p-4"
            onClick={() => setShowAddColumnModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-orange-600" />
                  {editingColumnIndex !== null ? 'تعديل' : 'إضافة'} عمود مخصص
                </h3>
                <button
                  onClick={() => setShowAddColumnModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم العمود <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="مثال: الجهة المختصة"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    القيمة الثابتة (اختياري)
                  </label>
                  <input
                    type="text"
                    value={newColumnValue}
                    onChange={(e) => setNewColumnValue(e.target.value)}
                    placeholder="مثال: القنصلية السودانية - جدة"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    القيمة ستكون نفسها لجميع الصفوف في التقرير
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowAddColumnModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleAddCustomColumn}
                    disabled={!newColumnName.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingColumnIndex !== null ? 'حفظ' : 'إضافة'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Save Template Modal */}
        {showSaveTemplateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center p-4"
            onClick={() => setShowSaveTemplateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Save className="w-5 h-5 text-teal-600" />
                  حفظ التقرير
                </h3>
                <button
                  onClick={() => setShowSaveTemplateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم التقرير <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="مثال: تقرير الطلبات الشهري"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    وصف التقرير (اختياري)
                  </label>
                  <textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="وصف مختصر لهذا التقرير..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">سيتم حفظ:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-teal-600" />
                      {columnOrder.length} عمود بالترتيب الحالي
                    </li>
                    {customColumns.length > 0 && (
                      <li className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-orange-600" />
                        {customColumns.length} عمود مخصص
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                      صيغة التصدير: {exportFormat === 'excel' ? 'Excel' : 'PDF'}
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowSaveTemplateModal(false)}
                    disabled={isSavingTemplate}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    disabled={isSavingTemplate || !templateName.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingTemplate ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>حفظ التقرير</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
