const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      current: page,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single user by ID (admin only)
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
router.get('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update user role (admin only)
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Admin)
router.patch('/users/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['patient', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be patient, doctor, or admin' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from changing their own role
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }
    
    user.role = role;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new user (admin only)
// @route   POST /api/admin/users
// @access  Private (Admin)
router.post('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = 'patient' } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role
    });
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: messages 
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    // Delete related data
    await Appointment.deleteMany({ userId: user._id });
    await MedicalRecord.deleteMany({ patient: user._id });
    await MedicalRecord.deleteMany({ doctor: user._id });
    
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all appointments (admin only)
// @route   GET /api/admin/appointments
// @access  Private (Admin)
router.get('/appointments', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, doctorId, patientId, date } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (doctorId) {
      query.doctorId = doctorId;
    }
    
    if (patientId) {
      query.userId = patientId;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    const appointments = await Appointment.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ date: -1, time: -1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get dashboard statistics (admin only)
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
    
    const totalMedicalRecords = await MedicalRecord.countDocuments();
    
    // Recent appointments
    const recentAppointments = await Appointment.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Recent users
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.status(200).json({
      success: true,
      data: {
        stats: {
          users: {
            total: totalUsers,
            patients: totalPatients,
            doctors: totalDoctors,
            admins: totalAdmins
          },
          appointments: {
            total: totalAppointments,
            pending: pendingAppointments,
            confirmed: confirmedAppointments,
            completed: completedAppointments,
            cancelled: cancelledAppointments
          },
          medicalRecords: {
            total: totalMedicalRecords
          }
        },
        recentAppointments,
        recentUsers
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Impersonate user (admin only)
// @route   POST /api/admin/impersonate/:id
// @access  Private (Admin)
router.post('/impersonate/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate a temporary token for impersonation
    const jwt = require('jsonwebtoken');
    const impersonationToken = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        impersonatedBy: req.user.id,
        isImpersonation: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(200).json({
      success: true,
      data: {
        token: impersonationToken,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update doctor's facility information
// @route   PATCH /api/admin/doctors/:id/facility
// @access  Private (Admin)
router.patch('/doctors/:id/facility', protect, authorize('admin'), async (req, res) => {
  try {
    const { facility, specialty, licenseNumber } = req.body;
    
    const doctor = await User.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    if (doctor.role !== 'doctor') {
      return res.status(400).json({ message: 'User is not a doctor' });
    }
    
    // Update doctor's facility information
    if (facility) {
      doctor.facility = facility;
    }
    
    if (specialty) {
      doctor.specialty = specialty;
    }
    
    if (licenseNumber) {
      doctor.licenseNumber = licenseNumber;
    }
    
    await doctor.save();
    
    res.status(200).json({
      success: true,
      data: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        role: doctor.role,
        facility: doctor.facility,
        specialty: doctor.specialty,
        licenseNumber: doctor.licenseNumber
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all doctors with their facility information
// @route   GET /api/admin/doctors
// @access  Private (Admin)
router.get('/doctors', protect, authorize('admin'), async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Assign doctor to patient
// @route   POST /api/admin/assign-doctor
// @access  Private (Admin)
router.post('/assign-doctor', protect, authorize('admin'), async (req, res) => {
  try {
    const { patientId, doctorId } = req.body;
    
    // Validate required fields
    if (!patientId || !doctorId) {
      return res.status(400).json({ message: 'Patient ID and Doctor ID are required' });
    }
    
    // Check if patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Check if doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    if (doctor.role !== 'doctor') {
      return res.status(400).json({ message: 'User is not a doctor' });
    }
    
    // Update patient's assigned doctor
    patient.assignedDoctor = doctorId;
    await patient.save();
    
    res.status(200).json({
      success: true,
      data: {
        patient: {
          id: patient._id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          assignedDoctor: patient.assignedDoctor
        },
        doctor: {
          id: doctor._id,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          email: doctor.email,
          facility: doctor.facility
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get patients assigned to a doctor
// @route   GET /api/admin/doctors/:doctorId/patients
// @access  Private (Admin)
router.get('/doctors/:doctorId/patients', protect, authorize('admin'), async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Check if doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    if (doctor.role !== 'doctor') {
      return res.status(400).json({ message: 'User is not a doctor' });
    }
    
    // Get all patients assigned to this doctor
    const patients = await User.find({ 
      assignedDoctor: doctorId,
      role: 'patient'
    }).select('-password');
    
    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get available medical facilities for doctor assignment
// @route   GET /api/admin/facilities
// @access  Private (Admin)
router.get('/facilities', protect, authorize('admin'), async (req, res) => {
  try {
    const { lat, lng, radius = 25, type, search } = req.query;
    
    // Default coordinates (Berlin) if not provided
    const defaultLat = 52.5200;
    const defaultLng = 13.4050;
    
    const centerLat = lat ? parseFloat(lat) : defaultLat;
    const centerLng = lng ? parseFloat(lng) : defaultLng;
    const searchRadius = parseInt(radius);
    
    // Generate comprehensive medical facilities (same logic as frontend)
    const facilities = [];
    
    // Hospital facilities
    const hospitals = [
      { name: 'City General Hospital', specialties: ['Emergency Care', 'Surgery', 'Cardiology'] },
      { name: 'Regional Medical Center', specialties: ['Intensive Care', 'Neurology', 'Oncology'] },
      { name: 'University Hospital', specialties: ['Research', 'Specialized Care', 'Teaching'] },
      { name: 'Community Hospital', specialties: ['General Medicine', 'Emergency Care', 'Surgery'] },
      { name: 'Metro Health Center', specialties: ['Emergency Care', 'Trauma', 'Critical Care'] },
      { name: 'St. Mary\'s Hospital', specialties: ['Maternity', 'Pediatrics', 'Women\'s Health'] },
      { name: 'Children\'s Medical Center', specialties: ['Pediatrics', 'Child Surgery', 'Neonatology'] }
    ];

    // Clinic facilities
    const clinics = [
      { name: 'Family Health Clinic', specialties: ['General Practice', 'Family Medicine', 'Pediatrics'] },
      { name: 'Urgent Care Center', specialties: ['Urgent Care', 'Walk-in Clinic', 'Minor Injuries'] },
      { name: 'Community Health Center', specialties: ['Primary Care', 'Preventive Medicine', 'Health Education'] },
      { name: 'Medical Group Practice', specialties: ['Internal Medicine', 'Family Practice', 'Preventive Care'] },
      { name: 'Wellness Medical Clinic', specialties: ['Preventive Care', 'Health Screening', 'Wellness'] },
      { name: 'Specialty Care Clinic', specialties: ['Specialist Care', 'Consultation', 'Advanced Treatment'] },
      { name: 'Multi-Specialty Center', specialties: ['Multiple Specialties', 'Comprehensive Care', 'Diagnostics'] }
    ];

    // Doctor facilities
    const doctors = [
      { name: 'Dr. Smith Medical Practice', specialties: ['Internal Medicine', 'Consultation', 'Preventive Care'] },
      { name: 'Specialist Medical Group', specialties: ['Specialist Consultation', 'Private Practice', 'Telemedicine'] },
      { name: 'Health & Wellness Clinic', specialties: ['Holistic Medicine', 'Wellness', 'Alternative Care'] },
      { name: 'Dr. Johnson Family Practice', specialties: ['Family Medicine', 'General Practice', 'Preventive Care'] },
      { name: 'Dr. Williams Specialist Center', specialties: ['Specialist Care', 'Consultation', 'Advanced Treatment'] },
      { name: 'Dr. Brown Cardiology Clinic', specialties: ['Cardiology', 'Heart Care', 'Cardiovascular Surgery'] },
      { name: 'Dr. Davis Orthopedic Center', specialties: ['Orthopedics', 'Sports Medicine', 'Physical Therapy'] }
    ];

    // Pharmacy facilities
    const pharmacies = [
      { name: 'City Pharmacy', specialties: ['Prescriptions', 'Over-the-counter', 'Health Products'] },
      { name: '24/7 Medical Pharmacy', specialties: ['Emergency Prescriptions', 'Consultation', 'Vaccinations'] },
      { name: 'Community Drugstore', specialties: ['Prescriptions', 'Health Advice', 'Medical Supplies'] },
      { name: 'Health Plus Pharmacy', specialties: ['Prescriptions', 'Health Products', 'Consultation'] },
      { name: 'Metro Pharmacy', specialties: ['Prescriptions', 'Health Screening', 'Medical Equipment'] }
    ];

    // Generate facilities with realistic coordinates
    const facilityTypes = [
      { type: 'hospital', data: hospitals, color: '#DC2626' },
      { type: 'clinic', data: clinics, color: '#2563EB' },
      { type: 'medical_center', data: doctors, color: '#7C3AED' },
      { type: 'private_practice', data: doctors.slice(0, 3), color: '#7C3AED' }
    ];

    // Helper function to calculate distance between two coordinates
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    facilityTypes.forEach(({ type, data, color }) => {
      data.forEach((facility, index) => {
        // Generate realistic coordinates around the center location
        const offsetLat = (Math.random() - 0.5) * 0.02; // ~1km variation
        const offsetLng = (Math.random() - 0.5) * 0.02;
        
        const facilityLat = centerLat + offsetLat;
        const facilityLng = centerLng + offsetLng;
        
        const distance = calculateDistance(centerLat, centerLng, facilityLat, facilityLng);
        
        // Only include facilities within search radius
        if (distance <= searchRadius) {
          const facilityData = {
            id: `${type}_${index}`,
            name: facility.name,
            address: `${Math.floor(Math.random() * 999) + 1} Main St, City, State ${Math.floor(Math.random() * 90000) + 10000}`,
            coordinates: { lat: facilityLat, lng: facilityLng },
            rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0 rating
            userRatingsTotal: Math.floor(Math.random() * 200) + 10,
            type: type,
            phone: `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
            website: `https://${facility.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`,
            specialties: facility.specialties,
            distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
            color: color
          };
          
          // Apply type filter if specified
          if (!type || facilityData.type === type) {
            facilities.push(facilityData);
          }
        }
      });
    });

    // Apply search filter if specified
    let filteredFacilities = facilities;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredFacilities = facilities.filter(facility => 
        facility.name.toLowerCase().includes(searchLower) ||
        facility.address.toLowerCase().includes(searchLower) ||
        facility.specialties.some(specialty => specialty.toLowerCase().includes(searchLower))
      );
    }

    // Sort by distance
    filteredFacilities.sort((a, b) => a.distance - b.distance);
    
    res.status(200).json({
      success: true,
      count: filteredFacilities.length,
      data: filteredFacilities
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

