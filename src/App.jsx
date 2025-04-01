

import React from 'react'

import { BrowserRouter,Routes, Route } from 'react-router-dom';   
import Login from "./Pages/Login";
import Signup from "./Pages/Signup"
import DoctorDashboard from './Pages/Doctor/DoctorDashboard';
import ViewAppointment from './Pages/Doctor/ViewAppointment';
import Patient from './Pages/Doctor/Patient';
import Messages from './Pages/Doctor/Messages';
import Profile from './Pages/Doctor/Profile';
import MedicalRecord from './Pages/Doctor/MedicalRecord';
import PatientDashboard from './Pages/Patient/PatientDashboard';
import BookAppointment from './Pages/Patient/BookAppointment';
import PatientMedicalHistory from './Pages/Patient/PatientMedicalHistory';
import PatientMessage from './Pages/Patient/PatientMessage';
import PatientProfile from './Pages/Patient/PatientProfile';
import ProtectedRoute from './Pages/ProtectedRoute';
import Notifications from './Pages/Doctor/Notifications';
import NotFountPage from './Pages/NotFountPage'


const App = () => {
  return (
    <BrowserRouter>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes for Doctors */}
      <Route
        path="/doctordashboard"
        element={
          <ProtectedRoute role="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/viewappointment"
        element={
          <ProtectedRoute role="doctor">
            <ViewAppointment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient"
        element={
          <ProtectedRoute role="doctor">
            <Patient />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute role="doctor">
            <Messages />
          </ProtectedRoute>
        }
      />
       <Route
        path="/notifications"
        element={
          <ProtectedRoute role="doctor">
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute role="doctor">
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/medicalrecord"
        element={
          <ProtectedRoute role="doctor">
            <MedicalRecord />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes for Patients */}
      <Route
        path="/patientdashboard"
        element={
          <ProtectedRoute role="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookappointment"
        element={
          <ProtectedRoute role="patient">
            <BookAppointment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patientmedicalhistory"
        element={
          <ProtectedRoute role="patient">
            <PatientMedicalHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patientmessage"
        element={
          <ProtectedRoute role="patient">
            <PatientMessage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/patientprofile"
        element={
          <ProtectedRoute role="patient">
            <PatientProfile />
          </ProtectedRoute>
        }
      />
  <Route path="*" element={<NotFountPage/>} />
      
      
    </Routes>
  </BrowserRouter>

  
  )
}
export default App