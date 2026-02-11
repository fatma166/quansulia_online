import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Plus, Trash2, Save, DollarSign } from 'lucide-react';

export default function PriceEditor({ applicationId, isOpen, onClose, onSaved }) {
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditable, setIsEditable] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && applicationId) {
      loadPricingData();
    }
  }, [isOpen, applicationId]);

  const loadPricingData = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: summary, error: summaryError } = await supabase
        .from('application_pricing_summary')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle();

      if (summaryError) throw summaryError;

      if (summary) {
        setDiscount(parseFloat(summary.discount) || 0);
        setTax(parseFloat(summary.tax) || 0);
        setNotes(summary.notes || '');
        setIsEditable(summary.is_editable);
      }

      const { data: itemsData, error: itemsError } = await supabase
        .from('application_pricing_items')
        .select('*')
        .eq('application_id', applicationId)
        .order('order_index');

      if (itemsError) throw itemsError;

      if (itemsData && itemsData.length > 0) {
        setItems(itemsData.map(item => ({
          id: item.id,
          type: item.item_type,
          description: item.description,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price),
          total: parseFloat(item.total_price)
        })));
      } else {
        addNewItem();
      }
    } catch (err) {
      console.error('Error loading pricing data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addNewItem = () => {
    setItems([...items, {
      id: null,
      type: 'adult',
      description: 'بالغ',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const unitPrice = parseFloat(newItems[index].unitPrice) || 0;
      newItems[index].total = quantity * unitPrice;
    }

    if (field === 'type') {
      const typeLabels = {
        adult: 'بالغ',
        child: 'طفل',
        additional_service: 'خدمة إضافية',
        custom: 'مخصص'
      };
      newItems[index].description = typeLabels[value] || 'مخصص';
    }

    setItems(newItems);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = parseFloat(discount) || 0;
    const taxAmount = parseFloat(tax) || 0;
    return subtotal - discountAmount + taxAmount;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      if (!isEditable) {
        throw new Error('لا يمكن تعديل السعر بعد إتمام الدفع');
      }

      const { data: staffData } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user.id)
        .single();

      const staffId = staffData?.id;

      const { data: existingSummary } = await supabase
        .from('application_pricing_summary')
        .select('id')
        .eq('application_id', applicationId)
        .maybeSingle();

      const summaryData = {
        application_id: applicationId,
        subtotal: calculateSubtotal(),
        discount: parseFloat(discount) || 0,
        tax: parseFloat(tax) || 0,
        total_amount: calculateTotal(),
        notes: notes,
        is_editable: true,
        updated_by: staffId
      };

      if (existingSummary) {
        const { error: summaryError } = await supabase
          .from('application_pricing_summary')
          .update(summaryData)
          .eq('id', existingSummary.id);

        if (summaryError) throw summaryError;
      } else {
        summaryData.created_by = staffId;
        const { error: summaryError } = await supabase
          .from('application_pricing_summary')
          .insert([summaryData]);

        if (summaryError) throw summaryError;
      }

      const { error: deleteError } = await supabase
        .from('application_pricing_items')
        .delete()
        .eq('application_id', applicationId);

      if (deleteError) throw deleteError;

      const itemsToInsert = items.map((item, index) => ({
        application_id: applicationId,
        item_type: item.type,
        description: item.description,
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.unitPrice) || 0,
        total_price: parseFloat(item.total) || 0,
        order_index: index,
        created_by: staffId,
        updated_by: staffId
      }));

      const { error: itemsError } = await supabase
        .from('application_pricing_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Error saving pricing:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">تعديل قيمة الدفع</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {!isEditable && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
              تنبيه: لا يمكن تعديل السعر بعد إتمام الدفع
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري التحميل...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">تفاصيل السعر</h3>
                  {isEditable && (
                    <button
                      onClick={addNewItem}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة بند
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <select
                        value={item.type}
                        onChange={(e) => updateItem(index, 'type', e.target.value)}
                        disabled={!isEditable}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="adult">بالغ</option>
                        <option value="child">طفل</option>
                        <option value="additional_service">خدمة إضافية</option>
                        <option value="custom">مخصص</option>
                      </select>

                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        disabled={!isEditable}
                        placeholder="الوصف"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />

                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        disabled={!isEditable}
                        placeholder="الكمية"
                        min="1"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />

                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                        disabled={!isEditable}
                        placeholder="السعر"
                        min="0"
                        step="0.01"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />

                      <div className="w-32 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-center font-semibold">
                        {item.total.toFixed(2)} ريال
                      </div>

                      {isEditable && items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الخصم (ريال)
                    </label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      disabled={!isEditable}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الضريبة (ريال)
                    </label>
                    <input
                      type="number"
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                      disabled={!isEditable}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={!isEditable}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="أضف أي ملاحظات إضافية..."
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">المجموع الفرعي:</span>
                    <span className="font-semibold">{calculateSubtotal().toFixed(2)} ريال</span>
                  </div>
                  {parseFloat(discount) > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>الخصم:</span>
                      <span>- {parseFloat(discount).toFixed(2)} ريال</span>
                    </div>
                  )}
                  {parseFloat(tax) > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>الضريبة:</span>
                      <span>+ {parseFloat(tax).toFixed(2)} ريال</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t border-blue-200">
                    <span>المبلغ الإجمالي:</span>
                    <span>{calculateTotal().toFixed(2)} ريال</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
          {isEditable && (
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  حفظ التغييرات
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
