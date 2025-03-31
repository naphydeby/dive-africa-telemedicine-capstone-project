import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth, db } from '/src/firebase/firebaseConfig';
import { 
  FaCalendarAlt, 
  FaUserMd, 
  FaNotesMedical, 
  FaComments, 
  FaUserCog, 
  FaSignOutAlt,
  FaTimes,
  FaBars, 
  FaTachometerAlt,
  FaFileMedicalAlt
} from 'react-icons/fa';
import { 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc
} from 'firebase/firestore';

const PatientSidebar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Fetch patient data
    const fetchPatientData = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPatientData(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    };

    // Track unread messages (same as doctor)
    const messagesRef = collection(db, 'messages');
    const messagesQuery = query(messagesRef, 
      where('receiverId', '==', user.uid),
      where('read', '==', false)
    );
    
    const unsubscribeMessages = onSnapshot(messagesQuery, 
      (snapshot) => {
        setUnreadMessages(snapshot.size);
      },
      (error) => {
        console.error("Error listening to messages:", error);
      }
    );

    fetchPatientData();

    return () => {
      unsubscribeMessages();
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-64 bg-blue-900 text-white p-5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-64 bg-blue-900 text-white p-5">
        Please log in to continue
      </div>
    );
  }

  const activeLinkClass = "bg-blue-700 border-l-4 border-white";
  const normalLinkClass = "hover:bg-blue-800 transition-colors duration-200";

  return (
    <>
      {/* Mobile toggle button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 text-blue-900 bg-white p-2 rounded"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`fixed md:relative z-40 w-64 min-h-screen bg-blue-900 text-white flex flex-col transition-all duration-300 ${isOpen ? 'left-0 ' : '-left-64'} md:left-0`}>
        {/* Header */}
        <div className="p-5 border-b border-blue-800 flex flex-col items-center space-y-3 pt-20 lg:pt-6">
          <div className="w-36 h-36 rounded-full bg-blue-700 flex items-center justify-center">
            {patientData?.photoURL ? (
              <img 
                src={patientData.photoURL} 
                alt="Profile" 
                className="rounded-full w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = ''; // Fallback to initials if image fails to load
                }}
              />
            ) : (
              <span className="text-lg">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold truncate">{user?.displayName || 'Patient'}</h2>
            <p className="text-blue-200 text-sm truncate text-center">
              {patientData?.healthPlan || 'Standard Plan'}
            </p>
          </div>
        </div>

        {/* Navigation - Updated for patient routes */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <NavLink 
                to="/patientdashboard" 
                className={({isActive}) => 
                  `flex items-center py-3 px-4 rounded-lg ${isActive ? activeLinkClass : normalLinkClass}`
                }
                onClick={() => setIsOpen(false)}
              >
                <FaTachometerAlt className="mr-3 flex-shrink-0" />
                <span className="truncate">Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/bookappointment" 
                className={({isActive}) => 
                  `flex items-center py-3 px-4 rounded-lg ${isActive ? activeLinkClass : normalLinkClass}`
                }
                onClick={() => setIsOpen(false)}
              >
                <FaCalendarAlt className="mr-3 flex-shrink-0" />
                <span className="truncate">Book Appointment</span>
              </NavLink>
            </li>
           
            <li>
              <NavLink 
                to="/patientmedicalhistory" 
                className={({isActive}) => 
                  `flex items-center py-3 px-4 rounded-lg ${isActive ? activeLinkClass : normalLinkClass}`
                }
                onClick={() => setIsOpen(false)}
              >
                <FaFileMedicalAlt className="mr-3 flex-shrink-0" />
                <span className="truncate">Medical Records</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/patientmessage" 
                className={({isActive}) => 
                  `flex items-center py-3 px-4 rounded-lg ${isActive ? activeLinkClass : normalLinkClass}`
                }
                onClick={() => setIsOpen(false)}
              >
                <FaComments className="mr-3 flex-shrink-0" />
                <span className="truncate">Messages</span>
                {unreadMessages > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </NavLink>
            </li>
           
            <li>
              <NavLink 
                to="/patientprofile" 
                className={({isActive}) => 
                  `flex items-center py-3 px-4 rounded-lg ${isActive ? activeLinkClass : normalLinkClass}`
                }
                onClick={() => setIsOpen(false)}
              >
                <FaUserCog className="mr-3 flex-shrink-0" />
                <span className="truncate">Profile</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Footer with logout */}
        <div className="p-4 border-t border-blue-800">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full py-2 px-4 text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg transition-colors duration-200"
          >
            <FaSignOutAlt className="mr-3 flex-shrink-0" />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default PatientSidebar;