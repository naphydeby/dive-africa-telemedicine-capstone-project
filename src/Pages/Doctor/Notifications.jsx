import { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '/src/firebase/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  updateDoc, 
  doc,
  writeBatch 
} from 'firebase/firestore';

const Notifications = ({ inSidebar = false }) => {
  const currentUser = auth.currentUser;
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log("Fetching notifications for user:", currentUser.uid);

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', currentUser.uid), // Changed from doctorId to userId
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        console.log("Received notifications:", docs);
        setNotifications(docs);
        setUnreadCount(docs.length);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching notifications:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      await updateDoc(doc(db, 'notifications', notification.id), {
        read: true,
        readAt: new Date()
      });

      // Navigate if link exists
      if (notification.link) {
        navigate(notification.link);
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Error handling notification:", error);
      setError(error.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications.forEach(notification => {
        const ref = doc(db, 'notifications', notification.id);
        batch.update(ref, {
          read: true,
          readAt: new Date()
        });
      });
      await batch.commit();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
      setError(error.message);
    }
  };

  const formatTime = (date) => {
    return date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString() || '';
  };

  return (
    <div className={`relative ${inSidebar ? 'w-full' : ''}`}>
      {inSidebar ? (
        <button 
          onClick={() => navigate('/notifications')}
          className="flex items-center w-full py-3 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-200"
        >
          <FaBell className="mr-3" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      ) : (
        <>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-full hover:bg-blue-800 relative"
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          >
            <FaBell className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200">
              <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold">Notifications</h3>
                <div className="flex space-x-2">
                  {notifications.length > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark all as read
                    </button>
                  )}
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center">Loading notifications...</div>
                ) : error ? (
                  <div className="p-4 text-center text-red-500">{error}</div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center">No new notifications</div>
                ) : (
                  <ul>
                    {notifications.map(notification => (
                      <li 
                        key={notification.id}
                        className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          </div>
                          <FaChevronRight className="text-gray-400" />
                        </div>
                        <div className="flex justify-between mt-2">
                          <p className="text-xs text-gray-400">
                            {formatDate(notification.createdAt)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-2 border-t border-gray-200 text-center">
                <button 
                  onClick={() => {
                    navigate('/notifications');
                    setIsOpen(false);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notifications;