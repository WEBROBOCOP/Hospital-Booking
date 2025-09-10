const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Helper function to check if a date is a weekend
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

// @desc    Get all appointments for a user
// @route   GET /api/appointments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, date } = req.query;
    
    let query = { userId: req.user.id };
    
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
      .sort({ date: 1, time: 1 });

    // Handle population for valid ObjectIds only
    const appointmentsWithPopulatedDoctors = await Promise.all(
      appointments.map(async (appointment) => {
        const appointmentObj = appointment.toObject();
        
        // Only populate if doctorId is a valid MongoDB ObjectId
        if (appointment.doctorId && appointment.doctorId.match(/^[0-9a-fA-F]{24}$/)) {
          try {
            const doctor = await User.findById(appointment.doctorId).select('firstName lastName email specialty');
            appointmentObj.doctorId = doctor;
          } catch (err) {
            // If population fails, keep the original doctorId
            console.log('Failed to populate doctor:', err.message);
          }
        } else {
          // For clinic IDs, create a virtual doctor object
          appointmentObj.doctorId = {
            _id: appointment.doctorId,
            firstName: appointment.doctorName?.split(' ')[0] || 'Clinic',
            lastName: appointment.doctorName?.split(' ').slice(1).join(' ') || 'Doctor',
            email: 'clinic@example.com',
            specialty: appointment.specialty || 'General Practice'
          };
        }
        
        return appointmentObj;
      })
    );
    
    res.status(200).json({
      success: true,
      count: appointmentsWithPopulatedDoctors.length,
      data: appointmentsWithPopulatedDoctors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    console.log('Appointment creation request body:', JSON.stringify(req.body, null, 2));
    console.log('User ID from token:', req.user.id);
    
    const {
      doctorId,
      doctorName,
      specialty,
      date,
      time,
      reason,
      notes,
      clinicAddress,
      clinicType,
      clinicPhone,
      clinicWebsite,
      facilityId,
      facilityName
    } = req.body;

    const appointmentDate = new Date(date);
    if (isWeekend(appointmentDate)) {
      return res.status(400).json({ message: 'Cannot book appointments on weekends.' });
    }

    // Check if the appointment time is in the past
    const appointmentDateTime = new Date(`${date}T${time}`);
    if (appointmentDateTime < new Date()) {
      return res.status(400).json({ message: 'Cannot book appointments in the past.' });
    }

    // Check if the doctor exists (only for actual doctor bookings)
    let doctor = null;
    if (doctorId && doctorId.match(/^[0-9a-fA-F]{24}$/)) {
      // Valid MongoDB ObjectId - check if it's a real doctor
      doctor = await User.findById(doctorId);
      if (!doctor || doctor.role !== 'doctor') {
        return res.status(400).json({ message: 'Invalid doctor selected.' });
      }
    } else if (doctorId && doctorId.startsWith('clinic_')) {
      // For clinic bookings with generated IDs, create a virtual doctor entry
      doctor = {
        _id: doctorId,
        role: 'doctor',
        firstName: doctorName?.split(' ')[0] || 'Clinic',
        lastName: doctorName?.split(' ').slice(1).join(' ') || 'Doctor'
      };
    } else {
      // For coordinate-based clinic bookings, create a virtual doctor entry
      doctor = {
        _id: doctorId,
        role: 'doctor',
        firstName: doctorName?.split(' ')[0] || 'Clinic',
        lastName: doctorName?.split(' ').slice(1).join(' ') || 'Doctor'
      };
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({ 
        message: 'This time slot is already booked. Please choose another time.' 
      });
    }

    const appointment = new Appointment({
      userId: req.user.id,
      doctorId,
      doctorName,
      specialty,
      date: new Date(date), // Convert string to Date object
      time,
      reason,
      notes,
      clinicAddress,
      clinicType,
      clinicPhone,
      clinicWebsite,
      facilityId,
      facilityName,
      // status defaults to 'pending'
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctorId', 'firstName lastName email specialty');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if the appointment belongs to the user or if user is doctor/admin
    if (appointment.userId.toString() !== req.user.id && 
        !['doctor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
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

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { date, time, reason, notes } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if the appointment belongs to the user
    if (appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    // Check if appointment can be updated (not confirmed or completed)
    if (appointment.status === 'confirmed' || appointment.status === 'completed') {
      return res.status(400).json({ 
        message: 'Cannot update confirmed or completed appointments' 
      });
    }

    if (date) appointment.date = date;
    if (time) appointment.time = time;
    if (reason) appointment.reason = reason;
    if (notes) appointment.notes = notes;

    await appointment.save();
    res.status(200).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Cancel appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const { reason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if the appointment belongs to the user
    if (appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
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

    res.status(200).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Confirm appointment
// @route   PATCH /api/appointments/:id/confirm
// @access  Private (Doctor, Admin)
router.patch('/:id/confirm', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending appointments can be confirmed' });
    }

    appointment.status = 'confirmed';
    appointment.confirmedAt = new Date();
    await appointment.save();

    res.status(200).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if the appointment belongs to the user
    if (appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this appointment' });
    }

    // Check if appointment can be deleted (not confirmed or completed)
    if (appointment.status === 'confirmed' || appointment.status === 'completed') {
      return res.status(400).json({ 
        message: 'Cannot delete confirmed or completed appointments' 
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
