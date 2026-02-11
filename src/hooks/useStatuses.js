import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

let statusesCache = null;
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000;

export const useStatuses = () => {
  const [statuses, setStatuses] = useState([]);
  const [statusesMap, setStatusesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      if (statusesCache && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
        setStatuses(statusesCache);
        createStatusesMap(statusesCache);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('application_statuses')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (fetchError) throw fetchError;

      statusesCache = data || [];
      cacheTime = Date.now();

      setStatuses(data || []);
      createStatusesMap(data || []);
    } catch (err) {
      console.error('Error fetching statuses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createStatusesMap = (statusList) => {
    const map = {};
    statusList.forEach(status => {
      map[status.status_key] = status;
    });
    setStatusesMap(map);
  };

  const getStatusByKey = (statusKey) => {
    return statusesMap[statusKey] || null;
  };

  const getStatusLabel = (statusKey, language = 'ar') => {
    const status = statusesMap[statusKey];
    if (!status) return statusKey;
    return language === 'ar' ? status.label_ar : status.label_en;
  };

  const getStatusColor = (statusKey) => {
    const status = statusesMap[statusKey];
    return status?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (statusKey) => {
    const status = statusesMap[statusKey];
    return status?.icon || 'FileText';
  };

  const getStatusDescription = (statusKey) => {
    const status = statusesMap[statusKey];
    return status?.description_ar || '';
  };

  const getStatusesByCategory = (category) => {
    return statuses.filter(status => status.category === category);
  };

  const getAllCategories = () => {
    const categories = new Set(statuses.map(s => s.category));
    return Array.from(categories);
  };

  const refreshStatuses = () => {
    statusesCache = null;
    cacheTime = null;
    fetchStatuses();
  };

  return {
    statuses,
    statusesMap,
    loading,
    error,
    getStatusByKey,
    getStatusLabel,
    getStatusColor,
    getStatusIcon,
    getStatusDescription,
    getStatusesByCategory,
    getAllCategories,
    refreshStatuses
  };
};

export const getStatusesSync = () => {
  return statusesCache || [];
};

export const clearStatusesCache = () => {
  statusesCache = null;
  cacheTime = null;
};
