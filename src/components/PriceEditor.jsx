import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Plus, Trash2, Save, DollarSign } from 'lucide-react';

export default function PriceEditor({ application, onClose, onUpdate }) {
  const applicationId = application?.id;
  const [items, setItems] = useState([
    {
      id: null,
      type: 'adult',
      description: 'بالغ',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
  ]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (applicationId) {
      loadPricingData();
    }
  }, [applicationId]);

  const loadPricingData = async () => {
    try {
      setLoading(true);
      setError('');

      // Try to load existing pricing data
      const { data: itemsData } = await supabase
        .from('application_pricing_items')
        .select('*')
        .eq('application_id', applicationId)
        .order('order_index');

      if (itemsData && itemsData.length > 0) {
        setItems(itemsData.map(item => ({
          id: item.id,
          type: item.item_type,
          description: item.description,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price),
          total: parseFloat(item.total_price)
        })));
      }

      // Load discount and tax
      const { data: summary } = await supabase
        .from('application_pricing_summary')
        .select('discount, tax, notes')
        .eq('application_id', applicationId)
        .maybeSingle();

      if (summary) {
        setDiscount(parseFloat(summary.discount) || 0);
        setTax(parseFloat(summary.tax) || 0);
        setNotes(summary.notes || '');
      }
    } catch (err) {
      console.error('Error loading pricing data:', err);
      // Don't show error, just use default values
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

      const { data: userData } = await supabase.auth.getUser();
      const { data: staffData } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      const staffId = staffData?.id;
      const totalAmount = calculateTotal();

      // Update application total_amount
      const { error: appError } = await supabase
        .from('applications')
        .update({ total_amount: totalAmount })
        .eq('id', applicationId);

      if (appError) throw appError;

      // Delete existing items
      await supabase
        .from('application_pricing_items')
        .delete()
        .eq('application_id', applicationId);

      // Insert new items
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

      if (itemsToInsert.length > 0) {
        await supabase
          .from('application_pricing_items')
          .insert(itemsToInsert);
      }

      // Save or update summary
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
        total_amount: totalAmount,
        notes: notes,
        updated_by: staffId
      };

      if (existingSummary) {
        await supabase
          .from('application_pricing_summary')
          .update(summaryData)
          .eq('id', existingSummary.id);
      } else {
        summaryData.created_by = staffId;
        await supabase
          .from('application_pricing_summary')
          .insert([summaryData]);
      }

      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      console.error('Error saving pricing:', err);
      setError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            تعديل قيمة الدفع
            <DollarSign className="w-7 h-7 text-blue-600" />
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري التحميل...</p>
            </div>
          ) : (
            <>
              {/* Price Items Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">تفاصيل السعر</h3>
                  <button
                    onClick={addNewItem}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة بند
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="grid grid-cols-12 gap-3 items-center">
                        {/* Type Select */}
                        <div className="col-span-3">
                          <select
                            value={item.type}
                            onChange={(e) => updateItem(index, 'type', e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="adult">بالغ</option>
                            <option value="child">طفل</option>
                            <option value="additional_service">خدمة إضافية</option>
                            <option value="custom">مخصص</option>
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            placeholder="الكمية"
                            min="1"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-sm"
                          />
                        </div>

                        {/* Unit Price */}
                        <div className="col-span-3">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                            placeholder="السعر"
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        {/* Total */}
                        <div className="col-span-3">
                          <div className="px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-center font-semibold text-sm">
                            {item.total.toFixed(2)} ريال
                          </div>
                        </div>

                        {/* Delete Button */}
                        {items.length > 1 && (
                          <div className="col-span-1 flex justify-center">
                            <button
                              onClick={() => removeItem(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount and Tax */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الخصم (ريال)
                  </label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الضريبة (ريال)
                  </label>
                  <input
                    type="number"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ملاحظات
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="أضف أي ملاحظات إضافية..."
                />
              </div>

              {/* Total Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">المجموع الفرعي:</span>
                  <span className="text-lg font-bold text-gray-900">{calculateTotal().toFixed(2)} ريال</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 font-semibold"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
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
        </div>
      </div>
    </div>
  );
}
