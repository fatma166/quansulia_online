import React, { useState } from 'react';
import { GripVertical, ChevronDown, ChevronUp, Trash2, Settings2 } from 'lucide-react';
import ConditionalLogicBuilder from './ConditionalLogicBuilder';

const DraggableItem = ({
  item,
  index,
  onUpdate,
  onDelete,
  availableFields,
  children,
  title,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}) => {
  const [showConditions, setShowConditions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
    if (onDragStart) onDragStart(e, index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (onDragOver) onDragOver(e, index);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (onDrop) onDrop(e, index);
  };

  const handleConditionsChange = (newConditions) => {
    onUpdate(index, 'conditions', newConditions);
  };

  const hasNewConditions = item.conditions?.show_when?.length > 0;
  // Legacy conditions use show_when with operator field
  // New format uses: { field: "x", values: [...] } or { logic: "AND", conditions: [...] }
  const hasLegacyConditions = item.conditions &&
    item.conditions.show_when &&
    Array.isArray(item.conditions.show_when) &&
    item.conditions.show_when.length > 0 &&
    item.conditions.show_when.some(c => c.operator !== undefined);
  // New simplified format
  const hasSimplifiedConditions = item.conditions &&
    !item.conditions.show_when &&
    (item.conditions.field || item.conditions.conditions);
  // New operator-based format: { operator: "AND", conditions: [...] }
  const hasOperatorBasedConditions = item.conditions &&
    item.conditions.operator &&
    item.conditions.conditions &&
    Array.isArray(item.conditions.conditions) &&
    item.conditions.conditions.length > 0;
  const hasConditions = hasNewConditions || hasLegacyConditions || hasSimplifiedConditions || hasOperatorBasedConditions;

  return (
    <div
      className="border border-gray-200 rounded-lg bg-white shadow-sm"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="mt-1 cursor-move text-gray-400 hover:text-gray-600"
            title="اسحب لإعادة الترتيب"
          >
            <GripVertical className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <h4 className="font-semibold text-gray-900">{title}</h4>
                {(hasNewConditions || hasSimplifiedConditions || hasOperatorBasedConditions) && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                    شرطي
                  </span>
                )}
                {hasLegacyConditions && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded">
                    صيغة قديمة
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConditions(!showConditions)}
                  className={`p-2 rounded transition-colors ${
                    hasConditions
                      ? 'text-blue-600 hover:bg-blue-50'
                      : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                  }`}
                  title="الشروط"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 text-gray-400 hover:text-[#276073] hover:bg-gray-50 rounded"
                >
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(index)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                {children}
              </div>
            )}

            {showConditions && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <ConditionalLogicBuilder
                  value={item.conditions || {}}
                  availableFields={availableFields}
                  onChange={handleConditionsChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraggableItem;
