

import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { addDoc, collection, doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "/src/firebase/firebaseConfig";

const ReviewForm = ({ 
  doctor, 
  onClose, 
  onReviewSubmitted,
  initialRating = 0, 
  initialComment = '' 
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!auth.currentUser) {
        throw new Error("You must be logged in to submit a review");
      }

      // Add review to the reviews collection
      const reviewDoc = {
        doctorId: doctor.id,
        doctorName: doctor.fullName,
        patientId: auth.currentUser.uid,
        patientName: auth.currentUser.displayName || "Anonymous",
        rating,
        comment,
        date: new Date().toISOString(),
        status: 'published'
      };

      await addDoc(collection(db, "reviews"), reviewDoc);

      // Update doctor's average rating
      await updateDoctorRating(doctor.id, rating);

      // Notify parent component that review was submitted
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      onClose();
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDoctorRating = async (doctorId, newRating) => {
    const doctorRef = doc(db, "users", doctorId);
    const doctorSnap = await getDoc(doctorRef);

    if (doctorSnap.exists()) {
      const doctorData = doctorSnap.data();
      const currentReviews = doctorData.reviews || 0;
      const currentRating = doctorData.averageRating || 0;
      
      // Calculate new average rating
      const newAverage = currentReviews > 0 
        ? ((currentRating * currentReviews) + newRating) / (currentReviews + 1)
        : newRating;
      
      await updateDoc(doctorRef, {
        reviews: currentReviews + 1,
        averageRating: newAverage
      });
    }
  };

  if (!doctor) return null;

  return (
    
    <div className="fixed inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Review Dr. {doctor.fullName}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`text-3xl focus:outline-none ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                  disabled={isSubmitting}
                >
                  <FaStar />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Review</label>
            <textarea
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this doctor..."
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-white transition ${
                isSubmitting || rating === 0
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;