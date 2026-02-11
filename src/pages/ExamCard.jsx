import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Download,
  Printer as Print,
  Eye,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  MapPin,
  FileText,
  GraduationCap,
  QrCode,
  Shield
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ExamCard = () => {
  const { referenceNumber } = useParams();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState(referenceNumber || '');
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const cardRef = useRef(null);

  // Mock exam card data
  const mockCardData = {
    'EDU-202501-0001': {
      referenceNumber: 'EDU-202501-0001',
      examType: 'primary',
      examTypeAr: 'الشهادة الابتدائية',
      examTypeEn: 'Primary Certificate',
      studentData: {
        fullName: 'أحمد محمد علي حسن',
        fullNameEn: 'Ahmed Mohamed Ali Hassan',
        nationalId: '1234567890',
        dateOfBirth: '2010-05-15',
        gender: 'ذكر',
        genderEn: 'Male',
        photo: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      examDetails: {
        seatNumber: '4567',
        school: 'مدرسة النيل الابتدائية',
        schoolEn: 'Al-Nile Primary School',
        examLanguage: 'عربي',
        examLanguageEn: 'Arabic',
        centerName: 'مركز جدة الرئيسي',
        centerNameEn: 'Jeddah Main Center',
        centerNumber: 'C-001',
        buildingNumber: 'B-05',
        hallNumber: 'H-12',
        examCenter: 'جدة - قاعة 5',
        examCenterEn: 'Jeddah - Hall 5',
        examDate: '2025-05-20',
        examTime: '09:00 AM',
        session: 'الدورة الأولى 2025',
        sessionEn: 'First Session 2025'
      },
      issueDate: '2025-01-16',
      status: 'active'
    },
    'EDU-202501-0002': {
      referenceNumber: 'EDU-202501-0002',
      examType: 'intermediate',
      examTypeAr: 'الشهادة المتوسطة',
      examTypeEn: 'Intermediate Certificate',
      studentData: {
        fullName: 'سارة أحمد محمد علي',
        fullNameEn: 'Sara Ahmed Mohamed Ali',
        nationalId: '2234567891',
        dateOfBirth: '2008-03-20',
        gender: 'أنثى',
        genderEn: 'Female',
        photo: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      examDetails: {
        seatNumber: '3456',
        school: 'مدرسة الخرطوم المتوسطة',
        schoolEn: 'Khartoum Intermediate School',
        examLanguage: 'عربي',
        examLanguageEn: 'Arabic',
        centerName: 'مركز جدة الثاني',
        centerNameEn: 'Jeddah Second Center',
        centerNumber: 'C-002',
        buildingNumber: 'B-03',
        hallNumber: 'H-08',
        examCenter: 'جدة - قاعة 3',
        examCenterEn: 'Jeddah - Hall 3',
        examDate: '2025-06-15',
        examTime: '09:00 AM',
        session: 'الدورة الأولى 2025',
        sessionEn: 'First Session 2025'
      },
      issueDate: '2025-01-16',
      status: 'active'
    },
    'EDU-202501-0003': {
      referenceNumber: 'EDU-202501-0003',
      examType: 'secondary_science',
      examTypeAr: 'الشهادة الثانوية - القسم العلمي',
      examTypeEn: 'Secondary Certificate - Science Section',
      studentData: {
        fullName: 'محمد أحمد عبدالله حسن',
        fullNameEn: 'Mohamed Ahmed Abdullah Hassan',
        nationalId: '3234567892',
        dateOfBirth: '2006-08-10',
        gender: 'ذكر',
        genderEn: 'Male',
        photo: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      examDetails: {
        seatNumber: '2345',
        school: 'مدرسة الخرطوم الثانوية',
        schoolEn: 'Khartoum Secondary School',
        examLanguage: 'عربي',
        examLanguageEn: 'Arabic',
        centerName: 'مركز جدة الرئيسي',
        centerNameEn: 'Jeddah Main Center',
        centerNumber: 'C-001',
        buildingNumber: 'B-01',
        hallNumber: 'H-05',
        examCenter: 'جدة - قاعة 1',
        examCenterEn: 'Jeddah - Hall 1',
        examDate: '2025-07-10',
        examTime: '09:00 AM',
        session: 'الدورة الأولى 2025',
        sessionEn: 'First Session 2025',
        section: 'علمي',
        sectionEn: 'Science',
        electiveSubject: 'الأحياء',
        electiveSubjectEn: 'Biology'
      },
      issueDate: '2025-01-16',
      status: 'active'
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const data = mockCardData[searchQuery.trim()];
      setCardData(data || null);
      setShowCard(!!data);
      setLoading(false);
    }, 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;

    try {
      // Show loading state
      const originalText = document.querySelector('.download-btn-text')?.textContent;
      if (document.querySelector('.download-btn-text')) {
        document.querySelector('.download-btn-text').textContent = 'جاري التحميل...';
      }

      // Capture the card as an image with higher quality
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Calculate dimensions for PDF (A4 landscape)
      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = 210; // A4 landscape height in mm

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Download the PDF
      const fileName = `exam-card-${cardData.referenceNumber || 'unknown'}.pdf`;
      pdf.save(fileName);

      // Restore button text
      if (document.querySelector('.download-btn-text')) {
        document.querySelector('.download-btn-text').textContent = originalText || 'تحميل PDF';
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء تحميل البطاقة. الرجاء المحاولة مرة أخرى.');
    }
  };

  const generateQRCode = (data) => {
    // Mock QR code URL - in real app, use a QR code library
    const qrData = `${window.location.origin}/verify/${data.referenceNumber}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrData)}`;
  };

  useEffect(() => {
    if (referenceNumber) {
      handleSearch();
    }
  }, [referenceNumber]);

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      {/* Search Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              بطاقة الامتحان
            </h1>
            <p className="text-gray-600 mb-8">
              أدخل الرقم المرجعي لعرض وطباعة بطاقة الامتحان
            </p>
            
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="أدخل الرقم المرجعي (مثال: EDU-202501-0001)"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Search className="absolute top-3.5 right-4 w-5 h-5 text-gray-400" />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="bg-[#276073] hover:bg-[#1e4a5a] disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري البحث...' : 'عرض البطاقة'}
              </button>
            </div>

            {/* Test Reference Numbers */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-800 mb-3">أرقام مرجعية تجريبية:</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setSearchQuery('EDU-202501-0001')}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded"
                >
                  EDU-202501-0001 (ابتدائية)
                </button>
                <button
                  onClick={() => setSearchQuery('EDU-202501-0002')}
                  className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded"
                >
                  EDU-202501-0002 (متوسطة)
                </button>
                <button
                  onClick={() => setSearchQuery('EDU-202501-0003')}
                  className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded"
                >
                  EDU-202501-0003 (ثانوية علمي)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exam Card Display */}
      {showCard && cardData ? (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 rtl:space-x-reverse mb-8">
                <button
                  onClick={() => setShowCard(true)}
                  className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <Eye className="w-5 h-5" />
                  <span>معاينة</span>
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <Download className="w-5 h-5" />
                  <span className="download-btn-text">تحميل PDF</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <Print className="w-5 h-5" />
                  <span>طباعة</span>
                </button>
              </div>

              {/* Exam Card */}
              <motion.div
                ref={cardRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="exam-card bg-white rounded-lg shadow-2xl border-4 border-[#276073] overflow-hidden print-card"
                style={{
                  width: '210mm',
                  height: '148mm',
                  margin: '0 auto',
                  transform: 'scale(0.8)',
                  transformOrigin: 'center top'
                }}
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] text-white p-6 relative">
                  {/* Decorative Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 400 100" fill="none">
                      <defs>
                        <pattern id="card-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="10" cy="10" r="1" fill="currentColor"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#card-pattern)" />
                    </svg>
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    {/* Arabic Side */}
                    <div className="text-right">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">SD</span>
                        </div>
                        <div>
                          <h1 className="text-xl font-bold">القنصلية العامة</h1>
                          <p className="text-sm opacity-90">لجمهورية السودان بجدة</p>
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-center">
                        بطاقة امتحانات الشهادة
                      </h2>
                    </div>

                    {/* English Side */}
                    <div className="text-left">
                      <div className="flex items-center space-x-3 mb-2">
                        <div>
                          <h1 className="text-xl font-bold">Consulate General</h1>
                          <p className="text-sm opacity-90">Republic of Sudan - Jeddah</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-center">
                        Examination Admission Card
                      </h2>
                    </div>
                  </div>

                  {/* Reference Number */}
                  <div className="text-center mt-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-2 inline-block">
                      <span className="text-lg font-mono font-bold">
                        {cardData.referenceNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 grid grid-cols-3 gap-6 h-full">
                  {/* Student Photo */}
                  <div className="col-span-1 flex flex-col items-center">
                    <div className="w-32 h-40 border-2 border-gray-300 rounded-lg overflow-hidden mb-4 bg-gray-100">
                      {cardData.studentData.photo ? (
                        <img
                          src={cardData.studentData.photo}
                          alt="صورة الطالب"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* QR Code */}
                    <div className="text-center">
                      <img
                        src={generateQRCode(cardData)}
                        alt="QR Code"
                        className="w-16 h-16 mx-auto mb-2"
                      />
                      <p className="text-xs text-gray-500">رمز التحقق</p>
                    </div>
                  </div>

                  {/* Student Information */}
                  <div className="col-span-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {/* Arabic Column */}
                      <div className="space-y-3">
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">الاسم الكامل</p>
                          <p className="font-bold text-gray-900">{cardData.studentData.fullName}</p>
                        </div>
                        
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">الرقم الوطني</p>
                          <p className="font-bold text-gray-900 font-mono">{cardData.studentData.nationalId}</p>
                        </div>
                        
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">نوع الشهادة</p>
                          <p className="font-bold text-[#276073]">{cardData.examTypeAr}</p>
                        </div>
                        
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">رقم الجلوس</p>
                          <p className="font-bold text-gray-900 text-xl">{cardData.examDetails.seatNumber}</p>
                        </div>

                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">اسم المركز</p>
                          <p className="font-bold text-[#276073]">{cardData.examDetails.centerName}</p>
                        </div>

                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">رقم المركز</p>
                          <p className="font-bold text-gray-900 font-mono">{cardData.examDetails.centerNumber}</p>
                        </div>

                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">رقم المبنى</p>
                          <p className="font-bold text-gray-900 font-mono">{cardData.examDetails.buildingNumber}</p>
                        </div>

                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">رقم القاعة</p>
                          <p className="font-bold text-gray-900 font-mono">{cardData.examDetails.hallNumber}</p>
                        </div>
                        
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">لغة الامتحان</p>
                          <p className="font-bold text-gray-900">{cardData.examDetails.examLanguage}</p>
                        </div>
                        
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">اللجنة / المركز</p>
                          <p className="font-bold text-gray-900">{cardData.examDetails.examCenter}</p>
                        </div>
                        
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">تاريخ الامتحان</p>
                          <p className="font-bold text-gray-900">{cardData.examDetails.examDate}</p>
                        </div>

                        {cardData.examDetails.section && (
                          <div className="border-b border-gray-200 pb-2">
                            <p className="text-gray-600 text-xs">القسم</p>
                            <p className="font-bold text-gray-900">{cardData.examDetails.section}</p>
                          </div>
                        )}

                        {cardData.examDetails.electiveSubject && (
                          <div className="border-b border-gray-200 pb-2">
                            <p className="text-gray-600 text-xs">المادة الاختيارية</p>
                            <p className="font-bold text-gray-900">{cardData.examDetails.electiveSubject}</p>
                          </div>
                        )}
                      </div>

                      {/* English Column */}
                      <div className="space-y-3 text-left">
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">Full Name</p>
                          <p className="font-bold text-gray-900">{cardData.studentData.fullNameEn}</p>
                        </div>
                        
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">National No.</p>
                          <p className="font-bold text-gray-900 font-mono">{cardData.studentData.nationalId}</p>
                        </div>
                        
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">Exam Type</p>
                          <p className="font-bold text-[#276073]">{cardData.examTypeEn}</p>
                        </div>
                        
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">Seat Number</p>
                          <p className="font-bold text-gray-900 text-xl">{cardData.examDetails.seatNumber}</p>
                        </div>

                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">Center Name</p>
                          <p className="font-bold text-[#276073]">{cardData.examDetails.centerNameEn}</p>
                        </div>

                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">Center Number</p>
                          <p className="font-bold text-gray-900 font-mono">{cardData.examDetails.centerNumber}</p>
                        </div>

                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">Building No.</p>
                          <p className="font-bold text-gray-900 font-mono">{cardData.examDetails.buildingNumber}</p>
                        </div>

                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">Hall Number</p>
                          <p className="font-bold text-gray-900 font-mono">{cardData.examDetails.hallNumber}</p>
                        </div>
                        
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">Exam Language</p>
                          <p className="font-bold text-gray-900">{cardData.examDetails.examLanguageEn}</p>
                        </div>
                        
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">Exam Center</p>
                          <p className="font-bold text-gray-900">{cardData.examDetails.examCenterEn}</p>
                        </div>
                        
                        <div className="border-b border-gray-200 pb-2">
                          <p className="text-gray-600 text-xs">Exam Date</p>
                          <p className="font-bold text-gray-900">{cardData.examDetails.examDate}</p>
                        </div>

                        {cardData.examDetails.sectionEn && (
                          <div className="border-b border-gray-200 pb-2">
                            <p className="text-gray-600 text-xs">Section</p>
                            <p className="font-bold text-gray-900">{cardData.examDetails.sectionEn}</p>
                          </div>
                        )}

                        {cardData.examDetails.electiveSubjectEn && (
                          <div className="border-b border-gray-200 pb-2">
                            <p className="text-gray-600 text-xs">Elective Subject</p>
                            <p className="font-bold text-gray-900">{cardData.examDetails.electiveSubjectEn}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="bg-gray-50 p-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {/* Arabic Instructions */}
                    <div className="text-right">
                      <h4 className="font-bold text-gray-900 mb-2">تعليمات مهمة:</h4>
                      <ul className="text-gray-700 space-y-1">
                        <li>• يرجى إبراز هذه البطاقة مع الهوية يوم الامتحان</li>
                        <li>• الحضور قبل 30 دقيقة من بداية الامتحان</li>
                        <li>• إحضار أدوات الكتابة المطلوبة</li>
                        <li>• عدم إحضار الهاتف المحمول</li>
                      </ul>
                    </div>

                    {/* English Instructions */}
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900 mb-2">Important Instructions:</h4>
                      <ul className="text-gray-700 space-y-1">
                        <li>• Present this card with your ID on exam day</li>
                        <li>• Arrive 30 minutes before exam time</li>
                        <li>• Bring required writing materials</li>
                        <li>• Mobile phones are not allowed</li>
                      </ul>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="mt-4 pt-4 border-t border-gray-300 flex justify-between items-center">
                    <div className="text-xs text-gray-600">
                      تاريخ الإصدار: {cardData.issueDate}
                    </div>
                    <div className="text-xs text-gray-600">
                      Issue Date: {cardData.issueDate}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Additional Information */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center space-x-2 rtl:space-x-reverse">
                  <CheckCircle className="w-5 h-5" />
                  <span>معلومات إضافية</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                  <div>
                    <h4 className="font-semibold mb-2">معلومات الامتحان:</h4>
                    <ul className="space-y-1">
                      <li>• الدورة: {cardData.examDetails.session}</li>
                      <li>• وقت البداية: {cardData.examDetails.examTime}</li>
                      <li>• مدة الامتحان: 3 ساعات</li>
                      <li>• نوع الأسئلة: اختيار من متعدد ومقالي</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">للاستفسارات:</h4>
                    <ul className="space-y-1">
                      <li>• الهاتف: +966 12 123 4567</li>
                      <li>• البريد: education@consulate.gov.sd</li>
                      <li>• الموقع: www.consulate.gov.sd</li>
                      <li>• ساعات العمل: 8:00 ص - 2:00 م</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : searchQuery && !loading && !cardData ? (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                لم يتم العثور على البطاقة
              </h3>
              <p className="text-gray-600 mb-4">
                الرقم المرجعي "{searchQuery}" غير موجود في النظام
              </p>
              <p className="text-sm text-gray-500">
                تأكد من صحة الرقم المرجعي أو تواصل مع القنصلية
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <Footer />
    </div>
  );
};

export default ExamCard;