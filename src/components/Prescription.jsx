import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '/src/firebase/firebaseConfig';

const Prescription = ({ prescriptions,icon }) => {
  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    medicines: [{ name: '', dosage: '' }],
    instructions: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddMedicine = () => {
    setNewPrescription(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '' }]
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...newPrescription.medicines];
    updatedMedicines[index][field] = value;
    setNewPrescription(prev => ({ ...prev, medicines: updatedMedicines }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'prescriptions'), {
        doctorId: auth.currentUser.uid,
        ...newPrescription,
        date: new Date()
      });
      setNewPrescription({
        patientId: '',
        medicines: [{ name: '', dosage: '' }],
        instructions: ''
      });
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding prescription:", error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
      <div className='flex items-center'>
      <div className="text-xl text-blue-900 ">
          {icon}
        </div>
      <h3 className="font-bold text-xl">Prescriptions</h3>
      </div>
       
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-900 text-white px-3 py-1 rounded text-sm"
        >
          {isAdding ? 'Cancel' : '+ New Prescription'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 border border-blue-900 p-4 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Patient ID</label>
            <input
              type="text"
              value={newPrescription.patientId}
              onChange={(e) => setNewPrescription(prev => ({ ...prev, patientId: e.target.value }))}
              className="w-full p-2 border border-blue-900 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Medicines</label>
            {newPrescription.medicines.map((medicine, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Medicine name"
                  value={medicine.name}
                  onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                  className="w-[50%] p-2 border border-blue-900 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Dosage"
                  value={medicine.dosage}
                  onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                  className="w-[50%] p-2 border border-blue-900 rounded"
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddMedicine}
              className="text-blue-900 text-sm mt-1"
            >
              + Add another medicine
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Instructions</label>
            <textarea
              value={newPrescription.instructions}
              onChange={(e) => setNewPrescription(prev => ({ ...prev, instructions: e.target.value }))}
              className="w-full p-2 border border-blue-900 rounded"
              rows="3"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-900 text-white px-4 py-2 rounded"
          >
            Save Prescription
          </button>
        </form>
      )}

      <div className="space-y-4 max-h-64 overflow-y-auto">
        {prescriptions.length === 0 ? (
          <p className="text-gray-500">No prescriptions yet.</p>
        ) : (
          prescriptions.map((prescription) => (
            <div key={prescription.id} className="border border-blue-900 p-3 rounded-lg">
              <div className="flex justify-between">
                <p className="font-bold">Patient: {prescription.patientId}</p>
                <p className="text-sm text-gray-500">
                  {prescription.date?.toDate().toLocaleDateString()}
                </p>
              </div>
              <div className="mt-2">
                <h4 className="font-medium">Medicines:</h4>
                <ul className="list-disc pl-5 mt-1">
                  {prescription.medicines.map((med, idx) => (
                    <li key={idx}>
                      {med.name} - {med.dosage}
                    </li>
                  ))}
                </ul>
              </div>
              {prescription.instructions && (
                <p className="mt-2">
                  <span className="font-medium">Instructions:</span> {prescription.instructions}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Prescription;