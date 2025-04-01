import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db, messaging } from "../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getToken, onMessage } from "firebase/messaging";
import doctorImage2 from "/src/assets/images/Animation-2.gif";
import sideRightImage1 from "/src/assets/images/patient1.jpg";
import sideRightImage2 from "/src/assets/images/doc-2.avif";
import AOS from "aos";
import "aos/dist/aos.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const Login = () => {
  useEffect(() => {
    AOS.init({
      duration: 1200,
      easing: "ease-in-out",
      once: false,
    });
  }, []);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 1200,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    TransitionEvent: "ease-in-out",
    innerHeight: "100%",
    innerWidth: "100%",
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const requestNotificationPermission = async (user) => {
    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      console.log("Service Worker registered:", registration);
  
      // Request permission and get FCM token
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const vapidKey = "BJtEqHXmMTa_9F5q1aF6VAFSnu99Tk2D5bRG_Jyg56EoUpJBfUqtH5pE7_GvCJs2Ery0grZdfjYPpLEOGh__woA";
        const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
        console.log("FCM Token:", token);
  
        // Store the token in Firestore
        if (user) {
          await setDoc(doc(db, "users", user.uid), { fcmToken: token }, { merge: true });
        }
        return token;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };
  

  // Listen for incoming messages
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received:", payload);
      const { title, body } = payload.notification;
      new Notification(title, { body });
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      //  Sign in the user with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      //  Request notification permission and store FCM token
      await requestNotificationPermission(user);

      //  Fetch the user's role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userRole = userDoc.data().role;

        //  Redirect based on the user's role
        if (userRole === "patient") {
          navigate("/patientdashboard"); // Redirect to patient dashboard
        } else if (userRole === "doctor") {
          navigate("/doctordashboard"); // Redirect to doctor dashboard
        } else {
          setError("Invalid role. Please contact support.");
        }
      } else {
        setError("User data not found. Please sign up.");
      }
    } catch (error) {
      setError('Invalid Credential'); // Set error message for the user
      console.error("Error logging in:", error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen w-[100%] h-[100vh] flex justify-center lg:justify-between bg-[#fefbfb]">
      {/* Left Information */}
      <div className="flex p-8">
        <div className="flex flex-col lg:px-16 items-start">
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <div className="w-20 h-20 2xl:w-40 2xl:h-40 rounded-full bg-[#483d8b]">
                <img
                  src={doctorImage2}
                  data-aos="fade-up"
                  alt="Doctor Illustration"
                  className="rounded-full w-16 2xl:w-36 h-16 2xl:h-36 mx-auto mt-4"
                />
              </div>
              <h1 className="ml-4 text-[#483d8b] font-[inter] text-4xl">Telemedix</h1>
            </div>
          </div>
          <div className="mt-10 md:mt-4 md:w-[70vw] lg:w-[35vw] md:ml-20">
            <div className="flex flex-col items-center mt-12">
              <p className="text-gray-600 font-[inter] text-md 2xl:text-2xl mt-1 text-center">
                Welcome! Please Login .
              </p>
              <form onSubmit={handleLogin} className="space-y-6 mt-8">
                <input
                  className="w-full h-[55px] text-gray-900 text-xl pl-4 font-[inter] rounded-[12px] font-medium border outline-[#483d8b]"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  className="w-full h-[55px] text-xl pl-4 font-[inter] rounded-[12px] font-medium border outline-[#483d8b] text-gray-900"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="flex flex-row justify-between">
                  <div className="flex items-center space-x-1">
                    <input className="w-4 h-4" type="checkbox" name="remember" id="remember" />
                    <label className="font-[inter] text-md text-gray-900" htmlFor="remember">
                      Remember Me
                    </label>
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <p>
                  Don't have an account?
                  <NavLink to="/signup" className="text-[#483d8b] ml-1">
                    Signup
                  </NavLink>
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 text-white text-lg rounded-lg bg-[#483d8b] hover:bg-[rgba(72,61,139,0.9)] focus:ring-4 focus:ring-[#483d8b] focus:ring-opacity-50 font-[inter] font-semibold transition-colors duration-300"
                >
                  {loading ? "Logging In..." : "Login"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Right Information */}
      <div className="hidden lg:block lg:h-[100vh] lg:w-[500px] xl:w-[600px] 2xl:w-[1100px] lg:overflow-hidden bg-[blue]">
        <Slider {...sliderSettings}>
          <div className="w-[100%] h-[100vh]">
            <img src={sideRightImage1} alt="hospital1" className="w-[100%] h-[100%] object-cover" />
          </div>
          <div className="w-[100%] h-[100vh]">
            <img src={sideRightImage2} alt="hospital2" className="w-[100%] h-[100%] object-cover" />
          </div>
        </Slider>
      </div>
    </div>
  );
};

export default Login;