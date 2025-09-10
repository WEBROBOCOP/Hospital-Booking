import { useState, useEffect } from 'react';
import { FaTimes, FaHospital, FaUserMd } from 'react-icons/fa';

const DoctorFacilityModal = ({ doctor, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    facility: {
      name: '',
      address: '',
      phone: '',
      type: 'hospital'
    },
    specialty: '',
    licenseNumber: ''
  });

  useEffect(() => {
    if (doctor) {
      setFormData({
        facility: {
          name: doctor.facility?.name || '',
          address: doctor.facility?.address || '',
          phone: doctor.facility?.phone || '',
          type: doctor.facility?.type || 'hospital'
        },
        specialty: doctor.specialty || '',
        licenseNumber: doctor.licenseNumber || ''
      });
    }
  }, [doctor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(doctor._id, formData);
      onClose();
    } catch (error) {
      console.error('Error saving facility information:', error);
    }
  };

  const handleFacilityChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      facility: {
        ...prev.facility,
        [field]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Assign Facility - {doctor?.firstName} {doctor?.lastName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Doctor Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <FaUserMd className="w-4 h-4 mr-2" />
                Doctor Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialty</label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Cardiology, Neurology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">License Number</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., MD123456"
                  />
                </div>
              </div>
            </div>

            {/* Facility Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <FaHospital className="w-4 h-4 mr-2" />
                Facility Information
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Facility Name</label>
                  <input
                    type="text"
                    required
                    value={formData.facility.name}
                    onChange={(e) => handleFacilityChange('name', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., City General Hospital"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    required
                    value={formData.facility.address}
                    onChange={(e) => handleFacilityChange('address', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., 123 Main St, City, State 12345"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={formData.facility.phone}
                      onChange={(e) => handleFacilityChange('phone', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="e.g., (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={formData.facility.type}
                      onChange={(e) => handleFacilityChange('type', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="hospital">Hospital</option>
                      <option value="clinic">Clinic</option>
                      <option value="medical_center">Medical Center</option>
                      <option value="private_practice">Private Practice</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Save Facility Assignment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorFacilityModal;
