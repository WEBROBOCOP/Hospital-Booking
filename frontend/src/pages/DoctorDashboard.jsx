import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { format } from 'date-fns';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaEye,
  FaPrescriptionBottle,
  FaHistory,
  FaFilter,
  FaExclamationTriangle
} from 'react-icons/fa';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [facilityInfo, setFacilityInfo] = useState(null);
  const { currentUser } = useAuth();

  const fetchFacilityInfo = async () => {
    try {
      const response = await api.get("/doctors/facility");
      setFacilityInfo(response.data.data);
    } catch (err) {
      console.error("Error fetching facility info:", err);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'doctor') {
      fetchAppointments();
      fetchFacilityInfo();
    }
  }, [currentUser, filterStatus, filterDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let queryParams = '';
      if (filterStatus !== 'all') {
        queryParams += `?status=${filterStatus}`;
      }
      if (filterDate) {
        queryParams += queryParams ? `&date=${filterDate}` : `?date=${filterDate}`;
      }

      const response = await api.get(`/doctors/appointments${queryParams}`);
      setAppointments(response.data.data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.patch(`/appointments/${appointmentId}`, { status: newStatus });
      setAppointments(prev => 
        prev.map(apt => 
          apt._id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
    } catch (err) {
      console.error('Error updating appointment status:', err);
    }
  };

  const handleViewPrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPrescriptionForm(true);
  };

  const handleViewMedicalHistory = async (appointment) => {
    try {
      const response = await api.get(`/medical-records/${appointment.userId}`);
      setMedicalHistory(response.data.data);
      setSelectedAppointment(appointment);
      setShowMedicalHistory(true);
    } catch (err) {
      console.error('Error fetching medical history:', err);
    }
  };

  const handlePrescriptionSubmit = async (prescriptionData) => {
    try {
      await api.post('/medical-records', {
        userId: selectedAppointment.userId,
        appointmentId: selectedAppointment._id,
        ...prescriptionData
      });
      setShowPrescriptionForm(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error creating prescription:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <FaCheckCircle className="w-4 h-4" />;
      case 'cancelled': return <FaTimesCircle className="w-4 h-4" />;
      case 'completed': return <FaCheckCircle className="w-4 h-4" />;
      default: return <FaClock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          {!facilityInfo?.facility?.name && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <div className="flex items-center">
                <FaExclamationTriangle className="w-5 h-5 mr-2" />
                <div>
                  <strong>No Facility Assigned</strong>
                  <p className="text-sm">Please contact your administrator to assign you to a facility.</p>
                </div>
              </div>
            </div>
          )}
          {facilityInfo?.facility?.name && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
              <div className="flex items-center">
                <FaUser className="w-5 h-5 mr-2" />
                <div>
                  <strong>Assigned to: {facilityInfo.facility.name}</strong>
                  <p className="text-sm">{facilityInfo.facility.address} - {facilityInfo.facility.type}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Appointments</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Appointments</h2>
          </div>
          
          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {appointments.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <FaCalendarAlt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No appointments found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <div key={appointment._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaUser className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {appointment.userName}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1 capitalize">{appointment.status}</span>
                            </span>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <FaCalendarAlt className="w-4 h-4 mr-1" />
                              {format(new Date(appointment.date), 'MMM dd, yyyy')}
                            </div>
                            <div className="flex items-center">
                              <FaClock className="w-4 h-4 mr-1" />
                              {appointment.time}
                            </div>
                            <div className="text-sm text-gray-600">
                              {appointment.specialty}
                            </div>
                          </div>
                          {appointment.reason && (
                            <p className="mt-1 text-sm text-gray-600">
                              <strong>Reason:</strong> {appointment.reason}
                            </p>
                          )}
                          {appointment.facilityName && (
                            <p className="mt-1 text-sm text-gray-600">
                              <strong>Facility:</strong> {appointment.facilityName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <FaCheckCircle className="w-4 h-4 mr-1" />
                            Confirm
                          </button>
                          <button
                            onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <FaTimesCircle className="w-4 h-4 mr-1" />
                            Cancel
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(appointment._id, 'completed')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FaCheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleViewPrescription(appointment)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Create Prescription"
                      >
                        <FaPrescriptionBottle className="w-4 h-4 mr-1" />
                        Prescription
                      </button>
                      <button
                        onClick={() => handleViewMedicalHistory(appointment)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="View Medical History"
                      >
                        <FaHistory className="w-4 h-4 mr-1" />
                        History
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prescription Form Modal */}
        {showPrescriptionForm && selectedAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create Prescription</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  handlePrescriptionSubmit({
                    diagnosis: formData.get('diagnosis'),
                    prescription: formData.get('prescription'),
                    notes: formData.get('notes')
                  });
                }}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                    <input
                      type="text"
                      name="diagnosis"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prescription</label>
                    <textarea
                      name="prescription"
                      rows="4"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      name="notes"
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowPrescriptionForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create Prescription
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Medical History Modal */}
        {showMedicalHistory && medicalHistory && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Medical History</h3>
                <div className="space-y-4">
                  {medicalHistory.map((record, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <div className="text-sm text-gray-600">
                        <strong>Date:</strong> {format(new Date(record.createdAt), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Diagnosis:</strong> {record.diagnosis}
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Prescription:</strong> {record.prescription}
                      </div>
                      {record.notes && (
                        <div className="text-sm text-gray-600">
                          <strong>Notes:</strong> {record.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowMedicalHistory(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
