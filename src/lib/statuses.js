import { supabase } from './supabase';

let cachedStatuses = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000;

export const loadStatuses = async (forceRefresh = false) => {
  if (!forceRefresh && cachedStatuses && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedStatuses;
  }

  try {
    const { data, error } = await supabase
      .from('application_statuses')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;

    cachedStatuses = data || [];
    cacheTimestamp = Date.now();

    return cachedStatuses;
  } catch (error) {
    console.error('Error loading statuses:', error);
    return [];
  }
};

export const getStatusesMap = async () => {
  const statuses = await loadStatuses();
  const map = {};
  statuses.forEach(status => {
    map[status.status_key] = status;
  });
  return map;
};

export const getStatus = async (statusKey) => {
  const statusesMap = await getStatusesMap();
  return statusesMap[statusKey] || null;
};

export const getStatusLabel = async (statusKey, language = 'ar') => {
  const status = await getStatus(statusKey);
  if (!status) return statusKey;
  return language === 'ar' ? status.label_ar : status.label_en;
};

export const getStatusColor = async (statusKey) => {
  const status = await getStatus(statusKey);
  return status?.color || 'bg-gray-100 text-gray-800';
};

export const getStatusIcon = async (statusKey) => {
  const status = await getStatus(statusKey);
  return status?.icon || 'FileText';
};

export const getStatussByCategory = async (category) => {
  const statuses = await loadStatuses();
  return statuses.filter(s => s.category === category);
};

export const clearStatusesCache = () => {
  cachedStatuses = null;
  cacheTimestamp = null;
};

export const statusCategories = {
  SUBMISSION: 'submission',
  REVIEW: 'review',
  PAYMENT: 'payment',
  APPOINTMENT: 'appointment',
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  COMPLETION: 'completion',
  REJECTION: 'rejection'
};

export const statusKeys = {
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  PAYMENT_PENDING: 'payment_pending',
  PAYMENT_COMPLETED: 'payment_completed',
  APPOINTMENT_REQUIRED: 'appointment_required',
  APPOINTMENT_BOOKED: 'appointment_booked',
  PROCESSING: 'processing',
  READY: 'ready',
  SHIPPING: 'shipping',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};
