import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "/src/firebase/firebaseConfig";
import { collection, addDoc, query, where, onSnapshot, orderBy, getDocs } from "firebase/firestore";
import PatientSidebar from "../../components/PatientSidebar";


const PatientMessage = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setError("User not authenticated. Please log in.");
      return;
    }

    const fetchDoctors = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "doctor"));
        const querySnapshot = await getDocs(q);

        const doctorsData = [];
        querySnapshot.forEach((doc) => {
          doctorsData.push({ id: doc.id, ...doc.data() });
        });

        setDoctors(doctorsData);
      } catch (error) {
        console.error("Error fetching doctors: ", error);
        setError("Failed to fetch doctors. Please try again.");
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [user]);

  useEffect(() => {
    if (!selectedDoctorId) return;

    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("senderId", "in", [user.uid, selectedDoctorId]),
      where("receiverId", "in", [user.uid, selectedDoctorId]),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = [];
      querySnapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesData);
      setLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [selectedDoctorId, user.uid]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedDoctorId) {
      setError("Please select a doctor and enter a message.");
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        senderId: user.uid,
        receiverId: selectedDoctorId,
        message: message,
        timestamp: new Date().toISOString(),
      });
      setMessage("");
      setError("");
    } catch (error) {
      console.error("Error sending message: ", error);
      setError("Failed to send message. Please try again.");
    }
  };

  if (loadingDoctors) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }
 
  return (
    
    <div className="min-h-screen flex bg-gradient-to-r from-blue-250 to-purple-50  ">
    <PatientSidebar/>
      <div className="w-full lg:w-3/4 p-5 mt-8 lg:mt-0 lg:ml-4 bg-white rounded-lg  shadow-lg overflow-hidden  ">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h2 className="text-2xl font-bold text-white">Messages</h2>
        </div>

        {/* Doctor Selection */}
        <div className="p-6 border-b border-gray-200">
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            overflow-y-auto  custom-scrollbar"
            aria-label="Select a doctor"
            required
          >
            <option value="">Select a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Messages Container */}
        <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">
          {messages.length === 0 && !loadingMessages && (
            <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
          )}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isSender={msg.senderId === user.uid}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-gray-50">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ msg, isSender }) => (
  <div
    className={`flex ${isSender ? "justify-end" : "justify-start"} mb-4`}
  >
    <div
      className={`max-w-[70%] p-4 rounded-lg ${
        isSender
          ? "bg-blue-600 text-white rounded-br-none"
          : "bg-gray-100 text-gray-800 rounded-bl-none"
      }`}
    >
      <p>{msg.message}</p>
      <p className="text-xs mt-1 opacity-75">
        {new Date(msg.timestamp).toLocaleTimeString()}
      </p>
    </div>
  </div>
);

export default PatientMessage;