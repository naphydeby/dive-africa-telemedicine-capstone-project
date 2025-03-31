
import React, { useEffect, useState } from "react";
import { auth, db } from "/src/firebase/firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { CalendarDaysIcon, ClockIcon, UserIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import DoctorSidebar from "../../components/DoctorSidebar";

const ViewAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  const [filter, setFilter] = useState("upcoming");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to view appointments.");
        setLoading(false);
        return;
      }

      try {
        // Fetch the user's role from Firestore
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          setError("User data not found.");
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        setUserRole(userData.role);

        const appointmentsRef = collection(db, "appointments");
        let q;

        if (userData.role === "doctor") {
          q = query(appointmentsRef, where("doctorId", "==", user.uid));
        } else if (userData.role === "patient") {
          q = query(appointmentsRef, where("patientId", "==", user.uid));
        } else {
          setError("Invalid user role.");
          setLoading(false);
          return;
        }

        const querySnapshot = await getDocs(q);
        const appointmentsData = [];
        
        querySnapshot.forEach((doc) => {
          const appointment = { id: doc.id, ...doc.data() };
          
          if (appointment.timestamp?.toDate) {
            appointment.dateTime = appointment.timestamp.toDate();
          }
          appointmentsData.push(appointment);
        });

        // Sort appointments by date
        appointmentsData.sort((a, b) => a.dateTime - b.dateTime);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error("Error fetching appointments: ", error);
        setError("Failed to fetch appointments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filterAppointments = () => {
    const now = new Date();
    return appointments.filter(appointment => {
      if (!appointment.dateTime) return false;
      
      if (filter === "upcoming") {
        return appointment.dateTime >= now;
      } else if (filter === "past") {
        return appointment.dateTime < now;
      }
      return true;
    });
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredAppointments = filterAppointments();

  return (
    <div className="flex h-screen">
     <DoctorSidebar/>
    
    <div className="lg:w-3/4 p-5">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg mt-8 lg:mt-0 p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {userRole === "doctor" ? "My Appointments" : "My Bookings"}
            </h1>
            <p className="text-purple-100 mt-1">
              {filteredAppointments.length} {filter} appointment{filteredAppointments.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="inline-flex rounded-md shadow-sm mt-4 md:mt-0" role="patient">
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                filter === "upcoming" 
                  ? 'bg-white text-purple-600' 
                  : 'bg-purple-700 text-white hover:bg-purple-800'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                filter === "past" 
                  ? 'bg-white text-purple-600' 
                  : 'bg-purple-700 text-white hover:bg-purple-800'
              }`}
            >
              Past
            </button>
          </div>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No appointments found</h3>
          <p className="mt-1 text-gray-500">
            You don't have any {filter} appointments scheduled yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAppointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedAppointment(appointment)}
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg">
                      <CalendarDaysIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {userRole === "doctor" ? appointment.patientName : appointment.doctorName}
                      </h3>
                      <p className="text-gray-500">
                        {userRole === "doctor" ? "Patient" : "Doctor"} Appointment
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                      <span>{formatTime(appointment.dateTime)}</span>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                    <span>{formatDate(appointment.dateTime)}</span>
                  </div>
                  
                  {appointment.notes && (
                    <div className="flex items-start space-x-2 text-gray-600">
                      <ClipboardDocumentIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <span className="line-clamp-1">{appointment.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900">Appointment Details</h3>
                <button 
                  onClick={() => setSelectedAppointment(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <UserIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{userRole === "doctor" ? "Patient" : "Doctor"}</p>
                    <p className="font-medium text-gray-900">
                      {userRole === "doctor" ? selectedAppointment.patientName : selectedAppointment.doctorName}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <CalendarDaysIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(selectedAppointment.dateTime)} at {formatTime(selectedAppointment.dateTime)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                        {selectedAppointment.status}
                      </span>
                    </p>
                  </div>
                </div>
                
                {selectedAppointment.notes && (
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <ClipboardDocumentIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="font-medium text-gray-900 whitespace-pre-line">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  onClick={() => setSelectedAppointment(null)}
                >
                  Close
                </button>
                {selectedAppointment.status.toLowerCase() === 'confirmed' && (
                  <button
                    type="button"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default ViewAppointment;


