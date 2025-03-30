
import React from 'react';

const StatsCards = ({ icon, title, value, subtitle }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center">
        {/* Icon Container */}
        <div className="p-3 bg-blue-100 rounded-full mr-4">
          {icon}
        </div>
        {/* Text */}
        <div>
        <p className="text-gray-700">{title}</p>
         <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-gray-500 text-sm">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;