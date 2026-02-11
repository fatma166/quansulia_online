import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { supabase } from '../lib/supabase';

interface BreakingNews {
  id: number;
  title_ar: string;
  title_en: string;
  link: string | null;
  is_active: boolean;
  priority: number;
  start_date: string | null;
  end_date: string | null;
}

const NewsTicker: React.FC = () => {
  const { t, language } = useLanguage();
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);

  useEffect(() => {
    loadBreakingNews();
  }, []);

  const loadBreakingNews = async () => {
    try {
      const now = new Date().toISOString();

      let query = supabase
        .from('breaking_news_ticker')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Filter by date range on client side
      const filtered = data?.filter(news => {
        const startValid = !news.start_date || new Date(news.start_date) <= new Date(now);
        const endValid = !news.end_date || new Date(news.end_date) >= new Date(now);
        return startValid && endValid;
      }) || [];

      setBreakingNews(filtered);
    } catch (error) {
      console.error('Error loading breaking news:', error);
    }
  };

  // Don't show ticker if no news
  if (breakingNews.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-600 border-t border-red-700 py-3 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-white font-semibold">
            <Bell className="w-5 h-5" />
            <span>{t('breakingNews')}</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="animate-scroll whitespace-nowrap text-white">
              {breakingNews.map((news, index) => (
                <React.Fragment key={news.id}>
                  {news.link ? (
                    <a
                      href={news.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-8 hover:text-yellow-300 transition-colors"
                    >
                      {language === 'ar' ? news.title_ar : news.title_en}
                    </a>
                  ) : (
                    <span className="inline-block px-8">
                      {language === 'ar' ? news.title_ar : news.title_en}
                    </span>
                  )}
                  {index < breakingNews.length - 1 && (
                    <span className="inline-block px-4">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">SD</span>
                      </div>
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;