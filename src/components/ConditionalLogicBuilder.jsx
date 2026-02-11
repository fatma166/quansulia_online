import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Info, Settings, X, CheckCircle2 } from 'lucide-react';

// Helper to safely parse options (handles both arrays and JSON strings)
const parseOptions = (options) => {
  if (!options) return [];
  if (Array.isArray(options)) return options;
  if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse options:', options, e);
      return [];
    }
  }
  return [];
};

const OPERATORS = [
  { value: 'equals', label: 'يساوي', symbol: '=' },
  { value: 'not_equals', label: 'لا يساوي', symbol: '≠' },
  { value: 'contains', label: 'يحتوي على', symbol: '⊃' },
  { value: 'not_contains', label: 'لا يحتوي على', symbol: '⊅' },
  { value: 'in', label: 'واحد من', symbol: '∈' },
  { value: 'not_in', label: 'ليس واحداً من', symbol: '∉' },
  { value: 'greater_than', label: 'أكبر من', symbol: '>' },
  { value: 'less_than', label: 'أقل من', symbol: '<' },
  { value: 'greater_than_or_equal', label: 'أكبر من أو يساوي', symbol: '≥' },
  { value: 'less_than_or_equal', label: 'أقل من أو يساوي', symbol: '≤' },
  { value: 'is_empty', label: 'فارغ', symbol: '∅' },
  { value: 'is_not_empty', label: 'غير فارغ', symbol: '∃' }
];

const ConditionalLogicBuilder = ({ value, availableFields = [], onChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Parse conditions safely from string or object
  let parsedValue = value;
  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value);
    } catch (e) {
      console.error('❌ Failed to parse conditions:', e);
      parsedValue = null;
    }
  }

  // Check format types
  // NEW format options:
  // 1. Simple: { field: "x", values: ["a", "b"] }
  // 2. Complex: { logic: "AND", conditions: [{field: "x", values: ["a"]}, ...] }
  // 3. Operator-based: { operator: "AND", conditions: [{field: "x", values: ["a"]}, ...] }
  // OLD format (legacy): { show_when: [{field: "x", operator: "equals", value: "y"}], logic: "AND" }

  const isSimpleNewFormat = parsedValue && parsedValue.field && parsedValue.values;
  const isComplexNewFormat = parsedValue && parsedValue.logic && parsedValue.conditions && !parsedValue.show_when;
  const isOperatorBasedFormat = parsedValue && parsedValue.operator && parsedValue.conditions && !parsedValue.show_when;
  const hasOldFormatData = parsedValue &&
    parsedValue.show_when &&
    Array.isArray(parsedValue.show_when) &&
    parsedValue.show_when.length > 0 &&
    parsedValue.show_when.some(c => c.operator !== undefined); // Has operator = old format

  // Convert new format to show_when format for editing
  const convertNewFormatToShowWhen = (parsedValue) => {
    // Simple format: { field: "x", values: ["a", "b"] }
    if (parsedValue && parsedValue.field && parsedValue.values) {
      return {
        show_when: parsedValue.values.map(val => ({
          id: `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          field: parsedValue.field,
          operator: 'equals',
          value: val
        })),
        logic: 'OR' // Multiple values = OR logic
      };
    }

    // Operator-based format: { operator: "AND", conditions: [{field: "x", values: ["a"]}, ...] }
    if (parsedValue && parsedValue.operator && parsedValue.conditions && !parsedValue.show_when) {
      const showWhenConditions = [];
      parsedValue.conditions.forEach(condition => {
        if (condition.values && condition.values.length > 0) {
          condition.values.forEach(val => {
            showWhenConditions.push({
              id: `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              field: condition.field,
              operator: 'equals',
              value: val
            });
          });
        }
      });
      return {
        show_when: showWhenConditions,
        logic: parsedValue.operator
      };
    }

    // Complex format: { logic: "AND", conditions: [{field: "x", values: ["a"]}, ...] }
    if (parsedValue && parsedValue.logic && parsedValue.conditions && !parsedValue.show_when) {
      const showWhenConditions = [];
      parsedValue.conditions.forEach(condition => {
        if (condition.values && condition.values.length > 0) {
          condition.values.forEach(val => {
            showWhenConditions.push({
              id: `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              field: condition.field,
              operator: 'equals',
              value: val
            });
          });
        }
      });
      return {
        show_when: showWhenConditions,
        logic: parsedValue.logic
      };
    }

    return parsedValue;
  };

  // Auto-convert new format to show_when for editing
  let editableParsedValue = parsedValue;
  if (isSimpleNewFormat || isComplexNewFormat || isOperatorBasedFormat) {
    editableParsedValue = convertNewFormatToShowWhen(parsedValue);
  }

  const showWhen = editableParsedValue?.show_when || [];
  const logic = editableParsedValue?.logic || 'AND';

  // Log available fields for debugging
  useEffect(() => {
    console.log('📋 ConditionalLogicBuilder Debug:', {
      rawValue: value,
      parsedValue,
      showWhen,
      showWhenLength: showWhen.length,
      logic,
      availableFieldsCount: availableFields.length,
      availableFields: availableFields.map(f => ({
        name: f.name,
        label: f.label,
        label_ar: f.label_ar,
        label_en: f.label_en,
        type: f.type
      }))
    });

    // Check each condition
    if (showWhen.length > 0) {
      showWhen.forEach((condition, index) => {
        const field = availableFields.find(f => f.name === condition.field);
        console.log(`🔍 Condition #${index + 1}:`, {
          conditionField: condition.field,
          conditionOperator: condition.operator,
          conditionValue: condition.value,
          foundField: field ? {
            name: field.name,
            label_ar: field.label_ar,
            label: field.label
          } : 'NOT FOUND'
        });
      });
    }
  }, [availableFields, value]);

  // Auto-cleanup disabled - let user manually clean
  // useEffect(() => {
  //   if (showWhen.length > 0) {
  //     const validConditions = showWhen.filter(condition => {
  //       return condition && condition.field && condition.field.trim() !== '';
  //     });
  //     if (validConditions.length !== showWhen.length) {
  //       console.log('🧹 Cleaning up empty conditions:', {
  //         before: showWhen.length,
  //         after: validConditions.length,
  //         removed: showWhen.length - validConditions.length
  //       });
  //       onChange({
  //         ...(parsedValue || {}),
  //         show_when: validConditions
  //       });
  //     }
  //   }
  // }, []);

  useEffect(() => {
    if (showWhen.length > 0 && showWhen.some(c => !c.id)) {
      const updatedShowWhen = showWhen.map((condition, index) => ({
        ...condition,
        id: condition.id || `condition_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
      }));
      onChange({
        show_when: updatedShowWhen,
        logic: logic
      });
    }
  }, []);

  // Disabled: Don't auto-fix missing fields, let user see and fix manually
  // useEffect(() => {
  //   if (showWhen.length > 0 && availableFields.length > 0) {
  //     let needsUpdate = false;
  //     const updatedShowWhen = showWhen.map(condition => {
  //       if (condition.field && !availableFields.find(f => f.name === condition.field)) {
  //         needsUpdate = true;
  //         return {
  //           ...condition,
  //           field: availableFields[0]?.name || '',
  //           value: ''
  //         };
  //       }
  //       return condition;
  //     });
  //     if (needsUpdate) {
  //       onChange({
  //         ...(parsedValue || {}),
  //         show_when: updatedShowWhen
  //       });
  //     }
  //   }
  // }, [availableFields]);

  const handleAddCondition = () => {
    const newCondition = {
      id: `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      field: '',
      operator: 'equals',
      value: ''
    };
    onChange({
      show_when: [...showWhen, newCondition],
      logic: logic
    });
  };

  const handleRemoveCondition = (index) => {
    const newShowWhen = showWhen.filter((_, i) => i !== index);
    onChange({
      show_when: newShowWhen,
      logic: logic
    });
  };

  const handleUpdateCondition = (index, property, conditionValue) => {
    const newShowWhen = [...showWhen];
    newShowWhen[index] = {
      ...newShowWhen[index],
      [property]: conditionValue
    };
    onChange({
      show_when: newShowWhen,
      logic: logic
    });
  };

  const handleLogicChange = (newLogic) => {
    onChange({
      show_when: showWhen,
      logic: newLogic
    });
  };

  const getFieldOptions = (field) => {
    const selectedField = availableFields.find(f => f.name === field);
    if (!selectedField) return [];

    if (['select', 'radio', 'checkbox', 'searchable-select'].includes(selectedField.type)) {
      return parseOptions(selectedField.config?.options);
    }
    return [];
  };

  const needsValueInput = (operator) => {
    return !['is_empty', 'is_not_empty'].includes(operator);
  };

  // Helper: Get field label from field name with proper mapping
  const getFieldLabel = (fieldName) => {
    if (!fieldName) return 'حقل غير محدد';
    const field = availableFields.find(f => f.name === fieldName);

    // Debug log
    if (!field) {
      console.log('⚠️ Field not found:', {
        fieldName,
        availableFieldNames: availableFields.map(f => f.name),
        availableFields
      });
    }

    return field?.label_ar || field?.label || `${fieldName} (غير موجود)`;
  };

  // Helper: Get option label from field name and option value
  const getOptionLabel = (fieldName, optionValue) => {
    if (!fieldName || !optionValue) return optionValue;
    const fieldOptions = getFieldOptions(fieldName);
    const option = fieldOptions.find(opt => opt.value === optionValue);
    return option?.label_ar || option?.label || optionValue;
  };

  return (
    <>
      {/* زر فتح Modal */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
            showWhen.length > 0 || isSimpleNewFormat || isComplexNewFormat || isOperatorBasedFormat
              ? 'bg-green-50 border-green-300 hover:bg-green-100'
              : hasOldFormatData
              ? 'bg-amber-50 border-amber-300 hover:bg-amber-100'
              : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <Settings className={`w-5 h-5 ${
              showWhen.length > 0 || isSimpleNewFormat || isComplexNewFormat || isOperatorBasedFormat ? 'text-green-600' : hasOldFormatData ? 'text-amber-600' : 'text-gray-600'
            }`} />
            <span className={`font-semibold ${
              showWhen.length > 0 || isSimpleNewFormat || isComplexNewFormat || isOperatorBasedFormat ? 'text-green-900' : hasOldFormatData ? 'text-amber-900' : 'text-gray-700'
            }`}>
              إدارة الشروط
            </span>
          </div>
          <div className="flex items-center gap-2">
            {showWhen.length > 0 ? (
              <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full font-bold">
                {showWhen.length} {showWhen.length === 1 ? 'شرط' : 'شروط'}
              </span>
            ) : (isSimpleNewFormat || isComplexNewFormat || isOperatorBasedFormat) ? (
              <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full font-bold">
                صيغة جديدة ✓
              </span>
            ) : hasOldFormatData ? (
              <span className="text-xs bg-amber-600 text-white px-3 py-1 rounded-full font-bold">
                صيغة قديمة
              </span>
            ) : (
              <span className="text-xs text-gray-500">لا توجد شروط</span>
            )}
          </div>
        </button>

        {(showWhen.length > 0 || isOperatorBasedFormat) && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-800 font-semibold mb-2">
                  هذا العنصر سيظهر بشكل شرطي
                </p>
                <div className="text-xs text-green-700 space-y-1">
                  <p className="font-semibold">
                    عند تحقق {logic === 'AND' ? 'جميع' : 'أي من'} الشروط التالية:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 mr-2">
                    {showWhen.map((condition, idx) => {
                      const operator = OPERATORS.find(op => op.value === condition.operator);
                      return (
                        <li key={condition.id || `summary_${idx}`}>
                          {getFieldLabel(condition.field)}
                          {' '}{operator?.label || condition.operator}
                          {needsValueInput(condition.operator) && condition.value && (
                            <> "{getOptionLabel(condition.field, condition.value)}"</>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}


        {hasOldFormatData && showWhen.length === 0 && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-900 font-semibold mb-2">
                  ⚠️ صيغة الشروط القديمة
                </p>
                <div className="text-xs text-amber-800 space-y-2">
                  <p>
                    هذا العنصر يحتوي على شروط بصيغة قديمة لا يمكن تعديلها هنا.
                  </p>
                  <div className="bg-amber-100 rounded p-2 font-mono text-xs">
                    {JSON.stringify(parsedValue, null, 2)}
                  </div>
                  <p className="font-semibold">
                    يرجى حذف الشروط القديمة وإنشاء شروط جديدة باستخدام النظام المحدث.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('هل تريد حذف الشروط القديمة وإنشاء شروط جديدة؟')) {
                        onChange({ show_when: [], logic: 'AND' });
                      }
                    }}
                    className="mt-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold"
                  >
                    حذف الشروط القديمة وإنشاء جديدة
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6" />
                <h3 className="text-xl font-bold">إدارة الشروط الشرطية</h3>
                {(() => {
                  const emptyConditions = showWhen.filter(c => !c || !c.field || c.field.trim() === '');
                  if (emptyConditions.length > 0) {
                    return (
                      <span className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-full font-bold animate-pulse">
                        ⚠️ {emptyConditions.length} فارغ
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Empty Conditions Warning */}
              {(() => {
                const emptyConditions = showWhen.filter(c => !c || !c.field || c.field.trim() === '');
                if (emptyConditions.length > 0) {
                  return (
                    <div className="bg-red-50 border-2 border-red-400 rounded-xl p-5 mb-6 animate-pulse">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">⚠️</div>
                        <div className="flex-1">
                          <h5 className="font-bold text-red-900 mb-2 text-lg">تحذير: شروط فارغة!</h5>
                          <p className="text-sm text-red-800 mb-3">
                            يوجد <strong className="text-xl">{emptyConditions.length}</strong> شرط بدون حقل محدد.
                            هذه الشروط لن تعمل ويجب حذفها أو تكملتها.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`هل تريد حذف ${emptyConditions.length} شرط فارغ؟`)) {
                                const validConditions = showWhen.filter(c => c && c.field && c.field.trim() !== '');
                                onChange({
                                  ...(parsedValue || {}),
                                  show_when: validConditions
                                });
                              }
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-sm"
                          >
                            🗑️ حذف جميع الشروط الفارغة ({emptyConditions.length})
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* New Format Info */}
              {(isSimpleNewFormat || isComplexNewFormat) && (
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h5 className="font-bold text-green-900 mb-3 text-base">
                        ✓ الشروط محفوظة بالصيغة الجديدة
                      </h5>
                      <div className="space-y-3 text-sm text-green-800">
                        <p>
                          هذا العنصر يحتوي على شروط بالصيغة الجديدة المحسّنة. هذه الشروط تعمل بشكل صحيح ولا تحتاج إلى أي تعديلات.
                        </p>
                        <div className="bg-green-100 rounded-lg p-3 font-mono text-xs overflow-auto max-h-40">
                          {JSON.stringify(parsedValue, null, 2)}
                        </div>
                        <div className="bg-white border border-green-300 rounded-lg p-3">
                          <p className="font-semibold text-green-900 mb-2">
                            💡 معلومة
                          </p>
                          <p className="text-xs leading-relaxed">
                            الصيغة الجديدة أسرع وأكثر كفاءة من الصيغة القديمة. لا حاجة لتعديل هذه الشروط.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Old Format Warning */}
              {hasOldFormatData && showWhen.length === 0 && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h5 className="font-bold text-amber-900 mb-3 text-base">
                        ⚠️ صيغة الشروط القديمة
                      </h5>
                      <div className="space-y-3 text-sm text-amber-800">
                        <p>
                          هذا العنصر يحتوي على شروط بصيغة قديمة من نظام سابق. لا يمكن تعديل هذه الشروط باستخدام المحرر الحالي.
                        </p>
                        <div className="bg-amber-100 rounded-lg p-3 font-mono text-xs overflow-auto max-h-40">
                          {JSON.stringify(parsedValue, null, 2)}
                        </div>
                        <div className="bg-white border border-amber-300 rounded-lg p-3">
                          <p className="font-semibold text-amber-900 mb-2">
                            💡 ما هي الخطوة التالية؟
                          </p>
                          <p className="text-xs leading-relaxed">
                            يمكنك حذف الشروط القديمة وإنشاء شروط جديدة باستخدام النظام المحدث. سيتيح لك ذلك الاستفادة من جميع المزايا الجديدة مثل الشروط المتعددة والعمليات المختلفة.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('هل تريد حذف الشروط القديمة وإنشاء شروط جديدة؟\n\nتحذير: هذا الإجراء لا يمكن التراجع عنه!')) {
                              onChange({ show_when: [], logic: 'AND' });
                              alert('✓ تم حذف الشروط القديمة. يمكنك الآن إنشاء شروط جديدة.');
                            }
                          }}
                          className="w-full px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold transition-colors"
                        >
                          🗑️ حذف الشروط القديمة وإنشاء جديدة
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-bold text-blue-900 mb-2 text-base">كيف تعمل الشروط؟</h5>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      يمكنك التحكم في إظهار هذا الحقل بناءً على قيم حقول أخرى. على سبيل المثال: إظهار "رقم الجواز القديم" فقط عندما يختار المستخدم "تجديد" في حقل "نوع الطلب".
                    </p>
                  </div>
                </div>
              </div>

              {/* Available Fields Display */}
              {availableFields.length > 0 && (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold text-emerald-900 text-sm mb-3">
                        📋 الحقول المتاحة للاستخدام ({availableFields.length} حقل)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {availableFields.map(field => (
                          <span
                            key={field.name}
                            className="inline-flex items-center px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs"
                            title={`الاسم التقني: ${field.name} | النوع: ${field.type}`}
                          >
                            <span className="font-bold text-emerald-900">{getFieldLabel(field.name)}</span>
                            {field.label_ar !== field.name && (
                              <span className="mr-1.5 text-emerald-600 text-[10px]">
                                ({field.name})
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Logic Selector */}
              {showWhen.length > 0 && (
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5 mb-6">
                  <label className="block text-sm font-bold text-green-900 mb-3">
                    إظهار هذا العنصر عندما:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleLogicChange('AND')}
                      className={`p-4 rounded-xl border-2 transition-all text-right ${
                        logic === 'AND'
                          ? 'bg-green-600 border-green-600 text-white shadow-lg'
                          : 'bg-white border-green-300 text-green-800 hover:border-green-400'
                      }`}
                    >
                      <div className="font-bold text-base mb-1">✓ جميع الشروط (AND)</div>
                      <div className={`text-xs ${logic === 'AND' ? 'text-green-100' : 'text-green-600'}`}>
                        يجب تحقق كل الشروط معاً
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLogicChange('OR')}
                      className={`p-4 rounded-xl border-2 transition-all text-right ${
                        logic === 'OR'
                          ? 'bg-green-600 border-green-600 text-white shadow-lg'
                          : 'bg-white border-green-300 text-green-800 hover:border-green-400'
                      }`}
                    >
                      <div className="font-bold text-base mb-1">◉ أي شرط (OR)</div>
                      <div className={`text-xs ${logic === 'OR' ? 'text-green-100' : 'text-green-600'}`}>
                        يكفي تحقق شرط واحد فقط
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Conditions List */}
              {showWhen.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {showWhen.map((condition, index) => {
                    const fieldOptions = getFieldOptions(condition.field);

                    const selectedField = availableFields.find(f => f.name === condition.field);
                    const selectedOperator = OPERATORS.find(op => op.value === condition.operator);
                    const hasCompleteCondition = condition.field && condition.operator && (condition.value || ['is_empty', 'is_not_empty'].includes(condition.operator));

                    // Debug logging
                    console.log('🔍 Condition Debug:', {
                      index,
                      field: condition.field,
                      operator: condition.operator,
                      value: condition.value,
                      selectedField: selectedField?.name,
                      hasCompleteCondition
                    });

                    return (
                      <div key={condition.id || index} className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        {/* Debug Info */}
                        {!condition.field && (
                          <div className="bg-amber-50 border border-amber-300 rounded-lg p-2 mb-3 text-xs">
                            <strong className="text-amber-900">⚠️ تحذير:</strong>
                            <span className="text-amber-700"> لم يتم تحديد الحقل بعد</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-white bg-[#276073] px-4 py-1.5 rounded-full">
                              شرط #{index + 1}
                            </span>
                            {hasCompleteCondition && (
                              <div className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                                ✓ مكتمل
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCondition(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف الشرط"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {hasCompleteCondition && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-blue-900 font-semibold text-center">
                              "{getFieldLabel(condition.field)}"
                              <span className="mx-2">{selectedOperator?.symbol}</span>
                              {needsValueInput(condition.operator) && condition.value && (
                                <>
                                  "{getOptionLabel(condition.field, condition.value)}"
                                </>
                              )}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                          {/* Field */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              <span className="text-blue-600">①</span> الحقل
                            </label>
                            {availableFields.length === 0 ? (
                              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 text-center">
                                <p className="text-sm text-yellow-800 font-semibold">
                                  ⚠️ لا توجد حقول متاحة
                                </p>
                                <p className="text-xs text-yellow-700 mt-1">
                                  يجب إضافة حقول إلى النموذج أولاً قبل إنشاء الشروط
                                </p>
                              </div>
                            ) : (
                              <>
                                <select
                                  value={condition.field || ''}
                                  onChange={(e) => {
                                    console.log('🔄 Field changed:', e.target.value);
                                    handleUpdateCondition(index, 'field', e.target.value);
                                  }}
                                  className={`w-full px-4 py-3 border-2 rounded-lg text-sm focus:ring-2 focus:ring-[#276073] focus:border-[#276073] bg-white ${
                                    !condition.field ? 'border-amber-400 bg-amber-50' : 'border-gray-300'
                                  }`}
                                >
                                  <option value="">اختر الحقل</option>
                                  {condition.field && !selectedField && (
                                    <option value={condition.field} className="text-red-600">
                                      {getFieldLabel(condition.field)} (غير موجود)
                                    </option>
                                  )}
                                  {availableFields.map(field => {
                                    const label = field.label_ar || field.label || field.name;
                                    console.log('🏷️ Field Option:', {
                                      name: field.name,
                                      label,
                                      label_ar: field.label_ar,
                                      label_en: field.label_en,
                                      field
                                    });
                                    return (
                                      <option key={field.name} value={field.name}>
                                        {label}
                                      </option>
                                    );
                                  })}
                                </select>
                                {!condition.field && (
                                  <p className="text-xs text-amber-600 mt-1 font-semibold">
                                    ⚠️ الرجاء اختيار حقل من القائمة
                                  </p>
                                )}
                                {condition.field && !selectedField && (
                                  <p className="text-xs text-red-600 mt-1">
                                    ⚠️ الحقل "{getFieldLabel(condition.field)}" غير موجود في النموذج الحالي
                                  </p>
                                )}
                                {condition.field && selectedField && (
                                  <p className="text-xs text-green-600 mt-1 font-semibold">
                                    ✓ الحقل المختار: {getFieldLabel(condition.field)}
                                  </p>
                                )}
                              </>
                            )}
                          </div>

                          {/* Operator & Value */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">
                                <span className="text-blue-600">②</span> المعامل
                              </label>
                              <select
                                value={condition.operator}
                                onChange={(e) => handleUpdateCondition(index, 'operator', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#276073] focus:border-[#276073] bg-white"
                              >
                                {OPERATORS.map(op => (
                                  <option key={op.value} value={op.value}>
                                    {op.symbol} {op.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {needsValueInput(condition.operator) && (
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                  <span className="text-blue-600">③</span> القيمة
                                </label>
                                {fieldOptions.length > 0 ? (
                                  <>
                                    <select
                                      value={condition.value || ''}
                                      onChange={(e) => {
                                        console.log('🔄 Value changed:', e.target.value);
                                        handleUpdateCondition(index, 'value', e.target.value);
                                      }}
                                      className={`w-full px-4 py-3 border-2 rounded-lg text-sm focus:ring-2 focus:ring-[#276073] focus:border-[#276073] bg-white ${
                                        !condition.value ? 'border-amber-400 bg-amber-50' : 'border-gray-300'
                                      }`}
                                    >
                                      <option value="">اختر القيمة</option>
                                      {fieldOptions.map((opt) => (
                                        <option key={opt.value || opt.label} value={opt.value}>
                                          {opt.label_ar || opt.label || opt.value}
                                          {opt.value && (opt.label_ar || opt.label) && opt.value !== (opt.label_ar || opt.label) &&
                                            ` (${opt.value})`
                                          }
                                        </option>
                                      ))}
                                    </select>
                                    {!condition.value && (
                                      <p className="text-xs text-amber-600 mt-1 font-semibold">
                                        ⚠️ الرجاء اختيار قيمة من القائمة
                                      </p>
                                    )}
                                    {condition.value && (
                                      <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-blue-700">
                                            <strong>القيمة المحفوظة:</strong>
                                          </span>
                                          <code className="font-mono text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                                            {condition.value}
                                          </code>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <input
                                      type="text"
                                      value={condition.value || ''}
                                      onChange={(e) => {
                                        console.log('🔄 Value changed:', e.target.value);
                                        handleUpdateCondition(index, 'value', e.target.value);
                                      }}
                                      className={`w-full px-4 py-3 border-2 rounded-lg text-sm focus:ring-2 focus:ring-[#276073] focus:border-[#276073] font-mono ${
                                        !condition.value ? 'border-amber-400 bg-amber-50' : 'border-gray-300'
                                      }`}
                                      placeholder="أدخل القيمة (value)"
                                    />
                                    <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                      <p className="text-xs text-blue-700">
                                        <strong>💡 نصيحة:</strong> استخدم القيمة المحفوظة (value) وليس التسمية المعروضة.
                                        <br />
                                        مثال: اكتب "renewal" وليس "تجديد"
                                      </p>
                                    </div>
                                    {!condition.value && (
                                      <p className="text-xs text-amber-600 mt-1 font-semibold">
                                        ⚠️ الرجاء إدخال قيمة
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 mb-6">
                  <div className="text-6xl mb-3">📋</div>
                  <p className="text-gray-600 font-semibold mb-1">
                    لا توجد شروط حالياً
                  </p>
                  <p className="text-gray-500 text-sm">
                    سيظهر هذا العنصر دائماً بدون شروط
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddCondition}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#276073] to-[#1e4a5a] text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-bold text-base"
                >
                  <Plus className="w-5 h-5" />
                  إضافة شرط جديد
                </button>

                {showWhen.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const validConditions = showWhen.filter(c => c && c.field && c.field.trim() !== '');
                      const emptyCount = showWhen.length - validConditions.length;

                      if (emptyCount > 0) {
                        if (confirm(`هل تريد حذف ${emptyCount} شرط فارغ؟`)) {
                          onChange({
                            ...(parsedValue || {}),
                            show_when: validConditions
                          });
                        }
                      } else {
                        alert('✓ جميع الشروط صحيحة!');
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 text-white rounded-xl hover:bg-amber-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-bold text-base"
                    title="حذف الشروط الفارغة"
                  >
                    <Trash2 className="w-5 h-5" />
                    تنظيف
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-3 bg-[#276073] text-white rounded-lg hover:bg-[#1e4a5a] transition-colors font-semibold"
              >
                تم
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ConditionalLogicBuilder;
