
// import React, { useEffect, useState } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { auth, db } from "../firebase/firebaseConfig";
// import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
// import { doc, setDoc, serverTimestamp } from "firebase/firestore";
// import doctorImage2 from "../assets/images/Animation-2.gif";
// import sideRightImage1 from "../assets/images/doc-4.jpg";
// import sideRightImage2 from "../assets/images/doc-3.jpg";
// import AOS from "aos";
// import "aos/dist/aos.css";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import Slider from "react-slick";

// const Signup = () => {
//   useEffect(() => {
//     AOS.init({
//       duration: 1200,
//       easing: "ease-in-out",
//       once: false,
//     });
//   }, []);

//   const sliderSettings = {
//     dots: false,
//     infinite: true,
//     speed: 1200,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     autoplay: true,
//     autoplaySpeed: 3000,
//     TransitionEvent: "ease-in-out",
//     innerHeight: "100%",
//     innerWidth: "100%",
//   };

//    // Cloudinary configuration - REPLACE WITH YOUR ACTUAL VALUES
//    const CLOUD_NAME = "VITE_CLOUDINARY_CLOUD_NAME";
//    const UPLOAD_PRESET = "VITE_CLOUDINARY_UPLOAD_PRESET";
   
//    const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;;
//    const CLOUDINARY_FOLDER = "telemedix_profiles";
//    const [formData, setFormData] = useState({
//     fullName: "",
//     phoneNumber: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     dateOfBirth: "",
//     role: "patient",
//     specialization: "",
//   });
//   const [photoFile, setPhotoFile] = useState(null);
//   const [photoPreview, setPhotoPreview] = useState(null);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const validateEmail = (email) => {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return re.test(String(email).toLowerCase());
//   };

//   const validatePassword = (password) => {
//     return password.length >= 6;
//   };

//   const validatePhoneNumber = (phone) => {
//     return /^\d{10,15}$/.test(phone);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handlePhotoChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Validate file type and size
//     const validTypes = ["image/jpeg", "image/png", "image/webp"];
//     const maxSize = 5 * 1024 * 1024; // 5MB

//     if (!validTypes.includes(file.type)) {
//       setError("Only JPG, PNG, or WEBP images allowed");
//       return;
//     }

//     if (file.size > maxSize) {
//       setError("Image must be smaller than 5MB");
//       return;
//     }

//     setPhotoFile(file);
//     setPhotoPreview(URL.createObjectURL(file));
//     setError("");
//   };

//   const uploadToCloudinary = async (file) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
//     formData.append('folder', CLOUDINARY_FOLDER);

//     try {
//       const response = await fetch( `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`, {
//         method: 'POST',
//         body: formData
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error?.message || "Image upload failed");
//       }

//       const data = await response.json();
      
//       // Apply transformations to the URL (400x400 face crop)
//       return data.secure_url.replace('/upload/', '/upload/w_400,h_400,c_fill,g_face/');
//     } catch (error) {
//       console.error('Cloudinary upload error:', error);
//       throw new Error("Failed to upload image. Please try again.");
//     }
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       // Validate all fields
//       if (!formData.fullName.trim()) throw new Error("Full name is required");
//       if (!validateEmail(formData.email)) throw new Error("Please enter a valid email address");
//       if (!validatePassword(formData.password)) throw new Error("Password must be at least 6 characters");
//       if (formData.password !== formData.confirmPassword) throw new Error("Passwords do not match");
//       if (!validatePhoneNumber(formData.phoneNumber)) throw new Error("Please enter a valid phone number");
//       if (formData.role === "doctor" && !formData.specialization.trim()) throw new Error("Specialization is required for doctors");
//       if (!formData.dateOfBirth) throw new Error("Date of birth is required");
//       if (!photoFile) throw new Error("Profile photo is required");

//       // Upload image to Cloudinary
//       const photoURL = await uploadToCloudinary(photoFile);

//       // Create user in Firebase Authentication
//       const userCredential = await createUserWithEmailAndPassword(
//         auth, 
//         formData.email, 
//         formData.password
//       );

//       // Update user profile with Cloudinary URL
//       await updateProfile(userCredential.user, {
//         displayName: formData.fullName,
//         photoURL: photoURL,
//       });

//       // Prepare user data for Firestore (excluding passwords)
//       const { password, confirmPassword, ...userData } = formData;
      
//       await setDoc(doc(db, "users", userCredential.user.uid), {
//         ...userData,
//         uid: userCredential.user.uid,
//         photoURL: photoURL,
//         createdAt: new Date().toISOString(),
//         lastLogin: new Date().toISOString(),
//         status: "active"
//       });

//       // Redirect to login with success state
//       navigate("/login", { 
//         state: { 
//           signupSuccess: true,
//           email: formData.email,
//           name: formData.fullName
//         } 
//       });

//     } catch (error) {
//       console.error("Signup error:", error);
//       setError(error.message || "An error occurred during signup. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <div className="min-h-screen w-[100%] h-[100vh] flex justify-center lg:justify-between bg-[#fefbfb]">
//       <div className="hidden lg:block lg:h-[100vh] lg:w-[500px] xl:w-[600px] 2xl:w-[1100px] lg:overflow-hidden bg-[blue]">
//         <Slider {...sliderSettings}>
//           <div className="w-[100%] h-[100vh]">
//             <img src={sideRightImage1} alt="hospital1" className="w-[100%] h-[100%] object-cover" />
//           </div>
//           <div className="w-[100%] h-[100vh]">
//             <img src={sideRightImage2} alt="hospital2" className="w-[100%] h-[100%] object-cover" />
//           </div>
//         </Slider>
//       </div>
//       {/* Right Side - Signup Form */}
//       <div className="w-full lg:w-[55%] xl:w-[50%] flex items-center justify-center p-4 md:p-8 overflow-y-auto">
//         <div className="w-full max-w-md">
//           {/* Logo and Title */}
//           <div className="flex flex-col items-center mb-8">
//             <div className="flex items-center mb-4">
//               <div className="w-16 h-16 rounded-full bg-[#483d8b] flex items-center justify-center">
//                 <img
//                   src={doctorImage2}
//                   alt="Telemedix Logo"
//                   className="w-14 h-14 rounded-full"
//                   data-aos="fade-up"
//                 />
//               </div>
//               <h1 className="ml-4 text-[#483d8b] font-bold text-3xl">Telemedix</h1>
//             </div>
//             <h2 className="text-2xl font-semibold text-gray-800">Create Your Account</h2>
//           </div>

//           {/* Error Message */}
//           {error && (
//             <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
//               {error}
//             </div>
//           )}

//           {/* Signup Form */}
//           <form onSubmit={handleSignup} className="space-y-4">
//             {/* Profile Photo Upload */}
//             <div className="flex flex-col items-center mb-4">
//               <label className="cursor-pointer group">
//                 <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 group-hover:border-[#483d8b] overflow-hidden flex items-center justify-center">
//                   {photoPreview ? (
//                     <img 
//                       src={photoPreview} 
//                       alt="Profile Preview" 
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="text-center">
//                       <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                       </svg>
//                       <span className="text-xs text-gray-500">Upload Photo</span>
//                     </div>
//                   )}
//                 </div>
//                 <input
//                   type="file"
//                   name="profilePhoto"
//                   accept="image/jpeg,image/png,image/webp"
//                   onChange={handlePhotoChange}
//                   className="hidden"
                  
//                 />
//               </label>
//             </div>

//             {/* Form Fields */}
//             <div className="space-y-4">
//               <input
//                 name="fullName"
//                 type="text"
//                 placeholder="Full Name"
//                 value={formData.fullName}
//                 onChange={handleChange}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#483d8b] focus:border-transparent"
                
//               />

//               <input
//                 name="phoneNumber"
//                 type="tel"
//                 placeholder="Phone Number"
//                 value={formData.phoneNumber}
//                 onChange={handleChange}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#483d8b] focus:border-transparent"
                
//               />

//               <input
//                 name="email"
//                 type="email"
//                 placeholder="Email Address"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#483d8b] focus:border-transparent"
                
//               />

//               <input
//                 name="password"
//                 type="password"
//                 placeholder="Password (min 6 characters)"
//                 value={formData.password}
//                 onChange={handleChange}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#483d8b] focus:border-transparent"
//                 required
//                 minLength={6}
//               />

//               <input
//                 name="confirmPassword"
//                 type="password"
//                 placeholder="Confirm Password"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#483d8b] focus:border-transparent"
                
//                 minLength={6}
//               />

//               <select
//                 name="role"
//                 value={formData.role}
//                 onChange={handleChange}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#483d8b] focus:border-transparent"
//                 required
//               >
//                 <option value="patient">Patient</option>
//                 <option value="doctor">Doctor</option>
//               </select>

//               {formData.role === "doctor" && (
//                 <input
//                   name="specialization"
//                   type="text"
//                   placeholder="Specialization (e.g. Cardiologist)"
//                   value={formData.specialization}
//                   onChange={handleChange}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#483d8b] focus:border-transparent"
//                   required={formData.role === "doctor"}
//                 />
//               )}

//               <input
//                 name="dateOfBirth"
//                 type="date"
//                 value={formData.dateOfBirth}
//                 onChange={handleChange}
//                 max={new Date().toISOString().split('T')[0]}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#483d8b] focus:border-transparent"
                
//               />
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className={`w-full py-3 px-4 text-white rounded-lg transition-colors ${
//                 loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#483d8b] hover:bg-[#3a2f6b]"
//               }`}
//             >
//               {loading ? (
//                 <span className="flex items-center justify-center">
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Creating Account...
//                 </span>
//               ) : "Sign Up"}
//             </button>
//           </form>

//           {/* Login Link */}
//           <p className="mt-6 text-center text-sm text-gray-600">
//             Already have an account?{" "}
//             <NavLink 
//               to="/login" 
//               className="font-medium text-[#483d8b] hover:underline"
//             >
//               Log in
//             </NavLink>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Signup;





import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import doctorImage2 from "../assets/images/Animation-2.gif";
import sideRightImage1 from "../assets/images/doc-4.jpg";
import sideRightImage2 from "../assets/images/doc-3.jpg";
import AOS from "aos";
import "aos/dist/aos.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    role: "patient",
    specialization: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoURL, setPhotoURL] = useState(null); // Added to store final uploaded URL
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1200,
      easing: "ease-in-out",
      once: false,
    });

    // Validate Cloudinary config
    if (!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 
        !import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) {
      console.error('Cloudinary environment variables are missing!');
      setError('Configuration error - please contact support');
    }
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

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validatePhoneNumber = (phone) => {
    return /^\d{10,15}$/.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setError("Only JPG, PNG, or WEBP images allowed");
      return;
    }

    if (file.size > maxSize) {
      setError("Image must be smaller than 5MB");
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'telemedix_profiles');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
        { method: 'POST', body: formData }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Image upload failed");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      let errorMessage = 'Image upload failed. Please try again.';
      
      if (error.message.includes('File size too large')) {
        errorMessage = 'Image must be smaller than 5MB';
      } else if (error.message.includes('Invalid file type')) {
        errorMessage = 'Only JPG, PNG, or WEBP images allowed';
      }
      
      throw new Error(errorMessage);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate all fields
      if (!formData.fullName.trim()) throw new Error("Full name is required");
      if (!validateEmail(formData.email)) throw new Error("Please enter a valid email address");
      if (!validatePassword(formData.password)) throw new Error("Password must be at least 6 characters");
      if (formData.password !== formData.confirmPassword) throw new Error("Passwords do not match");
      if (!validatePhoneNumber(formData.phoneNumber)) throw new Error("Please enter a valid phone number");
      if (formData.role === "doctor" && !formData.specialization.trim()) throw new Error("Specialization is required for doctors");
      if (!formData.dateOfBirth) throw new Error("Date of birth is required");
      if (!photoFile) throw new Error("Profile photo is required");

      // Upload image to Cloudinary
      const uploadedPhotoURL = await uploadToCloudinary(photoFile);
      setPhotoURL(uploadedPhotoURL); // Store the final URL

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // Update user profile with Cloudinary URL
      await updateProfile(userCredential.user, {
        displayName: formData.fullName,
        photoURL: uploadedPhotoURL,
      });

      // Prepare user data for Firestore
      const { password, confirmPassword, ...userData } = formData;
      
      await setDoc(doc(db, "users", userCredential.user.uid), {
        ...userData,
        uid: userCredential.user.uid,
        photoURL: uploadedPhotoURL,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        status: "active"
      });

      // Redirect to login with success state
      navigate("/login", { 
        state: { 
          signupSuccess: true,
          email: formData.email,
          name: formData.fullName
        } 
      });

    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "An error occurred during signup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-[100%] h-[100vh] flex justify-center lg:justify-between bg-[#fefbfb]">
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
      
      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-[55%] xl:w-[50%] flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#483d8b] flex items-center justify-center">
                <img
                  src={doctorImage2}
                  alt="Telemedix Logo"
                  className="w-14 h-14 rounded-full"
                  data-aos="fade-up"
                />
              </div>
              <h1 className="ml-4 text-[#483d8b] font-bold text-3xl">Telemedix</h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Create Your Account</h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center mb-4 ">
              <label className="cursor-pointer group">
                <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 group-hover:border-[#483d8b] overflow-hidden flex items-center justify-center">
                  {photoPreview ? (
                    <img 
                      src={photoPreview}
                      alt="Profile Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-gray-500">Upload Photo</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  name="profilePhoto"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                  required
                />
              </label>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <input
                name="fullName"
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#483d8b] focus:border-transparent"
                required
              />

              <input
                name="phoneNumber"
                type="tel"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#483d8b] focus:border-transparent"
                required
              />

              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#483d8b] focus:border-transparent"
                required
              />

              <input
                name="password"
                type="password"
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#483d8b] focus:border-transparent"
                required
                minLength={6}
              />

              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#483d8b] focus:border-transparent"
                required
                minLength={6}
              />

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#483d8b] focus:border-transparent"
                required
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>

              {formData.role === "doctor" && (
                <input
                  name="specialization"
                  type="text"
                  placeholder="Specialization (e.g. Cardiologist)"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#483d8b] focus:border-transparent"
                  required={formData.role === "doctor"}
                />
              )}

              <input
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#483d8b] focus:border-transparent"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 text-white rounded-lg transition-colors ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#483d8b] hover:bg-[#3a2f6b]"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : "Sign Up"}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <NavLink 
              to="/login" 
              className="font-medium text-[#483d8b] hover:underline"
            >
              Log in
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;


