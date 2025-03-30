// components/Calendar.jsx
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'react-feather';

function Calendar() {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(now);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate days array dynamically with useMemo for performance
  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    // Previous month's days (to fill the first row)
    const prevMonthDays = [];
    const daysFromPrevMonth = (firstDayOfMonth + 6) % 7; 
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    for (let i = daysFromPrevMonth; i > 0; i--) {
      prevMonthDays.push({
        day: prevMonthLastDay - i + 1,
        isCurrentMonth: false,
        isToday: false,
        date: new Date(year, month - 1, prevMonthLastDay - i + 1)
      });
    }
    
    // Current month's days
    const currentMonthDays = [];
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      currentMonthDays.push({
        day: i,
        isCurrentMonth: true,
        isToday: date.getDate() === today.getDate() && 
                 date.getMonth() === today.getMonth() && 
                 date.getFullYear() === today.getFullYear(),
        date: date
      });
    }
    
    // Next month's days (to fill the last row)
    const totalCells = prevMonthDays.length + currentMonthDays.length;
    const nextMonthDaysCount = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
    const nextMonthDays = [];
    
    for (let i = 1; i <= nextMonthDaysCount; i++) {
      nextMonthDays.push({
        day: i,
        isCurrentMonth: false,
        isToday: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [currentDate]);

  const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden w-full">
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <button 
          onClick={handlePrevMonth}
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold text-gray-800">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button 
          onClick={handleNextMonth}
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center p-2 bg-gray-50">
        {weekdays.map((day, index) => (
          <div key={index} className="font-medium text-gray-500 text-sm p-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="p-2">
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((dayObj, index) => (
            <button
              key={index}
              onClick={() => dayObj.isCurrentMonth && setSelectedDate(dayObj.date)}
              className={`p-2 rounded-full text-sm
                ${!dayObj.isCurrentMonth ? 'text-gray-400' : 'text-gray-800'}
                ${isSameDay(dayObj.date, selectedDate) ? 'bg-indigo-600 text-white font-medium' : ''}
                ${dayObj.isToday ? 'border border-blue-600' : ''}
                ${dayObj.isCurrentMonth ? 'hover:bg-blue-900' : ''}
              `}
              disabled={!dayObj.isCurrentMonth}
              aria-label={`${dayObj.isCurrentMonth ? months[currentDate.getMonth()] : 
                dayObj.date.getMonth() < currentDate.getMonth() ? 
                months[currentDate.getMonth() - 1] : months[currentDate.getMonth() + 1]} 
                ${dayObj.day}, ${dayObj.date.getFullYear()}`}
            >
              {dayObj.day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Calendar;