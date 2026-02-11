import React from 'react';
import {
  FileText, Search, CheckCircle, DollarSign, Calendar,
  Clock, MapPin, XCircle, AlertCircle
} from 'lucide-react';
import { useStatuses } from '../hooks/useStatuses';

const iconMap = {
  FileText,
  Search,
  CheckCircle,
  DollarSign,
  Calendar,
  Clock,
  MapPin,
  XCircle,
  AlertCircle
};

const StatusBadge = ({
  statusKey,
  showIcon = true,
  showDescription = false,
  size = 'md',
  language = 'ar'
}) => {
  const { getStatusByKey } = useStatuses();
  const status = getStatusByKey(statusKey);

  if (!status) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
        {statusKey}
      </span>
    );
  }

  const Icon = iconMap[status.icon] || FileText;
  const label = language === 'ar' ? status.label_ar : status.label_en;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <span className={`inline-flex items-center rounded-full font-medium ${status.color} ${sizeClasses[size]}`}>
        {showIcon && <Icon size={iconSizes[size]} />}
        <span>{label}</span>
      </span>
      {showDescription && status.description_ar && (
        <span className="text-xs text-gray-600">{status.description_ar}</span>
      )}
    </div>
  );
};

export default StatusBadge;
