import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useServiceData(serviceSlug, serviceTypeId) {
  const [service, setService] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [fields, setFields] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!serviceSlug && !serviceTypeId) {
      setLoading(false);
      return;
    }

    async function fetchServiceData() {
      try {
        setLoading(true);
        setError(null);

        let finalServiceData = null;
        let serviceIdToUse = null;
        let useServiceTypeId = false;

        // إذا تم تمرير serviceTypeId، جلب البيانات مباشرة من service_types
        if (serviceTypeId) {
          const { data: serviceTypeData, error: serviceTypeError } = await supabase
            .from('service_types')
            .select('*')
            .eq('id', serviceTypeId)
            .maybeSingle();

          if (serviceTypeError) throw serviceTypeError;
          if (!serviceTypeData) {
            throw new Error('Service type not found');
          }

          finalServiceData = serviceTypeData;
          serviceIdToUse = serviceTypeData.id;
          useServiceTypeId = true;
        }
        // وإلا، ابحث عن الخدمة بواسطة slug
        else if (serviceSlug) {
          // First, try to find in services table
          const { data: serviceData, error: serviceError } = await supabase
            .from('services')
            .select('*')
            .eq('slug', serviceSlug)
            .maybeSingle();

          if (serviceError) throw serviceError;

          finalServiceData = serviceData;
          serviceIdToUse = serviceData?.id;
          useServiceTypeId = false;

          // If not found, try service_types table
          if (!serviceData) {
            const { data: serviceTypeData, error: serviceTypeError } = await supabase
              .from('service_types')
              .select('*')
              .eq('slug', serviceSlug)
              .maybeSingle();

            if (serviceTypeError) throw serviceTypeError;
            if (!serviceTypeData) {
              throw new Error('Service not found');
            }

            finalServiceData = serviceTypeData;
            serviceIdToUse = serviceTypeData.id;
            useServiceTypeId = true;
          }
        }

        if (!finalServiceData) {
          throw new Error('Service not found');
        }

        setService(finalServiceData);

        // Query using the appropriate ID field
        const buildQuery = (query) => {
          if (useServiceTypeId) {
            return query.eq('service_type_id', serviceIdToUse);
          } else {
            return query.eq('service_id', serviceIdToUse);
          }
        };

        const [reqResult, docResult, fieldResult, pricingResult] = await Promise.all([
          buildQuery(
            supabase
              .from('service_requirements')
              .select('*')
          )
            .eq('is_active', true)
            .order('order_index'),

          buildQuery(
            supabase
              .from('service_documents')
              .select('*')
          )
            .eq('is_active', true)
            .order('order_index'),

          buildQuery(
            supabase
              .from('service_fields')
              .select('*')
          )
            .eq('is_active', true)
            .order('order_index'),

          buildQuery(
            supabase
              .from('service_pricing_rules')
              .select('*')
          )
            .eq('is_active', true)
            .order('priority', { ascending: false })
        ]);

        if (reqResult.error) throw reqResult.error;
        if (docResult.error) throw docResult.error;
        if (fieldResult.error) throw fieldResult.error;
        if (pricingResult.error) throw pricingResult.error;

        console.log('🟢🟢🟢 [useServiceData] Fetched from DB:', {
          serviceId: serviceIdToUse,
          useServiceTypeId,
          requirements: reqResult.data?.length || 0,
          documents: docResult.data?.length || 0,
          fields: fieldResult.data?.length || 0,
          pricingRules: pricingResult.data?.length || 0
        });

        console.log('📄 [useServiceData] Documents details:', docResult.data);
        console.log('📝 [useServiceData] Fields RAW from DB:', fieldResult.data);
        console.log('🔑 [useServiceData] Service details:', {
          serviceName: finalServiceData.name_ar,
          serviceId: serviceIdToUse,
          serviceSlug: finalServiceData.slug
        });

        setRequirements(reqResult.data || []);
        setDocuments(docResult.data || []);
        setPricingRules(pricingResult.data || []);

        // Load subfields for dynamic-list fields
        const fieldsWithSubfields = await Promise.all(
          (fieldResult.data || []).map(async (field) => {
            // تصحيح options - parse JSON strings إلى arrays
            let normalizedOptions = field.options;

            // If options is a string, try to parse it
            if (typeof normalizedOptions === 'string') {
              try {
                normalizedOptions = JSON.parse(normalizedOptions);
              } catch (e) {
                console.error('Failed to parse field options:', field.field_name, e);
                normalizedOptions = [];
              }
            }

            // If options is nested {options: [...]}, extract it
            if (normalizedOptions && typeof normalizedOptions === 'object' && normalizedOptions.options && Array.isArray(normalizedOptions.options)) {
              normalizedOptions = normalizedOptions.options;
            }

            // Ensure it's an array
            if (!Array.isArray(normalizedOptions)) {
              normalizedOptions = [];
            }

            if (field.field_type === 'dynamic-list') {
              const { data: subfieldsData } = await supabase
                .from('service_dynamic_list_fields')
                .select('*')
                .eq('parent_field_id', field.id)
                .order('order_index');

              return {
                ...field,
                options: normalizedOptions,
                subfields: (subfieldsData || []).map(sf => {
                  // تصحيح options للـ subfields أيضاً
                  let sfOptions = sf.options;

                  // If options is a string, try to parse it
                  if (typeof sfOptions === 'string') {
                    try {
                      sfOptions = JSON.parse(sfOptions);
                    } catch (e) {
                      console.error('Failed to parse subfield options:', sf.field_name, e);
                      sfOptions = [];
                    }
                  }

                  // If options is nested {options: [...]}, extract it
                  if (sfOptions && typeof sfOptions === 'object' && sfOptions.options && Array.isArray(sfOptions.options)) {
                    sfOptions = sfOptions.options;
                  }

                  // Ensure it's an array
                  if (!Array.isArray(sfOptions)) {
                    sfOptions = [];
                  }

                  return {
                    name: sf.field_name,
                    type: sf.field_type,
                    label: sf.label_ar,
                    label_ar: sf.label_ar,
                    label_en: sf.label_en,
                    required: sf.is_required,
                    is_required: sf.is_required,
                    options: sfOptions,
                    validation: sf.validation_rules
                  };
                })
              };
            }

            return {
              ...field,
              options: normalizedOptions
            };
          })
        );

        console.log('✨ [useServiceData] Final fields after processing:', {
          count: fieldsWithSubfields.length,
          fieldNames: fieldsWithSubfields.map(f => f.field_name),
          firstFieldOptions: fieldsWithSubfields[0]?.options
        });

        setFields(fieldsWithSubfields);

      } catch (err) {
        console.error('Error fetching service data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchServiceData();
  }, [serviceSlug, serviceTypeId]);

  return { service, requirements, documents, fields, pricingRules, loading, error };
}

export function convertLegacyConditions(legacyConditions) {
  const categoryMap = {
    'minors_new': [
      { field: 'isAdult', value: 'no' },
      { field: 'passportType', value: 'new' }
    ],
    'minors_renewal': [
      { field: 'isAdult', value: 'no' },
      { field: 'passportType', value: 'renewal' }
    ],
    'emergency_adults': [
      { field: 'isAdult', value: 'yes' },
      { field: 'passportType', value: 'emergency' }
    ],
    'emergency_children': [
      { field: 'isAdult', value: 'no' },
      { field: 'passportType', value: 'emergency' }
    ],
    'adults_new': [
      { field: 'isAdult', value: 'yes' },
      { field: 'passportType', value: 'new' }
    ],
    'adults_renewal': [
      { field: 'isAdult', value: 'yes' },
      { field: 'passportType', value: 'renewal' }
    ]
  };

  if (legacyConditions.category && categoryMap[legacyConditions.category]) {
    return {
      show_when: categoryMap[legacyConditions.category].map(c => ({
        field: c.field,
        operator: 'equals',
        value: c.value
      })),
      logic: 'AND'
    };
  }

  return null;
}

export function evaluateConditions(conditions, formValues) {
  if (!conditions) return true;

  // إذا كانت الشروط كائن فارغ {} أو لا تحتوي على أي مفاتيح، أظهر الحقل
  if (typeof conditions === 'object' && Object.keys(conditions).length === 0) {
    return true;
  }

  // دعم النسق البسيط الأكثر شيوعاً: { field: 'x', values: [...], exclude?: true }
  if (conditions.field && conditions.values && Array.isArray(conditions.values) && !conditions.operator && !conditions.conditions && !conditions.show_when) {
    const fieldValue = formValues[conditions.field];

    // إذا كانت القيمة فارغة أو undefined أو null
    const isEmpty = !fieldValue || fieldValue === '' || fieldValue === null;

    const isInValues = conditions.values.includes(fieldValue);

    // القاعدة الأساسية: إذا كانت القيمة فارغة، جميع الحقول المشروطة تكون مخفية
    if (isEmpty) {
      console.log('[evaluateConditions] Field is HIDDEN - value is empty', {
        field: conditions.field,
        actualValue: fieldValue
      });
      return false;
    }

    // الآن القيمة موجودة، نطبق الشرط
    if (conditions.exclude === true) {
      // exclude = true يعني: أظهر الحقل إلا لو القيمة في القائمة
      const result = !isInValues;
      console.log('[evaluateConditions - Exclude Mode]', {
        field: conditions.field,
        expectedValues: conditions.values,
        actualValue: fieldValue,
        isInValues,
        result: result ? 'VISIBLE' : 'HIDDEN'
      });
      return result;
    }

    // بدون exclude: أظهر الحقل فقط لو القيمة في القائمة
    const result = isInValues;
    console.log('[evaluateConditions - Include Mode]', {
      field: conditions.field,
      expectedValues: conditions.values,
      actualValue: fieldValue,
      isInValues,
      result: result ? 'VISIBLE' : 'HIDDEN'
    });
    return result;
  }

  // تحقق من النسق الجديد أولاً: { operator: 'AND'|'OR', conditions: [...] }
  if (conditions.operator && Array.isArray(conditions.conditions)) {
    console.log('[evaluateConditions - Nested]', {
      operator: conditions.operator,
      conditions: conditions.conditions,
      formValues
    });

    const results = conditions.conditions.map((condition) => {
      const fieldValue = formValues[condition.field];

      console.log(`  [Nested Condition] field: ${condition.field}`, {
        expectedValues: condition.values || condition.value,
        actualValue: fieldValue
      });

      // إذا كانت الشرط يحتوي على values بدلاً من value (الحالة الأكثر شيوعاً)
      if (condition.values && Array.isArray(condition.values)) {
        // If field value is undefined or null, condition fails
        if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
          console.log(`    -> FAILED: fieldValue is empty`);
          return false;
        }

        const isInValues = condition.values.includes(fieldValue);
        console.log(`    -> ${isInValues ? 'MATCH' : 'NO MATCH'}: ${fieldValue} ${isInValues ? 'in' : 'not in'} [${condition.values.join(', ')}]`);

        // دعم exclude داخل الشروط المتعددة أيضاً
        if (condition.exclude === true) {
          return !isInValues;
        }

        return isInValues;
      }

      // إذا كانت الشرط يحتوي على value مباشرة
      if (Object.prototype.hasOwnProperty.call(condition, 'value')) {
        const matches = fieldValue === condition.value;
        console.log(`    -> ${matches ? 'MATCH' : 'NO MATCH'}: ${fieldValue} === ${condition.value}`);
        return matches;
      }

      // إذا كانت الشرط يحتوي على operator
      if (condition.operator) {
        switch (condition.operator) {
          case 'equals':
            return fieldValue === condition.value;
          case 'not_equals':
            return fieldValue !== condition.value;
          case 'contains':
            return fieldValue && fieldValue.includes(condition.value);
          case 'not_contains':
            return !fieldValue || !fieldValue.includes(condition.value);
          case 'in':
            return Array.isArray(condition.value) && condition.value.includes(fieldValue);
          case 'not_in':
            return !Array.isArray(condition.value) || !condition.value.includes(fieldValue);
          case 'greater_than':
          case '>':
            return Number(fieldValue) > Number(condition.value);
          case 'less_than':
          case '<':
            return Number(fieldValue) < Number(condition.value);
          case 'greater_than_or_equal':
          case '>=':
            return Number(fieldValue) >= Number(condition.value);
          case 'less_than_or_equal':
          case '<=':
            return Number(fieldValue) <= Number(condition.value);
          case 'is_empty':
            return !fieldValue || fieldValue === '';
          case 'is_not_empty':
            return fieldValue && fieldValue !== '';
          default:
            return false;
        }
      }

      console.log(`    -> FAILED: no valid condition format`);
      return false;
    });

    const finalResult = conditions.operator === 'AND'
      ? results.every(r => r === true)
      : results.some(r => r === true);

    console.log(`[evaluateConditions - Nested] Final Result: ${finalResult ? 'VISIBLE' : 'HIDDEN'}`, {
      operator: conditions.operator,
      results
    });

    return finalResult;
  }

  // دعم النسق القديم البسيط: { field: 'x', operator: 'equals', values: [...] }
  if (conditions.field && conditions.operator && !conditions.conditions && !conditions.show_when) {
    const fieldValue = formValues[conditions.field];

    if (conditions.values && Array.isArray(conditions.values)) {
      const isInValues = conditions.values.includes(fieldValue);

      if (conditions.exclude === true) {
        return !isInValues;
      }

      return isInValues;
    }

    if (Object.prototype.hasOwnProperty.call(conditions, 'value')) {
      return fieldValue === conditions.value;
    }
  }

  // دعم النسق القديم: { show_when: [...], logic: 'AND' }
  let normalizedConditions = conditions;
  if (!conditions.show_when) {
    const converted = convertLegacyConditions(conditions);
    if (converted) {
      normalizedConditions = converted;
    } else {
      // Unknown conditions format - don't show by default to avoid displaying irrelevant requirements
      return false;
    }
  }

  const { show_when, logic = 'OR' } = normalizedConditions;

  const results = show_when.map(condition => {
    const fieldValue = formValues[condition.field];

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return fieldValue && fieldValue.includes(condition.value);
      case 'not_contains':
        return !fieldValue || !fieldValue.includes(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'not_in':
        return !Array.isArray(condition.value) || !condition.value.includes(fieldValue);
      case 'greater_than':
      case '>':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
      case '<':
        return Number(fieldValue) < Number(condition.value);
      case 'greater_than_or_equal':
      case '>=':
        return Number(fieldValue) >= Number(condition.value);
      case 'less_than_or_equal':
      case '<=':
        return Number(fieldValue) <= Number(condition.value);
      case 'is_empty':
        return !fieldValue || fieldValue === '';
      case 'is_not_empty':
        return fieldValue && fieldValue !== '';
      default:
        return false;
    }
  });

  return logic === 'AND'
    ? results.every(r => r === true)
    : results.some(r => r === true);
}

export function getVisibleItems(items, formValues) {
  console.log('[getVisibleItems] 🔍 START:', {
    itemsCount: items?.length || 0,
    hasItems: !!items,
    formValuesKeys: Object.keys(formValues || {}).length,
    formValues: formValues
  });

  if (!items || !Array.isArray(items)) {
    console.error('[getVisibleItems] ❌ items is not an array!', items);
    return [];
  }

  const filtered = items.filter(item => {
    const itemName = item.field_name || item.name || item.document_name_ar || item.label_ar || 'unknown';

    // Parse conditions if they are a string
    let parsedConditions = item.conditions;
    if (typeof item.conditions === 'string') {
      try {
        parsedConditions = JSON.parse(item.conditions);
      } catch (e) {
        console.error('Failed to parse conditions:', e);
        parsedConditions = null;
      }
    }

    const hasNoConditions = !parsedConditions ||
      (typeof parsedConditions === 'object' && Object.keys(parsedConditions).length === 0);

    if (hasNoConditions) {
      console.log(`✅ [${itemName}] NO conditions - VISIBLE`);
      return true;
    }

    console.log(`🔍 [${itemName}] Evaluating conditions:`, parsedConditions);
    const result = evaluateConditions(parsedConditions, formValues);
    console.log(`${result ? '✅' : '❌'} [${itemName}] Result: ${result ? 'VISIBLE' : 'HIDDEN'}`);

    return result;
  });

  console.log(`[getVisibleItems] ✅ RESULT: ${filtered.length}/${items.length} items visible`);
  console.log('[getVisibleItems] Visible items:', filtered.map(i => i.field_name || i.document_name_ar || i.label_ar || i.requirement_ar || i.name || 'unknown'));
  return filtered;
}

export function useServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        setError(null);

        console.log('Starting to fetch services...');

        // جلب الخدمات الرئيسية أولاً بدون service_types
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .is('parent_id', null)
          .order('order_index');

        console.log('Services data:', servicesData);
        if (servicesError) {
          console.error('Services error:', servicesError);
          throw servicesError;
        }

        // جلب جميع الخدمات الفرعية دفعة واحدة
        const { data: allChildServices, error: childServicesError } = await supabase
          .from('services')
          .select('id, name_ar, description_ar, icon, slug, parent_id')
          .eq('is_active', true)
          .not('parent_id', 'is', null)
          .order('order_index');

        console.log('Child services:', allChildServices);
        if (childServicesError) {
          console.error('Child services error:', childServicesError);
          throw childServicesError;
        }

        // جلب جميع service_types (الأنواع الفرعية مثل أنواع التوكيلات)
        const { data: allServiceTypes, error: serviceTypesError } = await supabase
          .from('service_types')
          .select('id, name_ar, description_ar, service_id, config')
          .eq('is_active', true)
          .order('created_at');

        console.log('Service types:', allServiceTypes);
        if (serviceTypesError) {
          console.error('Service types error:', serviceTypesError);
          throw serviceTypesError;
        }

        // جلب جميع المتطلبات دفعة واحدة
        const { data: allRequirements, error: requirementsError } = await supabase
          .from('service_requirements')
          .select('requirement_ar, requirement_en, service_id')
          .eq('is_active', true)
          .is('service_type_id', null)
          .order('order_index');

        console.log('Requirements:', allRequirements);
        if (requirementsError) {
          console.error('Requirements error:', requirementsError);
          throw requirementsError;
        }

        // تجميع الخدمات الفرعية حسب parent_id
        const childServicesMap = {};
        (allChildServices || []).forEach(child => {
          if (!childServicesMap[child.parent_id]) {
            childServicesMap[child.parent_id] = [];
          }
          childServicesMap[child.parent_id].push(child);
        });

        // تجميع service_types حسب service_id
        const serviceTypesMap = {};
        (allServiceTypes || []).forEach(type => {
          if (!serviceTypesMap[type.service_id]) {
            serviceTypesMap[type.service_id] = [];
          }
          serviceTypesMap[type.service_id].push(type);
        });

        // تجميع المتطلبات حسب service_id
        const requirementsMap = {};
        (allRequirements || []).forEach(req => {
          if (!requirementsMap[req.service_id]) {
            requirementsMap[req.service_id] = [];
          }
          requirementsMap[req.service_id].push(req);
        });

        // بناء قائمة الخدمات النهائية بدون استعلامات إضافية
        const servicesWithDetails = (servicesData || []).map(service => {
          const requirements = requirementsMap[service.id] || [];

          // جلب الخدمات الفرعية من الـ map
          const childServices = childServicesMap[service.id] || [];
          const childServicesSubcategories = childServices.map(child => ({
            id: child.id,
            title: child.name_ar,
            description: child.description_ar || '',
            icon: child.icon || '📋',
            bgColor: 'bg-blue-100',
            color: 'from-blue-600 to-blue-700',
            slug: child.slug
          }));

          // جلب service_types من الـ map
          const serviceTypes = serviceTypesMap[service.id] || [];
          const serviceTypesSubcategories = serviceTypes.map(type => {
            console.log(`[useServices] Mapping service_type: ${type.name_ar} (ID: ${type.id})`, type);

            // استخراج config من الـ service_type
            const config = type.config || {};

            return {
              id: type.id,
              title: type.name_ar,
              description: type.description_ar || '',
              icon: config.icon || '📋',
              bgColor: config.bgColor || 'bg-blue-100',
              color: config.color || 'from-blue-600 to-blue-700',
              isServiceType: true
            };
          });

          // دمج الخدمات الفرعية وservice_types
          const allSubcategories = [...childServicesSubcategories, ...serviceTypesSubcategories];

          return {
            id: service.id,
            slug: service.slug,
            title: service.name_ar,
            description: service.description_ar,
            icon: service.icon || 'FileText',
            category: service.category || 'documents',
            fees: service.fees || { base: 0, currency: 'ر.س' },
            duration: service.duration || 'حسب نوع الخدمة',
            requirements: requirements.map(r => r.requirement_ar),
            hasSubcategories: allSubcategories.length > 0,
            subcategories: allSubcategories,
            is_external: service.is_external || false,
            external_url: service.external_url || null
          };
        });

        console.log('Final services with details:', servicesWithDetails);
        setServices(servicesWithDetails);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  return { services, loading, error };
}
