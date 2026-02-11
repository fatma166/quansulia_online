import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { getVisibleItems } from '../hooks/useServiceData';

export default function ConditionalDocuments({ documents, formValues }) {
  const visibleDocuments = getVisibleItems(documents, formValues);

  if (visibleDocuments.length === 0) return null;

  const requiredDocs = visibleDocuments.filter(doc => doc.is_required);
  const optionalDocs = visibleDocuments.filter(doc => !doc.is_required);

  return (
    <div className="hidden lg:block bg-amber-50 border border-amber-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-amber-600" />
        المستندات المطلوبة
      </h3>

      {requiredDocs.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            مستندات إلزامية
          </h4>
          <ul className="space-y-2">
            {requiredDocs.map((doc) => (
              <li key={doc.id} className="flex items-start gap-3 bg-white rounded-md p-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{doc.document_name_ar}</p>
                  {doc.description_ar && (
                    <p className="text-sm text-gray-600 mt-1">{doc.description_ar}</p>
                  )}
                  {doc.accepted_formats && (
                    <p className="text-xs text-gray-500 mt-1">
                      الصيغ المقبولة: {doc.accepted_formats.join(', ')}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {optionalDocs.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            مستندات اختيارية
          </h4>
          <ul className="space-y-2">
            {optionalDocs.map((doc) => (
              <li key={doc.id} className="flex items-start gap-3 bg-white rounded-md p-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{doc.document_name_ar}</p>
                  {doc.description_ar && (
                    <p className="text-sm text-gray-600 mt-1">{doc.description_ar}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
