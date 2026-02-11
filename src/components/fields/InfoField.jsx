import React from 'react';
import { Info } from 'lucide-react';

const InfoField = ({ field, label, help }) => {
  const displayLabel = label || field.label_ar || field.label;
  const displayContent = help || field.help_text_ar || field.content || field.help;

  return (
    <div className="md:col-span-12">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {displayLabel && (
            <h4 className="font-semibold text-blue-900 mb-2">{displayLabel}</h4>
          )}
          {displayContent && (
            <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-line">
              {displayContent}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoField;
