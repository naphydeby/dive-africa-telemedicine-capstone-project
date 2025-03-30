import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const ProtectedRoute = ({ children, role }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role); // Set the user's role
        }
      }
      setLoading(false); // Stop loading after fetching the role
    };

    fetchUserRole();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading spinner while fetching the role
  }

  if (!user) {
    return <Navigate to="/login" />; // Redirect to login if not authenticated
  }

  if (role && userRole !== role) {
    return <Navigate to="/" />; // Redirect to home if role doesn't match
  }

  return children;
};

export default ProtectedRoute;