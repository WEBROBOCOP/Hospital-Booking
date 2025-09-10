const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mbdamascene24:SHqfSaRMElgLC3Sw@cluster0.5jfji.mongodb.net/medicalrecord');

async function checkAppointments() {
  try {
    const appointments = await Appointment.find({});
    let validCount = 0;
    let problematicCount = 0;

    console.log(`Found ${appointments.length} appointments`);

    for (const appointment of appointments) {
      const doctorId = appointment.doctorId;
      
      if (doctorId && typeof doctorId === 'string') {
        if (doctorId.startsWith('clinic_') || doctorId.includes(',')) {
          // These are clinic IDs, which are valid
          validCount++;
        } else if (doctorId.match(/^[0-9a-fA-F]{24}$/)) {
          // Valid ObjectId
          validCount++;
        } else {
          console.log(`Problematic appointment ID: ${appointment._id}, doctorId: ${doctorId}`);
          problematicCount++;
        }
      } else {
        console.log(`Invalid doctorId type: ${typeof doctorId}, value: ${doctorId}`);
        problematicCount++;
      }
    }

    console.log(`Valid appointments: ${validCount}`);
    console.log(`Problematic appointments: ${problematicCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAppointments();
