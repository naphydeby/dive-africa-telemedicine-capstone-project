
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js");

// This will be replaced during build by Vite
const firebaseConfig = {
  apiKey: "IzaSyBBNVu_XNWUhtWSdogITTmYdI_Ttbv4qKU",
  authDomain: "telemedix-cec11.firebaseapp.com",
  projectId: "telemedix-cec11",
  storageBucket: "telemedix-cec11.appspot.com",
  messagingSenderId: "616521962183",
  appId: "1:616521962183:web:fe284c253aa7cf9adca4e2"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);
  const { title, body } = payload.notification;
  self.registration.showNotification(title, { body });
});