
import React, { useState, useEffect } from 'react';
import { FaUserInjured, FaCalendarCheck, FaBell, FaPrescriptionBottleAlt, FaCalendarAlt } from 'react-icons/fa';
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
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, getDocs } from "firebase/firestore";

const DoctorDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [updatingAppointment, setUpdatingAppointment] = useState(null);

  // Notification functions
  const addNotification = (title, message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Appointment status update function
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
  const handleStartVideo = (appointment) => {
    // Implement your video call logic here
    console.log('Starting video call with:', appointment.patientName);
    addNotification(
      'Video Call Started',
      `Initiated video call with ${appointment.patientName}`,
      'video'
    );
  };

  // Review update function
  const updateReview = async (reviewId, updates) => {
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      await updateDoc(reviewRef, updates);
    } catch (error) {
      console.error("Error updating review:", error);
      addNotification(
        'Update Failed',
        'Failed to update review',
        'error'
      );
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribeFunctions = [];

    //  Fetch Doctor Profile Data
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();

    //  Listen for Appointments (Real-Time Updates)
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("doctorId", "==", user.uid)
    );
    const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      const appointmentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
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

    //  Listen for Prescriptions
    const prescriptionsQuery = query(
      collection(db, "prescriptions"),
      where("doctorId", "==", user.uid)
    );
    const unsubscribePrescriptions = onSnapshot(prescriptionsQuery, (snapshot) => {
      const prescriptionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPrescriptions(prescriptionsData);
    });
    unsubscribeFunctions.push(unsubscribePrescriptions);

    //  Listen for Reviews
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("doctorId", "==", user.uid)
    );
    const unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
      const reviewsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
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

    //  Calculate Unique Patients
    const fetchUniquePatients = async () => {
      try {
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
        console.error("Error fetching unique patients:", error);
      }
    };
    fetchUniquePatients();

    return () => unsubscribeFunctions.forEach((unsub) => unsub());
  }, []);

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
      
      <div className="w-full md:w-3/4 p-4 md:p-10">
        {/* Welcome Banner */}
        <div className="bg-white shadow-2xl rounded-lg p-5 mb-6">
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
            icon={<MdPendingActions className="text-2xl text-yellow-600" />}
            title="Pending Approvals" 
            value={appointments.filter((a) => a.status === "pending").length} 
            subtitle="Action Required"    
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
              updateReview(reviewId, { doctorReply: replyText })
            }
            onHide={(reviewId) => {
              const review = reviews.find((r) => r.id === reviewId);
              if (review) {
                updateReview(reviewId, { 
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
            upcomingAppointments={appointments
              .filter((a) => a.status === "approved" && new Date(a.date) >= new Date())
              .sort((a, b) => new Date(a.date) - new Date(b.date))
            } 
            onStartVideo={handleStartVideo}
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
              <div className="space-y-3 max-h-64 overflow-y-auto">
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
      </div>
    </div>
  );
};

export default DoctorDashboard;