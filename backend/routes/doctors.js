const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');

// @desc    Get all appointments for a specific doctor (filtered by facility)
// @route   GET /api/doctors/appointments
// @access  Private (Doctor)
router.get('/appointments', protect, authorize('doctor'), async (req, res) => {
  try {
    const { status, date } = req.query;
    
    // First, get the doctor's facility information
    const doctor = await User.findById(req.user.id).select('facility');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Build query to filter appointments by doctor
    let query = { 
      doctorId: req.user.id
    };
    
    // If doctor has a facility, filter by facility name
    if (doctor.facility && doctor.facility.name) {
      query.facilityName = doctor.facility.name;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    const appointments = await Appointment.find(query)
      .populate('userId', 'firstName lastName email phone')
      .sort({ date: 1, time: 1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
      doctorFacility: doctor.facility
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get appointment details for doctor (with facility check)
// @route   GET /api/doctors/appointments/:id
// @access  Private (Doctor)
router.get('/appointments/:id', protect, authorize('doctor'), async (req, res) => {
  try {
    // First, get the doctor's facility information
    const doctor = await User.findById(req.user.id).select('facility');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    const appointment = await Appointment.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone dateOfBirth gender bloodGroup medicalHistory allergies');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Verify this appointment belongs to the doctor
    if (appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }
    
    // Verify this appointment is from the doctor's facility
    if (doctor.facility && doctor.facility.name && 
        appointment.facilityName !== doctor.facility.name) {
      return res.status(403).json({ 
        message: 'Not authorized to view appointments from other facilities' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Confirm appointment (with facility check)
// @route   PATCH /api/doctors/appointments/:id/confirm
// @access  Private (Doctor)
router.patch('/appointments/:id/confirm', protect, authorize('doctor'), async (req, res) => {
  try {
    // First, get the doctor's facility information
    const doctor = await User.findById(req.user.id).select('facility');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Verify this appointment belongs to the doctor
    if (appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to confirm this appointment' });
    }
    
    // Verify this appointment is from the doctor's facility
    if (doctor.facility && doctor.facility.name && 
        appointment.facilityName !== doctor.facility.name) {
      return res.status(403).json({ 
        message: 'Not authorized to manage appointments from other facilities' 
      });
    }
    
    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending appointments can be confirmed' });
    }
    
    appointment.status = 'confirmed';
    appointment.confirmedAt = new Date();
    await appointment.save();
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Cancel appointment (with facility check)
// @route   PATCH /api/doctors/appointments/:id/cancel
// @access  Private (Doctor)
router.patch('/appointments/:id/cancel', protect, authorize('doctor'), async (req, res) => {
  try {
    const { reason } = req.body;
    
    // First, get the doctor's facility information
    const doctor = await User.findById(req.user.id).select('facility');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Verify this appointment belongs to the doctor
    if (appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }
    
    // Verify this appointment is from the doctor's facility
    if (doctor.facility && doctor.facility.name && 
        appointment.facilityName !== doctor.facility.name) {
      return res.status(403).json({ 
        message: 'Not authorized to manage appointments from other facilities' 
      });
    }
    
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment is already cancelled' });
    }
    
    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    if (reason) {
      appointment.notes = appointment.notes ? `${appointment.notes}\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
    }
    await appointment.save();
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Complete appointment (with facility check)
// @route   PATCH /api/doctors/appointments/:id/complete
// @access  Private (Doctor)
router.patch('/appointments/:id/complete', protect, authorize('doctor'), async (req, res) => {
  try {
    // First, get the doctor's facility information
    const doctor = await User.findById(req.user.id).select('facility');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Verify this appointment belongs to the doctor
    if (appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to complete this appointment' });
    }
    
    // Verify this appointment is from the doctor's facility
    if (doctor.facility && doctor.facility.name && 
        appointment.facilityName !== doctor.facility.name) {
      return res.status(403).json({ 
        message: 'Not authorized to manage appointments from other facilities' 
      });
    }
    
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed appointments can be completed' });
    }
    
    appointment.status = 'completed';
    await appointment.save();
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create prescription for patient (with facility check)
// @route   POST /api/doctors/prescriptions
// @access  Private (Doctor)
router.post('/prescriptions', protect, authorize('doctor'), async (req, res) => {
  try {
    const {
      patientId,
      appointmentId,
      medication,
      dosage,
      frequency,
      duration,
      instructions,
      refills
    } = req.body;
    
    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // If appointmentId is provided, verify it belongs to this doctor and facility
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment || appointment.doctorId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Invalid appointment' });
      }
      
      // Get doctor's facility info
      const doctor = await User.findById(req.user.id).select('facility');
      if (doctor.facility && doctor.facility.name && 
          appointment.facilityName !== doctor.facility.name) {
        return res.status(403).json({ 
          message: 'Not authorized to create prescriptions for appointments from other facilities' 
        });
      }
    }
    
    const prescription = await MedicalRecord.create({
      patient: patientId,
      doctor: req.user.id,
      recordType: 'prescription',
      date: new Date(),
      title: `Prescription - ${medication}`,
      description: `Prescription for ${medication}`,
      prescription: {
        medication,
        dosage,
        frequency,
        duration,
        instructions,
        refills: refills || 0
      }
    });
    
    res.status(201).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get patient's medical history (with facility check)
// @route   GET /api/doctors/patients/:id/medical-history
// @access  Private (Doctor)
router.get('/patients/:id/medical-history', protect, authorize('doctor'), async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Get doctor's facility info
    const doctor = await User.findById(req.user.id).select('facility');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Get medical history, but only for records created by doctors from the same facility
    // This is a simplified approach - in a real system, you might want more sophisticated filtering
    const medicalHistory = await MedicalRecord.find({ patient: patientId })
      .populate('doctor', 'firstName lastName facility')
      .sort({ date: -1 });
    
    // Filter records to only show those from the same facility
    const filteredRecords = medicalHistory.filter(record => {
      if (!record.doctor || !record.doctor.facility) return false;
      return record.doctor.facility.name === doctor.facility.name;
    });
    
    res.status(200).json({
      success: true,
      data: {
        patient: {
          id: patient._id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          bloodGroup: patient.bloodGroup,
          medicalHistory: patient.medicalHistory,
          allergies: patient.allergies,
          medications: patient.medications
        },
        records: filteredRecords
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get doctor's facility information
// @route   GET /api/doctors/facility
// @access  Private (Doctor)
router.get('/facility', protect, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await User.findById(req.user.id).select('facility specialty licenseNumber');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.status(200).json({
      success: true,
      data: {
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

module.exports = router;
