import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const Review = ({ reviews, onReply, onHide, icon }) => {
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleSubmitReply = (reviewId) => {
    if (replyText.trim()) {
      onReply(reviewId, replyText);
      setActiveReplyId(null);
      setReplyText('');
    }
  };

  // Safe date formatting function
  const formatDate = (date) => {
    if (!date) return 'No date';
    
    try {
      // Handle Firestore Timestamp
      if (date.toDate) {
        return date.toDate().toLocaleDateString();
      }
      // Handle string or number timestamps
      if (typeof date === 'string' || typeof date === 'number') {
        return new Date(date).toLocaleDateString();
      }
      // If it's already a Date object
      if (date instanceof Date) {
        return date.toLocaleDateString();
      }
      return 'Invalid date';
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className='flex items-center'>
        <div className="text-xl text-blue-900 mb-3">
          {icon}
        </div>
        <h3 className="font-bold text-xl mb-4">Patient Reviews</h3>
      </div>
      
      {reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet.</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {reviews.map((review) => (
            <div key={review.id} className={`border p-3 rounded-lg ${
              review.status === 'hidden' ? 'bg-gray-100 opacity-75' : ''
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{review.patientName}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {formatDate(review.date)}
                </p>
              </div>

              <p className="mt-2">{review.comment}</p>

              {review.doctorReply && (
                <div className="mt-2 p-2 bg-blue-50 rounded">
                  <p className="font-semibold">Your Reply:</p>
                  <p>{review.doctorReply}</p>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                {!review.doctorReply && activeReplyId !== review.id && (
                  <button
                    onClick={() => setActiveReplyId(review.id)}
                    className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition"
                  >
                    Reply
                  </button>
                )}
                <button
                  onClick={() => onHide(review.id)}
                  className={`text-sm px-2 py-1 rounded hover:opacity-80 transition ${
                    review.status === 'hidden'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {review.status === 'hidden' ? 'Show' : 'Hide'}
                </button>
              </div>

              {activeReplyId === review.id && (
                <div className="mt-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response..."
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleSubmitReply(review.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => {
                        setActiveReplyId(null);
                        setReplyText('');
                      }}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Review;