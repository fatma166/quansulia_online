import { useEffect, useState } from 'react';
import { X, Download, Printer, CheckCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '../lib/supabase';

export default function InvoicePDF({ invoice, onClose }) {
  const [pricingItems, setPricingItems] = useState([]);
  const [application, setApplication] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (invoice) {
      loadInvoiceDetails();
    }
  }, [invoice]);

  const loadInvoiceDetails = async () => {
    try {
      const { data: itemsData } = await supabase
        .from('application_pricing_items')
        .select('*')
        .eq('application_id', invoice.application_id)
        .order('order_index');

      if (itemsData) {
        setPricingItems(itemsData);
      }

      const { data: appData } = await supabase
        .from('applications')
        .select('*')
        .eq('id', invoice.application_id)
        .single();

      if (appData) {
        setApplication(appData);
      }
    } catch (error) {
      console.error('Error loading invoice details:', error);
    }
  };

  const generateQRCode = () => {
    try {
      const trackingUrl = application?.reference_number
        ? `${window.location.origin}/track/${application.reference_number}`
        : `${window.location.origin}/track?ref=${invoice.invoice_number}`;

      return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(trackingUrl)}`;
    } catch (error) {
      return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.origin}/track`;
    }
  };

  const handleDownloadPDF = async () => {
    const invoiceElement = document.getElementById('invoice-content');
    if (!invoiceElement) return;

    try {
      setDownloading(true);

      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      pdf.save(`invoice-${invoice.invoice_number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء تحميل الفاتورة');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 print:hidden">
          <h2 className="text-xl font-bold text-gray-900">فاتورة رقم {invoice.invoice_number}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري التحميل...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  تحميل PDF
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              طباعة
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(95vh-80px)]">
          <div id="invoice-content" className="bg-white" dir="rtl">
            <div className="border-2 border-gray-300 rounded-lg p-8">
              <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-200">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">فاتورة</h1>
                  <div className="text-gray-600 space-y-1">
                    <p className="text-sm">القنصلية العامة لجمهورية السودان</p>
                    <p className="text-sm">المملكة العربية السعودية - جدة</p>
                  </div>
                </div>
                <div className="text-left">
                  <img
                    src={generateQRCode()}
                    alt="QR Code"
                    className="w-32 h-32 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase">معلومات الفاتورة</h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-32">رقم الفاتورة:</span>
                      <span className="text-sm font-bold text-gray-900">{invoice.invoice_number}</span>
                    </div>
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-32">رقم الطلب:</span>
                      <span className="text-sm font-medium text-gray-900">{application?.reference_number}</span>
                    </div>
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-32">تاريخ الإصدار:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(invoice.issue_date).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-32">حالة الدفع:</span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        مدفوع
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase">معلومات العميل</h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="text-sm text-gray-600 w-24">الاسم:</span>
                      <span className="text-sm font-bold text-gray-900">{invoice.customer_name}</span>
                    </div>
                    {invoice.customer_phone && (
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">الهاتف:</span>
                        <span className="text-sm text-gray-900">{invoice.customer_phone}</span>
                      </div>
                    )}
                    {invoice.customer_email && (
                      <div className="flex">
                        <span className="text-sm text-gray-600 w-24">البريد:</span>
                        <span className="text-sm text-gray-900">{invoice.customer_email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase">تفاصيل الرسوم</h3>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">الوصف</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">الكمية</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">سعر الوحدة</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingItems.length > 0 ? (
                      pricingItems.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="py-3 px-4 text-sm text-gray-900">{item.description}</td>
                          <td className="py-3 px-4 text-sm text-center text-gray-700">{item.quantity}</td>
                          <td className="py-3 px-4 text-sm text-center text-gray-700">
                            {parseFloat(item.unit_price).toFixed(2)} ريال
                          </td>
                          <td className="py-3 px-4 text-sm text-left font-medium text-gray-900">
                            {parseFloat(item.total_price).toFixed(2)} ريال
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-3 px-4 text-sm text-gray-900">{application?.service_title || 'خدمة قنصلية'}</td>
                        <td className="py-3 px-4 text-sm text-center text-gray-700">1</td>
                        <td className="py-3 px-4 text-sm text-center text-gray-700">
                          {parseFloat(invoice.subtotal).toFixed(2)} ريال
                        </td>
                        <td className="py-3 px-4 text-sm text-left font-medium text-gray-900">
                          {parseFloat(invoice.subtotal).toFixed(2)} ريال
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-8">
                <div className="w-80">
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-sm text-gray-600">المجموع الفرعي:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {parseFloat(invoice.subtotal).toFixed(2)} ريال
                      </span>
                    </div>
                    {parseFloat(invoice.discount) > 0 && (
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-red-600">الخصم:</span>
                        <span className="text-sm font-medium text-red-600">
                          - {parseFloat(invoice.discount).toFixed(2)} ريال
                        </span>
                      </div>
                    )}
                    {parseFloat(invoice.tax) > 0 && (
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">الضريبة:</span>
                        <span className="text-sm font-medium text-gray-900">
                          + {parseFloat(invoice.tax).toFixed(2)} ريال
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 bg-green-50 px-4 rounded-lg border-2 border-green-200">
                      <span className="text-lg font-bold text-gray-900">المبلغ الإجمالي:</span>
                      <span className="text-lg font-bold text-green-600">
                        {parseFloat(invoice.total_amount).toFixed(2)} ريال
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {invoice.notes && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">ملاحظات:</h3>
                  <p className="text-sm text-gray-700">{invoice.notes}</p>
                </div>
              )}

              <div className="pt-6 border-t-2 border-gray-200">
                <div className="text-center text-xs text-gray-500 space-y-1">
                  <p>شكراً لتعاملكم معنا</p>
                  <p>القنصلية العامة لجمهورية السودان - المملكة العربية السعودية</p>
                  <p>هذه فاتورة إلكترونية معتمدة ولا تحتاج إلى ختم أو توقيع</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
