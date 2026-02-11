import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { LanguageProvider } from './hooks/useLanguage';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Header from './components/Header';
import AnnouncementBanner from './components/AnnouncementBanner';
import MaintenancePage from './pages/MaintenancePage';
import { supabase } from './lib/supabase';
import HeroSlider from './components/HeroSlider';
import NewsTicker from './components/NewsTicker';
import ServicesSection from './components/ServicesSection';
import NewsSection from './components/NewsSection';
import CountersSection from './components/CountersSection';
import EventsSection from './components/EventsSection';
import AdvertisementSection from './components/AdvertisementSection';
import Footer from './components/Footer';
import AboutSudan from './pages/AboutSudan';
import AboutConsulate from './pages/AboutConsulate';
import ServicesGuide from './pages/ServicesGuide';
import ImportantLinks from './pages/ImportantLinks';
import KaramaBattle from './pages/KaramaBattle';
import ConsularServicesPage from './components/ConsularServicesPage';
import Success from './pages/Success';
import TransactionTracking from './pages/TransactionTracking';
import Payment from './pages/Payment';
import ContactUs from './pages/ContactUs';
import NewsPage from './pages/NewsPage';
import EventsPage from './pages/EventsPage';
import NewsDetail from './pages/NewsDetail';
import EventDetail from './pages/EventDetail';
import EventRegistration from './pages/EventRegistration';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ApplicationDetail from './pages/ApplicationDetail';
import EducationServices from './pages/EducationServices';
import ExamCard from './pages/ExamCard';
import EducationalCertificatePOA from './pages/EducationalCertificatePOA';
import ExamSupervision from './pages/ExamSupervision';
import { serviceComponents } from './services';
import ChatBot from './components/ChatBot';
import ChatManagement from './pages/ChatManagement';
import ChatbotManagement from './pages/ChatbotManagement';
import ChatStaffManagement from './pages/ChatStaffManagement';
import ContactMessagesManagement from './pages/ContactMessagesManagement';
import AppointmentsCalendar from './pages/AppointmentsCalendar';
import DailyAppointments from './pages/DailyAppointments';
import ServicesManagement from './pages/ServicesManagement';
import ServiceEditor from './pages/ServiceEditor';
import ServiceDashboard from './pages/ServiceDashboard';
import ServicePage from './pages/ServicePage';
import StaffManagement from './pages/StaffManagement';
import AddStaff from './pages/AddStaff';
import EditStaff from './pages/EditStaff';
import ApplicationsList from './pages/ApplicationsList';
import AppointmentsShipmentsManagement from './pages/AppointmentsShipmentsManagement';
import ShippingCompaniesManagement from './pages/ShippingCompaniesManagement';
import EventRegistrationsManagement from './pages/EventRegistrationsManagement';
import Profile from './pages/Profile';
import ContentManagementConsulate from './pages/ContentManagementConsulate';
import ContentManagementServicesGuide from './pages/ContentManagementServicesGuide';
import ContentManagementImportantLinks from './pages/ContentManagementImportantLinks';
import './components/AboutSudanStyles.css';

// Import POA Forms
import GeneralForm from './services/poa/general/GeneralForm';
import CourtsForm from './services/poa/courts/CourtsForm';
import InheritanceForm from './services/poa/inheritance/InheritanceForm';
import RealEstateForm from './services/poa/realEstate/RealEstateForm';
import VehiclesForm from './services/poa/vehicles/VehiclesForm';
import CompaniesForm from './services/poa/companies/CompaniesForm';
import BirthCertificatesForm from './services/poa/birthCertificates/BirthCertificatesForm';
import EducationalForm from './services/poa/educational/EducationalForm';
import MarriageDivorceForm from './services/poa/marriageDivorce/MarriageDivorceForm';
import RegularDeclarationsForm from './services/declarations/regular/RegularDeclarationsForm';
import SwornDeclarationsForm from './services/declarations/sworn/SwornDeclarationsForm';

// HomePage component - الصفحة الرئيسية الأصلية
function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSlider />
        <NewsTicker />
        <ServicesSection />
        <NewsSection />
        <AdvertisementSection />
        <EventsSection />
        <CountersSection />
      </main>
      <Footer />
      <ChatBot />
    </>
  );
}

function App() {
  const [maintenanceMode, setMaintenanceMode] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-out-cubic'
    });

    checkMaintenanceMode();
  }, []);

  const checkMaintenanceMode = async () => {
    try {
      const { data, error } = await supabase
        .from('system_maintenance')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) throw error;
      setMaintenanceMode(data);
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#276073] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (maintenanceMode?.is_enabled) {
    return (
      <LanguageProvider>
        <MaintenancePage
          message_ar={maintenanceMode.message_ar}
          message_en={maintenanceMode.message_en}
          start_time={maintenanceMode.start_time}
          end_time={maintenanceMode.end_time}
        />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen">
          <AnnouncementBanner />
          <ErrorBoundary>
            <BrowserRouter>
              <Routes>
                {/* الصفحة الرئيسية */}
                <Route path="/" element={<HomePage />} />
                
                {/* صفحة عن السودان */}
                <Route path="/about-sudan" element={<AboutSudan />} />

                {/* صفحة عن القنصلية */}
                <Route path="/about-consulate" element={<AboutConsulate />} />

                {/* صفحة دليل المعاملات */}
                <Route path="/services-guide" element={<ServicesGuide />} />

                {/* صفحة المواقع المهمة */}
                <Route path="/important-links" element={<ImportantLinks />} />

                {/* صفحة معركة الكرامة */}
                <Route path="/karama-battle" element={<KaramaBattle />} />

                {/* صفحة المعاملات القنصلية */}
                <Route path="/services" element={
                  <>
                    <Header />
                    <ConsularServicesPage />
                    <Footer />
                  </>
                } />
                
                {/* صفحة النجاح */}
                <Route path="/success" element={<Success />} />
                
                {/* صفحة تتبع المعاملات */}
                <Route path="/track" element={<TransactionTracking />} />
                <Route path="/track/:referenceNumber" element={<TransactionTracking />} />
                
                {/* صفحة الدفع */}
                <Route path="/payment" element={<Payment />} />
                
                {/* صفحة تواصل معنا */}
                <Route path="/contact" element={<ContactUs />} />
                
                {/* صفحة الأخبار */}
                <Route path="/news" element={<NewsPage />} />
                
                {/* صفحة الفعاليات */}
                <Route path="/events" element={<EventsPage />} />
                
                {/* صفحة تفاصيل الخبر */}
                <Route path="/news/:newsId" element={<NewsDetail />} />
                
                {/* صفحة تفاصيل الفعالية */}
                <Route path="/events/:eventId" element={<EventDetail />} />

                {/* صفحة طلب المشاركة في الفعالية */}
                <Route path="/events/:eventId/register" element={<EventRegistration />} />

                {/* صفحات التعليم */}
                <Route path="/services/education" element={<EducationServices />} />
                <Route path="/services/education/exam-supervision" element={<ExamSupervision />} />
                
                {/* صفحة بطاقة الامتحان */}
                <Route path="/exam-card" element={<ExamCard />} />
                <Route path="/exam-card/:referenceNumber" element={<ExamCard />} />
                
                {/* صفحة توكيل شهادة دراسية */}
                <Route path="/services/poa/educational" element={<EducationalCertificatePOA />} />

                {/* Dynamic Service Page - Database Driven */}
                <Route path="/services/:slug" element={<ServicePage />} />
                
                {/* صفحات الإدارة */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/applications" element={
                  <ProtectedRoute>
                    <ApplicationsList />
                  </ProtectedRoute>
                } />
                <Route path="/admin/applications/:id" element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <ApplicationDetail />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/chat" element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <ChatManagement />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/chatbot" element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <ChatbotManagement />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/chat-staff" element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <ChatStaffManagement />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/contact-messages" element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <ContactMessagesManagement />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/appointments" element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AppointmentsCalendar />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/appointments/day/:date" element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <DailyAppointments />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/services" element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <ServicesManagement />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/services/new" element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <ServiceEditor />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/services/:serviceId" element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <ServiceEditor />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/services/:serviceId/dashboard" element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <ServiceDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/staff" element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <StaffManagement />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/staff/new" element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AddStaff />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/staff/:id/edit" element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <EditStaff />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/appointments-shipments" element={
                  <ProtectedRoute>
                    <AppointmentsShipmentsManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/shipping-companies" element={
                  <ProtectedRoute>
                    <ShippingCompaniesManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/event-registrations" element={
                  <ProtectedRoute>
                    <EventRegistrationsManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/content/consulate" element={
                  <ProtectedRoute>
                    <ContentManagementConsulate />
                  </ProtectedRoute>
                } />
                <Route path="/admin/content/services-guide" element={
                  <ProtectedRoute>
                    <ContentManagementServicesGuide />
                  </ProtectedRoute>
                } />
                <Route path="/admin/content/important-links" element={
                  <ProtectedRoute>
                    <ContentManagementImportantLinks />
                  </ProtectedRoute>
                } />
                <Route path="/admin/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;