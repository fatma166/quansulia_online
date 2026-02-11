import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, CheckCircle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface ParticipationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
}

const ParticipationModal: React.FC<ParticipationModalProps> = ({ isOpen, onClose, event }) => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    companions: '0',
    notes: '',
    agreed: false
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission
    const participationData = { 
      ...formData, 
      eventId: event?.id,
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'confirmed'
    };
    
    // Save to localStorage for admin dashboard
    const savedParticipants = JSON.parse(localStorage.getItem('eventParticipants') || '{}');
    if (!savedParticipants[event.id]) {
      savedParticipants[event.id] = [];
    }
    savedParticipants[event.id].push(participationData);
    localStorage.setItem('eventParticipants', JSON.stringify(savedParticipants));
    
    console.log('Participation request:', participationData);
    setIsSubmitted(true);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      companions: '0',
      notes: '',
      agreed: false
    });
    setIsSubmitted(false);
    onClose();
  };

  if (!event) return null;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-xl font-bold text-gray-900">
                    {t('events.participate')}
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {!isSubmitted ? (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {language === 'ar' ? event.title_ar : event.title_en}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {event.event_date ? new Date(event.event_date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : ''}
                        {event.event_time && ` - ${event.event_time}`}
                      </p>
                      {(event.location_ar || event.location_en) && (
                        <p className="text-sm text-gray-600">
                          {language === 'ar' ? event.location_ar : event.location_en}
                        </p>
                      )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('footer.name')} *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('footer.phone')} *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          البريد الإلكتروني *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          عدد المرافقين
                        </label>
                        <select
                          value={formData.companions}
                          onChange={(e) => setFormData({ ...formData, companions: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200"
                        >
                          {[0, 1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ملاحظات إضافية
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 resize-none"
                        />
                      </div>

                      <div className="flex items-start space-x-3 rtl:space-x-reverse">
                        <input
                          type="checkbox"
                          id="agreement"
                          required
                          checked={formData.agreed}
                          onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                          className="mt-1 text-[#276073] border-gray-300 rounded focus:ring-[#276073]"
                        />
                        <label htmlFor="agreement" className="text-sm text-gray-600">
                          أوافق على الشروط والأحكام والسياسات المعمول بها في القنصلية
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={!formData.agreed}
                        className="w-full bg-[#276073] hover:bg-[#1e4a5a] disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-colors duration-200 disabled:cursor-not-allowed"
                      >
                        إرسال طلب المشاركة
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      تم إرسال الطلب بنجاح
                    </h3>
                    <p className="text-gray-600 mb-6">
                      سيتم التواصل معكم قريباً لتأكيد المشاركة
                    </p>
                    <button
                      onClick={handleClose}
                      className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      {t('search.close')}
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ParticipationModal;