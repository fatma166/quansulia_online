import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, DollarSign, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ConditionalLogicBuilder from './ConditionalLogicBuilder';

export default function ConditionalPricingManager({ serviceId, serviceTypeId = null }) {
  const [pricingRules, setPricingRules] = useState([]);
  const [availableFields, setAvailableFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState(null);

  // نموذج القاعدة الجديدة
  const [newRule, setNewRule] = useState({
    rule_name: '',
    conditions: { show_when: [], logic: 'AND' },
    price: '',
    price_under_18: '',
    price_18_and_above: '',
    priority: 0,
    use_age_based_pricing: false
  });

  useEffect(() => {
    if (serviceId) {
      fetchPricingRules();
      fetchServiceFields();
    }
  }, [serviceId, serviceTypeId]);

  const fetchServiceFields = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('service_fields')
        .select('*')
        .eq('service_id', serviceId)
        .eq('is_active', true)
        .order('order_index');

      if (fetchError) throw fetchError;

      // تحويل الحقول إلى صيغة مناسبة لـ ConditionalLogicBuilder
      const formattedFields = (data || []).map(field => ({
        name: field.field_name,
        label: field.label_ar,
        label_ar: field.label_ar,
        label_en: field.label_en,
        type: field.field_type,
        config: {
          options: field.options || []
        }
      }));

      setAvailableFields(formattedFields);
      console.log('[ConditionalPricingManager] تم جلب الحقول:', formattedFields);
    } catch (err) {
      console.error('Error fetching service fields:', err);
    }
  };

  const fetchPricingRules = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('service_pricing_rules')
        .select('*')
        .eq('service_id', serviceId)
        .order('priority', { ascending: false });

      if (serviceTypeId) {
        query = query.eq('service_type_id', serviceTypeId);
      } else {
        query = query.is('service_type_id', null);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setPricingRules(data || []);
    } catch (err) {
      console.error('Error fetching pricing rules:', err);
      setError('حدث خطأ في تحميل قواعد التسعير');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async () => {
    try {
      setError(null);

      // التحقق من البيانات
      if (!newRule.rule_name.trim()) {
        setError('يجب إدخال اسم القاعدة');
        return;
      }

      if (newRule.use_age_based_pricing) {
        if (!newRule.price_under_18 || !newRule.price_18_and_above) {
          setError('يجب إدخال السعر للأطفال والبالغين');
          return;
        }
      } else {
        if (!newRule.price) {
          setError('يجب إدخال السعر');
          return;
        }
      }

      const ruleData = {
        service_id: serviceId,
        service_type_id: serviceTypeId,
        rule_name: newRule.rule_name,
        conditions: newRule.conditions || { show_when: [], logic: 'AND' },
        priority: parseInt(newRule.priority) || 0,
        is_active: true
      };

      if (newRule.use_age_based_pricing) {
        ruleData.price_under_18 = parseFloat(newRule.price_under_18);
        ruleData.price_18_and_above = parseFloat(newRule.price_18_and_above);
        ruleData.price = null;
      } else {
        ruleData.price = parseFloat(newRule.price);
        ruleData.price_under_18 = null;
        ruleData.price_18_and_above = null;
      }

      const { error: insertError } = await supabase
        .from('service_pricing_rules')
        .insert([ruleData]);

      if (insertError) throw insertError;

      // إعادة تحميل القواعد
      await fetchPricingRules();

      // إعادة تعيين النموذج
      setNewRule({
        rule_name: '',
        conditions: { show_when: [], logic: 'AND' },
        price: '',
        price_under_18: '',
        price_18_and_above: '',
        priority: 0,
        use_age_based_pricing: false
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding pricing rule:', err);
      setError('حدث خطأ في إضافة القاعدة');
    }
  };

  const handleUpdateRule = async (ruleId) => {
    try {
      setError(null);

      const ruleToUpdate = pricingRules.find(r => r.id === ruleId);
      if (!ruleToUpdate) return;

      const { error: updateError } = await supabase
        .from('service_pricing_rules')
        .update({
          rule_name: ruleToUpdate.rule_name,
          conditions: ruleToUpdate.conditions,
          price: ruleToUpdate.price,
          price_under_18: ruleToUpdate.price_under_18,
          price_18_and_above: ruleToUpdate.price_18_and_above,
          priority: ruleToUpdate.priority,
          is_active: ruleToUpdate.is_active
        })
        .eq('id', ruleId);

      if (updateError) throw updateError;

      setEditingRule(null);
      await fetchPricingRules();
    } catch (err) {
      console.error('Error updating pricing rule:', err);
      setError('حدث خطأ في تحديث القاعدة');
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!confirm('هل أنت متأكد من حذف هذه القاعدة؟')) return;

    try {
      const { error: deleteError } = await supabase
        .from('service_pricing_rules')
        .delete()
        .eq('id', ruleId);

      if (deleteError) throw deleteError;
      await fetchPricingRules();
    } catch (err) {
      console.error('Error deleting pricing rule:', err);
      setError('حدث خطأ في حذف القاعدة');
    }
  };

  const handleToggleActive = async (ruleId, currentState) => {
    try {
      const { error: updateError } = await supabase
        .from('service_pricing_rules')
        .update({ is_active: !currentState })
        .eq('id', ruleId);

      if (updateError) throw updateError;
      await fetchPricingRules();
    } catch (err) {
      console.error('Error toggling rule state:', err);
      setError('حدث خطأ في تغيير حالة القاعدة');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#276073]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">قواعد التسعير المشروط</h3>
          <p className="text-sm text-gray-600 mt-1">
            حدد أسعار مختلفة بناءً على شروط معينة (نوع الطلب، الفئة العمرية، إلخ)
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#276073] text-white rounded-lg hover:bg-[#1e4a59] transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة قاعدة
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Rule Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-300 rounded-lg p-6 space-y-4">
          <h4 className="font-bold text-gray-900">إضافة قاعدة تسعير جديدة</h4>

          {/* Rule Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم القاعدة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newRule.rule_name}
              onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
              placeholder="مثال: سعر التجديد"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
            />
          </div>

          {/* Age-Based Pricing Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="use_age_based"
              checked={newRule.use_age_based_pricing}
              onChange={(e) => setNewRule({ ...newRule, use_age_based_pricing: e.target.checked })}
              className="w-4 h-4 text-[#276073] border-gray-300 rounded focus:ring-[#276073]"
            />
            <label htmlFor="use_age_based" className="text-sm font-medium text-gray-700">
              استخدام التسعير حسب العمر (أقل من 18 / 18 فأكثر)
            </label>
          </div>

          {/* Price Fields */}
          {newRule.use_age_based_pricing ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر للأطفال (أقل من 18) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newRule.price_under_18}
                  onChange={(e) => setNewRule({ ...newRule, price_under_18: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر للبالغين (18 فأكثر) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newRule.price_18_and_above}
                  onChange={(e) => setNewRule({ ...newRule, price_18_and_above: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={newRule.price}
                onChange={(e) => setNewRule({ ...newRule, price: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
              />
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الأولوية (رقم أعلى = أولوية أعلى)
            </label>
            <input
              type="number"
              value={newRule.priority}
              onChange={(e) => setNewRule({ ...newRule, priority: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
            />
          </div>

          {/* Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              شروط تطبيق القاعدة
            </label>
            <p className="text-xs text-gray-500 mb-3">
              حدد الشروط التي يجب أن تتحقق لتطبيق هذا السعر
            </p>
            <ConditionalLogicBuilder
              value={newRule.conditions}
              onChange={(conditions) => {
                console.log('[ConditionalPricingManager] تحديث الشروط:', conditions);
                setNewRule({ ...newRule, conditions });
              }}
              availableFields={availableFields}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleAddRule}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              حفظ القاعدة
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewRule({
                  rule_name: '',
                  conditions: { show_when: [], logic: 'AND' },
                  price: '',
                  price_under_18: '',
                  price_18_and_above: '',
                  priority: 0,
                  use_age_based_pricing: false
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Pricing Rules List */}
      <div className="space-y-3">
        {pricingRules.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">لا توجد قواعد تسعير</p>
            <p className="text-sm text-gray-500 mt-1">
              اضغط على "إضافة قاعدة" لإنشاء قاعدة تسعير جديدة
            </p>
          </div>
        ) : (
          pricingRules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-white border rounded-lg p-4 ${
                !rule.is_active ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-gray-900">{rule.rule_name}</h4>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      أولوية: {rule.priority}
                    </span>
                    {!rule.is_active && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        غير نشط
                      </span>
                    )}
                  </div>

                  {/* Price Display */}
                  <div className="flex items-center gap-4 text-sm mb-3">
                    {rule.price !== null ? (
                      <span className="font-semibold text-[#276073]">
                        السعر: {rule.price} ريال
                      </span>
                    ) : (
                      <>
                        <span className="text-gray-700">
                          أطفال: <span className="font-semibold text-blue-600">{rule.price_under_18} ريال</span>
                        </span>
                        <span className="text-gray-700">
                          بالغين: <span className="font-semibold text-green-600">{rule.price_18_and_above} ريال</span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Conditions Summary */}
                  {rule.conditions && rule.conditions.show_when && rule.conditions.show_when.length > 0 && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <span className="font-medium">الشروط:</span> {rule.conditions.show_when.length} شرط
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(rule.id, rule.is_active)}
                    className={`px-3 py-1 text-xs rounded ${
                      rule.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {rule.is_active ? 'نشط' : 'تفعيل'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-bold text-blue-900 mb-2">كيف يعمل نظام التسعير المشروط؟</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>يتم تطبيق القاعدة الأولى التي تحقق شروطها (حسب الأولوية)</li>
          <li>القواعد ذات الأولوية الأعلى تطبق قبل غيرها</li>
          <li>إذا لم تتحقق أي قاعدة، يستخدم السعر الافتراضي للخدمة</li>
          <li>يمكنك تعطيل القواعد دون حذفها</li>
        </ul>
      </div>
    </div>
  );
}
