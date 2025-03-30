import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "/src/firebase/firebaseConfig";

const Doctor = ({ onSelectDoctor }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "doctor"));
        const querySnapshot = await getDocs(q);
        const doctorsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading doctors...</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-3">Find a Doctor</h3>
      <input
        type="text"
        placeholder="Search by name or specialty..."
        className="w-full p-2 border rounded mb-3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="max-h-60 overflow-y-auto">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map(doctor => (
            <div 
              key={doctor.id} 
              className="p-3 border-b hover:bg-gray-50 cursor-pointer flex items-center"
              onClick={() => onSelectDoctor(doctor)}
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                {doctor.fullName.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{doctor.fullName}</p>
                <p className="text-sm text-gray-600">{doctor.specialization}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 p-3">No doctors found</p>
        )}
      </div>
    </div>
  );
};

export default Doctor;