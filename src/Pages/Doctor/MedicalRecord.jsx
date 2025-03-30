import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "/src/firebase/firebaseConfig";
import { collection, query, where, addDoc, getDocs } from "firebase/firestore";
import DoctorSidebar from '../../components/DoctorSidebar';

const MedicalReport = () => {
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRecord, setNewRecord] = useState({
    patientId: "",
    date: "",
    description: "",
    patientName: "",
    doctorName: "",
  });

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const medicalHistoryRef = collection(db, "medicalHistory");
          const q = query(medicalHistoryRef, where("doctorId", "==", user.uid));
          const querySnapshot = await getDocs(q);

          const historyData = [];
          querySnapshot.forEach((doc) => {
            historyData.push({ id: doc.id, ...doc.data() });
          });

          setMedicalHistory(historyData);
        } catch (error) {
          console.error("Error fetching medical history: ", error);
        }
      }
      setLoading(false);
    };

    fetchMedicalHistory();
  }, []);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      try {
        await addDoc(collection(db, "medicalHistory"), {
          patientId: newRecord.patientId,
          doctorId: user.uid,
          date: newRecord.date,
          description: newRecord.description,
          patientName: newRecord.patientName,
          doctorName: newRecord.doctorName,
        });
        setNewRecord({ patientId: "", date: "", description: "", patientName: "", doctorName: "" });
        alert("Medical record added successfully!");

        // Refetch medical history to update the UI
        const medicalHistoryRef = collection(db, "medicalHistory");
        const q = query(medicalHistoryRef, where("doctorId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const historyData = [];
        querySnapshot.forEach((doc) => {
          historyData.push({ id: doc.id, ...doc.data() });
        });

        setMedicalHistory(historyData);
      } catch (error) {
        console.error("Error adding medical record: ", error);
        alert("Failed to add medical record.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
    <DoctorSidebar />
     
      {/* Main Content */}
      <div className="lg:w-3/4 p-5">
        <h1 className=" text-2xl lg:text-3xl font-bold mt-8 lg:mt-0 mb-5 text-center">Medical History</h1>
        {medicalHistory.length === 0 ? (
          <p className="text-center">No medical history found.</p>
        ) : (
          <div className="space-y-4">
            {medicalHistory.map((record) => (
              <div key={record.id} className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">{record.date}</h2>
                <p className="text-gray-700">{record.description}</p>
                <p className="text-sm text-gray-500">Patient: {record.patientName}</p>
                <p className="text-sm text-gray-500">Doctor: {record.doctorName}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Medical Record Form */}

        <div className="mt-8">
         
          <h2 className="text-2xl font-bold mb-5">Add Medical Record</h2>
          <form onSubmit={handleAddRecord} className="space-y-4">
            <input
              type="text"
              placeholder="Patient ID"
              value={newRecord.patientId}
              onChange={(e) => setNewRecord({ ...newRecord, patientId: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Patient Name"
              value={newRecord.patientName}
              onChange={(e) => setNewRecord({ ...newRecord, patientName: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="date"
              placeholder="Date"
              value={newRecord.date}
              onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <textarea
              placeholder="Description"
              value={newRecord.description}
              onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Doctor Name"
              value={newRecord.doctorName}
              onChange={(e) => setNewRecord({ ...newRecord, doctorName: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <button
              type="submit"
              className="bg-blue-900 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Add Record
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MedicalReport;