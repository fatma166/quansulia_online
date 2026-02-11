import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Settings,
  FileText,
  CheckCircle,
  List,
  Layers,
  Upload,
  DollarSign
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';
import ProfessionalFormBuilder from '../components/ProfessionalFormBuilder';
import DraggableItem from '../components/DraggableItem';
import ServiceImportTool from '../components/ServiceImportTool';
import ConditionalPricingManager from '../components/ConditionalPricingManager';

const ServiceEditor = () => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const isEditMode = !!serviceId;

  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    slug: '',
    description_ar: '',
    description_en: '',
    icon: '',
    category: 'passports',
    fees: '',
    duration: '',
    is_active: true,
    order_index: 0,
    has_age_based_pricing: false,
    price_under_18: '',
    price_18_and_above: '',
    is_external: false,
    external_url: ''
  });

  const [serviceTypes, setServiceTypes] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [fields, setFields] = useState([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [showImportTool, setShowImportTool] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchServiceData();
    }
  }, [serviceId]);

  const fetchServiceData = async () => {
    try {
      setLoading(true);

      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .maybeSingle();

      if (serviceError) throw serviceError;
      if (serviceData) {
        setFormData({
          ...serviceData,
          fees: serviceData.fees || '',
          price_under_18: serviceData.price_under_18 || '',
          price_18_and_above: serviceData.price_18_and_above || ''
        });
      }

      const { data: typesData } = await supabase
        .from('service_types')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at');

      setServiceTypes(typesData || []);

      // جلب المتطلبات المرتبطة بـ service_id
      const { data: reqData } = await supabase
        .from('service_requirements')
        .select('*')
        .eq('service_id', serviceId)
        .order('order_index');

      // جلب المتطلبات المرتبطة بـ service_types
      let serviceTypeReqs = [];
      if (typesData && typesData.length > 0) {
        const typeIds = typesData.map(t => t.id);
        const { data: typeReqsData } = await supabase
          .from('service_requirements')
          .select('*')
          .in('service_type_id', typeIds)
          .order('order_index');

        serviceTypeReqs = typeReqsData || [];
      }

      setRequirements([...(reqData || []), ...serviceTypeReqs]);

      // جلب المستندات المرتبطة بـ service_id
      const { data: docsData } = await supabase
        .from('service_documents')
        .select('*')
        .eq('service_id', serviceId)
        .order('order_index');

      // جلب المستندات المرتبطة بـ service_types
      let serviceTypeDocs = [];
      if (typesData && typesData.length > 0) {
        const typeIds = typesData.map(t => t.id);
        const { data: typeDocsData } = await supabase
          .from('service_documents')
          .select('*')
          .in('service_type_id', typeIds)
          .order('order_index');

        serviceTypeDocs = typeDocsData || [];
      }

      setDocuments([...(docsData || []), ...serviceTypeDocs]);

      // جلب الحقول المرتبطة بـ service_id مباشرة
      const { data: fieldsData } = await supabase
        .from('service_fields')
        .select('*')
        .eq('service_id', serviceId)
        .order('order_index');

      // جلب الحقول المرتبطة بـ service_types
      let serviceTypeFields = [];
      if (typesData && typesData.length > 0) {
        const typeIds = typesData.map(t => t.id);
        const { data: typeFieldsData } = await supabase
          .from('service_fields')
          .select('*')
          .in('service_type_id', typeIds)
          .order('order_index');

        serviceTypeFields = typeFieldsData || [];
      }

      // دمج كل الحقول
      const allFields = [...(fieldsData || []), ...serviceTypeFields];

      // Load subfields for dynamic-list fields
      const fieldsWithSubfields = await Promise.all(
        allFields.map(async (field) => {
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

      setFields(fieldsWithSubfields);

    } catch (error) {
      console.error('Error fetching service data:', error);
      alert('حدث خطأ في تحميل بيانات الخدمة');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name_ar || !formData.slug) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // التحقق من صحة الأسعار حسب العمر
    if (formData.has_age_based_pricing) {
      if (!formData.price_under_18 || !formData.price_18_and_above) {
        alert('يرجى ملء أسعار الخدمة لكلا الفئتين العمريتين');
        return;
      }
    }

    // التحقق من رابط الخدمة الخارجية
    if (formData.is_external && !formData.external_url) {
      alert('يرجى إدخال رابط الخدمة الخارجية');
      return;
    }

    try {
      setSaving(true);

      // تنظيف البيانات قبل الحفظ
      const dataToSave = {
        ...formData,
        price_under_18: formData.has_age_based_pricing && formData.price_under_18
          ? parseFloat(formData.price_under_18)
          : null,
        price_18_and_above: formData.has_age_based_pricing && formData.price_18_and_above
          ? parseFloat(formData.price_18_and_above)
          : null
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('services')
          .update(dataToSave)
          .eq('id', serviceId);

        if (error) throw error;

        await saveServiceTypes();
        await saveRequirements();
        await saveDocuments();
        await saveFields();

        alert('تم تحديث الخدمة بنجاح');
      } else {
        const { data, error } = await supabase
          .from('services')
          .insert([dataToSave])
          .select()
          .single();

        if (error) throw error;

        alert('تم إضافة الخدمة بنجاح');
        navigate(`/admin/services/${data.id}`);
      }
    } catch (error) {
      console.error('Error saving service:', error);
      alert('حدث خطأ في حفظ الخدمة');
    } finally {
      setSaving(false);
    }
  };

  const saveServiceTypes = async () => {
    for (const type of serviceTypes) {
      if (type.id) {
        if (type._deleted) {
          await supabase.from('service_types').delete().eq('id', type.id);
        } else {
          await supabase.from('service_types').update(type).eq('id', type.id);
        }
      } else if (!type._deleted) {
        await supabase.from('service_types').insert([{ ...type, service_id: serviceId }]);
      }
    }
  };

  const saveRequirements = async () => {
    for (const req of requirements) {
      const reqData = { ...req };

      // حماية الشروط من الحذف
      if (reqData.conditions && typeof reqData.conditions === 'object') {
        const isEmpty = Object.keys(reqData.conditions).length === 0;
        if (isEmpty) {
          reqData.conditions = null;
        }
        // إذا كانت موجودة وليست فارغة، احتفظ بها كما هي
      }

      if (req.id) {
        if (req._deleted) {
          await supabase.from('service_requirements').delete().eq('id', req.id);
        } else {
          await supabase.from('service_requirements').update(reqData).eq('id', req.id);
        }
      } else if (!req._deleted) {
        await supabase.from('service_requirements').insert([{ ...reqData, service_id: serviceId }]);
      }
    }
  };

  const saveDocuments = async () => {
    for (const doc of documents) {
      const docData = { ...doc };

      // حماية الشروط من الحذف
      if (docData.conditions && typeof docData.conditions === 'object') {
        const isEmpty = Object.keys(docData.conditions).length === 0;
        if (isEmpty) {
          docData.conditions = null;
        }
        // إذا كانت موجودة وليست فارغة، احتفظ بها كما هي
      }

      if (doc.id) {
        if (doc._deleted) {
          await supabase.from('service_documents').delete().eq('id', doc.id);
        } else {
          await supabase.from('service_documents').update(docData).eq('id', doc.id);
        }
      } else if (!doc._deleted) {
        await supabase.from('service_documents').insert([{ ...docData, service_id: serviceId }]);
      }
    }
  };

  const saveFields = async () => {
    for (const field of fields) {
      const { subfields, _deleted, ...fieldData } = field;
      let fieldId = field.id;

      // تنظيف البيانات: احذف أي properties مش موجودة في الـ schema
      const allowedColumns = [
        'id', 'service_id', 'service_type_id', 'field_name', 'label_ar', 'label_en',
        'field_type', 'placeholder_ar', 'placeholder_en', 'help_text_ar', 'help_text_en',
        'is_required', 'is_active', 'options', 'validation_rules', 'order_index',
        'step_id', 'step_title_ar', 'step_title_en', 'conditions', 'default_value',
        'field_width', 'field_height', 'field_margin', 'break_line'
      ];

      const fieldWithoutSubfields = Object.keys(fieldData)
        .filter(key => allowedColumns.includes(key))
        .reduce((obj, key) => {
          obj[key] = fieldData[key];
          return obj;
        }, {});

      // تأكد من أن conditions يتم حفظها بشكل صحيح
      if (fieldWithoutSubfields.conditions && typeof fieldWithoutSubfields.conditions === 'object') {
        // التحقق من الصيغ المختلفة للشروط
        const isEmpty = Object.keys(fieldWithoutSubfields.conditions).length === 0;

        // صيغة show_when (قديمة)
        const hasShowWhen = fieldWithoutSubfields.conditions.show_when &&
                           Array.isArray(fieldWithoutSubfields.conditions.show_when) &&
                           fieldWithoutSubfields.conditions.show_when.length > 0;

        // صيغة field/operator/values (جديدة)
        const hasFieldCondition = fieldWithoutSubfields.conditions.field &&
                                 fieldWithoutSubfields.conditions.operator &&
                                 fieldWithoutSubfields.conditions.values;

        // صيغة معقدة AND/OR (أحدث)
        const hasComplexCondition = (fieldWithoutSubfields.conditions.operator === 'AND' ||
                                    fieldWithoutSubfields.conditions.operator === 'OR') &&
                                   Array.isArray(fieldWithoutSubfields.conditions.conditions) &&
                                   fieldWithoutSubfields.conditions.conditions.length > 0;

        // احفظ الشروط فقط إذا كانت بإحدى الصيغ الصحيحة
        if (isEmpty || (!hasShowWhen && !hasFieldCondition && !hasComplexCondition)) {
          fieldWithoutSubfields.conditions = null;
        }
      } else if (!fieldWithoutSubfields.conditions) {
        fieldWithoutSubfields.conditions = null;
      }

      console.log('💾 Saving field:', {
        field_name: field.field_name,
        label_ar: field.label_ar,
        conditions: fieldWithoutSubfields.conditions,
        hasConditions: !!fieldWithoutSubfields.conditions,
        conditions_type: typeof fieldWithoutSubfields.conditions
      });

      if (_deleted) {
        if (field.id) {
          // Delete subfields first
          if (field.field_type === 'dynamic-list') {
            await supabase
              .from('service_dynamic_list_fields')
              .delete()
              .eq('parent_field_id', field.id);
          }
          await supabase.from('service_fields').delete().eq('id', field.id);
        }
      } else {
        // استخدام UPSERT لمنع التكرار
        const { data, error } = await supabase
          .from('service_fields')
          .upsert(
            { ...fieldWithoutSubfields, service_id: serviceId },
            {
              onConflict: 'service_id,field_name',
              ignoreDuplicates: false
            }
          )
          .select()
          .single();

        if (error) {
          console.error('❌ Error saving field:', field.field_name, error);
        } else if (data) {
          fieldId = data.id;
          console.log('✅ Field saved successfully:', field.field_name, 'ID:', fieldId);
        }
      }

      // Save subfields for dynamic-list fields
      if (field.field_type === 'dynamic-list' && !_deleted && subfields && fieldId) {
        // Delete existing subfields only if fieldId exists
        await supabase
          .from('service_dynamic_list_fields')
          .delete()
          .eq('parent_field_id', fieldId);

        // Insert new subfields
        const subfieldsToInsert = subfields.map((sf, index) => ({
          parent_field_id: fieldId,
          field_name: sf.name,
          field_type: sf.type,
          label_ar: sf.label_ar || sf.label,
          label_en: sf.label_en || sf.label,
          is_required: sf.required || sf.is_required || false,
          options: sf.options || null,
          validation_rules: sf.validation || null,
          order_index: index
        }));

        if (subfieldsToInsert.length > 0) {
          await supabase
            .from('service_dynamic_list_fields')
            .insert(subfieldsToInsert);
        }
      }
    }
  };

  const addServiceType = () => {
    setServiceTypes([...serviceTypes, {
      name_ar: '',
      name_en: '',
      description_ar: '',
      description_en: '',
      is_active: true
    }]);
  };

  const removeServiceType = (index) => {
    const updatedTypes = [...serviceTypes];
    if (updatedTypes[index].id) {
      updatedTypes[index]._deleted = true;
    } else {
      updatedTypes.splice(index, 1);
    }
    setServiceTypes(updatedTypes);
  };

  const updateServiceType = (index, field, value) => {
    const updatedTypes = [...serviceTypes];
    updatedTypes[index][field] = value;
    setServiceTypes(updatedTypes);
  };

  const addRequirement = () => {
    setRequirements([...requirements, {
      requirement_ar: '',
      requirement_en: '',
      order_index: requirements.length,
      is_active: true
    }]);
  };

  const removeRequirement = (index) => {
    const updatedReqs = [...requirements];
    if (updatedReqs[index].id) {
      updatedReqs[index]._deleted = true;
    } else {
      updatedReqs.splice(index, 1);
    }
    setRequirements(updatedReqs);
  };

  const updateRequirement = (index, field, value) => {
    const updatedReqs = [...requirements];
    updatedReqs[index][field] = value;
    setRequirements(updatedReqs);
  };

  const addDocument = () => {
    setDocuments([...documents, {
      document_name_ar: '',
      document_name_en: '',
      description_ar: '',
      description_en: '',
      is_required: true,
      max_size_mb: 5,
      accepted_formats: ['pdf', 'jpg', 'jpeg', 'png'],
      order_index: documents.length,
      is_active: true
    }]);
  };

  const removeDocument = (index) => {
    const updatedDocs = [...documents];
    if (updatedDocs[index].id) {
      updatedDocs[index]._deleted = true;
    } else {
      updatedDocs.splice(index, 1);
    }
    setDocuments(updatedDocs);
  };

  const updateDocument = (index, field, value) => {
    const updatedDocs = [...documents];
    updatedDocs[index][field] = value;
    setDocuments(updatedDocs);
  };

  const handleDragStart = (e, index, type) => {
    setDraggedItemIndex({ index, type });
  };

  const handleDragOver = (e, index, type) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex, type) => {
    e.preventDefault();
    if (!draggedItemIndex || draggedItemIndex.type !== type) return;

    const dragIndex = draggedItemIndex.index;
    if (dragIndex === dropIndex) return;

    if (type === 'requirement') {
      const items = [...requirements];
      const draggedItem = items[dragIndex];
      items.splice(dragIndex, 1);
      items.splice(dropIndex, 0, draggedItem);
      items.forEach((item, idx) => {
        item.order_index = idx;
      });
      setRequirements(items);
    } else if (type === 'document') {
      const items = [...documents];
      const draggedItem = items[dragIndex];
      items.splice(dragIndex, 1);
      items.splice(dropIndex, 0, draggedItem);
      items.forEach((item, idx) => {
        item.order_index = idx;
      });
      setDocuments(items);
    }
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const handleImport = (importData) => {
    if (importData.requirements && importData.requirements.length > 0) {
      const newRequirements = importData.requirements.map((r, idx) => ({
        ...r,
        order_index: requirements.length + idx,
        _isNew: true
      }));
      setRequirements([...requirements, ...newRequirements]);
    }

    if (importData.documents && importData.documents.length > 0) {
      const newDocuments = importData.documents.map((d, idx) => ({
        ...d,
        order_index: documents.length + idx,
        _isNew: true
      }));
      setDocuments([...documents, ...newDocuments]);
    }

    if (importData.fields && importData.fields.length > 0) {
      const newFields = importData.fields.map((f, idx) => ({
        ...f,
        order_index: fields.length + idx,
        _isNew: true
      }));
      setFields([...fields, ...newFields]);
    }
  };

  const categories = [
    { value: 'passports', label: 'جوازات السفر' },
    { value: 'power-of-attorney', label: 'التوكيلات' },
    { value: 'attestations', label: 'التصديقات' },
    { value: 'civil-registry', label: 'الأحوال المدنية' },
    { value: 'education', label: 'التعليم' },
    { value: 'visas', label: 'التأشيرات' },
    { value: 'other', label: 'أخرى' }
  ];

  const tabs = [
    { id: 'basic', label: 'المعلومات الأساسية', icon: Settings },
    { id: 'pricing', label: 'التسعير المشروط', icon: DollarSign },
    { id: 'types', label: 'الأنواع الفرعية', icon: Layers },
    { id: 'requirements', label: 'المتطلبات', icon: CheckCircle },
    { id: 'documents', label: 'المستندات', icon: FileText },
    { id: 'fields', label: 'الحقول والنماذج', icon: List }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#276073]"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/admin/services')}
            className="flex items-center space-x-2 rtl:space-x-reverse text-[#276073] hover:text-[#1e4a5a] mb-4"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            <span>العودة إلى قائمة الخدمات</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 rtl:space-x-reverse px-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-4 border-b-2 font-semibold transition-colors duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-[#276073] text-[#276073]'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      اسم الخدمة (عربي) *
                    </label>
                    <input
                      type="text"
                      value={formData.name_ar}
                      onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      اسم الخدمة (إنجليزي)
                    </label>
                    <input
                      type="text"
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      المعرف الفريد (Slug) *
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                      placeholder="passport-renewal"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      التصنيف
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <input
                        type="checkbox"
                        id="has_age_based_pricing"
                        checked={formData.has_age_based_pricing}
                        onChange={(e) => setFormData({
                          ...formData,
                          has_age_based_pricing: e.target.checked,
                          price_under_18: e.target.checked ? formData.price_under_18 : '',
                          price_18_and_above: e.target.checked ? formData.price_18_and_above : ''
                        })}
                        className="w-5 h-5 text-[#276073] border-gray-300 rounded focus:ring-[#276073]"
                      />
                      <label htmlFor="has_age_based_pricing" className="text-sm font-semibold text-gray-700 cursor-pointer">
                        الخدمة لها أسعار متعددة حسب العمر (أقل من 18 سنة / 18 سنة فأكثر)
                      </label>
                    </div>

                    {formData.has_age_based_pricing ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            سعر الخدمة لأقل من 18 سنة
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.price_under_18}
                            onChange={(e) => setFormData({ ...formData, price_under_18: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                            placeholder="50.00"
                            required={formData.has_age_based_pricing}
                          />
                          <p className="text-xs text-gray-500 mt-1">السعر بالريال السعودي</p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            سعر الخدمة لـ 18 سنة فأكثر
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.price_18_and_above}
                            onChange={(e) => setFormData({ ...formData, price_18_and_above: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                            placeholder="100.00"
                            required={formData.has_age_based_pricing}
                          />
                          <p className="text-xs text-gray-500 mt-1">السعر بالريال السعودي</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          الرسوم (السعر الموحد)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            value={formData.fees}
                            onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                            placeholder="180"
                            min="0"
                          />
                          <span className="text-gray-700 font-medium whitespace-nowrap">ريال سعودي</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      مدة المعالجة
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                      placeholder="3 أيام عمل"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    وصف الخدمة (عربي)
                  </label>
                  <textarea
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    وصف الخدمة (إنجليزي)
                  </label>
                  <textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 text-[#276073] rounded focus:ring-[#276073]"
                    />
                    <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
                      الخدمة نشطة
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <input
                      type="checkbox"
                      id="is_external"
                      checked={formData.is_external}
                      onChange={(e) => setFormData({
                        ...formData,
                        is_external: e.target.checked,
                        external_url: e.target.checked ? formData.external_url : ''
                      })}
                      className="w-5 h-5 text-[#276073] rounded focus:ring-[#276073]"
                    />
                    <label htmlFor="is_external" className="text-sm font-semibold text-gray-700">
                      خدمة خارجية (رابط خارجي)
                    </label>
                  </div>

                  {formData.is_external && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        رابط الخدمة الخارجية *
                      </label>
                      <input
                        type="url"
                        value={formData.external_url}
                        onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                        placeholder="https://example.com/service"
                        required={formData.is_external}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        عند الضغط على هذه الخدمة، سيتم فتح الرابط في تاب جديد
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6">
                {serviceId ? (
                  <ConditionalPricingManager
                    serviceId={serviceId}
                    serviceTypeId={null}
                  />
                ) : (
                  <div className="text-center py-12 bg-amber-50 rounded-lg border-2 border-dashed border-amber-300">
                    <DollarSign className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                    <p className="text-amber-800 font-medium">يجب حفظ الخدمة أولاً</p>
                    <p className="text-sm text-amber-700 mt-1">
                      احفظ المعلومات الأساسية للخدمة قبل إضافة قواعد التسعير
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'types' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600">إضافة أنواع فرعية للخدمة (مثل: أنواع التوكيلات)</p>
                  <button
                    type="button"
                    onClick={addServiceType}
                    className="flex items-center space-x-2 rtl:space-x-reverse bg-[#276073] text-white px-4 py-2 rounded-lg hover:bg-[#1e4a5a]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة نوع</span>
                  </button>
                </div>

                {serviceTypes.filter(t => !t._deleted).map((type, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">نوع {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeServiceType(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          اسم النوع (عربي)
                        </label>
                        <input
                          type="text"
                          value={type.name_ar}
                          onChange={(e) => updateServiceType(index, 'name_ar', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          اسم النوع (إنجليزي)
                        </label>
                        <input
                          type="text"
                          value={type.name_en}
                          onChange={(e) => updateServiceType(index, 'name_en', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073]"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {serviceTypes.filter(t => !t._deleted).length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">لا توجد أنواع فرعية</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'requirements' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">متطلبات الخدمة</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      أضف المتطلبات وحدد متى تظهر بناءً على اختيارات المستخدم
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowImportTool(true)}
                      className="flex items-center space-x-2 rtl:space-x-reverse bg-white border-2 border-[#276073] text-[#276073] px-4 py-2 rounded-lg hover:bg-[#276073] hover:text-white transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>استيراد</span>
                    </button>
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="flex items-center space-x-2 rtl:space-x-reverse bg-[#276073] text-white px-4 py-2 rounded-lg hover:bg-[#1e4a5a]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة متطلب</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {requirements.filter(r => !r._deleted).map((req, index) => (
                    <DraggableItem
                      key={req.id || index}
                      item={req}
                      index={index}
                      title={req.requirement_ar || `متطلب ${index + 1}`}
                      onUpdate={updateRequirement}
                      onDelete={removeRequirement}
                      availableFields={fields
                        .filter(f => !f._deleted && f.is_active !== false)
                        .map(f => ({
                          name: f.field_name || f.name,
                          label: f.label_ar || f.label,
                          label_ar: f.label_ar,
                          label_en: f.label_en,
                          type: f.field_type || f.type,
                          config: f.config || { options: f.options },
                          options: f.options
                        }))
                      }
                      onDragStart={(e) => handleDragStart(e, index, 'requirement')}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, index, 'requirement')}
                      onDrop={(e) => handleDrop(e, index, 'requirement')}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            المتطلب (عربي)
                          </label>
                          <input
                            type="text"
                            value={req.requirement_ar}
                            onChange={(e) => updateRequirement(index, 'requirement_ar', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            المتطلب (إنجليزي)
                          </label>
                          <input
                            type="text"
                            value={req.requirement_en}
                            onChange={(e) => updateRequirement(index, 'requirement_en', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073]"
                          />
                        </div>
                      </div>
                    </DraggableItem>
                  ))}
                </div>

                {requirements.filter(r => !r._deleted).length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">لا توجد متطلبات</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">المستندات المطلوبة</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      أضف المستندات وحدد متى تظهر بناءً على اختيارات المستخدم
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowImportTool(true)}
                      className="flex items-center space-x-2 rtl:space-x-reverse bg-white border-2 border-[#276073] text-[#276073] px-4 py-2 rounded-lg hover:bg-[#276073] hover:text-white transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>استيراد</span>
                    </button>
                    <button
                      type="button"
                      onClick={addDocument}
                      className="flex items-center space-x-2 rtl:space-x-reverse bg-[#276073] text-white px-4 py-2 rounded-lg hover:bg-[#1e4a5a]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة مستند</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {documents.filter(d => !d._deleted).map((doc, index) => (
                    <DraggableItem
                      key={doc.id || index}
                      item={doc}
                      index={index}
                      title={doc.document_name_ar || `مستند ${index + 1}`}
                      onUpdate={updateDocument}
                      onDelete={removeDocument}
                      availableFields={fields
                        .filter(f => !f._deleted && f.is_active !== false)
                        .map(f => ({
                          name: f.field_name || f.name,
                          label: f.label_ar || f.label,
                          label_ar: f.label_ar,
                          label_en: f.label_en,
                          type: f.field_type || f.type,
                          config: f.config || { options: f.options },
                          options: f.options
                        }))
                      }
                      onDragStart={(e) => handleDragStart(e, index, 'document')}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, index, 'document')}
                      onDrop={(e) => handleDrop(e, index, 'document')}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            اسم المستند (عربي)
                          </label>
                          <input
                            type="text"
                            value={doc.document_name_ar}
                            onChange={(e) => updateDocument(index, 'document_name_ar', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            اسم المستند (إنجليزي)
                          </label>
                          <input
                            type="text"
                            value={doc.document_name_en}
                            onChange={(e) => updateDocument(index, 'document_name_en', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            الحجم الأقصى (MB)
                          </label>
                          <input
                            type="number"
                            value={doc.max_size_mb}
                            onChange={(e) => updateDocument(index, 'max_size_mb', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073]"
                          />
                        </div>

                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <input
                            type="checkbox"
                            id={`doc_required_${index}`}
                            checked={doc.is_required}
                            onChange={(e) => updateDocument(index, 'is_required', e.target.checked)}
                            className="w-5 h-5 text-[#276073] rounded"
                          />
                          <label htmlFor={`doc_required_${index}`} className="text-sm font-semibold text-gray-700">
                            إجباري
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          وصف المستند (عربي)
                        </label>
                        <textarea
                          value={doc.description_ar}
                          onChange={(e) => updateDocument(index, 'description_ar', e.target.value)}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073]"
                        />
                      </div>
                    </DraggableItem>
                  ))}
                </div>

                {documents.filter(d => !d._deleted).length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">لا توجد مستندات</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'fields' && (
              <ProfessionalFormBuilder
                fields={fields}
                onChange={setFields}
              />
            )}

            <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
              <button
                type="button"
                onClick={() => navigate('/admin/services')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
              >
                إلغاء
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 rtl:space-x-reverse bg-[#276073] text-white px-6 py-3 rounded-lg hover:bg-[#1e4a5a] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>حفظ الخدمة</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showImportTool && (
        <ServiceImportTool
          onImport={handleImport}
          onClose={() => setShowImportTool(false)}
          currentServiceId={serviceId}
        />
      )}
    </div>
  );
};

export default ServiceEditor;
