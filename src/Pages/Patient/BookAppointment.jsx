
import React, { useState, useEffect } from "react";
import { auth, db } from "/src/firebase/firebaseConfig";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { CalendarIcon, ClockIcon, UserIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import PatientSidebar from "../../components/PatientSidebar";

const BookAppointment = () => {
  const [formData, setFormData] = useState({
    doctorName: "",
    date: "",
    time: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [isDoctorListOpen, setIsDoctorListOpen] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsRef = collection(db, "users");
        const q = query(doctorsRef, where("role", "==", "doctor"));
        const querySnapshot = await getDocs(q);
        
        const doctorsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setDoctors(doctorsList);
      } catch (error) {
        console.error("Error fetching doctors: ", error);
      }
    };

    fetchDoctors();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDoctorSelect = (doctor) => {
    setFormData({ ...formData, doctorName: doctor.fullName });
    setIsDoctorListOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      setError("You must be logged in to book an appointment.");
      return;
    }

    if (!formData.doctorName || !formData.date || !formData.time) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Find the selected doctor
      const selectedDoctor = doctors.find(doc => doc.fullName === formData.doctorName);
      
      if (!selectedDoctor) {
        throw new Error("Selected doctor not found.");
      }

      // Save the appointment to Firestore
      await addDoc(collection(db, "appointments"), {
        patientId: user.uid,
        patientName: user.displayName || "Anonymous",
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.fullName,
        date: formData.date,
        time: formData.time,
        notes: formData.notes,
        status: "pending",
        createdAt: new Date(),
      });

      setSuccess("Appointment booked successfully!");
      setFormData({ 
        doctorName: "", 
        date: "", 
        time: "",
        notes: ""
      });
    } catch (error) {
      console.error("Error booking appointment: ", error);
      setError(`Failed to book appointment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
 

  return (
    <div className="flex h-screen" >
      <PatientSidebar/>
   
    <div className=" w-full lg:w-3/4 p-5 bg-white rounded-xl shadow-md mt-8 lg:mt-0 py-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Book an Appointment</h2>
        <p className="text-gray-600 mt-2">Schedule your consultation with our specialists</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Doctor Selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Doctor <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="doctorName"
              placeholder="Search for a doctor..."
              value={formData.doctorName}
              onChange={handleInputChange}
              onFocus={() => setIsDoctorListOpen(true)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent"
              required
            />
            {isDoctorListOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg focus:outline-none shadow-lg max-h-60 overflow-auto custom-scrollbar">
                {doctors.map(doctor => (
                  <div
                    key={doctor.id}
                    className="p-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-full mr-3">
                        <UserIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{doctor.fullName}</p>
                        <p className="text-sm text-gray-500">{doctor.specialization || "General Practitioner"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ClockIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            name="notes"
            placeholder="Any specific concerns or details..."
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex justify-center items-center"
          >
            {loading ? (
              <>
              <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
                Booking Appointment...
              </>
            ) : (
              "Book Appointment"
            )}
          </button>
        </div>
      </form>
    </div>
    </div>
  );
};

export default BookAppointment;