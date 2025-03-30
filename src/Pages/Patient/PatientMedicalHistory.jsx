import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "/src/firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import PatientSidebar from "../../components/PatientSidebar";

const PatientMedicalHistory = () => {
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Fetch medical history for the logged-in patient
          const medicalHistoryRef = collection(db, "medicalHistory");
          const q = query(medicalHistoryRef, where("patientId", "==", user.uid));
          const querySnapshot = await getDocs(q);

          const historyData = [];
          querySnapshot.forEach((doc) => {
            historyData.push({ id: doc.id, ...doc.data() });
          });

          setMedicalHistory(historyData);
        } catch (error) {
          console.error("Error fetching medical history: ", error);
          setError("Failed to fetch medical history. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMedicalHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <PatientSidebar/>
      {/* Main Content */}
      <div className="w-full lg:w-3/4 p-5 mt-10 lg:mt-0">
        <h1 className="text-3xl font-bold mb-5">Medical History</h1>
        {medicalHistory.length === 0 ? (
          <p>No medical history found.</p>
        ) : (
          <div className="space-y-4">
            {medicalHistory.map((record) => (
              <div key={record.id} className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">{record.date}</h2>
                <p className="text-gray-700">{record.description}</p>
                <p className="text-sm text-gray-500">Doctor: {record.doctorName}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientMedicalHistory;