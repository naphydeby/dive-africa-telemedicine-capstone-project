
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "/src/firebase/firebaseConfig";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import DoctorSidebar from "../../components/DoctorSidebar";
import { FaExclamationTriangle, FaExternalLinkAlt, FaUser, FaEnvelope, FaPhone, FaChevronRight } from "react-icons/fa";

const Patient = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const fetchPatients = async () => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        setError("Authentication required. Please login.");
        setLoading(false);
        return;
      }

      const patientsRef = collection(db, "users");
      let q;
      let needsManualSort = false;
      
      try {
        // First try the full query with ordering
        q = query(
          patientsRef,
          where("role", "==", "patient"),
          orderBy("fullName")
        );
        // Test the query
        await getDocs(q);
      } catch (indexError) {
        if (indexError.message.includes("index")) {
          console.warn("Index not ready, falling back to simple query");
          needsManualSort = true;
          q = query(
            patientsRef,
            where("role", "==", "patient")
          );
        } else {
          throw indexError;
        }
      }

      const querySnapshot = await getDocs(q);
      let patientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Manual sorting if we couldn't use orderBy
      if (needsManualSort) {
        patientsData = patientsData.sort((a, b) => 
          (a.fullName || "").localeCompare(b.fullName || "")
        );
      }

      setPatients(patientsData);
      setError(null);
    } catch (error) {
      console.error("Fetch error:", error);
      let errorMsg = error.message;
      
      if (error.message.includes("index")) {
        const indexUrl = error.message.match(/https:\/\/[^\s]+/)?.[0];
        errorMsg = (
          <div className="space-y-2">
            <p>Database needs configuration for this query.</p>
            {indexUrl && (
              <a 
                href={indexUrl} 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <FaExternalLinkAlt className="mr-1" />
                Click here to create required index
              </a>
            )}
            <p className="text-sm text-gray-600">
              This may take 2-10 minutes to activate after creation.
            </p>
          </div>
        );
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    (patient.fullName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchPatients();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorSidebar />
      
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className=" text-2xl lg:text-3xl font-bold text-gray-800 mb-6 mt-6 lg:mt-0">Patient Management</h1>
          
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <input
              type="text"
              placeholder="Search patients by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <div className="text-sm text-red-700">
                    {error}
                  </div>
                  <button
                    onClick={handleRetry}
                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {!error && filteredPatients.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <p className="text-gray-500 text-lg">
                {searchTerm ? "No matching patients found" : "No patients available"}
              </p>
              {patients.length > 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  Your search didn't match any of the {patients.length} patients.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map(patient => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const PatientCard = ({ patient }) => (
  <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition">
    <div className="flex items-start space-x-4 mb-4">
      <div className="bg-blue-100 text-blue-800 rounded-full p-3">
        <FaUser className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          {patient.fullName || "Unknown Patient"}
        </h2>
        <p className="text-gray-600 text-sm">ID: {patient.id?.substring(0, 8)}...</p>
      </div>
    </div>
    
    <div className="space-y-2 text-sm text-gray-600 mb-4">
      <p className="flex items-center">
        <FaEnvelope className="h-4 w-4 mr-2" />
        {patient.email || "No email provided"}
      </p>
      {patient.phoneNumber && (
        <p className="flex items-center">
          <FaPhone className="h-4 w-4 mr-2" />
          {patient.phoneNumber}
        </p>
      )}
    </div>
    
    <Link
      to={`/patientmedicalhistory`}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
    >
      View Medical Records
      <FaChevronRight className="h-4 w-4 ml-2" />
    </Link>
  </div>
);

export default Patient;