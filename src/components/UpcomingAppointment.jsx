import { AiOutlineClockCircle } from 'react-icons/ai';
import { FaCalendarAlt, FaUserMd, FaMapMarkerAlt, FaVideo } from 'react-icons/fa';

const UpcomingAppointments = ({ appointments, onReschedule, onCancel, onStartVideo,  isCallActive }) => {
  // Format date to readable string
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  // Group appointments by status
  const groupedAppointments = appointments.reduce((acc, appointment) => {
    if (!acc[appointment.status]) {
      acc[appointment.status] = [];
    }
    acc[appointment.status].push(appointment);
    return acc;
  }, {});

  return (
    <div className="bg-white  rounded-lg shadow-sm p-4  ">
      <div className="flex items-center mb-4">
        <AiOutlineClockCircle className="text-xl mr-2 text-blue-900" />
        <h2 className="text-xl font-bold">Upcoming Appointments</h2>
      </div>

      {appointments.length === 0 ? (
        <p className="text-gray-500">No upcoming appointments</p>
      ) : (
        <div className="space-y-4  ">
     {Object.entries(groupedAppointments).map(([status, statusAppointments]) => (
       <div key={status}>
       <h3 className="font-semibold text-gray-700 mb-2 capitalize">
        {status} ({statusAppointments.length})
        </h3>
        <div className="space-y-3">
        {statusAppointments.map((appointment) => (
         <div 
          key={appointment.id} 
          className="border border-blue-900 rounded-lg p-3 hover:shadow-md transition-shadow"
           >
           <div className="flex flex-col md:flex-col lg:flex-row justify-between items-start">
           <div>
           <h4 className="font-medium text-lg">
            {appointment.doctorName}
           </h4>
           <p className="text-gray-600 flex items-center mt-1">
            <FaCalendarAlt className="mr-2 text-blue-500" />
            {formatDate(appointment.date)}
              </p>
            <p className="text-gray-600 flex items-center mt-1">
            <FaMapMarkerAlt className="mr-2 text-green-500" />
             {appointment.location || 'Clinic Main Building'}
            </p>
            <p className="text-gray-600 flex items-center mt-1">
             <FaUserMd className="mr-2 text-purple-500" />
             {appointment.specialty || 'General Checkup'}
             </p>
              </div>
              <div className="flex space-x-2">
               {status === 'approved' && (
               <>
               <button
             onClick={() => !isCallActive && onStartVideo(appointment)}
             className={`p-2 rounded-full ${
             isCallActive
             ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
             : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
             title={isCallActive ? 'Call in progress' : 'Start Video Call'}
          disabled={isCallActive}
            >
          <FaVideo size={16} />
           </button>
              {/* <button
               onClick={() => onStartVideo(appointment)}
              className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
              title="Start Video Call"
               >
              <FaVideo size={16} />
              </button> */}
               <button
                onClick={() => onReschedule(appointment.id)}
               className="px-3 py-1 text-sm border border-yellow-500 text-yellow-600 rounded hover:bg-yellow-50"
               >
               Reschedule
              </button>
              </>
               )}
              <button
              onClick={() => onCancel(appointment.id)}
              className="px-3 py-1 text-sm border border-red-500 text-red-600 rounded hover:bg-red-50"
              >
              Cancel
              </button>
              </div>
              </div>
              {appointment.notes && (
               <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
              <p className="font-medium">Notes:</p>
              <p className="text-gray-600">{appointment.notes}</p>
              </div>
              )}
             </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingAppointments;