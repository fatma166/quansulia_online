import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DynamicServiceForm from '../../components/DynamicServiceForm';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const FamilyAffairsForm = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    const referenceNumber = `FAM-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    console.log('Family Affairs Application:', { ...formData, referenceNumber });

    navigate('/success', {
      state: {
        referenceNumber,
        serviceTitle: 'الأحوال الشخصية'
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] text-white py-6 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              <span>العودة</span>
            </button>

            <div className="flex-1 text-center px-4">
              <h1 className="text-2xl sm:text-3xl font-bold">الأحوال الشخصية</h1>
            </div>

            <div className="w-24 sm:w-32"></div>
          </div>

          <div className="text-center mt-3">
            <p className="text-blue-100 text-sm">
              يرجى ملء جميع الحقول المطلوبة لإكمال طلب الخدمة
            </p>
          </div>
        </div>
      </div>

      <div className="py-8">
        <DynamicServiceForm
          serviceSlug="family-affairs"
          onSubmit={handleSubmit}
        />
      </div>

      <Footer />
    </div>
  );
};

export default FamilyAffairsForm;
