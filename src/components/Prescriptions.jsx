import React from 'react';
import { FaPills, FaUserMd, FaCalendarAlt, FaNotesMedical } from 'react-icons/fa';
import { GiHealthNormal } from 'react-icons/gi';

const Prescriptions = ({ prescriptions }) => {
  return (
    <div className="bg-white flex flex-col items-center gap-2 rounded-xl shadow-sm p-6">
     <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <FaPills className="text-indigo-600 mr-3" />
          My Medications
        </h2>
      {/* Header with filter tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex flex-wrap gap-2">
          {['All', 'Active', 'Completed', 'Expired'].map((filter) => (
            <button
              key={filter}
              className={`px-3 py-1 text-sm rounded-full capitalize ${
                filter === 'All'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {prescriptions.length === 0 ? (
        <div className="text-center py-10">
          <GiHealthNormal className="mx-auto text-5xl text-gray-300 mb-4" />
          <p className="text-gray-500">No prescriptions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Card header */}
              <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-medium text-gray-800">{prescription.medicationName}</h3>
                <span className={`px-3 py-1 text-xs rounded-full capitalize ${
                  prescription.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : prescription.status === 'completed'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {prescription.status}
                </span>
              </div>

              {/* Card body */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left column */}
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <FaUserMd className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Prescribed by</p>
                        <p className="text-sm">Dr. {prescription.doctorName}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FaCalendarAlt className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Dates</p>
                        <p className="text-sm">
                          {new Date(prescription.datePrescribed).toLocaleDateString()} - {' '}
                          {new Date(prescription.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <FaPills className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Dosage</p>
                        <p className="text-sm">
                          {prescription.dosage} • {prescription.frequency}
                        </p>
                      </div>
                    </div>

                    {prescription.instructions && (
                      <div className="flex items-start">
                        <FaNotesMedical className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Instructions</p>
                          <p className="text-sm">{prescription.instructions}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card footer with actions */}
              <div className="flex justify-end p-3 bg-gray-50 border-t border-gray-200 gap-3">
                <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">
                  Request Refill
                </button>
                <button className="px-4 py-2 bg-white text-indigo-600 text-sm border border-indigo-600 rounded-md hover:bg-indigo-50">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;