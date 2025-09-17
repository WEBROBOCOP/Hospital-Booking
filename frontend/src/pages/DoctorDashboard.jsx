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
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [facilityInfo, setFacilityInfo] = useState(null);
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [activeTab, setActiveTab] = useState('appointments');
  const { currentUser } = useAuth();

  const fetchFacilityInfo = async () => {
    try {
      const response = await api.get("/doctors/facility");
      setFacilityInfo(response.data.data);
    } catch (err) {
      console.error("Error fetching facility info:", err);
    }
  };

  const fetchAssignedPatients = async () => {
    try {
      const response = await api.get(`/admin/doctors/${currentUser.id}/patients`);
      setAssignedPatients(response.data.data);
    } catch (err) {
      console.error("Error fetching assigned patients:", err);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'doctor') {
      fetchAppointments();
      fetchFacilityInfo();
      fetchAssignedPatients();
    }
  }, [currentUser, filterStatus, filterDate, filterDoctor]);

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
      if (filterDoctor !== 'all') {
        queryParams += queryParams ? `&doctorId=${filterDoctor}` : `?doctorId=${filterDoctor}`;
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
          <p className="mt-2 text-gray-600">View and manage all appointments in your facility</p>
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
                  <strong>Facility: {facilityInfo.facility.name}</strong>
                  <p className="text-sm">{facilityInfo.facility.address} - {facilityInfo.facility.type}</p>
                  <p className="text-xs mt-1">You can view and manage all appointments in this facility</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'appointments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaCalendarAlt className="inline w-4 h-4 mr-2" />
                Appointments
              </button>
              <button
                onClick={() => setActiveTab('patients')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'patients'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaUser className="inline w-4 h-4 mr-2" />
                My Patients ({assignedPatients.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <>
            {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Doctor</label>
              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Doctors</option>
                {Array.from(new Set(appointments.map(apt => apt.doctorId?._id).filter(Boolean))).map(doctorId => {
                  const appointment = appointments.find(apt => apt.doctorId?._id === doctorId);
                  return (
                    <option key={doctorId} value={doctorId}>
                      {appointment?.doctorId?.firstName} {appointment?.doctorId?.lastName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Facility Appointments</h2>
            <p className="text-sm text-gray-600 mt-1">View and manage appointments from all doctors in your facility</p>
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
                              {appointment.userId?.firstName} {appointment.userId?.lastName}
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
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                            {appointment.facilityName && (
                              <div>
                                <strong>Facility:</strong> {appointment.facilityName}
                              </div>
                            )}
                            {appointment.doctorId && (
                              <div>
                                <strong>Assigned Doctor:</strong> {appointment.doctorId.firstName} {appointment.doctorId.lastName}
                              </div>
                            )}
                          </div>
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
          </>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">My Assigned Patients</h2>
              <p className="text-sm text-gray-600 mt-1">Patients assigned to you for care</p>
            </div>
            
            {assignedPatients.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FaUser className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No patients assigned</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't have any patients assigned to you yet. Contact your administrator.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medical Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignedPatients.map((patient) => (
                      <tr key={patient._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <FaUser className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {patient.firstName} {patient.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                Patient ID: {patient._id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{patient.email}</div>
                          <div className="text-sm text-gray-500">{patient.phone || 'No phone'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {patient.bloodGroup ? `Blood Group: ${patient.bloodGroup}` : 'No blood group info'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Allergies: {patient.allergies?.length || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setMedicalHistory(patient.medicalHistory || []);
                              setShowMedicalHistory(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <FaHistory className="inline w-4 h-4 mr-1" />
                            History
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAppointment({ userId: patient._id });
                              setShowPrescriptionForm(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FaPrescriptionBottle className="inline w-4 h-4 mr-1" />
                            Prescribe
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
