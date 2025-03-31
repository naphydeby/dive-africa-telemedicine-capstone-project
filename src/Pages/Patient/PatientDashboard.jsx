
// import React, { useState, useEffect } from 'react';
// import { 
//   FaUserMd, 
//   FaCalendarCheck, 
//   FaPrescriptionBottleAlt, 
//   FaCalendarAlt,
//   FaStar,
//   FaSearch
// } from 'react-icons/fa';
// import { AiOutlineMessage, AiOutlineClockCircle } from 'react-icons/ai';
// import PatientSidebar from '../../components/PatientSidebar';
// import Calendar from '../../components/Calendar';
// import StatsCards from '../../components/StatsCards';
// import UpcomingAppointment from '../../components/UpcomingAppointment';
// import Prescriptions from '../../components/Prescriptions';

// import ReviewForm from '../../components/ReviewForm';
// import { 
//   auth, 
//   db, 
//   collection, 
//   query, 
//   where, 
//   onSnapshot, 
//   getDocs,
//   doc,
//   getDoc
// } from "/src/firebase/firebaseConfig";

// const PatientDashboard = () => {
//   const [state, setState] = useState({
//     userData: null,
//     loading: true,
//     error: null,
//     appointments: [],
//     prescriptions: [],
//     doctors: [],
//     showDoctorSelection: false,
//     showReviewModal: false,
//     selectedDoctor: null,
//     searchTerm: ''
//   });

//   // Fetch initial data
//   useEffect(() => {
//     const user = auth.currentUser;
//     if (!user) return;

//     const fetchInitialData = async () => {
//       try {
//         // Fetch user data
//         const userDoc = await getDoc(doc(db, "users", user.uid));
//         if (userDoc.exists()) {
//           setState(prev => ({ ...prev, userData: userDoc.data() }));
//         }

//         // Fetch doctors
//         const doctorsQuery = query(collection(db, "users"), where("role", "==", "doctor"));
//         const doctorsSnapshot = await getDocs(doctorsQuery);
//         const doctorsData = doctorsSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setState(prev => ({ ...prev, doctors: doctorsData }));
//       } catch (error) {
//         console.error("Error fetching initial data:", error);
//         setState(prev => ({ ...prev, error: "Failed to load data" }));
//       } finally {
//         setState(prev => ({ ...prev, loading: false }));
//       }
//     };

//     fetchInitialData();

//     // Set up real-time listeners
//     const unsubscribeFunctions = [];

//     // Appointments listener
//     const appointmentsQuery = query(
//       collection(db, "appointments"),
//       where("patientId", "==", user.uid)
//     );
//     const unsubscribeAppointments = onSnapshot(appointmentsQuery, 
//       (snapshot) => {
//         setState(prev => ({
//           ...prev,
//           appointments: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
//         }));
//       },
//       (error) => {
//         console.error("Error loading appointments:", error);
//         setState(prev => ({ ...prev, error: "Failed to load appointments" }));
//       }
//     );
//     unsubscribeFunctions.push(unsubscribeAppointments);

//     // Prescriptions listener
//     const prescriptionsQuery = query(
//       collection(db, "prescriptions"),
//       where("patientId", "==", user.uid)
//     );
//     const unsubscribePrescriptions = onSnapshot(prescriptionsQuery, 
//       (snapshot) => {
//         setState(prev => ({
//           ...prev,
//           prescriptions: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
//         }));
//       },
//       (error) => {
//         console.error("Error loading prescriptions:", error);
//         setState(prev => ({ ...prev, error: "Failed to load prescriptions" }));
//       }
//     );
//     unsubscribeFunctions.push(unsubscribePrescriptions);

//     return () => unsubscribeFunctions.forEach(unsub => unsub());
//   }, []);

//   // Derived data
//   const activeDoctors = new Set(state.appointments.map(app => app.doctorId)).size;
//   const doctorsToReview = state.appointments
//     .filter(a => a.status === "completed" && !a.reviewed)
//     .map(a => ({
//       appointmentId: a.id,
//       doctorId: a.doctorId,
//       doctorName: a.doctorName,
//       date: a.date
//     }));

//   const filteredDoctors = state.doctors.filter(doctor =>
//     doctor.fullName?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
//     doctor.specialization?.toLowerCase().includes(state.searchTerm.toLowerCase())
//   );

//   const upcomingAppointments = state.appointments
//     .filter(a => a.status === "approved" && new Date(a.date) >= new Date())
//     .sort((a, b) => new Date(a.date) - new Date(b.date));

//   const pendingAppointments = state.appointments.filter(a => a.status === "pending");
//   const activePrescriptions = state.prescriptions.filter(p => p.status === "active");

//   // Handlers
//   const handleSelectDoctor = (doctor) => {
//     setState(prev => ({
//       ...prev,
//       selectedDoctor: doctor,
//       showDoctorSelection: false,
//       showReviewModal: true
//     }));
//   };

//   const handleReviewSubmitted = async (appointmentId) => {
//     if (!appointmentId) return;
    
//     try {
//       await updateDoc(doc(db, "appointments", appointmentId), {
//         reviewed: true
//       });
//     } catch (error) {
//       console.error("Error marking appointment as reviewed:", error);
//     }
//   };

//   const handleAppointmentAction = async (action, appointmentId, newDate = null) => {
//     try {
//       const updateData = {};
//       switch (action) {
//         case 'cancel':
//           updateData.status = "cancelled";
//           break;
//         case 'reschedule':
//           updateData.date = newDate.toISOString();
//           updateData.status = "pending";
//           break;
//         default:
//           return;
//       }

//       await updateDoc(doc(db, "appointments", appointmentId), updateData);
//     } catch (error) {
//       console.error(`Error ${action}ing appointment:`, error);
//       setState(prev => ({ ...prev, error: `Failed to ${action} appointment` }));
//     }
//   };

//   const handleStartVideo = (appointment) => {
//     console.log('Starting video call for:', appointment);
//     // Implement video call functionality here
//   };

//   if (state.loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen">
//       <PatientSidebar />
      
//       <div className="w-full md:w-3/4 p-4 md:p-10 overflow-y-auto">
//         {/* Error Display */}
//         {state.error && (
//           <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
//             <div className="flex items-center">
//               <div>
//                 <p className="font-bold text-red-800">Error</p>
//                 <p className="text-red-600">{state.error}</p>
//                 <button 
//                   onClick={() => setState(prev => ({ ...prev, error: null }))}
//                   className="text-red-700 underline mt-1"
//                 >
//                   Dismiss
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         <div className="bg-white rounded-lg p-6 mb-6 mt-8 lg:mt-0 shadow">
//           <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
//             Welcome, {state.userData?.fullName || "Patient"}
//           </h1>
//           <p className="text-gray-600 mt-1">
//             Manage your healthcare in one place
//           </p>
//         </div>

//         {/* Review Prompt */}
//         {doctorsToReview.length > 0 && (
//           <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
//             <div className="flex items-center">
//               <FaStar className="text-yellow-500 mr-2 text-xl" />
//               <div>
//                 <p className="font-bold text-yellow-800">You have {doctorsToReview.length} doctor(s) to review</p>
//                 <button 
//                   onClick={() => setState(prev => ({
//                     ...prev,
//                     showReviewModal: true,
//                     selectedDoctor: {
//                       id: doctorsToReview[0].doctorId,
//                       fullName: doctorsToReview[0].doctorName
//                     }
//                   }))}
//                   className="text-yellow-700 underline mt-1"
//                 >
//                   Leave a review now
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Review Doctor Button */}
//         <button
//           onClick={() => setState(prev => ({ ...prev, showDoctorSelection: true }))}
//           className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 hover:bg-blue-700 transition"
//         >
//           <FaStar className="mr-2" />
//           Review a Doctor
//         </button>

//         {/* Dashboard Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {/* Stats Cards */}
//           <StatsCards 
//             icon={<FaUserMd className="text-2xl text-blue-600" />}
//             title="My Doctors" 
//             value={activeDoctors}
//             subtitle="Healthcare providers"
//           />
//           <StatsCards 
//             icon={<FaCalendarCheck className="text-2xl text-green-600" />}
//             title="Upcoming Visits"
//             value={upcomingAppointments.length}
//             subtitle="Scheduled appointments"
//           />
//           <StatsCards 
//             icon={<FaPrescriptionBottleAlt className="text-2xl text-purple-600" />}
//             title="Active Medications"
//             value={activePrescriptions.length}
//             subtitle="Current prescriptions"
//           />

//           {/* Upcoming Appointments */}
//           <UpcomingAppointment
//             appointments={upcomingAppointments}
//             icon={<AiOutlineClockCircle className="text-xl mr-2" />}
//             onReschedule={(id, date) => handleAppointmentAction('reschedule', id, date)}
//             onCancel={(id) => handleAppointmentAction('cancel', id)}
//             onStartVideo={handleStartVideo}
//           />

//           {/* Prescriptions */}
//           <Prescriptions 
//             prescriptions={activePrescriptions}
//             icon={<FaPrescriptionBottleAlt className="text-xl mr-2" />}
//           />

          
         
//         </div>

//         {/* Calendar View */}
//         <div className="mt-6 bg-white p-4 rounded-lg shadow">
//           <div className="flex items-center mb-4">
//             <FaCalendarAlt className="text-xl mr-2 text-blue-900" />
//             <h2 className="text-xl font-bold">My Calendar</h2>
//           </div>
//           <Calendar appointments={state.appointments} />
//         </div>

//         {/* Doctor Selection Modal */}
//         {state.showDoctorSelection && (
//           <div className="fixed inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-bold">Select a Doctor to Review</h3>
//                 <button 
//                   onClick={() => setState(prev => ({ ...prev, showDoctorSelection: false }))}
//                   className="text-gray-500 hover:text-gray-700 text-xl"
//                 >
//                   &times;
//                 </button>
//               </div>
              
//               <div className="relative mb-4">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <FaSearch className="text-gray-400" />
//                 </div>
//                 <input
//                   type="text"
//                   placeholder="Search doctors by name or specialty..."
//                   className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   value={state.searchTerm}
//                   onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
//                 />
//               </div>
              
//               <div className="max-h-96 overflow-y-auto">
//                 {filteredDoctors.length > 0 ? (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {filteredDoctors.map(doctor => (
//                       <div 
//                         key={doctor.id} 
//                         className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
//                         onClick={() => handleSelectDoctor(doctor)}
//                       >
//                         <div className="flex items-center">
//                           <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600 font-bold">
//                             {doctor.fullName?.charAt(0) || 'D'}
//                           </div>
//                           <div>
//                             <p className="font-bold">{doctor.fullName || "Doctor"}</p>
//                             <p className="text-sm text-gray-600">{doctor.specialization || "General Practitioner"}</p>
//                             {doctor.averageRating && (
//                               <div className="flex items-center mt-1">
//                                 <FaStar className="text-yellow-400 mr-1" />
//                                 <span className="text-sm font-medium">
//                                   {doctor.averageRating.toFixed(1)} ({doctor.reviews || 0} reviews)
//                                 </span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 p-4 text-center">No doctors found matching your search</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Review Form Modal */}
//         {state.showReviewModal && state.selectedDoctor && (
//           <ReviewForm
//             doctor={state.selectedDoctor}
//             onClose={() => setState(prev => ({ ...prev, showReviewModal: false }))}
//             onReviewSubmitted={() => {
//               const appointmentToReview = doctorsToReview.find(
//                 d => d.doctorId === state.selectedDoctor.id
//               );
//               if (appointmentToReview) {
//                 handleReviewSubmitted(appointmentToReview.appointmentId);
//               }
//             }}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default PatientDashboard;

import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUserMd, 
  FaCalendarCheck, 
  FaPrescriptionBottleAlt, 
  FaCalendarAlt,
  FaStar,
  FaSearch,
  FaVideo,
  FaPhoneSlash
} from 'react-icons/fa';
import { AiOutlineMessage, AiOutlineClockCircle } from 'react-icons/ai';
import PatientSidebar from '../../components/PatientSidebar';
import Calendar from '../../components/Calendar';
import StatsCards from '../../components/StatsCards';
import UpcomingAppointment from '../../components/UpcomingAppointment';
import Prescriptions from '../../components/Prescriptions';
import ReviewForm from '../../components/ReviewForm';
import { 
  auth, 
  db, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  getDocs,
  doc,
  getDoc,
  updateDoc
} from "/src/firebase/firebaseConfig";
import DailyIframe from '@daily-co/daily-js';

const PatientDashboard = () => {
  const [state, setState] = useState({
    userData: null,
    loading: true,
    error: null,
    appointments: [],
    prescriptions: [],
    doctors: [],
    showDoctorSelection: false,
    showReviewModal: false,
    selectedDoctor: null,
    searchTerm: '',
    videoCall: {
      isActive: false,
      callFrame: null,
      appointment: null,
      duration: 0
    }
  });

  const callTimerRef = useRef(null);
  const callStartTimeRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const fetchInitialData = async () => {
      try {
        // Fetch user data
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setState(prev => ({ ...prev, userData: userDoc.data() }));
        }

        // Fetch doctors
        const doctorsQuery = query(collection(db, "users"), where("role", "==", "doctor"));
        const doctorsSnapshot = await getDocs(doctorsQuery);
        const doctorsData = doctorsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setState(prev => ({ ...prev, doctors: doctorsData }));
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setState(prev => ({ ...prev, error: "Failed to load data" }));
      } finally {
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    fetchInitialData();

    // Set up real-time listeners
    const unsubscribeFunctions = [];

    // Appointments listener
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("patientId", "==", user.uid)
    );
    const unsubscribeAppointments = onSnapshot(appointmentsQuery, 
      (snapshot) => {
        setState(prev => ({
          ...prev,
          appointments: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        }));
      },
      (error) => {
        console.error("Error loading appointments:", error);
        setState(prev => ({ ...prev, error: "Failed to load appointments" }));
      }
    );
    unsubscribeFunctions.push(unsubscribeAppointments);

    // Prescriptions listener
    const prescriptionsQuery = query(
      collection(db, "prescriptions"),
      where("patientId", "==", user.uid)
    );
    const unsubscribePrescriptions = onSnapshot(prescriptionsQuery, 
      (snapshot) => {
        setState(prev => ({
          ...prev,
          prescriptions: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        }));
      },
      (error) => {
        console.error("Error loading prescriptions:", error);
        setState(prev => ({ ...prev, error: "Failed to load prescriptions" }));
      }
    );
    unsubscribeFunctions.push(unsubscribePrescriptions);

    return () => {
      unsubscribeFunctions.forEach(unsub => unsub());
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (state.videoCall.callFrame) {
        state.videoCall.callFrame.destroy();
      }
    };
  }, []);

  // Derived data
  const activeDoctors = new Set(state.appointments.map(app => app.doctorId)).size;
  const doctorsToReview = state.appointments
    .filter(a => a.status === "completed" && !a.reviewed)
    .map(a => ({
      appointmentId: a.id,
      doctorId: a.doctorId,
      doctorName: a.doctorName,
      date: a.date
    }));

  const filteredDoctors = state.doctors.filter(doctor =>
    doctor.fullName?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(state.searchTerm.toLowerCase())
  );

  const upcomingAppointments = state.appointments
    .filter(a => a.status === "approved" && new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const pendingAppointments = state.appointments.filter(a => a.status === "pending");
  const activePrescriptions = state.prescriptions.filter(p => p.status === "active");

  // Video Call Functions
  const startVideoCall = async (appointment) => {
    try {
      // Check if already in a call
      if (state.videoCall.isActive) {
        setState(prev => ({
          ...prev,
          error: "You are already in a call"
        }));
        return;
      }

      // Check if appointment time is within allowed window (±15 minutes)
      const now = new Date();
      const appointmentTime = new Date(appointment.date);
      const timeDiff = Math.abs(now - appointmentTime) / (1000 * 60);
      
      if (timeDiff > 15) {
        setState(prev => ({
          ...prev,
          error: "You can only start calls within 15 minutes of the appointment time"
        }));
        return;
      }

      // daily.co url
      const roomUrl = `https://naphydeby.daily.co/Naphydeby12/${appointment.id}`;
      
      // Create call frame
      const callFrame = DailyIframe.createFrame({
        url: roomUrl,
        iframeStyle: {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          border: '0',
          zIndex: '9999'
        },
        showLeaveButton: true,
        showFullscreenButton: true,
      });

      // Set up call state
      setState(prev => ({
        ...prev,
        videoCall: {
          isActive: true,
          callFrame,
          appointment,
          duration: 0
        }
      }));

      // Start timer
      callStartTimeRef.current = new Date();
      callTimerRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          videoCall: {
            ...prev.videoCall,
            duration: Math.floor((new Date() - callStartTimeRef.current) / 1000)
          }
        }));
      }, 1000);

      // Join the call
      await callFrame.join({
        url: roomUrl,
        userName: state.userData?.fullName || 'Patient',
      });

      // Set up event listeners
      callFrame.on('left-meeting', endVideoCall);
      callFrame.on('error', handleCallError);

    } catch (error) {
      console.error("Error starting video call:", error);
      endVideoCall();
      setState(prev => ({
        ...prev,
        error: "Failed to start video call"
      }));
    }
  };

  const endVideoCall = () => {
    if (state.videoCall.callFrame) {
      state.videoCall.callFrame.leave().then(() => {
        state.videoCall.callFrame.destroy();
      });
    }

    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }

    // Record call completion in Firestore
    if (state.videoCall.appointment) {
      const appointmentRef = doc(db, "appointments", state.videoCall.appointment.id);
      updateDoc(appointmentRef, {
        callCompleted: true,
        callDuration: state.videoCall.duration,
        updatedAt: new Date().toISOString()
      }).catch(error => {
        console.error("Error updating appointment:", error);
      });
    }

    setState(prev => ({
      ...prev,
      videoCall: {
        isActive: false,
        callFrame: null,
        appointment: null,
        duration: 0
      }
    }));
  };

  const handleCallError = (error) => {
    console.error("Call error:", error);
    endVideoCall();
    setState(prev => ({
      ...prev,
      error: "Call encountered an error"
    }));
  };

  // Format call duration (MM:SS)
  const formatCallDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handlers
  const handleSelectDoctor = (doctor) => {
    setState(prev => ({
      ...prev,
      selectedDoctor: doctor,
      showDoctorSelection: false,
      showReviewModal: true
    }));
  };

  const handleReviewSubmitted = async (appointmentId) => {
    if (!appointmentId) return;
    
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        reviewed: true
      });
    } catch (error) {
      console.error("Error marking appointment as reviewed:", error);
    }
  };

  const handleAppointmentAction = async (action, appointmentId, newDate = null) => {
    try {
      const updateData = {};
      switch (action) {
        case 'cancel':
          updateData.status = "cancelled";
          break;
        case 'reschedule':
          updateData.date = newDate.toISOString();
          updateData.status = "pending";
          break;
        default:
          return;
      }

      await updateDoc(doc(db, "appointments", appointmentId), updateData);
    } catch (error) {
      console.error(`Error ${action}ing appointment:`, error);
      setState(prev => ({ ...prev, error: `Failed to ${action} appointment` }));
    }
  };

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <PatientSidebar />
      
      <div className="w-full md:w-3/4 p-4 md:p-10 overflow-y-auto custom-scrollbar ">
        {/* Error Display */}
        {state.error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <div>
                <p className="font-bold text-red-800">Error</p>
                <p className="text-red-600">{state.error}</p>
                <button 
                  onClick={() => setState(prev => ({ ...prev, error: null }))}
                  className="text-red-700 underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg p-6 mb-6 mt-8 lg:mt-0 shadow">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
            Welcome, {state.userData?.fullName || "Patient"}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your healthcare in one place
          </p>
        </div>

        {/* Review Prompt */}
        {doctorsToReview.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-center">
              <FaStar className="text-yellow-500 mr-2 text-xl" />
              <div>
                <p className="font-bold text-yellow-800">You have {doctorsToReview.length} doctor(s) to review</p>
                <button 
                  onClick={() => setState(prev => ({
                    ...prev,
                    showReviewModal: true,
                    selectedDoctor: {
                      id: doctorsToReview[0].doctorId,
                      fullName: doctorsToReview[0].doctorName
                    }
                  }))}
                  className="text-yellow-700 underline mt-1"
                >
                  Leave a review now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Doctor Button */}
        <button
          onClick={() => setState(prev => ({ ...prev, showDoctorSelection: true }))}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 hover:bg-blue-700 transition"
        >
          <FaStar className="mr-2" />
          Review a Doctor
        </button>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <StatsCards 
            icon={<FaUserMd className="text-2xl text-blue-600" />}
            title="My Doctors" 
            value={activeDoctors}
            subtitle="Healthcare providers"
          />
          <StatsCards 
            icon={<FaCalendarCheck className="text-2xl text-green-600" />}
            title="Upcoming Visits"
            value={upcomingAppointments.length}
            subtitle="Scheduled appointments"
          />
          <StatsCards 
            icon={<FaPrescriptionBottleAlt className="text-2xl text-purple-600" />}
            title="Active Medications"
            value={activePrescriptions.length}
            subtitle="Current prescriptions"
          />

          {/* Upcoming Appointments */}
          <UpcomingAppointment
            appointments={upcomingAppointments}
            icon={<AiOutlineClockCircle className="text-xl mr-2" />}
            onReschedule={(id, date) => handleAppointmentAction('reschedule', id, date)}
            onCancel={(id) => handleAppointmentAction('cancel', id)}
            onStartVideo={startVideoCall}
            isCallActive={state.videoCall.isActive}
          />

          {/* Prescriptions */}
          <Prescriptions 
            prescriptions={activePrescriptions}
            icon={<FaPrescriptionBottleAlt className="text-xl mr-2" />}
          />
        </div>

        {/* Calendar View */}
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <FaCalendarAlt className="text-xl mr-2 text-blue-900" />
            <h2 className="text-xl font-bold">My Calendar</h2>
          </div>
          <Calendar appointments={state.appointments} />
        </div>

        {/* Doctor Selection Modal */}
        {state.showDoctorSelection && (
          <div className="fixed inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Select a Doctor to Review</h3>
                <button 
                  onClick={() => setState(prev => ({ ...prev, showDoctorSelection: false }))}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  &times;
                </button>
              </div>
              
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search doctors by name or specialty..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={state.searchTerm}
                  onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                />
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {filteredDoctors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDoctors.map(doctor => (
                      <div 
                        key={doctor.id} 
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                        onClick={() => handleSelectDoctor(doctor)}
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600 font-bold">
                            {doctor.fullName?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <p className="font-bold">{doctor.fullName || "Doctor"}</p>
                            <p className="text-sm text-gray-600">{doctor.specialization || "General Practitioner"}</p>
                            {doctor.averageRating && (
                              <div className="flex items-center mt-1">
                                <FaStar className="text-yellow-400 mr-1" />
                                <span className="text-sm font-medium">
                                  {doctor.averageRating.toFixed(1)} ({doctor.reviews || 0} reviews)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 p-4 text-center">No doctors found matching your search</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Review Form Modal */}
        {state.showReviewModal && state.selectedDoctor && (
          <ReviewForm
            doctor={state.selectedDoctor}
            onClose={() => setState(prev => ({ ...prev, showReviewModal: false }))}
            onReviewSubmitted={() => {
              const appointmentToReview = doctorsToReview.find(
                d => d.doctorId === state.selectedDoctor.id
              );
              if (appointmentToReview) {
                handleReviewSubmitted(appointmentToReview.appointmentId);
              }
            }}
          />
        )}

        {/* Video Call Overlay */}
        {state.videoCall.isActive && (
          <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
            <div className="bg-white p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">
                  Video Call with Dr. {state.videoCall.appointment?.doctorName || 'Doctor'}
                </h2>
                <p className="text-gray-600">
                  Duration: {formatCallDuration(state.videoCall.duration)}
                </p>
              </div>
              <button 
                onClick={endVideoCall}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
              >
                <FaPhoneSlash className="mr-2" />
                End Call
              </button>
            </div>
            <div className="flex-1 relative">
              <div id="daily-call-frame" className="w-full h-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;