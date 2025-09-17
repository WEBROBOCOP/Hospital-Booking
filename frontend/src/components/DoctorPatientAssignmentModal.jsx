import { useState, useEffect } from 'react';
import { FaTimes, FaUserMd, FaUserInjured, FaSearch, FaHospital, FaCheckCircle } from 'react-icons/fa';
import api from '../utils/api';

const DoctorPatientAssignmentModal = ({ patient, onClose, onSave }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/doctors');
      setDoctors(response.data.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleAssign = async () => {
    if (!selectedDoctor) {
      setError('Please select a doctor');
      return;
    }

    try {
      await onSave(patient._id, selectedDoctor._id);
      onClose();
    } catch (error) {
      console.error('Error assigning doctor:', error);
      setError('Failed to assign doctor. Please try again.');
    }
  };

  const filteredDoctors = doctors.filter(doctor => 
    doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.facility?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Assign Doctor to Patient
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          {/* Patient Info */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <FaUserInjured className="w-4 h-4 mr-2" />
              Patient Information
            </h4>
            <div className="text-sm text-gray-700">
              <p><strong>Name:</strong> {patient?.firstName} {patient?.lastName}</p>
              <p><strong>Email:</strong> {patient?.email}</p>
              {patient?.assignedDoctor && (
                <p className="text-green-600">
                  <FaCheckCircle className="inline w-3 h-3 mr-1" />
                  Currently assigned to: {patient.assignedDoctor.firstName} {patient.assignedDoctor.lastName}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Doctor Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search and Select Doctor
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors by name, specialty, or facility..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Doctors List */}
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg mb-6">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="spinner h-6 w-6 mx-auto mb-2"></div>
                Loading doctors...
              </div>
            ) : filteredDoctors.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    onClick={() => handleDoctorSelect(doctor)}
                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedDoctor?._id === doctor._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <FaUserMd className="w-4 h-4 text-blue-600 mr-2" />
                          <h6 className="font-medium text-gray-900">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </h6>
                          {selectedDoctor?._id === doctor._id && (
                            <FaCheckCircle className="w-4 h-4 text-green-600 ml-2" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{doctor.specialty || 'General Practice'}</p>
                        {doctor.facility?.name && (
                          <div className="flex items-center mt-1">
                            <FaHospital className="w-3 h-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">{doctor.facility.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No doctors found. Try adjusting your search criteria.
              </div>
            )}
          </div>

          {/* Selected Doctor Display */}
          {selectedDoctor && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-green-800">
                    Selected: Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </h5>
                  <p className="text-sm text-green-600">{selectedDoctor.specialty || 'General Practice'}</p>
                  {selectedDoctor.facility?.name && (
                    <p className="text-xs text-green-600">{selectedDoctor.facility.name}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="text-green-600 hover:text-green-800"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedDoctor}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                selectedDoctor
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Assign Doctor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPatientAssignmentModal;
