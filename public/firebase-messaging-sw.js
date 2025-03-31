
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js");

// This will be replaced during build by Vite
const firebaseConfig = {
  apiKey: "injected-by-vite",
  authDomain: "injected-by-vite",
  projectId: "injected-by-vite",
  storageBucket: "injected-by-vite",
  messagingSenderId: "injected-by-vite",
  appId: "injected-by-vite"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);
  const { title, body } = payload.notification;
  self.registration.showNotification(title, { body });
});