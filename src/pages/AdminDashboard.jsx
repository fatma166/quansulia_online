import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Users, FileText, Calendar, TrendingUp, Eye, CreditCard as Edit, Trash2, CheckCircle, Clock, AlertCircle, Search, Filter, Download, RefreshCw, Settings, Bell, Plus, UserPlus, FileCheck, CreditCard, Truck, Package, MapPin, Phone, Mail, Building, Award, Star, ChevronRight, ChevronDown, ChevronLeft, ChevronRight as ChevronRightIcon, X, Upload, Camera, MessageSquare, MessageCircle, User, Play, LayoutGrid as Layout, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRegionsList, getCitiesByRegion, getDistrictsByCity } from '../data/saudiRegions';
import AdminLayout from '../components/AdminLayout';
import StaffManagement from './StaffManagement';
import ContentManagement from './ContentManagement';
import ChatManagement from './ChatManagement';
import ChatStaffManagement from './ChatStaffManagement';

const AdminDashboard = () => {
  const { user, isSuperAdmin, hasPermission, canAccessStatus, canAccessRegion } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [serviceSubcategory, setServiceSubcategory] = useState('all');
  const [serviceSubtype, setServiceSubtype] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventParticipants, setEventParticipants] = useState({});
  const [showParticipants, setShowParticipants] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModalTab, setActiveModalTab] = useState('details');
  const [newActivity, setNewActivity] = useState({ type: '', message: '' });
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  // Mock applications data
  const mockApplications = [
    {
      id: 'SUD-2025-1197',
      serviceType: 'passports',
      serviceName: 'جواز سفر جديد',
      status: 'approved',
      submissionDate: '2025-01-10',
      lastUpdate: '2025-01-15',
      applicantData: {
        fullName: 'أحمد محمد علي حسن',
        nationalId: '1234567890',
        phone: '+966501234567',
        email: 'ahmed@example.com',
        region: 'makkah',
        city: 'جدة',
        district: 'الروضة'
      },
      fees: {
        base: 300,
        currency: 'ريال سعودي'
      },
      priority: 'normal',
      assignedTo: 'staff1',
      formData: {
        fullName: 'أحمد محمد علي حسن',
        nationalId: '1234567890',
        phoneNumber: '+966501234567',
        email: 'ahmed@example.com',
        dob: '1990-05-15',
        isAdult: 'yes',
        region: 'makkah',
        city: 'جدة',
        district: 'الروضة',
        profession: 'مهندس',
        workplace: 'شركة الاتصالات السعودية',
        address: 'شارع الأمير سلطان، مجمع الأعمال',
        passportType: 'new'
      },
      attachments: [
        { name: 'nationalIdCopy.pdf', size: '2.3 MB', type: 'application/pdf', uploadDate: '2025-01-10' },
        { name: 'photo.jpg', size: '1.8 MB', type: 'image/jpeg', uploadDate: '2025-01-10' }
      ],
      activities: [
        {
          id: 1,
          type: 'status_change',
          title: 'تغيير الحالة',
          description: 'تم تغيير حالة الطلب من "قيد المراجعة" إلى "تمت الموافقة"',
          user: 'أحمد محمد علي - موظف جوازات',
          timestamp: '2025-01-15 10:30:00',
          icon: 'CheckCircle',
          color: 'text-green-600'
        },
        {
          id: 2,
          type: 'document_review',
          title: 'مراجعة المستندات',
          description: 'تم مراجعة جميع المستندات المرفقة والتأكد من صحتها',
          user: 'أحمد محمد علي - موظف جوازات',
          timestamp: '2025-01-12 14:15:00',
          icon: 'FileCheck',
          color: 'text-blue-600'
        },
        {
          id: 3,
          type: 'sms_sent',
          title: 'إرسال رسالة SMS',
          description: 'تم إرسال رسالة تأكيد الموافقة مع رابط الدفع إلى رقم +966501234567',
          user: 'النظام الآلي',
          timestamp: '2025-01-15 10:35:00',
          icon: 'MessageSquare',
          color: 'text-purple-600'
        },
        {
          id: 4,
          type: 'note_added',
          title: 'إضافة ملاحظة',
          description: 'ملاحظة: المتقدم مقيم في جدة، يمكن التواصل معه مباشرة',
          user: 'أحمد محمد علي - موظف جوازات',
          timestamp: '2025-01-12 09:20:00',
          icon: 'FileText',
          color: 'text-gray-600'
        }
      ]
    },
    {
      id: 'SUD-2025-1198',
      serviceType: 'attestations',
      serviceName: 'تصديق شهادة جامعية',
      status: 'in_progress',
      submissionDate: '2025-01-08',
      lastUpdate: '2025-01-16',
      applicantData: {
        fullName: 'محمد أحمد عبدالله',
        nationalId: '1122334455',
        phone: '+966509876543',
        email: 'mohammed@example.com',
        region: 'eastern',
        city: 'الدمام',
        district: 'الفيصلية'
      },
      fees: {
        base: 150,
        currency: 'ريال سعودي'
      },
      priority: 'high',
      assignedTo: 'staff2',
      formData: {
        fullName: 'محمد أحمد عبدالله',
        nationalId: '1122334455',
        phoneNumber: '+966509876543',
        email: 'mohammed@example.com',
        dob: '1992-08-12',
        isAdult: 'yes',
        region: 'eastern',
        city: 'الدمام',
        district: 'الفيصلية',
        profession: 'مهندس كمبيوتر',
        workplace: 'شركة أرامكو السعودية',
        address: 'حي الفيصلية، شارع الملك فهد',
        docType: 'educational',
        docTitle: 'شهادة بكالوريوس هندسة كمبيوتر',
        issuingAuthority: 'جامعة الملك فهد للبترول والمعادن'
      },
      attachments: [
        { name: 'university_certificate.pdf', size: '3.1 MB', type: 'application/pdf', uploadDate: '2025-01-08' },
        { name: 'transcript.pdf', size: '1.5 MB', type: 'application/pdf', uploadDate: '2025-01-08' },
        { name: 'nationalId.jpg', size: '2.0 MB', type: 'image/jpeg', uploadDate: '2025-01-08' }
      ],
      activities: [
        {
          id: 1,
          type: 'status_change',
          title: 'بدء المعالجة',
          description: 'تم بدء معالجة الطلب وإرساله للجهات المختصة للتصديق',
          user: 'فاطمة عبدالله - موظف تصديقات',
          timestamp: '2025-01-16 11:00:00',
          icon: 'Play',
          color: 'text-orange-600'
        },
        {
          id: 2,
          type: 'payment_received',
          title: 'استلام الدفع',
          description: 'تم استلام دفعة بقيمة 150 ريال سعودي بنجاح',
          user: 'النظام الآلي',
          timestamp: '2025-01-09 16:45:00',
          icon: 'CreditCard',
          color: 'text-green-600'
        }
      ]
    },
    {
      id: 'SUD-2025-1199',
      serviceType: 'powerOfAttorney',
      serviceName: 'توكيل عام',
      status: 'pending',
      submissionDate: '2025-01-15',
      lastUpdate: '2025-01-16',
      applicantData: {
        fullName: 'عبدالرحمن صالح محمد',
        nationalId: '5566778899',
        phone: '+966505678901',
        email: 'abdulrahman@example.com',
        region: 'riyadh',
        city: 'الرياض',
        district: 'العليا'
      },
      fees: {
        base: 200,
        currency: 'ريال سعودي'
      },
      priority: 'normal',
      assignedTo: null,
      formData: {
        fullName: 'عبدالرحمن صالح محمد',
        nationalId: '5566778899',
        phoneNumber: '+966505678901',
        email: 'abdulrahman@example.com',
        dob: '1985-03-10',
        isAdult: 'yes',
        region: 'riyadh',
        city: 'الرياض',
        district: 'العليا',
        profession: 'رجل أعمال',
        workplace: 'شركة التجارة والاستثمار',
        address: 'حي العليا، طريق الملك فهد',
        poaType: 'general',
        principalName: 'عبدالرحمن صالح محمد',
        principalId: '5566778899',
        agentName: 'محمد أحمد علي',
        agentId: '1234567890',
        poaScope: 'توكيل عام في جميع الأمور المالية والإدارية'
      },
      attachments: [
        { name: 'principal_id.pdf', size: '1.9 MB', type: 'application/pdf', uploadDate: '2025-01-15' },
        { name: 'agent_id.pdf', size: '2.1 MB', type: 'application/pdf', uploadDate: '2025-01-15' }
      ],
      activities: [
        {
          id: 1,
          type: 'application_received',
          title: 'استلام الطلب',
          description: 'تم استلام طلب التوكيل العام وهو قيد المراجعة الأولية',
          user: 'النظام الآلي',
          timestamp: '2025-01-15 09:15:00',
          icon: 'FileText',
          color: 'text-blue-600'
        }
      ]
    },
    {
      id: 'SUD-2025-1200',
      serviceType: 'civilRegistry',
      serviceName: 'قيد ميلاد',
      status: 'completed',
      submissionDate: '2025-01-05',
      lastUpdate: '2025-01-12',
      applicantData: {
        fullName: 'سارة أحمد محمد علي',
        nationalId: '2233445566',
        phone: '+966502345678',
        email: 'sara@example.com',
        region: 'qassim',
        city: 'بريدة',
        district: 'الوسط'
      },
      fees: {
        base: 120,
        currency: 'ريال سعودي'
      },
      priority: 'low',
      assignedTo: 'staff1',
      formData: {
        fullName: 'سارة أحمد محمد علي',
        nationalId: '2233445566',
        phoneNumber: '+966502345678',
        email: 'sara@example.com',
        dob: '1995-07-22',
        isAdult: 'yes',
        region: 'qassim',
        city: 'بريدة',
        district: 'الوسط',
        profession: 'معلمة',
        workplace: 'وزارة التعليم',
        address: 'حي الوسط، شارع الملك عبدالعزيز',
        recordType: 'birth',
        relationToApplicant: 'self'
      },
      attachments: [
        { name: 'birth_certificate_original.pdf', size: '2.7 MB', type: 'application/pdf', uploadDate: '2025-01-05' },
        { name: 'national_id.jpg', size: '1.6 MB', type: 'image/jpeg', uploadDate: '2025-01-05' }
      ],
      activities: [
        {
          id: 1,
          type: 'application_completed',
          title: 'اكتمال المعاملة',
          description: 'تم إنجاز المعاملة بنجاح وإرسال المستند للمتقدم',
          user: 'أحمد محمد علي - موظف جوازات',
          timestamp: '2025-01-12 13:30:00',
          icon: 'CheckCircle',
          color: 'text-green-600'
        },
        {
          id: 2,
          type: 'document_ready',
          title: 'جاهزية المستند',
          description: 'تم إعداد قيد الميلاد وهو جاهز للاستلام',
          user: 'أحمد محمد علي - موظف جوازات',
          timestamp: '2025-01-10 15:20:00',
          icon: 'Package',
          color: 'text-blue-600'
        }
      ]
    },
    {
      id: 'SUD-2025-1201',
      serviceType: 'endorsements',
      serviceName: 'إفادة حسن سير وسلوك',
      status: 'paid',
      submissionDate: '2025-01-14',
      lastUpdate: '2025-01-16',
      applicantData: {
        fullName: 'نورا عبدالله أحمد',
        nationalId: '4455667788',
        phone: '+966504567890',
        email: 'nora@example.com',
        region: 'medina',
        city: 'المدينة المنورة',
        district: 'الحرم'
      },
      fees: {
        base: 80,
        currency: 'ريال سعودي'
      },
      priority: 'normal',
      assignedTo: 'staff2',
      formData: {
        fullName: 'نورا عبدالله أحمد',
        nationalId: '4455667788',
        phoneNumber: '+966504567890',
        email: 'nora@example.com',
        dob: '1993-09-25',
        isAdult: 'yes',
        region: 'medina',
        city: 'المدينة المنورة',
        district: 'الحرم',
        profession: 'مهندسة معمارية',
        workplace: 'مكتب الهندسة المعمارية',
        address: 'حي الحرم، قرب المسجد النبوي',
        endorseType: 'conduct',
        purpose: 'للحصول على وظيفة حكومية'
      },
      attachments: [
        { name: 'conduct_request.pdf', size: '1.2 MB', type: 'application/pdf', uploadDate: '2025-01-14' },
        { name: 'employment_letter.pdf', size: '0.8 MB', type: 'application/pdf', uploadDate: '2025-01-14' }
      ],
      activities: [
        {
          id: 1,
          type: 'payment_received',
          title: 'استلام الدفع',
          description: 'تم استلام دفعة بقيمة 80 ريال سعودي',
          user: 'النظام الآلي',
          timestamp: '2025-01-16 08:30:00',
          icon: 'CreditCard',
          color: 'text-green-600'
        },
        {
          id: 2,
          type: 'status_change',
          title: 'الموافقة على الطلب',
          description: 'تم مراجعة الطلب والموافقة عليه',
          user: 'فاطمة عبدالله - موظف تصديقات',
          timestamp: '2025-01-15 14:20:00',
          icon: 'CheckCircle',
          color: 'text-green-600'
        }
      ]
    },
    {
      id: 'EDU-2025-0001',
      referenceNumber: 'EDU-2025-0001',
      serviceType: 'education',
      serviceCategory: 'التعليم - الشهادة الابتدائية',
      serviceName: 'تسجيل امتحان الشهادة الابتدائية',
      status: 'approved',
      submissionDate: '2025-01-12',
      lastUpdate: '2025-01-16',
      applicantData: {
        fullName: 'أحمد محمد علي حسن',
        nationalId: '2345678901',
        phone: '+966502345678',
        email: 'ahmed.student@example.com',
        region: 'makkah',
        city: 'جدة',
        district: 'الحمراء'
      },
      fees: {
        base: 100,
        currency: 'ريال سعودي'
      },
      priority: 'normal',
      assignedTo: 'staff1',
      formData: {
        fullName: 'أحمد محمد علي حسن',
        fullNameEn: 'Ahmed Mohamed Ali Hassan',
        nationalId: '2345678901',
        phoneNumber: '+966502345678',
        email: 'ahmed.student@example.com',
        dob: '2010-05-15',
        dateOfBirth: '2010-05-15',
        isAdult: 'no',
        gender: 'male',
        region: 'makkah',
        city: 'جدة',
        district: 'الحمراء',
        address: 'حي الحمراء، شارع فلسطين',
        school: 'مدرسة النيل الابتدائية',
        examLanguage: 'عربي',
        examCenter: 'مركز جدة الرئيسي',
        examDate: '2025-05-20',
        seatNumber: '4567',
        photo: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      attachments: [
        { name: 'student_photo.jpg', size: '1.2 MB', type: 'image/jpeg', uploadDate: '2025-01-12' },
        { name: 'birth_certificate.pdf', size: '0.9 MB', type: 'application/pdf', uploadDate: '2025-01-12' },
        { name: 'parent_id.pdf', size: '1.5 MB', type: 'application/pdf', uploadDate: '2025-01-12' }
      ],
      activities: [
        {
          id: 1,
          type: 'status_change',
          title: 'تمت الموافقة',
          description: 'تم مراجعة الطلب والموافقة على تسجيل الطالب في الامتحان',
          user: 'سارة أحمد - موظف شؤون التعليم',
          timestamp: '2025-01-16 10:00:00',
          icon: 'CheckCircle',
          color: 'text-green-600'
        },
        {
          id: 2,
          type: 'exam_card_generated',
          title: 'إصدار بطاقة الامتحان',
          description: 'تم إصدار بطاقة الامتحان برقم الجلوس 4567',
          user: 'النظام الآلي',
          timestamp: '2025-01-16 10:05:00',
          icon: 'FileCheck',
          color: 'text-blue-600'
        },
        {
          id: 3,
          type: 'payment_received',
          title: 'استلام الدفع',
          description: 'تم استلام رسوم التسجيل 100 ريال سعودي',
          user: 'النظام الآلي',
          timestamp: '2025-01-13 14:30:00',
          icon: 'CreditCard',
          color: 'text-green-600'
        }
      ]
    },
    {
      id: 'EDU-2025-0002',
      referenceNumber: 'EDU-2025-0002',
      serviceType: 'education',
      serviceCategory: 'التعليم - الشهادة المتوسطة',
      serviceName: 'تسجيل امتحان الشهادة المتوسطة',
      status: 'completed',
      submissionDate: '2025-01-10',
      lastUpdate: '2025-01-16',
      applicantData: {
        fullName: 'سارة أحمد محمد علي',
        nationalId: '3456789012',
        phone: '+966503456789',
        email: 'sara.student@example.com',
        region: 'makkah',
        city: 'جدة',
        district: 'البلد'
      },
      fees: {
        base: 120,
        currency: 'ريال سعودي'
      },
      priority: 'normal',
      assignedTo: 'staff2',
      formData: {
        fullName: 'سارة أحمد محمد علي',
        fullNameEn: 'Sara Ahmed Mohamed Ali',
        nationalId: '3456789012',
        phoneNumber: '+966503456789',
        email: 'sara.student@example.com',
        dob: '2008-03-20',
        dateOfBirth: '2008-03-20',
        isAdult: 'no',
        gender: 'female',
        region: 'makkah',
        city: 'جدة',
        district: 'البلد',
        address: 'حي البلد، شارع قابل',
        school: 'مدرسة الخرطوم المتوسطة',
        examLanguage: 'عربي',
        examCenter: 'مركز جدة الثاني',
        examDate: '2025-06-15',
        seatNumber: '3456',
        photo: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      attachments: [
        { name: 'student_photo.jpg', size: '1.1 MB', type: 'image/jpeg', uploadDate: '2025-01-10' },
        { name: 'primary_certificate.pdf', size: '1.8 MB', type: 'application/pdf', uploadDate: '2025-01-10' },
        { name: 'parent_id.pdf', size: '1.4 MB', type: 'application/pdf', uploadDate: '2025-01-10' }
      ],
      activities: [
        {
          id: 1,
          type: 'status_change',
          title: 'اكتمال الإجراءات',
          description: 'تم إكمال جميع إجراءات التسجيل وإصدار البطاقة',
          user: 'سارة أحمد - موظف شؤون التعليم',
          timestamp: '2025-01-16 11:30:00',
          icon: 'CheckCircle',
          color: 'text-green-600'
        },
        {
          id: 2,
          type: 'exam_card_generated',
          title: 'إصدار بطاقة الامتحان',
          description: 'تم إصدار بطاقة الامتحان برقم الجلوس 3456',
          user: 'النظام الآلي',
          timestamp: '2025-01-15 09:20:00',
          icon: 'FileCheck',
          color: 'text-blue-600'
        },
        {
          id: 3,
          type: 'sms_sent',
          title: 'إرسال رسالة SMS',
          description: 'تم إرسال رسالة تأكيد مع رابط بطاقة الامتحان',
          user: 'النظام الآلي',
          timestamp: '2025-01-15 09:25:00',
          icon: 'MessageSquare',
          color: 'text-purple-600'
        }
      ]
    },
    {
      id: 'EDU-2025-0003',
      referenceNumber: 'EDU-2025-0003',
      serviceType: 'education',
      serviceCategory: 'التعليم - الشهادة الثانوية',
      serviceName: 'تسجيل امتحان الشهادة الثانوية - القسم العلمي',
      status: 'ready_for_pickup',
      submissionDate: '2025-01-08',
      lastUpdate: '2025-01-16',
      applicantData: {
        fullName: 'محمد أحمد عبدالله حسن',
        nationalId: '4567890123',
        phone: '+966504567890',
        email: 'mohamed.student@example.com',
        region: 'makkah',
        city: 'جدة',
        district: 'الروضة'
      },
      fees: {
        base: 150,
        currency: 'ريال سعودي'
      },
      priority: 'high',
      assignedTo: 'staff1',
      formData: {
        fullName: 'محمد أحمد عبدالله حسن',
        fullNameEn: 'Mohamed Ahmed Abdullah Hassan',
        nationalId: '4567890123',
        phoneNumber: '+966504567890',
        email: 'mohamed.student@example.com',
        dob: '2006-08-10',
        dateOfBirth: '2006-08-10',
        isAdult: 'yes',
        gender: 'male',
        region: 'makkah',
        city: 'جدة',
        district: 'الروضة',
        address: 'حي الروضة، شارع التحلية',
        school: 'مدرسة الخرطوم الثانوية',
        examLanguage: 'عربي',
        examCenter: 'مركز جدة الرئيسي',
        examDate: '2025-07-10',
        seatNumber: '2345',
        section: 'علمي',
        electiveSubject: 'الأحياء',
        photo: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      attachments: [
        { name: 'student_photo.jpg', size: '1.3 MB', type: 'image/jpeg', uploadDate: '2025-01-08' },
        { name: 'intermediate_certificate.pdf', size: '2.1 MB', type: 'application/pdf', uploadDate: '2025-01-08' },
        { name: 'national_id.pdf', size: '1.6 MB', type: 'application/pdf', uploadDate: '2025-01-08' }
      ],
      activities: [
        {
          id: 1,
          type: 'status_change',
          title: 'البطاقة جاهزة',
          description: 'بطاقة الامتحان جاهزة للاستلام من القنصلية',
          user: 'سارة أحمد - موظف شؤون التعليم',
          timestamp: '2025-01-16 12:00:00',
          icon: 'Package',
          color: 'text-blue-600'
        },
        {
          id: 2,
          type: 'exam_card_generated',
          title: 'إصدار بطاقة الامتحان',
          description: 'تم إصدار بطاقة الامتحان برقم الجلوس 2345 - القسم العلمي',
          user: 'النظام الآلي',
          timestamp: '2025-01-14 10:15:00',
          icon: 'FileCheck',
          color: 'text-blue-600'
        },
        {
          id: 3,
          type: 'payment_received',
          title: 'استلام الدفع',
          description: 'تم استلام رسوم التسجيل 150 ريال سعودي',
          user: 'النظام الآلي',
          timestamp: '2025-01-09 15:45:00',
          icon: 'CreditCard',
          color: 'text-green-600'
        }
      ]
    },
    {
      id: 'EDU-2025-0004',
      referenceNumber: 'EDU-2025-0004',
      serviceType: 'education',
      serviceCategory: 'التعليم - الشهادة الابتدائية',
      serviceName: 'تسجيل امتحان الشهادة الابتدائية',
      status: 'in_progress',
      submissionDate: '2025-01-15',
      lastUpdate: '2025-01-16',
      applicantData: {
        fullName: 'فاطمة محمد أحمد',
        nationalId: '5678901234',
        phone: '+966505678901',
        email: 'fatima.student@example.com',
        region: 'makkah',
        city: 'مكة المكرمة',
        district: 'العزيزية'
      },
      fees: {
        base: 100,
        currency: 'ريال سعودي'
      },
      priority: 'normal',
      assignedTo: 'staff2',
      formData: {
        fullName: 'فاطمة محمد أحمد',
        fullNameEn: 'Fatima Mohamed Ahmed',
        nationalId: '5678901234',
        phoneNumber: '+966505678901',
        email: 'fatima.student@example.com',
        dob: '2011-02-18',
        dateOfBirth: '2011-02-18',
        isAdult: 'no',
        gender: 'female',
        region: 'makkah',
        city: 'مكة المكرمة',
        district: 'العزيزية',
        address: 'حي العزيزية، شارع الحج',
        school: 'مدرسة النيل الابتدائية - مكة',
        examLanguage: 'عربي',
        examCenter: 'مركز مكة المكرمة',
        examDate: '2025-05-20',
        photo: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150'
      },
      attachments: [
        { name: 'student_photo.jpg', size: '1.0 MB', type: 'image/jpeg', uploadDate: '2025-01-15' },
        { name: 'birth_certificate.pdf', size: '0.8 MB', type: 'application/pdf', uploadDate: '2025-01-15' },
        { name: 'parent_id.pdf', size: '1.3 MB', type: 'application/pdf', uploadDate: '2025-01-15' }
      ],
      activities: [
        {
          id: 1,
          type: 'status_change',
          title: 'قيد المعالجة',
          description: 'جاري مراجعة المستندات والتحقق من البيانات',
          user: 'سارة أحمد - موظف شؤون التعليم',
          timestamp: '2025-01-16 09:15:00',
          icon: 'Clock',
          color: 'text-orange-600'
        },
        {
          id: 2,
          type: 'payment_received',
          title: 'استلام الدفع',
          description: 'تم استلام رسوم التسجيل 100 ريال سعودي',
          user: 'النظام الآلي',
          timestamp: '2025-01-16 08:00:00',
          icon: 'CreditCard',
          color: 'text-green-600'
        }
      ]
    }
  ];

  // Statistics
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    completedApplications: 0,
    totalRevenue: 0,
    todayApplications: 0,
    averageProcessingTime: 0,
    customerSatisfaction: 0
  });

  // Available statuses
  const availableStatuses = [
    { id: 'all', label: 'جميع الحالات', color: 'bg-gray-100 text-gray-800' },
    { id: 'pending', label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'review', label: 'قيد المراجعة', color: 'bg-blue-100 text-blue-800' },
    { id: 'approved', label: 'تمت الموافقة', color: 'bg-green-100 text-green-800' },
    { id: 'paid', label: 'تم الدفع', color: 'bg-purple-100 text-purple-800' },
    { id: 'appointment_booking', label: 'حجز الموعد', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'appointment_booked', label: 'تم حجز الموعد', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'appointment_scheduled', label: 'تم حجز موعد', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'in_progress', label: 'قيد المعالجة', color: 'bg-orange-100 text-orange-800' },
    { id: 'shipping', label: 'في الشحن', color: 'bg-cyan-100 text-cyan-800' },
    { id: 'completed', label: 'مكتمل', color: 'bg-green-100 text-green-800' },
    { id: 'rejected', label: 'مرفوض', color: 'bg-red-100 text-red-800' }
  ];

  // Available services
  // Main service categories
  const mainServices = [
    { id: 'all', label: 'جميع الخدمات' },
    { id: 'passports', label: 'جوازات السفر', hasSubcategories: false },
    { id: 'attestations', label: 'التصديقات', hasSubcategories: false },
    { id: 'powerOfAttorney', label: 'التوكيلات', hasSubcategories: true },
    { id: 'civilRegistry', label: 'السجل المدني', hasSubcategories: false },
    { id: 'endorsements', label: 'الإفادات', hasSubcategories: false },
    { id: 'familyAffairs', label: 'الشؤون الأسرية', hasSubcategories: false },
    { id: 'visas', label: 'التأشيرات', hasSubcategories: false },
    { id: 'declarations', label: 'الإقرارات', hasSubcategories: true },
    { id: 'education', label: 'الخدمات التعليمية', hasSubcategories: false }
  ];

  // Subcategories for services that have them
  const serviceSubcategories = {
    powerOfAttorney: [
      { id: 'all', label: 'جميع أنواع التوكيلات' },
      { id: 'general', label: 'توكيل عام', hasSubtypes: true },
      { id: 'courts', label: 'محاكم وقضايا ودعاوي', hasSubtypes: true },
      { id: 'inheritance', label: 'الورثة', hasSubtypes: true },
      { id: 'real_estate', label: 'عقارات وأراضي', hasSubtypes: true },
      { id: 'vehicles', label: 'سيارات', hasSubtypes: true },
      { id: 'companies', label: 'الشركات', hasSubtypes: true },
      { id: 'marriage_divorce', label: 'إجراءات الزواج والطلاق', hasSubtypes: true },
      { id: 'birth_certificates', label: 'شهادات ميلاد', hasSubtypes: true },
      { id: 'educational', label: 'شهادة دراسية', hasSubtypes: true }
    ],
    declarations: [
      { id: 'all', label: 'جميع أنواع الإقرارات' },
      { id: 'regular', label: 'إقرارات عادية', hasSubtypes: true },
      { id: 'sworn', label: 'إقرارات موثقة', hasSubtypes: true }
    ]
  };

  // Subtypes for POA subcategories
  const poaSubtypes = {
    general: [
      { id: 'all', label: 'جميع الأنواع' },
      { id: 'new_id_card', label: 'استخراج بطاقة جديدة' },
      { id: 'replacement_sim', label: 'استخرج شريحة بدل فاقد' },
      { id: 'transfer_error_form', label: 'استمارة تحويل مبلغ بالخطاء' },
      { id: 'account_management', label: 'ادارة حساب' },
      { id: 'saudi_insurance_form', label: 'استمارة التامين السعودي' },
      { id: 'general_procedure_form', label: 'استمارة عامة لإجراء محدد' },
      { id: 'foreign_embassy_memo', label: 'استمارة مذكرة لسفارة أجنبية' },
      { id: 'document_authentication', label: 'اسناد مستندات واثبات صحة' },
      { id: 'other_general', label: 'اخري' }
    ],
    courts: [
      { id: 'all', label: 'جميع الأنواع' },
      { id: 'land_litigation', label: 'تقاضي بشأن قطعة ارض' },
      { id: 'property_litigation', label: 'تقاضي بشأن عقار' },
      { id: 'file_lawsuit', label: 'إقامة دعوى' },
      { id: 'other_courts', label: 'اخري' }
    ],
    inheritance: [
      { id: 'all', label: 'جميع الأنواع' },
      { id: 'inheritance_inventory_form', label: 'استمارة حصر ورثة' },
      { id: 'inheritance_waiver', label: 'تنازل عن نصيب في ورثة' },
      { id: 'inheritance_receipt', label: 'استلام ورثة' },
      { id: 'other_inheritance', label: 'اخرى' }
    ],
    real_estate: [
      { id: 'all', label: 'جميع الأنواع' },
      { id: 'buy_land_property', label: 'شراء ارض أو عقار' },
      { id: 'land_sale', label: 'بيع قطعة أرض' },
      { id: 'property_sale', label: 'بيع عقار' },
      { id: 'other_real_estate', label: 'اخري' }
    ],
    vehicles: [
      { id: 'all', label: 'جميع الأنواع' },
      { id: 'vehicle_sale', label: 'بيع سيارة' },
      { id: 'vehicle_receipt', label: 'استلام سيارة' },
      { id: 'vehicle_licensing', label: 'ترخيص سيارة' },
      { id: 'other_vehicles', label: 'اخري' }
    ],
    companies: [
      { id: 'all', label: 'جميع الأنواع' },
      { id: 'company_registration_form', label: 'استمارة تسجيل شركة' },
      { id: 'business_name_form', label: 'استمارة تأسيس اسم عمل' },
      { id: 'other_companies', label: 'اخرى' }
    ],
    marriage_divorce: [
      { id: 'all', label: 'جميع الأنواع' },
      { id: 'marriage_contract', label: 'عقد زواج' },
      { id: 'divorce_procedures', label: 'إجراءات طلاق' },
      { id: 'other_marriage', label: 'اخرى' }
    ],
    birth_certificates: [
      { id: 'all', label: 'جميع الأنواع' },
      { id: 'birth_certificate_issuance', label: 'استخراج شهادات ميلاد' }
    ],
    educational: [
      { id: 'all', label: 'جميع الأنواع' },
      { id: 'educational_certificate_issuance', label: 'إستخراج شهادة دراسية' },
      { id: 'university_egypt', label: 'دراسة جامعية بمصر' },
      { id: 'other_educational', label: 'اخرى' }
    ]
  };

  // Subtypes for declaration subcategories (مختصرة للطول)
  const declarationSubtypes = {
    regular: [
      { id: 'all', label: 'جميع الأنواع' },
      { id: 'family_travel_consent', label: 'موافقة بالسفر لأفراد أسرة' },
      { id: 'wife_travel_consent', label: 'موافقة سفر الزوجة' },
      { id: 'marriage_no_objection', label: 'استمارة عدم ممانعة وشهادة كفاءة زواج' },
      { id: 'other_regular', label: 'اخرى' }
    ],
    sworn: [
      { id: 'all', label: 'جميع الأنواع' },
      { id: 'general_sworn', label: 'إقرار مشفوع باليمين' },
      { id: 'age_of_majority', label: 'بلوغ سن الرشد' },
      { id: 'paternity_proof', label: 'إقرار إثبات نسب' },
      { id: 'other_sworn', label: 'اخرى' }
    ]
  };

  // Load applications data
  useEffect(() => {
    loadApplications();
    loadNews();
    loadEvents();
  }, []);

  // Update activeTab when URL changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const loadApplications = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setApplications(mockApplications);
      calculateStats(mockApplications);
      setIsLoading(false);
    }, 1000);
  };

  const loadNews = () => {
    // Load from localStorage or use default data
    const savedNews = JSON.parse(localStorage.getItem('newsData') || '[]');
    if (savedNews.length === 0) {
      // Import default news data
      import('../data/news.json').then(module => {
        setNews(module.default);
        localStorage.setItem('newsData', JSON.stringify(module.default));
      });
    } else {
      setNews(savedNews);
    }
  };

  const loadEvents = () => {
    // Load from localStorage or use default data
    const savedEvents = JSON.parse(localStorage.getItem('eventsData') || '[]');
    if (savedEvents.length === 0) {
      // Import default events data
      import('../data/events.json').then(module => {
        setEvents(module.default);
        localStorage.setItem('eventsData', JSON.stringify(module.default));
      });
    } else {
      setEvents(savedEvents);
    }
    
    // Load participants data
    const savedParticipants = JSON.parse(localStorage.getItem('eventParticipants') || '{}');
    setEventParticipants(savedParticipants);
  };

  // Filter applications based on user permissions and filters
  useEffect(() => {
    let filtered = applications;

    // Apply user permission filters
    if (!isSuperAdmin) {
      // Filter by allowed statuses
      if (user?.allowedStatuses && user.allowedStatuses.length > 0) {
        filtered = filtered.filter(app => 
          user.allowedStatuses.includes(app.status)
        );
      }

      // Filter by allowed regions
      if (user?.allowedRegions && user.allowedRegions.length > 0) {
        filtered = filtered.filter(app => 
          app.applicantData && 
          app.applicantData.region && 
          user.allowedRegions.includes(app.applicantData.region)
        );
      }

      // Filter by allowed services
      if (user?.allowedServices && user.allowedServices.length > 0) {
        filtered = filtered.filter(app => 
          user.allowedServices.includes(app.serviceType)
        );
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.id.toLowerCase().includes(query) ||
        (app.applicantData?.fullName && app.applicantData.fullName.toLowerCase().includes(query)) ||
        app.serviceName.toLowerCase().includes(query) ||
        (app.applicantData?.nationalId && app.applicantData.nationalId.includes(query)) ||
        (app.applicantData?.phone && app.applicantData.phone.includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Apply region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(app =>
        app.applicantData &&
        app.applicantData.region === regionFilter
      );
    }

    // Apply city filter
    if (cityFilter !== 'all') {
      filtered = filtered.filter(app =>
        app.applicantData &&
        app.applicantData.city === cityFilter
      );
    }

    // Apply district filter
    if (districtFilter !== 'all') {
      filtered = filtered.filter(app =>
        app.applicantData &&
        app.applicantData.district === districtFilter
      );
    }

    // Apply service filter (main service)
    if (serviceFilter !== 'all') {
      filtered = filtered.filter(app => app.serviceType === serviceFilter);
    }

    // Apply subcategory filter
    if (serviceSubcategory !== 'all') {
      filtered = filtered.filter(app => app.serviceSubcategory === serviceSubcategory);
    }

    // Apply subtype filter
    if (serviceSubtype !== 'all') {
      filtered = filtered.filter(app => app.serviceSubtype === serviceSubtype);
    }

    setFilteredApplications(filtered);
  }, [applications, searchQuery, statusFilter, regionFilter, cityFilter, districtFilter, serviceFilter, serviceSubcategory, serviceSubtype, user, isSuperAdmin]);

  const calculateStats = (apps) => {
    const total = apps.length;
    const pending = apps.filter(app => app.status === 'pending').length;
    const approved = apps.filter(app => app.status === 'approved').length;
    const completed = apps.filter(app => app.status === 'completed').length;
    const revenue = apps.reduce((sum, app) => sum + (app.fees?.base || 0), 0);
    const today = new Date().toISOString().split('T')[0];
    const todayApps = apps.filter(app => app.submissionDate === today).length;

    setStats({
      totalApplications: total,
      pendingApplications: pending,
      approvedApplications: approved,
      completedApplications: completed,
      totalRevenue: revenue,
      todayApplications: todayApps,
      averageProcessingTime: 3.5,
      customerSatisfaction: 4.8
    });
  };

  const getStatusColor = (status) => {
    const statusObj = availableStatuses.find(s => s.id === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const statusObj = availableStatuses.find(s => s.id === status);
    return statusObj ? statusObj.label : status;
  };

  const getRegionLabel = (regionId) => {
    const region = getRegionsList().find(r => r.value === regionId);
    return region ? region.label : regionId;
  };

  const getServiceLabel = (serviceId) => {
    const service = mainServices.find(s => s.id === serviceId);
    return service ? service.label : serviceId;
  };

  // Handle service filter change
  const handleServiceChange = (newService) => {
    setServiceFilter(newService);
    setServiceSubcategory('all');
    setServiceSubtype('all');
  };

  // Handle subcategory change
  const handleSubcategoryChange = (newSubcategory) => {
    setServiceSubcategory(newSubcategory);
    setServiceSubtype('all');
  };

  // Get available subcategories for current service
  const getAvailableSubcategories = () => {
    if (serviceFilter === 'all') return [];
    return serviceSubcategories[serviceFilter] || [];
  };

  // Get available subtypes for current subcategory
  const getAvailableSubtypes = () => {
    if (serviceSubcategory === 'all') return [];
    if (serviceFilter === 'powerOfAttorney') {
      return poaSubtypes[serviceSubcategory] || [];
    } else if (serviceFilter === 'declarations') {
      return declarationSubtypes[serviceSubcategory] || [];
    }
    return [];
  };

  // Check if current service has subcategories
  const currentServiceHasSubcategories = () => {
    const service = mainServices.find(s => s.id === serviceFilter);
    return service && service.hasSubcategories && serviceFilter !== 'all';
  };

  // Check if current subcategory has subtypes
  const currentSubcategoryHasSubtypes = () => {
    const subcategories = getAvailableSubcategories();
    const subcategory = subcategories.find(s => s.id === serviceSubcategory);
    return subcategory && subcategory.hasSubtypes && serviceSubcategory !== 'all';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'normal': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Handle region change
  const handleRegionChange = (newRegion) => {
    setRegionFilter(newRegion);
    setCityFilter('all');
    setDistrictFilter('all');
  };

  // Handle city change
  const handleCityChange = (newCity) => {
    setCityFilter(newCity);
    setDistrictFilter('all');
  };

  // Get available cities for current region
  const getAvailableCities = () => {
    if (regionFilter === 'all') return [];
    return getCitiesByRegion(regionFilter);
  };

  // Get available districts for current city
  const getAvailableDistricts = () => {
    if (cityFilter === 'all' || regionFilter === 'all') return [];
    return getDistrictsByCity(regionFilter, cityFilter);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplications = filteredApplications.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, regionFilter, cityFilter, districtFilter, serviceFilter, serviceSubcategory, serviceSubtype]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  // Export to CSV (Excel compatible)
  const exportToExcel = () => {
    const headers = ['رقم المعاملة', 'المتقدم', 'الخدمة', 'المنطقة', 'الحالة', 'تاريخ التقديم', 'آخر تحديث', 'الرسوم'];
    const rows = filteredApplications.map(app => [
      app.id,
      app.applicantData?.fullName || '-',
      app.serviceName || '-',
      getRegionLabel(app.applicantData?.region) || '-',
      getStatusLabel(app.status),
      app.submissionDate,
      app.lastUpdate,
      `${app.fees?.base || 0} ${app.fees?.currency || ''}`
    ]);

    let csvContent = '\uFEFF'; // UTF-8 BOM for Arabic support
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `applications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  // Export to PDF
  const exportToPDF = () => {
    const printWindow = window.open('', '', 'height=600,width=800');

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير الطلبات</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            direction: rtl;
            padding: 20px;
          }
          h1 {
            text-align: center;
            color: #276073;
            margin-bottom: 20px;
          }
          .info {
            margin-bottom: 20px;
            padding: 10px;
            background: #f0f0f0;
            border-radius: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: right;
          }
          th {
            background-color: #276073;
            color: white;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <h1>تقرير الطلبات</h1>
        <div class="info">
          <p><strong>تاريخ التقرير:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
          <p><strong>عدد الطلبات:</strong> ${filteredApplications.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>رقم المعاملة</th>
              <th>المتقدم</th>
              <th>الخدمة</th>
              <th>المنطقة</th>
              <th>الحالة</th>
              <th>تاريخ التقديم</th>
              <th>الرسوم</th>
            </tr>
          </thead>
          <tbody>
            ${filteredApplications.map(app => `
              <tr>
                <td>${app.id}</td>
                <td>${app.applicantData?.fullName || '-'}</td>
                <td>${app.serviceName || '-'}</td>
                <td>${getRegionLabel(app.applicantData?.region) || '-'}</td>
                <td>${getStatusLabel(app.status)}</td>
                <td>${app.submissionDate}</td>
                <td>${app.fees?.base || 0} ${app.fees?.currency || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    setShowExportMenu(false);
  };

  const handleStatusChange = (applicationId, newStatus) => {
    if (!canAccessStatus(newStatus)) {
      alert('ليس لديك صلاحية لتغيير الحالة إلى: ' + getStatusLabel(newStatus));
      return;
    }

    const updatedApplications = applications.map(app => 
      app.id === applicationId 
        ? { ...app, status: newStatus, lastUpdate: new Date().toISOString().split('T')[0] }
        : app
    );
    setApplications(updatedApplications);
    calculateStats(updatedApplications);
  };

  const addActivity = () => {
    if (!newActivity.type || !newActivity.message.trim()) return;
    
    const activity = {
      id: Date.now(),
      type: newActivity.type,
      title: getActivityTitle(newActivity.type),
      description: newActivity.message,
      user: `${user?.fullName} - ${user?.department}`,
      timestamp: new Date().toLocaleString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      icon: getActivityIcon(newActivity.type),
      color: getActivityColor(newActivity.type)
    };

    // Update the selected application
    const updatedApplication = {
      ...selectedApplication,
      activities: [activity, ...(selectedApplication.activities || [])]
    };
    setSelectedApplication(updatedApplication);

    // Update applications list
    const updatedApplications = applications.map(app => 
      app.id === selectedApplication.id ? updatedApplication : app
    );
    setApplications(updatedApplications);

    // Reset form
    setNewActivity({ type: '', message: '' });
    setIsAddingActivity(false);
  };

  const getActivityTitle = (type) => {
    const titles = {
      'status_change': 'تغيير الحالة',
      'document_review': 'مراجعة المستندات',
      'sms_sent': 'إرسال رسالة',
      'email_sent': 'إرسال بريد إلكتروني',
      'phone_call': 'مكالمة هاتفية',
      'note_added': 'إضافة ملاحظة',
      'document_requested': 'طلب مستندات إضافية',
      'appointment_scheduled': 'جدولة موعد',
      'payment_received': 'استلام دفع',
      'application_completed': 'اكتمال المعاملة'
    };
    return titles[type] || 'نشاط';
  };

  const getActivityIcon = (type) => {
    const icons = {
      'status_change': 'RefreshCw',
      'document_review': 'FileCheck',
      'sms_sent': 'MessageSquare',
      'email_sent': 'Mail',
      'phone_call': 'Phone',
      'note_added': 'FileText',
      'document_requested': 'Upload',
      'appointment_scheduled': 'Calendar',
      'payment_received': 'CreditCard',
      'application_completed': 'CheckCircle'
    };
    return icons[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colors = {
      'status_change': 'text-blue-600',
      'document_review': 'text-purple-600',
      'sms_sent': 'text-green-600',
      'email_sent': 'text-blue-600',
      'phone_call': 'text-orange-600',
      'note_added': 'text-gray-600',
      'document_requested': 'text-yellow-600',
      'appointment_scheduled': 'text-indigo-600',
      'payment_received': 'text-green-600',
      'application_completed': 'text-green-600'
    };
    return colors[type] || 'text-gray-600';
  };

  const renderActivityIcon = (iconName, color) => {
    const iconMap = {
      CheckCircle, Clock, RefreshCw, FileCheck, MessageSquare, Mail, Phone, 
      FileText, Upload, Calendar, CreditCard, Package, Play
    };
    const IconComponent = iconMap[iconName] || FileText;
    return <IconComponent className={`w-5 h-5 ${color}`} />;
  };

  const handleViewApplication = (application) => {
    navigate(`/admin/applications/${application.id}`);
  };

  const handleDeleteApplication = (appId) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        // Remove from applications list
        setApplications(prev => prev.filter(app => app.id !== appId));
        
        // Also remove from localStorage if it exists there
        const savedApps = JSON.parse(localStorage.getItem('mockApplications') || '[]');
        const updatedApps = savedApps.filter(app => app.id !== appId);
        localStorage.setItem('mockApplications', JSON.stringify(updatedApps));
        
        // Remove from transaction tracking data
        const savedTransactions = JSON.parse(localStorage.getItem('mockTransactionData') || '{}');
        const appToDelete = applications.find(app => app.id === appId);
        if (appToDelete?.referenceNumber && savedTransactions[appToDelete.referenceNumber]) {
          delete savedTransactions[appToDelete.referenceNumber];
          localStorage.setItem('mockTransactionData', JSON.stringify(savedTransactions));
        }
        
        // Close modal if the deleted app was being viewed
        if (selectedApplication?.id === appId) {
          setSelectedApplication(null);
          setShowApplicationModal(false);
        }
        
        // Add activity log for deletion
        const deletionActivity = {
          id: Date.now(),
          type: 'deleted',
          title: 'تم حذف الطلب',
          description: `تم حذف الطلب نهائياً من النظام`,
          user: user.fullName,
          timestamp: new Date().toISOString(),
          icon: 'trash',
          color: 'text-red-600'
        };
        
        // Save deletion log (optional - for audit trail)
        const deletionLogs = JSON.parse(localStorage.getItem('deletionLogs') || '[]');
        deletionLogs.push({
          ...deletionActivity,
          applicationId: appId,
          applicationData: appToDelete
        });
        localStorage.setItem('deletionLogs', JSON.stringify(deletionLogs));
        
        alert('تم حذف الطلب بنجاح');
      } catch (error) {
        console.error('Error deleting application:', error);
        alert('حدث خطأ أثناء حذف الطلب. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  const handleDeleteNews = (newsId) => {
    if (confirm('هل أنت متأكد من حذف هذا الخبر؟')) {
      const updatedNews = news.filter(n => n.id !== newsId);
      setNews(updatedNews);
      localStorage.setItem('newsData', JSON.stringify(updatedNews));
      setSelectedNews(null);
    }
  };

  const handleDeleteEvent = (eventId) => {
    if (confirm('هل أنت متأكد من حذف هذه الفعالية؟')) {
      const updatedEvents = events.filter(e => e.id !== eventId);
      setEvents(updatedEvents);
      localStorage.setItem('eventsData', JSON.stringify(updatedEvents));
      setSelectedEvent(null);
    }
  };

  const handleEditNews = (newsItem) => {
    setEditingNews(newsItem);
    setShowNewsForm(true);
  };

  const handleEditEvent = (eventItem) => {
    setEditingEvent(eventItem);
    setShowEventForm(true);
  };

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    
    // Simulate image upload - في التطبيق الحقيقي سيتم رفع الصورة للخادم
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate a mock URL for the uploaded image
        const mockImageUrl = `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo-${Math.floor(Math.random() * 1000000)}.jpeg?auto=compress&cs=tinysrgb&w=800`;
        setUploadingImage(false);
        resolve(mockImageUrl);
      }, 2000);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('حجم الملف كبير جداً. الحد الأقصى 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صحيح');
        return;
      }
      
      try {
        const imageUrl = await handleImageUpload(file);
        setEventFormData(prev => ({ ...prev, image: imageUrl }));
      } catch (error) {
        alert('حدث خطأ في رفع الصورة');
      }
    }
  };

  const getEventParticipants = (eventId) => {
    return eventParticipants[eventId] || [];
  };

  const handleViewParticipants = (event) => {
    setShowParticipants(event);
  };

  const exportParticipants = (eventId) => {
    const participants = getEventParticipants(eventId);
    const csvContent = [
      ['الاسم', 'الهاتف', 'البريد الإلكتروني', 'عدد المرافقين', 'تاريخ التسجيل', 'الملاحظات'],
      ...participants.map(p => [
        p.name,
        p.phone,
        p.email,
        p.companions,
        p.registrationDate,
        p.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `participants_${eventId}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const tabs = [
    {
      id: 'overview',
      label: 'نظرة عامة',
      icon: BarChart3,
      permission: null
    },
    {
      id: 'applications',
      label: 'الطلبات',
      icon: FileText,
      permission: 'applications_view'
    },
    {
      id: 'services',
      label: 'إدارة الخدمات',
      icon: Settings,
      permission: 'content_manage',
      superAdminOnly: true,
      isExternal: true,
      externalPath: '/admin/services'
    },
    {
      id: 'news',
      label: 'إدارة الأخبار',
      icon: FileText,
      permission: 'content_manage'
    },
    {
      id: 'events',
      label: 'إدارة الفعاليات',
      icon: Calendar,
      permission: 'content_manage'
    },
    {
      id: 'content',
      label: 'إدارة المحتوى',
      icon: Layout,
      permission: 'content_manage',
      superAdminOnly: true
    },
    {
      id: 'staff',
      label: 'إدارة الموظفين',
      icon: Users,
      permission: 'staff_manage',
      superAdminOnly: true
    },
    {
      id: 'chat',
      label: 'إدارة المحادثات',
      icon: MessageCircle,
      permission: 'content_manage',
      superAdminOnly: false
    },
    {
      id: 'chat-staff',
      label: 'موظفي الدعم',
      icon: UserPlus,
      permission: 'staff_manage',
      superAdminOnly: true
    },
    {
      id: 'appointments',
      label: 'تقويم الحجوزات',
      icon: Calendar,
      permission: 'applications_view',
      superAdminOnly: false,
      isExternal: true,
      externalPath: '/admin/appointments'
    },
    {
      id: 'reports',
      label: 'التقارير',
      icon: TrendingUp,
      permission: 'reports_view'
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: Settings,
      permission: 'settings_manage'
    }
  ];

  // Filter tabs based on permissions
  const availableTabs = tabs.filter(tab => {
    if (tab.superAdminOnly && !isSuperAdmin) return false;
    if (tab.permission && !hasPermission(tab.permission)) return false;
    return true;
  });

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] text-white rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-2">
          مرحباً، {user?.fullName}
        </h2>
        <p className="text-white/90">
          {user?.department && `قسم ${user.department} • `}
          {user?.role === 'super_admin' ? 'مدير عام' : 'موظف'}
        </p>
        <div className="mt-4 text-sm text-white/80">
          آخر دخول: {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ar-SA') : 'أول مرة'}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+12% من الشهر الماضي</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">قيد الانتظار</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-yellow-600">يحتاج مراجعة</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">مكتملة</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedApplications}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">معدل إنجاز 95%</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الإيرادات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString('ar-SA')}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-purple-600">ريال سعودي</span>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">آخر الطلبات</h3>
            <button
              onClick={() => setActiveTab('applications')}
              className="text-[#276073] hover:text-[#1e4a5a] font-medium transition-colors duration-200 flex items-center space-x-1 rtl:space-x-reverse"
            >
              <span>عرض الكل</span>
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {filteredApplications.slice(0, 5).map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-[#276073] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {app.applicantData?.fullName ? app.applicantData.fullName.charAt(0) : '؟'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {app.applicantData?.fullName || 'غير محدد'}
                    </p>
                    <p className="text-sm text-gray-600">{app.serviceName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                    {getStatusLabel(app.status)}
                  </span>
                  <button
                    onClick={() => handleViewApplication(app)}
                    className="text-[#276073] hover:text-[#1e4a5a] transition-colors duration-200"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute top-3 right-4 rtl:right-auto rtl:left-4 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث في الطلبات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 rtl:pl-4 rtl:pr-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
          >
            {availableStatuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.label}
              </option>
            ))}
          </select>

          {/* Region Filter */}
          <select
            value={regionFilter}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
          >
            <option value="all">جميع المناطق</option>
            {getRegionsList().map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>

          {/* City Filter - Only show if region selected */}
          {regionFilter !== 'all' && (
            <select
              value={cityFilter}
              onChange={(e) => handleCityChange(e.target.value)}
              className="px-4 py-3 border border-blue-300 bg-blue-50 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
            >
              <option value="all">جميع المدن</option>
              {getAvailableCities().map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
          )}

          {/* District Filter - Only show if city selected */}
          {cityFilter !== 'all' && regionFilter !== 'all' && (
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-4 py-3 border border-cyan-300 bg-cyan-50 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
            >
              <option value="all">جميع الأحياء</option>
              {getAvailableDistricts().map((district) => (
                <option key={district.value} value={district.value}>
                  {district.label}
                </option>
              ))}
            </select>
          )}

          {/* Service Filter - Main Service */}
          <select
            value={serviceFilter}
            onChange={(e) => handleServiceChange(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
          >
            {mainServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.label}
              </option>
            ))}
          </select>

          {/* Service Subcategory Filter - Only show if service has subcategories */}
          {currentServiceHasSubcategories() && (
            <select
              value={serviceSubcategory}
              onChange={(e) => handleSubcategoryChange(e.target.value)}
              className="px-4 py-3 border border-emerald-300 bg-emerald-50 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
            >
              {getAvailableSubcategories().map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.label}
                </option>
              ))}
            </select>
          )}

          {/* Service Subtype Filter - Only show if subcategory has subtypes */}
          {currentSubcategoryHasSubtypes() && (
            <select
              value={serviceSubtype}
              onChange={(e) => setServiceSubtype(e.target.value)}
              className="px-4 py-3 border border-teal-300 bg-teal-50 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
            >
              {getAvailableSubtypes().map((subtype) => (
                <option key={subtype.id} value={subtype.id}>
                  {subtype.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Export and Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            {/* Export Button */}
            <div className="relative export-menu-container">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-[#276073] text-white rounded-lg hover:bg-[#1e4a5a] transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>تصدير النتائج</span>
              </button>

              {showExportMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px]">
                  <button
                    onClick={exportToExcel}
                    className="w-full px-4 py-3 text-right hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-green-600" />
                    <span>تصدير إلى Excel</span>
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="w-full px-4 py-3 text-right hover:bg-gray-50 transition-colors flex items-center gap-2 border-t border-gray-100"
                  >
                    <FileText className="w-4 h-4 text-red-600" />
                    <span>تصدير إلى PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              عرض {startIndex + 1} - {Math.min(endIndex, filteredApplications.length)} من {filteredApplications.length} طلب
            </div>
          </div>

          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">عدد الصفوف:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-right rtl:text-right text-sm font-semibold text-gray-900">
                  رقم المعاملة
                </th>
                <th className="px-6 py-4 text-right rtl:text-right text-sm font-semibold text-gray-900">
                  المتقدم
                </th>
                <th className="px-6 py-4 text-right rtl:text-right text-sm font-semibold text-gray-900">
                  الخدمة
                </th>
                <th className="px-6 py-4 text-right rtl:text-right text-sm font-semibold text-gray-900">
                  المنطقة
                </th>
                <th className="px-6 py-4 text-right rtl:text-right text-sm font-semibold text-gray-900">
                  الحالة
                </th>
                <th className="px-6 py-4 text-right rtl:text-right text-sm font-semibold text-gray-900">
                  التاريخ
                </th>
                <th className="px-6 py-4 text-right rtl:text-right text-sm font-semibold text-gray-900">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#276073]" />
                      <span className="text-gray-600">جاري تحميل البيانات...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">لا توجد طلبات</p>
                      <p className="text-sm">لا توجد طلبات تطابق معايير البحث</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-[#276073]">
                        {app.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {app.applicantData?.fullName || 'غير محدد'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {app.applicantData?.nationalId || 'غير محدد'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{app.serviceName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {app.applicantData?.region ? getRegionLabel(app.applicantData.region) : 'غير محدد'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{app.submissionDate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewApplication(app)}
                        className="text-[#276073] hover:text-[#1e4a5a] transition-colors duration-200"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredApplications.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                الصفحة {currentPage} من {totalPages}
              </div>

              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-[#276073] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm text-gray-600">
                الانتقال إلى:
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page);
                    }
                  }}
                  className="w-16 mx-2 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          التقارير والإحصائيات
        </h3>
        <p className="text-gray-600 mb-6">
          ستتوفر التقارير التفصيلية قريباً
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800">تقرير يومي</h4>
            <p className="text-sm text-blue-600">الطلبات اليومية</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800">تقرير شهري</h4>
            <p className="text-sm text-green-600">الإحصائيات الشهرية</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800">تقرير سنوي</h4>
            <p className="text-sm text-purple-600">الإنجازات السنوية</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          إعدادات النظام
        </h3>
        <p className="text-gray-600 mb-6">
          ستتوفر إعدادات النظام قريباً
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800">إعدادات عامة</h4>
            <p className="text-sm text-gray-600">إعدادات النظام الأساسية</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800">إعدادات الأمان</h4>
            <p className="text-sm text-gray-600">كلمات المرور والصلاحيات</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="bg-gray-50" dir="rtl">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {activeTab === 'overview' && 'نظرة عامة'}
                  {activeTab === 'applications' && 'إدارة الطلبات'}
                  {activeTab === 'services' && 'إدارة الخدمات'}
                  {activeTab === 'news' && 'إدارة الأخبار'}
                  {activeTab === 'events' && 'إدارة الفعاليات'}
                  {activeTab === 'content' && 'إدارة المحتوى'}
                  {activeTab === 'staff' && 'إدارة الموظفين'}
                  {activeTab === 'chat' && 'إدارة المحادثات'}
                  {activeTab === 'chat-staff' && 'موظفي الدعم'}
                  {activeTab === 'appointments' && 'تقويم الحجوزات'}
                </h1>
                <p className="text-gray-600 mt-1">
                  إدارة ومتابعة العمليات اليومية
                </p>
              </div>
            </div>

            {/* Content based on active tab */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'applications' && renderApplications()}

                {/* News Management */}
                {activeTab === 'news' && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">إدارة الأخبار</h2>
                        <p className="text-gray-600 mt-1">إضافة وتعديل ومعاينة الأخبار</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingNews(null);
                          setShowNewsForm(true);
                        }}
                        className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
                      >
                        <Plus className="w-5 h-5" />
                        <span>إضافة خبر جديد</span>
                      </button>
                    </div>

                    {/* News Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {news.map((newsItem) => (
                        <div key={newsItem.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                          <div className="relative h-48">
                            <img
                              src={newsItem.image}
                              alt={newsItem.title.ar}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 right-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                                newsItem.category === 'official' ? 'bg-red-500' : 'bg-green-500'
                              }`}>
                                {newsItem.category === 'official' ? 'بيان رسمي' : 'خبر جديد'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                              {newsItem.title.ar}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                              {newsItem.excerpt.ar}
                            </p>
                            <div className="text-xs text-gray-500 mb-4">
                              {new Date(newsItem.date).toLocaleDateString('ar-SA')}
                            </div>
                            
                            <div className="flex space-x-2 rtl:space-x-reverse">
                              <button
                                onClick={() => setSelectedNews(newsItem)}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1 rtl:space-x-reverse"
                              >
                                <Eye className="w-4 h-4" />
                                <span>معاينة</span>
                              </button>
                              <button
                                onClick={() => handleEditNews(newsItem)}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1 rtl:space-x-reverse"
                              >
                                <Edit className="w-4 h-4" />
                                <span>تعديل</span>
                              </button>
                              <button
                                onClick={() => handleDeleteNews(newsItem.id)}
                                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Events Management */}
                {activeTab === 'events' && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">إدارة الفعاليات</h2>
                        <p className="text-gray-600 mt-1">إضافة وتعديل ومعاينة الفعاليات</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingEvent(null);
                          setShowEventForm(true);
                        }}
                        className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
                      >
                        <Plus className="w-5 h-5" />
                        <span>إضافة فعالية جديدة</span>
                      </button>
                    </div>

                    {/* Events Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {events.map((eventItem) => (
                        <div key={eventItem.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                          <div className="relative h-48">
                            <img
                              src={eventItem.image}
                              alt={eventItem.title.ar}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 right-4 bg-[#276073] text-white px-3 py-1 rounded-lg text-sm font-semibold">
                              {eventItem.date}
                            </div>
                            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                              {eventItem.time}
                            </div>
                          </div>
                          
                          <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                              {eventItem.title.ar}
                            </h3>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 mb-2">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm line-clamp-1">{eventItem.place.ar}</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                              {eventItem.description.ar}
                            </p>
                            
                            <div className="flex space-x-2 rtl:space-x-reverse">
                              <button
                                onClick={() => navigate('/admin/event-registrations')}
                                className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg transition-colors duration-200"
                                title="عرض المسجلين"
                              >
                                <Users className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedEvent(eventItem)}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1 rtl:space-x-reverse"
                              >
                                <Eye className="w-4 h-4" />
                                <span>معاينة</span>
                              </button>
                              <button
                                onClick={() => handleEditEvent(eventItem)}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1 rtl:space-x-reverse"
                              >
                                <Edit className="w-4 h-4" />
                                <span>تعديل</span>
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(eventItem.id)}
                                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Management */}
                {activeTab === 'content' && (
                  <ContentManagement />
                )}

                {/* Staff Management */}
                {activeTab === 'staff' && (
                  <StaffManagement />
                )}

                {/* Chat Management */}
                {activeTab === 'chat' && (
                  <ChatManagement />
                )}

                {/* Chat Staff Management */}
                {activeTab === 'chat-staff' && (
                  <ChatStaffManagement />
                )}

                {activeTab === 'reports' && renderReports()}
                {activeTab === 'settings' && renderSettings()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Application Details Modal */}
      <AnimatePresence>
        {showApplicationModal && selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowApplicationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">تفاصيل الطلب</h2>
                    <p className="text-white/90 mt-1">رقم المعاملة: {selectedApplication.id}</p>
                  </div>
                  <button
                    onClick={() => setShowApplicationModal(false)}
                    className="text-white hover:text-gray-200 transition-colors duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Tabs */}
                <div className="flex space-x-1 rtl:space-x-reverse mt-6">
                  {[
                    { id: 'details', label: 'التفاصيل', icon: FileText },
                    { id: 'attachments', label: 'المرفقات', icon: Upload },
                    { id: 'activities', label: 'سجل الأنشطة', icon: Clock }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveModalTab(tab.id)}
                      className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        activeModalTab === tab.id
                          ? 'bg-white text-[#276073] shadow-lg'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {activeModalTab === 'details' && (
                  <div className="space-y-8">
                    {/* Application Status and Actions */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">حالة الطلب والإجراءات</h3>
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>
                            {getStatusLabel(selectedApplication.status)}
                          </span>
                          <span className={`text-sm font-medium ${getPriorityColor(selectedApplication.priority)}`}>
                            أولوية {selectedApplication.priority === 'high' ? 'عالية' : selectedApplication.priority === 'normal' ? 'عادية' : 'منخفضة'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            تغيير الحالة
                          </label>
                          <select
                            value={selectedApplication.status}
                            onChange={(e) => handleStatusChange(selectedApplication.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                          >
                            {availableStatuses.filter(s => s.id !== 'all').map((status) => (
                              <option key={status.id} value={status.id}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-end space-x-2 rtl:space-x-reverse">
                          <a
                            href={`tel:${selectedApplication.applicantData?.phone}`}
                            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                            title="اتصال هاتفي"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <a
                            href={`mailto:${selectedApplication.applicantData?.email}`}
                            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            title="إرسال إيميل"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                          <a
                            href={`https://wa.me/${selectedApplication.applicantData?.phone?.replace('+', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                            title="واتساب"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Applicant Information */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 text-[#276073] mr-2 rtl:mr-0 rtl:ml-2" />
                        بيانات المتقدم
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600">الاسم الكامل</label>
                          <p className="text-gray-900 font-semibold">{selectedApplication.applicantData?.fullName || 'غير محدد'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">رقم الهوية</label>
                          <p className="text-gray-900 font-mono">{selectedApplication.applicantData?.nationalId || 'غير محدد'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">رقم الهاتف</label>
                          <p className="text-gray-900 font-mono">{selectedApplication.applicantData?.phone || 'غير محدد'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">البريد الإلكتروني</label>
                          <p className="text-gray-900">{selectedApplication.applicantData?.email || 'غير محدد'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">المنطقة</label>
                          <p className="text-gray-900">{selectedApplication.applicantData?.region ? getRegionLabel(selectedApplication.applicantData.region) : 'غير محدد'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">المدينة</label>
                          <p className="text-gray-900">{selectedApplication.applicantData?.city || 'غير محدد'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Service Information */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <FileCheck className="w-5 h-5 text-[#276073] mr-2 rtl:mr-0 rtl:ml-2" />
                        تفاصيل الخدمة
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600">نوع الخدمة</label>
                          <p className="text-gray-900 font-semibold">{selectedApplication.serviceName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">الرسوم</label>
                          <p className="text-gray-900 font-semibold">
                            {selectedApplication.fees?.base} {selectedApplication.fees?.currency}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">تاريخ التقديم</label>
                          <p className="text-gray-900">{selectedApplication.submissionDate}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">آخر تحديث</label>
                          <p className="text-gray-900">{selectedApplication.lastUpdate}</p>
                        </div>
                      </div>
                    </div>

                    {/* Form Data */}
                    {selectedApplication.formData && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <FileText className="w-5 h-5 text-[#276073] mr-2 rtl:mr-0 rtl:ml-2" />
                          بيانات النموذج
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(selectedApplication.formData).map(([key, value]) => (
                            <div key={key}>
                              <label className="block text-sm font-medium text-gray-600 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </label>
                              <p className="text-gray-900">{value || 'غير محدد'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeModalTab === 'attachments' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <Upload className="w-5 h-5 text-[#276073] mr-2 rtl:mr-0 rtl:ml-2" />
                        الملفات المرفقة ({selectedApplication.attachments?.length || 0})
                      </h3>
                    </div>

                    {selectedApplication.attachments && selectedApplication.attachments.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedApplication.attachments.map((file, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow duration-200">
                            <div className="flex items-start space-x-3 rtl:space-x-reverse">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                {file.type?.includes('pdf') ? (
                                  <FileText className="w-6 h-6 text-red-600" />
                                ) : file.type?.includes('image') ? (
                                  <Camera className="w-6 h-6 text-green-600" />
                                ) : (
                                  <Upload className="w-6 h-6 text-blue-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {file.size} • {file.uploadDate}
                                </p>
                                <div className="flex items-center space-x-2 rtl:space-x-reverse mt-3">
                                  <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors duration-200">
                                    عرض
                                  </button>
                                  <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors duration-200">
                                    تحميل
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">لا توجد ملفات مرفقة</p>
                        <p className="text-gray-400 text-sm">لم يتم رفع أي ملفات مع هذا الطلب</p>
                      </div>
                    )}
                  </div>
                )}

                {activeModalTab === 'activities' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <Clock className="w-5 h-5 text-[#276073] mr-2 rtl:mr-0 rtl:ml-2" />
                        سجل الأنشطة والحركات
                      </h3>
                      <button
                        onClick={() => setIsAddingActivity(!isAddingActivity)}
                        className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-[#276073] text-white rounded-lg hover:bg-[#1e4a5a] transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة نشاط</span>
                      </button>
                    </div>

                    {/* Add Activity Form */}
                    {isAddingActivity && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">إضافة نشاط جديد</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              نوع النشاط
                            </label>
                            <select
                              value={newActivity.type}
                              onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                            >
                              <option value="">اختر نوع النشاط</option>
                              <option value="status_change">تغيير الحالة</option>
                              <option value="document_review">مراجعة المستندات</option>
                              <option value="sms_sent">إرسال رسالة SMS</option>
                              <option value="email_sent">إرسال بريد إلكتروني</option>
                              <option value="phone_call">مكالمة هاتفية</option>
                              <option value="note_added">إضافة ملاحظة</option>
                              <option value="document_requested">طلب مستندات إضافية</option>
                              <option value="appointment_scheduled">جدولة موعد</option>
                              <option value="payment_received">استلام دفع</option>
                              <option value="application_completed">اكتمال المعاملة</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              الوصف
                            </label>
                            <input
                              type="text"
                              value={newActivity.message}
                              onChange={(e) => setNewActivity({...newActivity, message: e.target.value})}
                              placeholder="اكتب وصف النشاط..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 rtl:space-x-reverse mt-4">
                          <button
                            onClick={addActivity}
                            disabled={!newActivity.type || !newActivity.message.trim()}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            حفظ النشاط
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingActivity(false);
                              setNewActivity({ type: '', message: '' });
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Activities Timeline */}
                    <div className="space-y-4">
                      {selectedApplication.activities && selectedApplication.activities.length > 0 ? (
                        selectedApplication.activities.map((activity) => (
                          <div key={activity.id} className="bg-white border border-gray-200 rounded-xl p-6">
                            <div className="flex items-start space-x-4 rtl:space-x-reverse">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                {renderActivityIcon(activity.icon, activity.color)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                                  <span className="text-sm text-gray-500">{activity.timestamp}</span>
                                </div>
                                <p className="text-gray-700 mb-2">{activity.description}</p>
                                <p className="text-sm text-gray-500">بواسطة: {activity.user}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg font-medium">لا توجد أنشطة مسجلة</p>
                          <p className="text-gray-400 text-sm">لم يتم تسجيل أي أنشطة لهذا الطلب بعد</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Participants Modal */}
      <AnimatePresence>
        {showParticipants && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    المتقدمين للفعالية
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {showParticipants.title.ar}
                  </p>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <button
                    onClick={() => exportParticipants(showParticipants.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <Download className="w-4 h-4" />
                    <span>تصدير CSV</span>
                  </button>
                  <button
                    onClick={() => setShowParticipants(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {getEventParticipants(showParticipants.id).length > 0 ? (
                  <>
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {getEventParticipants(showParticipants.id).length}
                        </div>
                        <div className="text-sm text-blue-800">إجمالي المتقدمين</div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {getEventParticipants(showParticipants.id).reduce((sum, p) => sum + parseInt(p.companions || 0), 0)}
                        </div>
                        <div className="text-sm text-green-800">إجمالي المرافقين</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {getEventParticipants(showParticipants.id).length + getEventParticipants(showParticipants.id).reduce((sum, p) => sum + parseInt(p.companions || 0), 0)}
                        </div>
                        <div className="text-sm text-purple-800">إجمالي الحضور</div>
                      </div>
                    </div>

                    {/* Participants List */}
                    <div className="space-y-4">
                      {getEventParticipants(showParticipants.id).map((participant, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <label className="text-xs font-medium text-gray-600">الاسم</label>
                              <p className="font-semibold text-gray-900">{participant.name}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600">الهاتف</label>
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <p className="font-semibold text-gray-900">{participant.phone}</p>
                                <a
                                  href={`tel:${participant.phone}`}
                                  className="text-green-600 hover:text-green-700 transition-colors duration-200"
                                  title="اتصال"
                                >
                                  <Phone className="w-4 h-4" />
                                </a>
                                <a
                                  href={`https://wa.me/${participant.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-700 transition-colors duration-200"
                                  title="واتساب"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600">البريد الإلكتروني</label>
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <p className="font-semibold text-gray-900 text-sm">{participant.email}</p>
                                <a
                                  href={`mailto:${participant.email}`}
                                  className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                                  title="إرسال بريد"
                                >
                                  <Mail className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600">المرافقين</label>
                              <p className="font-semibold text-gray-900">{participant.companions || 0}</p>
                            </div>
                          </div>
                          
                          {participant.notes && (
                            <div className="mt-3 pt-3 border-t border-gray-300">
                              <label className="text-xs font-medium text-gray-600">الملاحظات</label>
                              <p className="text-sm text-gray-700 mt-1">{participant.notes}</p>
                            </div>
                          )}
                          
                          <div className="mt-3 pt-3 border-t border-gray-300 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              تاريخ التسجيل: {participant.registrationDate}
                            </span>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                مؤكد
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      لا يوجد متقدمين
                    </h3>
                    <p className="text-gray-600">
                      لم يتقدم أحد للمشاركة في هذه الفعالية بعد
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* News Preview Modal */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-64">
                <img
                  src={selectedNews.image}
                  alt={selectedNews.title.ar}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                    selectedNews.category === 'official' ? 'bg-red-500' : 'bg-green-500'
                  }`}>
                    {selectedNews.category === 'official' ? 'بيان رسمي' : 'خبر جديد'}
                  </span>
                </div>
              </div>
              
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedNews.title.ar}
                </h2>
                <div className="flex items-center space-x-4 rtl:space-x-reverse text-gray-500 mb-6">
                  <span>{new Date(selectedNews.date).toLocaleDateString('ar-SA')}</span>
                  <span>•</span>
                  <span>القنصلية السودانية</span>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {selectedNews.excerpt.ar}
                </p>
                
                <div className="flex space-x-4 rtl:space-x-reverse">
                  <button
                    onClick={() => handleEditNews(selectedNews)}
                    className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <Edit className="w-5 h-5" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => window.open(`/news/${selectedNews.id}`, '_blank')}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>عرض في الموقع</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Preview Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-64">
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title.ar}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center space-x-4 rtl:space-x-reverse text-white">
                    <span className="bg-[#276073] px-3 py-1 rounded-lg text-sm font-semibold">
                      {selectedEvent.date}
                    </span>
                    <span className="bg-black/70 px-3 py-1 rounded-lg text-sm">
                      {selectedEvent.time}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedEvent.title.ar}
                </h2>
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 mb-6">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedEvent.place.ar}</span>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {selectedEvent.description.ar}
                </p>
                
                <div className="flex space-x-4 rtl:space-x-reverse">
                  <button
                    onClick={() => handleEditEvent(selectedEvent)}
                    className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <Edit className="w-5 h-5" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => window.open(`/events/${selectedEvent.id}`, '_blank')}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>عرض في الموقع</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
            </AnimatePresence>

      {/* News Form Modal */}
      <NewsFormModal
        isOpen={showNewsForm}
        onClose={() => {
          setShowNewsForm(false);
          setEditingNews(null);
        }}
        news={editingNews}
        onSave={(newsData) => {
          if (editingNews) {
            // Update existing news
            const updatedNews = news.map(n => n.id === editingNews.id ? { ...newsData, id: editingNews.id } : n);
            setNews(updatedNews);
            localStorage.setItem('newsData', JSON.stringify(updatedNews));
          } else {
            // Add new news
            const newNews = { ...newsData, id: Date.now() };
            const updatedNews = [newNews, ...news];
            setNews(updatedNews);
            localStorage.setItem('newsData', JSON.stringify(updatedNews));
          }
          setShowNewsForm(false);
          setEditingNews(null);
        }}
      />

      {/* Event Form Modal */}
      <EventFormModal
        isOpen={showEventForm}
        onClose={() => {
          setShowEventForm(false);
          setEditingEvent(null);
        }}
        event={editingEvent}
        onSave={(eventData) => {
          if (editingEvent) {
            // Update existing event
            const updatedEvents = events.map(e => e.id === editingEvent.id ? { ...eventData, id: editingEvent.id } : e);
            setEvents(updatedEvents);
            localStorage.setItem('eventsData', JSON.stringify(updatedEvents));
          } else {
            // Add new event
            const newEvent = { ...eventData, id: Date.now() };
            const updatedEvents = [newEvent, ...events];
            setEvents(updatedEvents);
            localStorage.setItem('eventsData', JSON.stringify(updatedEvents));
          }
          setShowEventForm(false);
          setEditingEvent(null);
        }}
      />
    </AdminLayout>
  );
};

// News Form Modal Component
const NewsFormModal = ({ isOpen, onClose, news, onSave }) => {
  const [formData, setFormData] = useState({
    title: { ar: '', en: '' },
    excerpt: { ar: '', en: '' },
    image: '',
    date: new Date().toISOString().split('T')[0],
    category: 'latest'
  });

  useEffect(() => {
    if (news) {
      setFormData({
        title: news.title,
        excerpt: news.excerpt,
        image: news.image,
        date: news.date,
        category: news.category
      });
    } else {
      setFormData({
        title: { ar: '', en: '' },
        excerpt: { ar: '', en: '' },
        image: '',
        date: new Date().toISOString().split('T')[0],
        category: 'latest'
      });
    }
  }, [news]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {news ? 'تعديل الخبر' : 'إضافة خبر جديد'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Arabic Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان (عربي) *
            </label>
            <input
              type="text"
              required
              value={formData.title.ar}
              onChange={(e) => setFormData({
                ...formData,
                title: { ...formData.title, ar: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              placeholder="أدخل عنوان الخبر بالعربية"
            />
          </div>

          {/* English Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان (إنجليزي) *
            </label>
            <input
              type="text"
              required
              value={formData.title.en}
              onChange={(e) => setFormData({
                ...formData,
                title: { ...formData.title, en: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              placeholder="Enter news title in English"
            />
          </div>

          {/* Arabic Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المقتطف (عربي) *
            </label>
            <textarea
              required
              rows={3}
              value={formData.excerpt.ar}
              onChange={(e) => setFormData({
                ...formData,
                excerpt: { ...formData.excerpt, ar: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none resize-none"
              placeholder="أدخل مقتطف الخبر بالعربية"
            />
          </div>

          {/* English Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المقتطف (إنجليزي) *
            </label>
            <textarea
              required
              rows={3}
              value={formData.excerpt.en}
              onChange={(e) => setFormData({
                ...formData,
                excerpt: { ...formData.excerpt, en: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none resize-none"
              placeholder="Enter news excerpt in English"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رابط الصورة *
            </label>
            <input
              type="url"
              required
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              placeholder="https://images.pexels.com/..."
            />
          </div>

          {/* Date and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التاريخ *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفئة *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              >
                <option value="latest">خبر جديد</option>
                <option value="official">بيان رسمي</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 rtl:space-x-reverse pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-colors duration-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg font-semibold transition-colors duration-200"
            >
              {news ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Event Form Modal Component
const EventFormModal = ({ isOpen, onClose, event, onSave }) => {
  const [formData, setFormData] = useState({
    title: { ar: '', en: '' },
    description: { ar: '', en: '' },
    place: { ar: '', en: '' },
    date: new Date().toISOString().split('T')[0],
    time: '',
    image: '',
    tabGroup: 'today'
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        place: event.place,
        date: event.date,
        time: event.time,
        image: event.image,
        tabGroup: event.tabGroup
      });
    } else {
      setFormData({
        title: { ar: '', en: '' },
        description: { ar: '', en: '' },
        place: { ar: '', en: '' },
        date: new Date().toISOString().split('T')[0],
        time: '',
        image: '',
        tabGroup: 'today'
      });
    }
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {event ? 'تعديل الفعالية' : 'إضافة فعالية جديدة'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Arabic Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان الفعالية (عربي) *
            </label>
            <input
              type="text"
              required
              value={formData.title.ar}
              onChange={(e) => setFormData({
                ...formData,
                title: { ...formData.title, ar: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              placeholder="أدخل عنوان الفعالية بالعربية"
            />
          </div>

          {/* English Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان الفعالية (إنجليزي) *
            </label>
            <input
              type="text"
              required
              value={formData.title.en}
              onChange={(e) => setFormData({
                ...formData,
                title: { ...formData.title, en: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              placeholder="Enter event title in English"
            />
          </div>

          {/* Arabic Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف (عربي) *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description.ar}
              onChange={(e) => setFormData({
                ...formData,
                description: { ...formData.description, ar: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none resize-none"
              placeholder="أدخل وصف الفعالية بالعربية"
            />
          </div>

          {/* English Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف (إنجليزي) *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description.en}
              onChange={(e) => setFormData({
                ...formData,
                description: { ...formData.description, en: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none resize-none"
              placeholder="Enter event description in English"
            />
          </div>

          {/* Arabic Place */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المكان (عربي) *
            </label>
            <input
              type="text"
              required
              value={formData.place.ar}
              onChange={(e) => setFormData({
                ...formData,
                place: { ...formData.place, ar: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              placeholder="أدخل مكان الفعالية بالعربية"
            />
          </div>

          {/* English Place */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المكان (إنجليزي) *
            </label>
            <input
              type="text"
              required
              value={formData.place.en}
              onChange={(e) => setFormData({
                ...formData,
                place: { ...formData.place, en: e.target.value }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              placeholder="Enter event place in English"
            />
          </div>

          {/* Date, Time, and Tab Group */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التاريخ *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوقت *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التبويب *
              </label>
              <select
                required
                value={formData.tabGroup}
                onChange={(e) => setFormData({ ...formData, tabGroup: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              >
                <option value="today">اليوم</option>
                <option value="tomorrow">الغد</option>
                <option value="afterTomorrow">بعد الغد</option>
                <option value="nextWeek">الأسبوع القادم</option>
              </select>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رابط الصورة *
            </label>
            <input
              type="url"
              required
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              placeholder="https://images.pexels.com/..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 rtl:space-x-reverse pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-colors duration-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg font-semibold transition-colors duration-200"
            >
              {event ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;