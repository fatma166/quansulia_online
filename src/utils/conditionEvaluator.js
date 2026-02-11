/**
 * تقييم الشروط بناءً على بيانات النموذج
 * @param {Array|Object} conditions - مصفوفة الشروط أو كائن شرط واحد
 * @param {Object} formData - بيانات النموذج
 * @returns {boolean} - true إذا تحققت جميع الشروط
 */
export function evaluateConditions(conditions, formData) {
  if (!conditions) {
    return true; // لا توجد شروط = متحققة دائماً
  }

  // If conditions is an empty object, return true (always visible)
  if (typeof conditions === 'object' && !Array.isArray(conditions) && Object.keys(conditions).length === 0) {
    return true;
  }

  // If conditions is a single object (not an array), convert to array
  if (!Array.isArray(conditions) && typeof conditions === 'object') {
    // Handle nested format: { operator: "AND", conditions: [...] }
    if (conditions.operator && conditions.conditions && Array.isArray(conditions.conditions)) {
      console.log('🔍 [evaluateConditions] Evaluating nested conditions:', {
        operator: conditions.operator,
        conditionsCount: conditions.conditions.length,
        formData
      });

      const results = conditions.conditions.map(cond => {
        // Each condition in the array should have { field, values }
        const { field, values, value } = cond;
        const fieldValue = formData[field];

        console.log(`  📋 [Condition] Field: ${field}`, {
          expectedValues: values || value,
          actualValue: fieldValue,
          hasValue: fieldValue !== undefined && fieldValue !== null
        });

        // Handle undefined/null field values
        if (fieldValue === undefined || fieldValue === null) {
          console.log(`  ❌ Field "${field}" is undefined/null - FAILED`);
          return false;
        }

        // Check if fieldValue is in values array
        if (values && Array.isArray(values)) {
          const result = values.includes(fieldValue);
          console.log(`  ${result ? '✅' : '❌'} Field "${field}" value "${fieldValue}" ${result ? 'IS' : 'NOT'} in [${values.join(', ')}]`);
          return result;
        }

        // Check if fieldValue equals value
        if (value !== undefined) {
          const result = String(fieldValue) === String(value);
          console.log(`  ${result ? '✅' : '❌'} Field "${field}" value "${fieldValue}" ${result ? 'EQUALS' : 'NOT EQUALS'} "${value}"`);
          return result;
        }

        return false;
      });

      // Apply the operator (AND or OR)
      const finalResult = conditions.operator === 'AND'
        ? results.every(r => r === true)
        : results.some(r => r === true);

      console.log(`🎯 [evaluateConditions] Final result (${conditions.operator}):`, {
        individualResults: results,
        finalResult
      });

      return finalResult;
    }

    // Check if it's the new format: { field, operator, values/value, exclude? }
    if (conditions.field) {
      const { field, operator, values, value, exclude } = conditions;
      const fieldValue = formData[field];

      // Handle undefined/null field values
      if (fieldValue === undefined || fieldValue === null) {
        return operator === 'is_empty' || operator === 'not_exists';
      }

      // Handle exclude flag (show when field value is NOT in values)
      if (exclude && values) {
        return !values.includes(fieldValue);
      }

      // Handle "in" operator with values array
      if ((operator === 'in' || !operator) && values && Array.isArray(values)) {
        return values.includes(fieldValue);
      }

      // Handle equals operator
      if (operator === 'equals' || operator === '==') {
        if (values && Array.isArray(values) && values.length === 1) {
          return String(fieldValue) === String(values[0]);
        }
        if (value !== undefined) {
          return String(fieldValue) === String(value);
        }
      }

      // Fallback to standard evaluation
      return evaluateSingleCondition({ field, operator: operator || 'equals', value: value || (values && values[0]) }, formData);
    }

    // If it has show_when property, use that
    if (conditions.show_when) {
      return evaluateShowWhenConditions(conditions, formData);
    }
  }

  // If it's an empty array, return true
  if (Array.isArray(conditions) && conditions.length === 0) {
    return true;
  }

  // Handle array of conditions (legacy format)
  if (Array.isArray(conditions)) {
    return conditions.every(condition => evaluateSingleCondition(condition, formData));
  }

  return true;
}

/**
 * Evaluate a single condition
 */
function evaluateSingleCondition(condition, formData) {
    const { field, operator, value } = condition;
    const fieldValue = formData[field];

    // إذا كان الحقل غير موجود في البيانات
    if (fieldValue === undefined || fieldValue === null) {
      return operator === 'is_empty' || operator === 'not_exists';
    }

    switch (operator) {
      case 'equals':
      case '==':
        return String(fieldValue) === String(value);

      case 'not_equals':
      case '!=':
        return String(fieldValue) !== String(value);

      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());

      case 'not_contains':
        return !String(fieldValue).toLowerCase().includes(String(value).toLowerCase());

      case 'starts_with':
        return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase());

      case 'ends_with':
        return String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase());

      case 'greater_than':
      case '>':
        return Number(fieldValue) > Number(value);

      case 'greater_than_or_equal':
      case '>=':
        return Number(fieldValue) >= Number(value);

      case 'less_than':
      case '<':
        return Number(fieldValue) < Number(value);

      case 'less_than_or_equal':
      case '<=':
        return Number(fieldValue) <= Number(value);

      case 'is_empty':
        return !fieldValue || String(fieldValue).trim() === '';

      case 'is_not_empty':
        return fieldValue && String(fieldValue).trim() !== '';

      case 'in':
        if (Array.isArray(value)) {
          return value.includes(fieldValue);
        }
        // إذا كانت القيمة string مفصولة بفواصل
        const values = String(value).split(',').map(v => v.trim());
        return values.includes(String(fieldValue));

      case 'not_in':
        if (Array.isArray(value)) {
          return !value.includes(fieldValue);
        }
        const notInValues = String(value).split(',').map(v => v.trim());
        return !notInValues.includes(String(fieldValue));

      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;

      case 'not_exists':
        return fieldValue === undefined || fieldValue === null;

      case 'is_true':
        return fieldValue === true || fieldValue === 'true' || fieldValue === 'yes' || fieldValue === 1;

      case 'is_false':
        return fieldValue === false || fieldValue === 'false' || fieldValue === 'no' || fieldValue === 0;

      default:
        console.warn(`Unknown operator: ${operator}`);
        return false;
    }
}

/**
 * تقييم الشروط بصيغة show_when
 * @param {Object} conditionsObject - كائن الشروط بصيغة { show_when: [], logic: 'AND' }
 * @param {Object} formData - بيانات النموذج
 * @returns {boolean}
 */
function evaluateShowWhenConditions(conditionsObject, formData) {
  if (!conditionsObject || !conditionsObject.show_when || conditionsObject.show_when.length === 0) {
    return true;
  }

  const { show_when, logic = 'AND' } = conditionsObject;

  console.log('[تقييم الشروط] بدء التقييم:', {
    conditions: show_when,
    logic,
    formData
  });

  const results = show_when.map(condition => {
    const { field, operator, value } = condition;
    const fieldValue = formData[field];

    console.log(`[تقييم الشرط] الحقل: ${field}`, {
      operator,
      expectedValue: value,
      actualValue: fieldValue,
      match: String(fieldValue) === String(value)
    });

    // إذا كان الحقل غير موجود في البيانات
    if (fieldValue === undefined || fieldValue === null) {
      return operator === 'is_empty' || operator === 'not_exists';
    }

    switch (operator) {
      case 'equals':
      case '==':
        return String(fieldValue) === String(value);

      case 'not_equals':
      case '!=':
        return String(fieldValue) !== String(value);

      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());

      case 'not_contains':
        return !String(fieldValue).toLowerCase().includes(String(value).toLowerCase());

      case 'starts_with':
        return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase());

      case 'ends_with':
        return String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase());

      case 'greater_than':
      case '>':
        return Number(fieldValue) > Number(value);

      case 'greater_than_or_equal':
      case '>=':
        return Number(fieldValue) >= Number(value);

      case 'less_than':
      case '<':
        return Number(fieldValue) < Number(value);

      case 'less_than_or_equal':
      case '<=':
        return Number(fieldValue) <= Number(value);

      case 'is_empty':
        return !fieldValue || String(fieldValue).trim() === '';

      case 'is_not_empty':
        return fieldValue && String(fieldValue).trim() !== '';

      case 'in':
        if (Array.isArray(value)) {
          return value.includes(fieldValue);
        }
        const values = String(value).split(',').map(v => v.trim());
        return values.includes(String(fieldValue));

      case 'not_in':
        if (Array.isArray(value)) {
          return !value.includes(fieldValue);
        }
        const notInValues = String(value).split(',').map(v => v.trim());
        return !notInValues.includes(String(fieldValue));

      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;

      case 'not_exists':
        return fieldValue === undefined || fieldValue === null;

      case 'is_true':
        return fieldValue === true || fieldValue === 'true' || fieldValue === 'yes' || fieldValue === 1;

      case 'is_false':
        return fieldValue === false || fieldValue === 'false' || fieldValue === 'no' || fieldValue === 0;

      default:
        console.warn(`Unknown operator: ${operator}`);
        return false;
    }
  });

  const finalResult = logic === 'AND'
    ? results.every(r => r === true)
    : results.some(r => r === true);

  console.log('[تقييم الشروط] النتيجة النهائية:', {
    logic,
    individualResults: results,
    finalResult
  });

  return finalResult;
}

/**
 * العثور على قاعدة التسعير المناسبة بناءً على الشروط
 * @param {Array} pricingRules - مصفوفة قواعد التسعير (مرتبة حسب الأولوية)
 * @param {Object} formData - بيانات النموذج
 * @returns {Object|null} - القاعدة المتحققة أو null
 */
export function findMatchingPricingRule(pricingRules, formData) {
  if (!pricingRules || pricingRules.length === 0) {
    console.log('[التسعير المشروط] لا توجد قواعد تسعير');
    return null;
  }

  console.log('[التسعير المشروط] بدء البحث عن قاعدة مطابقة:', {
    totalRules: pricingRules.length,
    formData
  });

  // القواعد يجب أن تكون مرتبة حسب الأولوية (من الأعلى إلى الأدنى)
  const sortedRules = [...pricingRules]
    .filter(rule => rule.is_active)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  console.log('[التسعير المشروط] القواعد النشطة بعد الترتيب:',
    sortedRules.map(r => ({
      name: r.rule_name,
      priority: r.priority,
      hasConditions: !!r.conditions
    }))
  );

  // إرجاع أول قاعدة تتحقق شروطها
  for (const rule of sortedRules) {
    console.log(`[التسعير المشروط] فحص القاعدة: ${rule.rule_name}`);

    // التحقق من صيغة الشروط
    if (!rule.conditions) {
      console.log(`[التسعير المشروط] القاعدة ${rule.rule_name} ليس لها شروط - تطبق على الجميع`);
      return rule;
    }

    // إذا كانت الشروط بصيغة { operator: "AND", conditions: [...] }
    if (rule.conditions.operator && rule.conditions.conditions) {
      const results = rule.conditions.conditions.map(condition => {
        const fieldValue = formData[condition.field];

        // إذا كان الشرط يحتوي على values
        if (condition.values && Array.isArray(condition.values)) {
          return condition.values.includes(fieldValue);
        }

        // إذا كان الشرط يحتوي على value
        if (Object.prototype.hasOwnProperty.call(condition, 'value')) {
          return fieldValue === condition.value;
        }

        return true;
      });

      const matched = rule.conditions.operator === 'AND'
        ? results.every(r => r === true)
        : results.some(r => r === true);

      if (matched) {
        console.log(`[التسعير المشروط] ✓ القاعدة ${rule.rule_name} متحققة!`);
        return rule;
      }
    }
    // إذا كانت الشروط بصيغة { show_when: [...], logic: '...' }
    else if (rule.conditions.show_when) {
      if (evaluateShowWhenConditions(rule.conditions, formData)) {
        console.log(`[التسعير المشروط] ✓ القاعدة ${rule.rule_name} متحققة!`);
        return rule;
      }
    }
    // إذا كانت الشروط مصفوفة مباشرة (صيغة قديمة)
    else if (Array.isArray(rule.conditions)) {
      if (evaluateConditions(rule.conditions, formData)) {
        console.log(`[التسعير المشروط] ✓ القاعدة ${rule.rule_name} متحققة! (صيغة قديمة)`);
        return rule;
      }
    }

    console.log(`[التسعير المشروط] ✗ القاعدة ${rule.rule_name} غير متحققة`);
  }

  console.log('[التسعير المشروط] لم يتم العثور على قاعدة مطابقة');
  return null;
}
