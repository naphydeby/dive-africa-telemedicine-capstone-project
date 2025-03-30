import React, { useState, useEffect } from 'react';
import { auth, db } from '/src/firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { FaUserEdit, FaCamera, FaSave } from 'react-icons/fa';
import DoctorSidebar from "../../components/DoctorSidebar";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
   fullName: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    role: "doctor",
    specialization: "",
        
  
  });
  const [photoURL, setPhotoURL] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      setUser(currentUser);
      setPhotoURL(currentUser.photoURL || '');

      try {
        // Fetch user data from 'users' collection
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setFormData({
            fullName: data.fullName || currentUser.displayName || '',
            phoneNumber: data.phoneNumber || '',
            specialization: data.specialization || '',
            role: data.role || '',
            dateOfBirth: data. dateOfBirth || ''
          });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
      setPhotoURL(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let photoUrl = photoURL;

      // Upload new photo if selected
      if (photoFile) {
        const storageRef = ref(storage, `profilePhotos/${user.uid}`);
        await uploadBytes(storageRef, photoFile);
        photoUrl = await getDownloadURL(storageRef);
      }

      // Update auth profile
      await updateProfile(user, {
        displayName: formData.fullName,
        photoURL: photoUrl
      });

      // Update user data in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        ...(userData?.role === 'doctor' && { specialization: formData.specialization }),
        bio: formData.bio,
        ...(photoUrl && { photoURL: photoUrl })
      });

      // Refresh user data
      const updatedDoc = await getDoc(userRef);
      setUserData(updatedDoc.data());
      setEditMode(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
    <DoctorSidebar/>
    <div className="w-full lg:w-3/4 mt-8 p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center lg:mt-8 lg:mt-0 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
          <button
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
          >
            {editMode ? <FaSave /> : <FaUserEdit />}
            {editMode ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 flex flex-col items-center">
            <div className="relative mb-4">
              <img
                src={photoURL || '/default-avatar.png'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
              />
              {editMode && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                  <FaCamera />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <h2 className="text-xl font-semibold">{user?.displayName}</h2>
            {userData?.role === 'doctor' && (
              <p className="text-blue-600">{userData?.specialization}</p>
            )}
          </div>

          <div className="md:w-2/3">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-1">Full Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded border border-blue-900 focus:outline-none"
                      required
                    />
                  ) : (
                    <p className="p-2 bg-gray-100 rounded">{formData.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Email</label>
                  <p className="p-2 bg-gray-100 rounded border border-blue-900 focus:outline-none">{user?.email}</p>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Phone Number</label>
                  {editMode ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded border border-blue-900 focus:outline-none"
                    />
                  ) : (
                    <p className="p-2 bg-gray-100 rounded">{formData.phoneNumber || 'Not provided'}</p>
                  )}
                </div>

                {userData?.role === 'doctor' && (
                  <div>
                    <label className="block text-gray-700 mb-1">Specialization</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded border border-blue-900 focus:outline-none"
                      />
                    ) : (
                      <p className="p-2 bg-gray-100 rounded">{formData.specialization || 'Not specified'}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Bio</label>
                {editMode ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded h-24 border border-blue-900 focus:outline-none"
                  />
                ) : (
                  <p className="p-2 bg-gray-100 rounded min-h-24">
                    {formData.bio || 'No bio provided'}
                  </p>
                )}
              </div>

              {editMode && (
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-blue-400"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Profile;