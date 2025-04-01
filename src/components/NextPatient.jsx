
import { AiOutlineClockCircle } from 'react-icons/ai';
import { FaUserAlt, FaVideo } from 'react-icons/fa';

const NextPatient = ({ upcomingAppointments, icon, onStartVideo,isCallActive }) => {
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex items-center mb-4">
        {icon || <AiOutlineClockCircle className="text-xl mr-2 text-blue-900" />}
        <h2 className="text-xl font-bold">Next Patient</h2>
      </div>

      {upcomingAppointments.length === 0 ? (
        <p className="text-gray-500">No upcoming appointments</p>
      ) : (
        <div className="border border-blue-900 rounded-lg p-3 hover:shadow-md transition-shadow">
          <div className="flex flex-col">
            <div className="flex flex-col items-start mb-2">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <FaUserAlt className="text-blue-900" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">
                    {upcomingAppointments[0].patientName}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {upcomingAppointments[0].patientId}
                  </p>
                </div>
              </div>
              {onStartVideo && (
        <button
        onClick={() => !isCallActive && onStartVideo(upcomingAppointments[0])}
         className={`flex items-center px-3 py-1 rounded-md transition-colors ${
         isCallActive 
        ? 'bg-gray-400 cursor-not-allowed' 
        : 'bg-blue-900 text-white hover:bg-blue-800'
         }`}
         disabled={isCallActive}
       aria-label={isCallActive ? 'Call in progress' : 'Start video call'}
      >
    <FaVideo className="mr-2" />
    {isCallActive ? 'Call in Progress' : 'Start Video'}
      </button>
     )}
              
              {/* {onStartVideo && (
                <button
                  onClick={() => onStartVideo(upcomingAppointments[0])}
                  className="flex items-center px-3 py-1 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
                  aria-label="Start video call"
                >
                  <FaVideo className="mr-2" />
                  Start Video
                </button>
              )} */}
            </div>
            
            <div className="space-y-2 pl-11">
              <p className="text-gray-600 flex items-center">
                <span className="inline-block w-24 font-medium">Date:</span>
                {formatDate(upcomingAppointments[0].date)}
              </p>
              <p className="text-gray-600 flex items-center">
                <span className="inline-block w-24 font-medium">Time:</span>
                {formatTime(upcomingAppointments[0].date)}
              </p>
              {upcomingAppointments[0].purpose && (
                <p className="text-gray-600 flex items-center">
                  <span className="inline-block w-24 font-medium">Purpose:</span>
                  {upcomingAppointments[0].purpose}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

NextPatient.defaultProps = {
  onStartVideo: null,
  upcomingAppointments: []
};

export default NextPatient;