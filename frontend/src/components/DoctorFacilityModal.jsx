import { useState, useEffect } from 'react'; import { FaTimes, FaHospital, FaUserMd, FaSearch, FaMapMarkerAlt, FaPhone, FaGlobe, FaStar, FaFilter } from 'react-icons/fa';
import api from '../utils/api';

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
  
  // New state for facility selection
  const [availableFacilities, setAvailableFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [facilitySearchTerm, setFacilitySearchTerm] = useState('');
  const [facilityTypeFilter, setFacilityTypeFilter] = useState('');
  const [showFacilitySelector, setShowFacilitySelector] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [useExistingFacility, setUseExistingFacility] = useState(false);

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

  // Fetch available facilities
  const fetchFacilities = async () => {
    setLoadingFacilities(true);
    try {
      const params = new URLSearchParams();
      if (facilitySearchTerm) params.append('search', facilitySearchTerm);
      if (facilityTypeFilter) params.append('type', facilityTypeFilter);
      params.append('radius', '50'); // Large radius to get more facilities
      
      const response = await api.get(`/admin/facilities?${params.toString()}`);
      setAvailableFacilities(response.data.data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    } finally {
      setLoadingFacilities(false);
    }
  };

  // Handle facility selection
  const handleFacilitySelect = (facility) => {
    setSelectedFacility(facility);
    setFormData(prev => ({
      ...prev,
      facility: {
        name: facility.name,
        address: facility.address,
        phone: facility.phone,
        type: facility.type
      }
    }));
    setShowFacilitySelector(false);
  };

  // Toggle between manual entry and facility selection
  const toggleFacilityMode = () => {
    setUseExistingFacility(!useExistingFacility);
    if (!useExistingFacility) {
      fetchFacilities();
    }
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
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <FaHospital className="w-4 h-4 mr-2" />
                  Facility Information
                </h4>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={useExistingFacility}
                      onChange={toggleFacilityMode}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Select from available facilities
                  </label>
                </div>
              </div>
              {useExistingFacility ? (
                // Facility Selection Interface
                <div className="space-y-4">
                  {/* Search and Filter Controls */}
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search facilities..."
                        value={facilitySearchTerm}
                        onChange={(e) => setFacilitySearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && fetchFacilities()}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <select
                      value={facilityTypeFilter}
                      onChange={(e) => setFacilityTypeFilter(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">All Types</option>
                      <option value="hospital">Hospital</option>
                      <option value="clinic">Clinic</option>
                      <option value="medical_center">Medical Center</option>
                      <option value="private_practice">Private Practice</option>
                    </select>
                    <button
                      onClick={fetchFacilities}
                      disabled={loadingFacilities}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loadingFacilities ? 'Searching...' : 'Search'}
                    </button>
                  </div>

                  {/* Selected Facility Display */}
                  {selectedFacility && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-green-800">{selectedFacility.name}</h5>
                          <p className="text-sm text-green-600">{selectedFacility.address}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-green-600 flex items-center">
                              <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                              {selectedFacility.distance}km away
                            </span>
                            <span className="text-xs text-green-600 flex items-center">
                              <FaStar className="w-3 h-3 mr-1" />
                              {selectedFacility.rating} ({selectedFacility.userRatingsTotal} reviews)
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedFacility(null)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Facilities List */}
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    {loadingFacilities ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="spinner h-6 w-6 mx-auto mb-2"></div>
                        Loading facilities...
                      </div>
                    ) : availableFacilities.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {availableFacilities.map((facility) => (
                          <div
                            key={facility.id}
                            onClick={() => handleFacilitySelect(facility)}
                            className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                              selectedFacility?.id === facility.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h6 className="font-medium text-gray-900">{facility.name}</h6>
                                <p className="text-sm text-gray-600 mt-1">{facility.address}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <span className="text-xs text-gray-500 flex items-center">
                                    <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                                    {facility.distance}km
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center">
                                    <FaPhone className="w-3 h-3 mr-1" />
                                    {facility.phone}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center">
                                    <FaStar className="w-3 h-3 mr-1" />
                                    {facility.rating}
                                  </span>
                                </div>
                                <div className="mt-2">
                                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mr-1">
                                    {facility.type}
                                  </span>
                                  {facility.specialties.slice(0, 2).map((specialty, index) => (
                                    <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full mr-1">
                                      {specialty}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No facilities found. Try adjusting your search criteria.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Manual Entry Form
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
              )}
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
