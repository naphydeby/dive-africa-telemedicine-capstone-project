const AppointmentRequest = ({ appointments, onApprove, onReject,icon }) => {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center">
      <div className=" text-xl text-blue-900 mb-3 ">
          {icon}
        </div>
      <h3 className="font-bold text-xl mb-3">Appointment Requests</h3>
      </div>
        
        {appointments.length === 0 ? (
          <p>No pending appointments.</p>
        ) : (
          <ul className="space-y-2">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="border p-2 rounded">
                <p><strong>{appointment.patientName}</strong></p>
                <p>{appointment.date} at {appointment.time}</p>
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => onApprove(appointment.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => onReject(appointment.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  export default  AppointmentRequest