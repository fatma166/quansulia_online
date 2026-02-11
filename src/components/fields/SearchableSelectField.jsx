import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, ChevronDown, Search } from 'lucide-react';
import { poaSubtypes, declarationSubtypes } from '../../data/serviceSubtypes';

const parseOptions = (options) => {
  if (!options) return [];
  if (Array.isArray(options)) return options;
  if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse options:', options, e);
      return [];
    }
  }
  return [];
};

const SearchableSelectField = ({ field, value, error, onChange, serviceId, onPOASubtypeChange, formData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOptions, setHasLoadedOptions] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Simulate lazy loading with delay
  const loadOptions = async (searchQuery = '') => {
    // For declaration subtype field, load options dynamically based on declaration type
    if (field.name === 'declarationSubtype' && serviceId === 'declarations') {
      const declarationType = formData?.declarationType;
      if (!declarationType) {
        setFilteredOptions([]);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Get subtypes from declarationSubtypes
        const subtypes = declarationSubtypes[declarationType] || [];
        
        const filtered = subtypes.filter(option =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (option.description && option.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        
        setFilteredOptions(filtered);
        setHasLoadedOptions(true);
      } catch (error) {
        console.error('Error loading declaration subtypes:', error);
        setFilteredOptions([]);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    // For POA subtype field, load options dynamically based on POA type
    if (field.name === 'poaSubtype' && serviceId === 'powerOfAttorney') {
      const poaType = formData?.poaType;
      if (!poaType) {
        setFilteredOptions([]);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Ajax call to load POA subtypes
        const response = await fetch('/src/data/poaFields.json', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const poaData = await response.json();
        const subtypes = poaSubtypes[poaType] || [];
        
        const filtered = subtypes.filter(option =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (option.description && option.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        
        setFilteredOptions(filtered);
        setHasLoadedOptions(true);
      } catch (error) {
        console.error('Error loading POA subtypes:', error);
        setFilteredOptions([]);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const options = parseOptions(field.options);
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (option.description && option.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setFilteredOptions(filtered);
    setIsLoading(false);
  };

  useEffect(() => {
    // Only load options if we have field options or it's a POA subtype field
    const fieldOptions = parseOptions(field.options);
    if (fieldOptions.length > 0) {
      loadOptions(searchTerm);
    } else if (field.name === 'declarationSubtype' && serviceId === 'declarations') {
      loadOptions(searchTerm);
    } else if (field.name === 'poaSubtype' && serviceId === 'powerOfAttorney') {
      loadOptions(searchTerm);
    }
  }, [searchTerm, field.options, serviceId, formData?.poaType, formData?.declarationType]);

  // Initial load
  useEffect(() => {
    const fieldOptions = parseOptions(field.options);
    if (fieldOptions.length > 0) {
      loadOptions();
    } else if (field.name === 'declarationSubtype' && serviceId === 'declarations') {
      loadOptions();
    } else if (field.name === 'poaSubtype' && serviceId === 'powerOfAttorney') {
      loadOptions();
    }
  }, [serviceId, formData?.poaType, formData?.declarationType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option.value);
    
    // Call parent handler for POA subtype changes
    if (field.name === 'poaSubtype' && onPOASubtypeChange) {
      onPOASubtypeChange(option.value);
    }
    
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const getOptionLabel = (option) => {
    return option?.label_ar || option?.label || option?.value || '';
  };

  const fieldOptions = parseOptions(field.options);
  const selectedOption = fieldOptions.find(opt => opt.value === value);

  return (
    <div className="md:col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 mr-1">*</span>}
      </label>

      <div className="relative" ref={dropdownRef}>
        <div
          className={`w-full px-4 py-3 border rounded-lg focus-within:ring-2 focus-within:ring-[#276073] focus-within:border-transparent transition-all duration-200 cursor-pointer ${
            error ? 'border-red-500 bg-red-50' :
            field.disabled ? 'border-gray-200 bg-gray-100 cursor-not-allowed' :
            'border-gray-300 bg-white hover:border-gray-400'
          }`}
          onClick={() => !field.disabled && setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <span className={`${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
              {selectedOption ? getOptionLabel(selectedOption) :
               field.placeholder || 'اختر...'}
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          {selectedOption && selectedOption.description && (
            <p className="text-xs text-gray-500 mt-1">{selectedOption.description}</p>
          )}
        </div>

        {isOpen && !field.disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="ابحث..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none text-sm"
                  autoFocus
                />
                {isLoading && (
                  <div className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-[#276073] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-8 text-center">
                  <div className="w-8 h-8 border-2 border-[#276073] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">
                    {field.name === 'poaSubtype' ? 'جاري تحميل أنواع التوكيل...' : 'جاري البحث...'}
                  </p>
                </div>
              ) : filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 ${
                      option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    <div>
                      <div className="font-medium">{getOptionLabel(option)}</div>
                      {option.description && (
                        <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  <p className="text-sm">لا توجد نتائج</p>
                  <p className="text-xs mt-1">جرب كلمات بحث أخرى</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {field.help && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">{field.help}</p>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center space-x-2 rtl:space-x-reverse text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{Array.isArray(error) ? error[0] : error}</span>
        </div>
      )}
    </div>
  );
};

export default SearchableSelectField;