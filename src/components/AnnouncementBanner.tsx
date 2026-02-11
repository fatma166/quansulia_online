import React, { useEffect, useState } from 'react';
import { X, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';

interface Announcement {
  id: string;
  type: 'info' | 'warning' | 'error';
  title_ar: string;
  title_en: string;
  message_ar: string;
  message_en: string;
  is_dismissible: boolean;
}

const AnnouncementBanner: React.FC = () => {
  const { language } = useLanguage();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    loadAnnouncement();
  }, []);

  const loadAnnouncement = async () => {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('system_announcements')
        .select('*')
        .eq('is_enabled', true)
        .or(`start_time.is.null,start_time.lte.${now}`)
        .or(`end_time.is.null,end_time.gte.${now}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const dismissedKey = `announcement_dismissed_${data.id}`;
        const wasDismissed = localStorage.getItem(dismissedKey);
        if (!wasDismissed) {
          setAnnouncement(data);
        }
      }
    } catch (error) {
      console.error('Error loading announcement:', error);
    }
  };

  const handleDismiss = () => {
    if (announcement && announcement.is_dismissible) {
      const dismissedKey = `announcement_dismissed_${announcement.id}`;
      localStorage.setItem(dismissedKey, 'true');
      setIsDismissed(true);
    }
  };

  if (!announcement || isDismissed) {
    return null;
  }

  const getTypeConfig = () => {
    switch (announcement.type) {
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          icon: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          icon: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
        };
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          icon: <Info className="w-5 h-5 flex-shrink-0" />,
        };
    }
  };

  const config = getTypeConfig();
  const title = language === 'ar' ? announcement.title_ar : announcement.title_en;
  const message = language === 'ar' ? announcement.message_ar : announcement.message_en;

  return (
    <div className={`${config.bgColor} border-b ${config.borderColor}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-start space-x-3 rtl:space-x-reverse">
          <div className={config.textColor}>
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={`font-bold ${config.textColor} mb-1`}>
                {title}
              </h4>
            )}
            <p className={`text-sm ${config.textColor}`}>
              {message}
            </p>
          </div>
          {announcement.is_dismissible && (
            <button
              onClick={handleDismiss}
              className={`${config.textColor} hover:opacity-70 transition-opacity p-1`}
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
