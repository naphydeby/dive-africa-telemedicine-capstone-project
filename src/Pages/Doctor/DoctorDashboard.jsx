
// import React, { useState, useEffect } from 'react';
// import { FaUserInjured, FaCalendarCheck, FaBell, FaPrescriptionBottleAlt, FaCalendarAlt } from 'react-icons/fa';
// import { AiOutlineMessage, AiOutlineClockCircle } from 'react-icons/ai';
// import { MdReviews, MdPendingActions } from 'react-icons/md';
// import DoctorSidebar from '../../components/DoctorSidebar';
// import Calendar from '../../components/Calendar';
// import StatsCards from '../../components/StatsCards';
// import NextPatient from '../../components/NextPatient';
// import Prescription from '../../components/Prescription';
// import AppointmentRequest from '../../components/AppointmentRequest';
// import Review from '../../components/Review';
// import { auth, db } from "/src/firebase/firebaseConfig";
// import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, getDocs } from "firebase/firestore";

// const DoctorDashboard = () => {
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [notifications, setNotifications] = useState([]);
//   const [appointments, setAppointments] = useState([]);
//   const [prescriptions, setPrescriptions] = useState([]);
//   const [reviews, setReviews] = useState([]);
//   const [totalPatients, setTotalPatients] = useState(0);
//   const [updatingAppointment, setUpdatingAppointment] = useState(null);

//   // Notification functions
//   const addNotification = (title, message, type = 'info') => {
//     const newNotification = {
//       id: Date.now(),
//       title,
//       message,
//       type,
//       timestamp: new Date().toISOString(),
//       read: false
//     };
//     setNotifications(prev => [newNotification, ...prev]);
//   };

//   const markNotificationAsRead = (id) => {
//     setNotifications(prev =>
//       prev.map(notification =>
//         notification.id === id ? { ...notification, read: true } : notification
//       )
//     );
//   };

//   // Appointment status update function
//   const updateAppointmentStatus = async (appointmentId, newStatus) => {
//     setUpdatingAppointment(appointmentId);
//     try {
//       const appointmentRef = doc(db, "appointments", appointmentId);
//       await updateDoc(appointmentRef, {
//         status: newStatus,
//         updatedAt: new Date().toISOString()
//       });

//       const appointment = appointments.find(a => a.id === appointmentId);
//       if (appointment) {
//         addNotification(
//           'Appointment Updated',
//           `Appointment with ${appointment.patientName} has been ${newStatus}`,
//           'appointment'
//         );
//       }
//     } catch (error) {
//       console.error("Error updating appointment status:", error);
//       addNotification(
//         'Update Failed',
//         `Failed to update appointment status`,
//         'error'
//       );
//     } finally {
//       setUpdatingAppointment(null);
//     }
//   };
//   const handleStartVideo = (appointment) => {
//     // Implement your video call logic here
//     console.log('Starting video call with:', appointment.patientName);
//     addNotification(
//       'Video Call Started',
//       `Initiated video call with ${appointment.patientName}`,
//       'video'
//     );
//   };

//   // Review update function
//   const updateReview = async (reviewId, updates) => {
//     try {
//       const reviewRef = doc(db, "reviews", reviewId);
//       await updateDoc(reviewRef, updates);
//     } catch (error) {
//       console.error("Error updating review:", error);
//       addNotification(
//         'Update Failed',
//         'Failed to update review',
//         'error'
//       );
//     }
//   };

//   useEffect(() => {
//     const user = auth.currentUser;
//     if (!user) return;

//     const unsubscribeFunctions = [];

//     //  Fetch Doctor Profile Data
//     const fetchUserData = async () => {
//       try {
//         const userDoc = await getDoc(doc(db, "users", user.uid));
//         if (userDoc.exists()) {
//           setUserData(userDoc.data());
//         }
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUserData();

//     //  Listen for Appointments (Real-Time Updates)
//     const appointmentsQuery = query(
//       collection(db, "appointments"),
//       where("doctorId", "==", user.uid)
//     );
//     const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
//       const appointmentsData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
      
//       if (appointments.length > 0) {
//         const newPending = appointmentsData.filter(newApp => 
//           newApp.status === "pending" && 
//           !appointments.some(oldApp => oldApp.id === newApp.id)
//         );
        
//         newPending.forEach(app => {
//           addNotification(
//             'New Appointment Request',
//             `Patient ${app.patientName} requested an appointment`,
//             'appointment'
//           );
//         });
//       }
      
//       setAppointments(appointmentsData);
//     });
//     unsubscribeFunctions.push(unsubscribeAppointments);

//     //  Listen for Prescriptions
//     const prescriptionsQuery = query(
//       collection(db, "prescriptions"),
//       where("doctorId", "==", user.uid)
//     );
//     const unsubscribePrescriptions = onSnapshot(prescriptionsQuery, (snapshot) => {
//       const prescriptionsData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setPrescriptions(prescriptionsData);
//     });
//     unsubscribeFunctions.push(unsubscribePrescriptions);

//     //  Listen for Reviews
//     const reviewsQuery = query(
//       collection(db, "reviews"),
//       where("doctorId", "==", user.uid)
//     );
//     const unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
//       const reviewsData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
      
//       if (reviews.length > 0) {
//         const newReviews = reviewsData.filter(newRev => 
//           !reviews.some(oldRev => oldRev.id === newRev.id)
//         );
        
//         newReviews.forEach(rev => {
//           addNotification(
//             'New Patient Review',
//             `Patient ${rev.patientName} left a ${rev.rating}-star review`,
//             'review'
//           );
//         });
//       }
      
//       setReviews(reviewsData);
//     });
//     unsubscribeFunctions.push(unsubscribeReviews);

//     //  Calculate Unique Patients
//     const fetchUniquePatients = async () => {
//       try {
//         const q = query(
//           collection(db, "appointments"),
//           where("doctorId", "==", user.uid)
//         );
//         const snapshot = await getDocs(q);
//         const uniquePatientIds = new Set();

//         snapshot.forEach((doc) => {
//           const { patientId } = doc.data();
//           if (patientId) uniquePatientIds.add(patientId);
//         });

//         setTotalPatients(uniquePatientIds.size);
//       } catch (error) {
//         console.error("Error fetching unique patients:", error);
//       }
//     };
//     fetchUniquePatients();

//     return () => unsubscribeFunctions.forEach((unsub) => unsub());
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen">
//       <DoctorSidebar />
      
//       <div className="w-full md:w-3/4 p-4 md:p-10">
//         {/* Welcome Banner */}
//         <div className="bg-white shadow-2xl rounded-lg p-5 mb-6">
//           <h1 className="text-2xl text-blue-900 md:text-3xl pt-8 font-bold">
//             Welcome, Dr. {userData?.fullName || "Doctor"}!
//           </h1>
//           <p className="mt-2 text-gray-600">
//             Manage your appointments, patients, and messages.
//           </p>
//         </div>

//         {/* Dashboard Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {/* Stats Cards */}
//           <StatsCards 
//             icon={<FaUserInjured className="text-2xl text-blue-600" />}
//             title="Total Patients" 
//             value={totalPatients}         
//             subtitle="Unique Patients" 
//           />
//           <StatsCards 
//             icon={<FaCalendarCheck className="text-2xl text-green-600" />}     
//             title="Today's Appointments" 
//             value={appointments.filter(
//               (a) => new Date(a.date).toDateString() === new Date().toDateString()
//             ).length} 
//             subtitle="Scheduled Today" 
//           />     
//           <StatsCards 
//             icon={<MdPendingActions className="text-2xl text-yellow-600" />}
//             title="Pending Approvals" 
//             value={appointments.filter((a) => a.status === "pending").length} 
//             subtitle="Action Required"    
//           />

//           {/* Components */}
//           <Prescription 
//             prescriptions={prescriptions} 
//             icon={<FaPrescriptionBottleAlt className="text-xl mr-2 text-blue-900" />}
//           />
//           <Review
//             icon={<MdReviews className="text-xl mr-2 text-blue-900" />}
//             reviews={reviews}
//             onReply={(reviewId, replyText) => 
//               updateReview(reviewId, { doctorReply: replyText })
//             }
//             onHide={(reviewId) => {
//               const review = reviews.find((r) => r.id === reviewId);
//               if (review) {
//                 updateReview(reviewId, { 
//                   status: review.status === "hidden" ? "published" : "hidden" 
//                 });
//               }
//             }}
//           />
//           <AppointmentRequest 
//             icon={<AiOutlineMessage className="text-xl mr-2 text-blue-900" />}
//             appointments={appointments.filter((a) => a.status === "pending")} 
//             onApprove={(id) => updateAppointmentStatus(id, "approved")}
//             onReject={(id) => updateAppointmentStatus(id, "rejected")}
//             loadingId={updatingAppointment}
//           />
//           <NextPatient 
//             icon={<AiOutlineClockCircle className="text-xl mr-2" />}
//             upcomingAppointments={appointments
//               .filter((a) => a.status === "approved" && new Date(a.date) >= new Date())
//               .sort((a, b) => new Date(a.date) - new Date(b.date))
//             } 
//             onStartVideo={handleStartVideo}
//           />

//           {/* Notifications Section */}
//           <div className="md:col-span-3 bg-white p-4 rounded-lg shadow-sm">
//             <div className="flex items-center mb-4">
//               <FaBell className="text-xl mr-2 text-blue-900" />
//               <h2 className="text-xl font-bold">Notifications</h2>
//               {notifications.filter(n => !n.read).length > 0 && (
//                 <span className="ml-2 bg-blue-900 text-white text-xs font-bold px-2 py-1 rounded-full">
//                   {notifications.filter(n => !n.read).length}
//                 </span>
//               )}
//             </div>
//             {notifications.length === 0 ? (
//               <p className="text-gray-500">No new notifications.</p>
//             ) : (
//               <div className="space-y-3 max-h-64 overflow-y-auto">
//                 {notifications.map((notification) => (
//                   <div
//                     key={notification.id}
//                     onClick={() => markNotificationAsRead(notification.id)}
//                     className={`p-3 rounded-lg flex items-start cursor-pointer ${
//                       notification.read ? 'bg-gray-50' : 'bg-blue-50'
//                     }`}
//                   >
//                     {notification.type === 'appointment' ? (
//                       <FaCalendarAlt className="text-lg mt-1 mr-3 text-green-500" />
//                     ) : notification.type === 'review' ? (
//                       <MdReviews className="text-lg mt-1 mr-3 text-yellow-500" />
//                     ) : (
//                       <AiOutlineMessage className="text-lg mt-1 mr-3 text-blue-500" />
//                     )}
//                     <div>
//                       <h3 className="font-semibold">{notification.title}</h3>
//                       <p className="text-gray-600">{notification.message}</p>
//                       <p className="text-xs text-gray-400 mt-1">
//                         {new Date(notification.timestamp).toLocaleString()}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
          
//           {/* Calendar */}
//           <div className="md:col-span-3">
//             <div className="flex items-center mb-4">
//               <FaCalendarAlt className="text-xl mr-2 text-blue-900" />
//               <h2 className="text-xl font-bold">Appointment Calendar</h2>
//             </div>
//             <Calendar appointments={appointments} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DoctorDashboard;






import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUserInjured, 
  FaCalendarCheck, 
  FaBell, 
  FaPrescriptionBottleAlt, 
  FaCalendarAlt,
  FaVideo, 
  FaPhoneSlash,
  FaUserMd
} from 'react-icons/fa';
import { AiOutlineMessage, AiOutlineClockCircle } from 'react-icons/ai';
import { MdReviews, MdPendingActions } from 'react-icons/md';
import DoctorSidebar from '../../components/DoctorSidebar';
import Calendar from '../../components/Calendar';
import StatsCards from '../../components/StatsCards';
import NextPatient from '../../components/NextPatient';
import Prescription from '../../components/Prescription';
import AppointmentRequest from '../../components/AppointmentRequest';
import Review from '../../components/Review';
import { auth, db } from "/src/firebase/firebaseConfig";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  getDocs, 
  addDoc 
} from "firebase/firestore";

const DoctorDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [updatingAppointment, setUpdatingAppointment] = useState(null);
  const [videoCall, setVideoCall] = useState({
    isActive: false,
    callFrame: null,
    appointment: null,
    duration: 0
  });
  
  const callTimerRef = useRef(null);
  const callStartTimeRef = useRef(null);

  // Initialize Daily.co
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@daily-co/daily-js/dist/daily-iframe.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (videoCall.callFrame) {
        videoCall.callFrame.destroy();
      }
    };
  }, []);

  // Fetch initial data
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const fetchInitialData = async () => {
      try {
        // Fetch user data
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        // Calculate unique patients
        const q = query(
          collection(db, "appointments"),
          where("doctorId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const uniquePatientIds = new Set();
        snapshot.forEach((doc) => {
          const { patientId } = doc.data();
          if (patientId) uniquePatientIds.add(patientId);
        });
        setTotalPatients(uniquePatientIds.size);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Set up real-time listeners
    const unsubscribeFunctions = [];

    // Appointments listener
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("doctorId", "==", user.uid)
    );
    const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      const appointmentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Check for new pending appointments
      if (appointments.length > 0) {
        const newPending = appointmentsData.filter(newApp => 
          newApp.status === "pending" && 
          !appointments.some(oldApp => oldApp.id === newApp.id)
        );
        
        newPending.forEach(app => {
          addNotification(
            'New Appointment Request',
            `Patient ${app.patientName} requested an appointment`,
            'appointment'
          );
        });
      }
      
      setAppointments(appointmentsData);
    });
    unsubscribeFunctions.push(unsubscribeAppointments);

    // Prescriptions listener
    const prescriptionsQuery = query(
      collection(db, "prescriptions"),
      where("doctorId", "==", user.uid)
    );
    const unsubscribePrescriptions = onSnapshot(prescriptionsQuery, (snapshot) => {
      setPrescriptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    unsubscribeFunctions.push(unsubscribePrescriptions);

    // Reviews listener
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("doctorId", "==", user.uid)
    );
    const unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Check for new reviews
      if (reviews.length > 0) {
        const newReviews = reviewsData.filter(newRev => 
          !reviews.some(oldRev => oldRev.id === newRev.id)
        );
        
        newReviews.forEach(rev => {
          addNotification(
            'New Patient Review',
            `Patient ${rev.patientName} left a ${rev.rating}-star review`,
            'review'
          );
        });
      }
      
      setReviews(reviewsData);
    });
    unsubscribeFunctions.push(unsubscribeReviews);

    return () => unsubscribeFunctions.forEach(unsub => unsub());
  }, []);

  // Notification functions
  const addNotification = async (title, message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Persist to Firestore
    if (auth.currentUser) {
      try {
        await addDoc(collection(db, "notifications"), {
          userId: auth.currentUser.uid,
          ...newNotification
        });
      } catch (error) {
        console.error("Error saving notification:", error);
      }
    }
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  const getUpcomingAppointments = () => {
    return appointments
      .filter(appointment => {
        if (appointment.status !== "approved") return false;
        const appointmentDate = appointment.date?.toDate 
          ? appointment.date.toDate() 
          : new Date(appointment.date);
        return appointmentDate >= new Date();
      })
      .sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateA - dateB;
      });
  };
  // Appointment functions
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    setUpdatingAppointment(appointmentId);
    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        addNotification(
          'Appointment Updated',
          `Appointment with ${appointment.patientName} has been ${newStatus}`,
          'appointment'
        );
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      addNotification(
        'Update Failed',
        `Failed to update appointment status`,
        'error'
      );
    } finally {
      setUpdatingAppointment(null);
    }
  };

  // Video Call Functions
  const startVideoCall = async (appointment) => {
    try {
      // Check if already in a call
      if (videoCall.isActive) {
        addNotification(
          'Call In Progress',
          'You already have an active call',
          'warning'
        );
        return;
      }

      // Check if appointment time is within allowed window (±15 minutes)
      const now = new Date();
      const appointmentTime = new Date(appointment.date);
      const timeDiff = Math.abs(now - appointmentTime) / (1000 * 60);
      
      if (timeDiff > 15) {
        addNotification(
          'Call Not Available',
          `You can only start calls within 15 minutes of the appointment time`,
          'warning'
        );
        return;
      }

      
      const roomUrl = `https://naphydeby.daily.co/Naphydeby12/${appointment.id}`;
      
      // Create call frame
      const callFrame = window.DailyIframe.createFrame({
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
      setVideoCall({
        isActive: true,
        callFrame,
        appointment,
        duration: 0
      });

      // Start timer
      callStartTimeRef.current = new Date();
      callTimerRef.current = setInterval(() => {
        setVideoCall(prev => ({
          ...prev,
          duration: Math.floor((new Date() - callStartTimeRef.current) / 1000)
        }));
      }, 1000);

      // Join the call
      await callFrame.join({
        url: roomUrl,
        userName: `Dr. ${userData?.fullName || 'Doctor'}`,
      });

      // Set up event listeners
      callFrame.on('left-meeting', handleCallEnd);
      callFrame.on('error', handleCallError);

      addNotification(
        'Video Call Started',
        `Call with ${appointment.patientName} has begun`,
        'video'
      );

    } catch (error) {
      console.error("Error starting video call:", error);
      addNotification(
        'Call Failed',
        `Could not start video call with ${appointment.patientName}`,
        'error'
      );
      endVideoCall();
    }
  };

  const handleCallEnd = () => {
    endVideoCall();
    addNotification(
      'Call Ended',
      `Video call with ${videoCall.appointment?.patientName} completed`,
      'video'
    );
  };

  const handleCallError = (error) => {
    console.error("Call error:", error);
    addNotification(
      'Call Error',
      `Technical issue during call with ${videoCall.appointment?.patientName}`,
      'error'
    );
    endVideoCall();
  };

  const endVideoCall = () => {
    if (videoCall.callFrame) {
      videoCall.callFrame.leave().then(() => {
        videoCall.callFrame.destroy();
      });
    }

    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }

    // Record call completion in Firestore
    if (videoCall.appointment) {
      const appointmentRef = doc(db, "appointments", videoCall.appointment.id);
      updateDoc(appointmentRef, {
        callCompleted: true,
        callDuration: videoCall.duration,
        updatedAt: new Date().toISOString()
      }).catch(error => {
        console.error("Error updating appointment:", error);
      });
    }

    setVideoCall({
      isActive: false,
      callFrame: null,
      appointment: null,
      duration: 0
    });
  };

  // Format call duration (HH:MM:SS)
  const formatCallDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <DoctorSidebar />
      
      <div className="w-full md:w-3/4 p-4 md:p-10 lg: ml-4 overflow-y-auto   custom-scrollbar">
        {/* Welcome Banner */}
        <div className="bg-white shadow-2xl w-full rounded-lg p-5 mb-6">
          <h1 className="text-2xl text-blue-900 md:text-3xl pt-8 font-bold">
            Welcome, Dr. {userData?.fullName || "Doctor"}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your appointments, patients, and messages.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <StatsCards 
            icon={<FaUserInjured className="text-2xl text-blue-600" />}
            title="Total Patients" 
            value={totalPatients}         
            subtitle="Unique Patients" 
          />
          <StatsCards 
            icon={<FaCalendarCheck className="text-2xl text-green-600" />}     
            title="Today's Appointments" 
            value={appointments.filter(
              (a) => new Date(a.date).toDateString() === new Date().toDateString()
            ).length} 
            subtitle="Scheduled Today" 
          />     
          <StatsCards 
            icon={<FaVideo className="text-2xl text-purple-600" />}
            title="Today's Calls" 
            value={appointments.filter(a => 
              a.callCompleted && 
              new Date(a.date).toDateString() === new Date().toDateString()
            ).length}
            subtitle="Completed"
          />

          {/* Components */}
          <Prescription 
            prescriptions={prescriptions} 
            icon={<FaPrescriptionBottleAlt className="text-xl mr-2 text-blue-900" />}
          />
          <Review
            icon={<MdReviews className="text-xl mr-2 text-blue-900" />}
            reviews={reviews}
            onReply={(reviewId, replyText) => 
              updateDoc(doc(db, "reviews", reviewId), { doctorReply: replyText })
            }
            onHide={(reviewId) => {
              const review = reviews.find((r) => r.id === reviewId);
              if (review) {
                updateDoc(doc(db, "reviews", reviewId), { 
                  status: review.status === "hidden" ? "published" : "hidden" 
                });
              }
            }}
          />
          <AppointmentRequest 
            icon={<AiOutlineMessage className="text-xl mr-2 text-blue-900" />}
            appointments={appointments.filter((a) => a.status === "pending")} 
            onApprove={(id) => updateAppointmentStatus(id, "approved")}
            onReject={(id) => updateAppointmentStatus(id, "rejected")}
            loadingId={updatingAppointment}
          />
          <NextPatient 
            icon={<AiOutlineClockCircle className="text-xl mr-2" />}
            upcomingAppointments={getUpcomingAppointments()} 
            onStartVideo={startVideoCall}
            isCallActive={videoCall.isActive}
          />

          {/* Notifications Section */}
          <div className="md:col-span-3 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <FaBell className="text-xl mr-2 text-blue-900" />
              <h2 className="text-xl font-bold">Notifications</h2>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="ml-2 bg-blue-900 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-gray-500">No new notifications.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto  custom-scrollbar">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markNotificationAsRead(notification.id)}
                    className={`p-3 rounded-lg flex items-start cursor-pointer ${
                      notification.read ? 'bg-gray-50' : 'bg-blue-50'
                    }`}
                  >
                    {notification.type === 'appointment' ? (
                      <FaCalendarAlt className="text-lg mt-1 mr-3 text-green-500" />
                    ) : notification.type === 'review' ? (
                      <MdReviews className="text-lg mt-1 mr-3 text-yellow-500" />
                    ) : notification.type === 'video' ? (
                      <FaVideo className="text-lg mt-1 mr-3 text-purple-500" />
                    ) : (
                      <AiOutlineMessage className="text-lg mt-1 mr-3 text-blue-500" />
                    )}
                    <div>
                      <h3 className="font-semibold">{notification.title}</h3>
                      <p className="text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Calendar */}
          <div className="md:col-span-3">
            <div className="flex items-center mb-4">
              <FaCalendarAlt className="text-xl mr-2 text-blue-900" />
              <h2 className="text-xl font-bold">Appointment Calendar</h2>
            </div>
            <Calendar appointments={appointments} />
          </div>
        </div>

        {/* Video Call Overlay */}
        {videoCall.isActive && (
          <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
            <div className="bg-white p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">
                  Video Call with {videoCall.appointment?.patientName || 'Patient'}
                </h2>
                <p className="text-gray-600">
                  Duration: {formatCallDuration(videoCall.duration)}
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

export default DoctorDashboard;