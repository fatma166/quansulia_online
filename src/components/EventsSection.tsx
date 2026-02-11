import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Sun, Sunrise, Moon, CalendarDays } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { supabase } from '../lib/supabase';

const EventsSection: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { key: 'today', label: t('events.today'), icon: Sun, color: 'from-yellow-400 to-orange-500' },
    { key: 'tomorrow', label: t('events.tomorrow'), icon: Sunrise, color: 'from-orange-400 to-pink-500' },
    { key: 'afterTomorrow', label: t('events.afterTomorrow'), icon: Moon, color: 'from-purple-400 to-blue-500' },
    { key: 'nextWeek', label: t('events.nextWeek'), icon: CalendarDays, color: 'from-green-400 to-teal-500' }
  ];

  // Load events from database
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => event.tab_group === activeTab);

  const handleParticipationRequest = (eventId: string) => {
    navigate(`/events/${eventId}/register`);
  };

  return (
    <>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 px-4">
              {t('events.title')}
            </h2>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-8 bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-2xl shadow-lg border border-gray-200 max-w-full mx-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-3 sm:px-4 md:px-6 py-2 md:py-4 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse group overflow-hidden text-sm md:text-base ${
                    activeTab === tab.key
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-xl scale-105`
                      : 'text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-gray-400 hover:to-gray-500 bg-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {/* Background Animation */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${activeTab === tab.key ? 'opacity-100' : ''}`} />

                  {/* Content */}
                  <div className="relative z-10 flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse">
                    <tab.icon className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 ${
                      activeTab === tab.key
                        ? 'animate-bounce'
                        : 'group-hover:animate-pulse'
                    }`} />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </div>

                  {/* Active Indicator */}
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-[#276073] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">{language === 'ar' ? 'لا توجد فعاليات حالياً' : 'No events available'}</p>
              </div>
            ) : (
              filteredEvents.map((event, index) => {
                const eventDate = new Date(event.event_date);
                const formattedDate = eventDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });

                return (
                  <div
                    key={event.id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    {/* Event Image */}
                    <div className="relative h-48 overflow-hidden">
                      {event.featured_image ? (
                        <img
                          src={event.featured_image}
                          alt={language === 'ar' ? event.title_ar : event.title_en}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#276073] to-[#1e4a5a] flex items-center justify-center">
                          <Calendar className="w-16 h-16 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-4 right-4 bg-[#276073] text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {formattedDate}
                      </div>
                      {event.is_featured && (
                        <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {language === 'ar' ? 'مميز' : 'Featured'}
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      {event.event_time && (
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-[#276073] mb-3">
                          <Clock className="w-5 h-5" />
                          <span className="font-semibold">{event.event_time}</span>
                        </div>
                      )}

                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#276073] transition-colors duration-300">
                        {language === 'ar' ? event.title_ar : event.title_en}
                      </h3>

                      {(event.location_ar || event.location_en) && (
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 mb-4">
                          <MapPin className="w-4 h-4" />
                          <span>{language === 'ar' ? event.location_ar : event.location_en}</span>
                        </div>
                      )}

                      {(event.short_description_ar || event.short_description_en) && (
                        <p className="text-gray-600 mb-6 leading-relaxed text-sm line-clamp-3">
                          {language === 'ar' ? event.short_description_ar : event.short_description_en}
                        </p>
                      )}

                      {event.registration_required && (
                        <button
                          onClick={() => handleParticipationRequest(event.id)}
                          className="w-full bg-gradient-to-r from-[#276073] to-[#1e4a5a] hover:from-[#1e4a5a] hover:to-[#276073] text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-lg hover:shadow-xl"
                        >
                          <Users className="w-5 h-5" />
                          <span>{t('events.participate')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default EventsSection;