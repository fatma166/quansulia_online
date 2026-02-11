import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, FileText, User, Phone, Mail, Calendar, DollarSign } from 'lucide-react';

export default function InvoiceModal({ application, pricingSummary, pricingItems, isOpen, onClose, onInvoiceCreated }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && application) {
      const formData = application.form_data || application.formData || {};
      setCustomerName(formData.fullName || formData.applicantName || 'غير محدد');
      setCustomerPhone(application.applicant_phone || formData.phone || '');
      setCustomerEmail(application.applicant_email || formData.email || '');
      setNotes('');
    }
  }, [isOpen, application]);

  const handleCreateInvoice = async () => {
    try {
      setLoading(true);
      setError('');

      if (!customerName.trim()) {
        throw new Error('اسم العميل مطلوب');
      }

      const { data: staffData } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user.id)
        .single();

      const staffId = staffData?.id;

      const { data: invoiceNumberData, error: numberError } = await supabase
        .rpc('generate_invoice_number');

      if (numberError) throw numberError;

      const invoiceNumber = invoiceNumberData || `INV-${new Date().getFullYear()}-${Date.now()}`;

      const trackingUrl = `${window.location.origin}/track/${application.reference_number || application.referenceNumber}`;
      const qrCodeData = trackingUrl;

      const invoiceData = {
        invoice_number: invoiceNumber,
        application_id: application.actualId || application.id,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || null,
        customer_email: customerEmail.trim() || null,
        subtotal: parseFloat(pricingSummary?.subtotal || 0),
        discount: parseFloat(pricingSummary?.discount || 0),
        tax: parseFloat(pricingSummary?.tax || 0),
        total_amount: parseFloat(pricingSummary?.total_amount || 0),
        payment_status: 'paid',
        notes: notes.trim() || null,
        qr_code_data: qrCodeData,
        created_by: staffId
      };

      const { data: invoice, error: insertError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      if (insertError) throw insertError;

      if (onInvoiceCreated) {
        onInvoiceCreated(invoice);
      }

      onClose();
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">إصدار فاتورة</h2>
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

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              سيتم إصدار فاتورة للطلب رقم: <span className="font-bold">{application?.reference_number || application?.referenceNumber}</span>
            </p>
            <p className="text-sm text-blue-600 mt-1">
              يمكنك مراجعة وتعديل بيانات العميل قبل إصدار الفاتورة
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                اسم العميل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="أدخل اسم العميل"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                رقم الهاتف
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="أدخل رقم الهاتف"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="أدخل البريد الإلكتروني"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات إضافية
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="أضف أي ملاحظات إضافية..."
              />
            </div>
          </div>

          {pricingSummary && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                <DollarSign className="w-4 h-4" />
                ملخص الفاتورة
              </h3>

              {pricingItems && pricingItems.length > 0 && (
                <div className="space-y-2 mb-3">
                  {pricingItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.description} ({item.quantity} × {parseFloat(item.unit_price).toFixed(2)} ريال)
                      </span>
                      <span className="font-medium">{parseFloat(item.total_price).toFixed(2)} ريال</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 pt-3 border-t border-gray-300">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">المجموع الفرعي:</span>
                  <span className="font-semibold">{parseFloat(pricingSummary.subtotal).toFixed(2)} ريال</span>
                </div>
                {parseFloat(pricingSummary.discount) > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>الخصم:</span>
                    <span>- {parseFloat(pricingSummary.discount).toFixed(2)} ريال</span>
                  </div>
                )}
                {parseFloat(pricingSummary.tax) > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>الضريبة:</span>
                    <span>+ {parseFloat(pricingSummary.tax).toFixed(2)} ريال</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-green-600 pt-2 border-t border-gray-300">
                  <span>المبلغ الإجمالي:</span>
                  <span>{parseFloat(pricingSummary.total_amount).toFixed(2)} ريال</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleCreateInvoice}
            disabled={loading || !customerName.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                جاري الإصدار...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                إصدار الفاتورة
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
