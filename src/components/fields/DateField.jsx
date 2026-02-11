import React, { useState, useEffect } from 'react';
import { AlertCircle, Calendar, ChevronDown } from 'lucide-react';

const DateField = ({ field, value, error, onChange }) => {
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Initialize from existing value
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDay(date.getDate().toString().padStart(2, '0'));
        setSelectedMonth((date.getMonth() + 1).toString().padStart(2, '0'));
        setSelectedYear(date.getFullYear().toString());
      }
    }
  }, [value]);

  const months = [
    { value: '01', label: 'يناير' },
    { value: '02', label: 'فبراير' },
    { value: '03', label: 'مارس' },
    { value: '04', label: 'أبريل' },
    { value: '05', label: 'مايو' },
    { value: '06', label: 'يونيو' },
    { value: '07', label: 'يوليو' },
    { value: '08', label: 'أغسطس' },
    { value: '09', label: 'سبتمبر' },
    { value: '10', label: 'أكتوبر' },
    { value: '11', label: 'نوفمبر' },
    { value: '12', label: 'ديسمبر' }
  ];

  // Generate days (1-31)
  const days = Array.from({ length: 31 }, (_, i) => {
    const day = (i + 1).toString().padStart(2, '0');
    return { value: day, label: day };
  });

  // Generate years (current year - 100 to current year + 10)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 111 }, (_, i) => {
    const year = (currentYear + 10 - i).toString();
    return { value: year, label: year };
  });

  const updateDate = (day, month, year) => {
    if (day && month && year) {
      const dateString = `${year}-${month}-${day}`;
      onChange(dateString);
    } else {
      onChange('');
    }
  };

  const handleDayChange = (day) => {
    setSelectedDay(day);
    updateDate(day, selectedMonth, selectedYear);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    updateDate(selectedDay, month, selectedYear);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    updateDate(selectedDay, selectedMonth, year);
  };

  const formatDateForDisplay = () => {
    if (!selectedDay || !selectedMonth || !selectedYear) return '';
    const monthName = months.find(m => m.value === selectedMonth)?.label || '';
    return `${selectedDay} ${monthName} ${selectedYear}`;
  };

  return (
    <div className="md:col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 mr-1">*</span>}
      </label>
      
      {/* Date Display */}
      {selectedDay && selectedMonth && selectedYear && (
        <div className="mb-3 p-3 bg-[#276073]/10 border border-[#276073]/20 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-[#276073]">
            <Calendar className="w-4 h-4" />
            <span className="font-semibold">{formatDateForDisplay()}</span>
          </div>
        </div>
      )}

      {/* Date Selectors */}
      <div className="grid grid-cols-3 gap-3">
        {/* Day Selector */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">اليوم</label>
          <div className="relative">
            <select
              value={selectedDay}
              onChange={(e) => handleDayChange(e.target.value)}
              className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 appearance-none bg-white text-center font-medium ${
                error ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">يوم</option>
              {days.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-2 rtl:left-auto rtl:right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Month Selector */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">الشهر</label>
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 appearance-none bg-white text-center font-medium ${
                error ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">شهر</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-2 rtl:left-auto rtl:right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Year Selector */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">السنة</label>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 appearance-none bg-white text-center font-medium ${
                error ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">سنة</option>
              {years.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-2 rtl:left-auto rtl:right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2 rtl:space-x-reverse mt-3">
        <button
          type="button"
          onClick={() => {
            const today = new Date();
            const day = today.getDate().toString().padStart(2, '0');
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const year = today.getFullYear().toString();
            setSelectedDay(day);
            setSelectedMonth(month);
            setSelectedYear(year);
            updateDate(day, month, year);
          }}
          className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          اليوم
        </button>
        
        <button
          type="button"
          onClick={() => {
            setSelectedDay('');
            setSelectedMonth('');
            setSelectedYear('');
            onChange('');
          }}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          مسح
        </button>
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

export default DateField;