# Doctor Appointment Management System

A comprehensive healthcare management application built with React and Node.js that enables patients to find medical facilities, book appointments, and manage their healthcare journey.

## 🏗️ Application Architecture

### Backend (Node.js/Express)
- **Framework**: Express.js with MongoDB (Mongoose ODM)
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Storage**: Cloudinary for profile picture uploads
- **Email Service**: Nodemailer for notifications
- **Port**: 8000 (configurable via environment)

### Frontend (React/Vite)
- **Framework**: React 18 with Vite build tool
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **State Management**: React Context API (AuthContext)
- **HTTP Client**: Axios with interceptors
- **Port**: 5173 (Vite default)

## 🔐 Authentication & Authorization System

### User Roles
1. **Patient** (default role)
2. **Doctor** (with facility assignment)
3. **Admin** (system administration)

### Authentication Flow
1. **Registration**: Users sign up with email/password or Google OAuth
2. **Login**: JWT token issued and stored in localStorage
3. **Token Management**: Automatic token attachment to API requests
4. **Route Protection**: ProtectedRoute component guards sensitive pages
5. **Session Persistence**: AuthContext maintains user state across page refreshes

### Security Features
- Password hashing with bcrypt (salt rounds: 10)
- JWT tokens with configurable expiration
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Role-based access control (RBAC)

## 🗄️ Database Schema & Models

### User Model
```javascript
{
  // Basic Info
  firstName, lastName, email, password, role
  
  // Authentication
  googleId, firebaseUid
  
  // Doctor-specific
  facility: { name, address, phone, type },
  specialty, licenseNumber
  
  // Medical Info
  dateOfBirth, gender, bloodGroup, phone, address
  medicalHistory[], allergies[], medications[]
  
  // Profile
  profilePicture, emergencyContact
}
```

### Appointment Model
```javascript
{
  userId, doctorId, doctorName, specialty
  date, time, reason, notes, status
  clinicAddress, clinicType, clinicPhone, clinicWebsite
  facilityId, facilityName
  insurance, consultationFee
  createdAt, confirmedAt, cancelledAt
}
```

### Medical Record Model
```javascript
{
  patient, doctor, recordType, date, title, description
  testResults: { testName, result, unit, referenceRange, status }
  prescription: { medication, dosage, frequency, duration, instructions }
  procedure: { name, description, anesthesia, complications }
  vaccination: { name, manufacturer, lotNumber, nextDueDate }
  status, followUpRequired, followUpDate, notes
}
```

## 🚀 API Endpoints & Functionality

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /profile/picture` - Upload profile picture
- `POST /google` - Google OAuth authentication

### Appointment Routes (`/api/appointments`)
- `GET /` - Get user's appointments (with filtering)
- `POST /` - Create new appointment
- `GET /:id` - Get specific appointment
- `PUT /:id` - Update appointment
- `PATCH /:id/cancel` - Cancel appointment
- `PATCH /:id/confirm` - Confirm appointment (doctor/admin)
- `DELETE /:id` - Delete appointment

### Doctor Routes (`/api/doctors`)
- `GET /appointments` - Get doctor's appointments
- `GET /appointments/:id` - Get appointment details
- `PATCH /appointments/:id/confirm` - Confirm appointment
- `PATCH /appointments/:id/cancel` - Cancel appointment
- `PATCH /appointments/:id/complete` - Complete appointment
- `POST /prescriptions` - Create prescription
- `GET /patients/:id/medical-history` - Get patient history
- `GET /facility` - Get doctor's facility info

### Medical Records Routes (`/api/medical-records`)
- `GET /` - Get user's medical records
- `GET /:id` - Get specific record
- `POST /` - Create new record
- `PUT /:id` - Update record
- `DELETE /:id` - Delete record

## 🎨 Frontend Components & Pages

### Core Pages
1. **Home** - Landing page with features overview
2. **Login/Signup** - Authentication forms
3. **Dashboard** - User dashboard with stats and quick actions
4. **FindClinics** - Interactive map to find medical facilities
5. **BookAppointment** - Appointment booking form
6. **Appointments** - View and manage appointments
7. **Profile** - User profile management
8. **DoctorDashboard** - Doctor-specific interface
9. **AdminDashboard** - Administrative interface

### Key Components
- **AuthContext** - Global authentication state management
- **ProtectedRoute** - Route protection wrapper
- **GoogleMapsWithGeolocation** - Google Maps integration
- **FreeMapWithFallback** - Fallback map without API key
- **AppointmentCard** - Reusable appointment display
- **ProfilePicture** - Image upload component

## 🗺️ Map Integration & Location Services

### Google Maps Integration
- **API**: Google Places API for medical facility search
- **Features**: 
  - Real-time location detection
  - Facility search by type (hospitals, clinics, doctors, pharmacies)
  - Distance calculation and filtering
  - Interactive markers and directions
  - Fallback system for API key issues

### Location Features
- **Geolocation**: Browser-based location detection
- **Search Radius**: Configurable search distance (1-15km)
- **Facility Types**: Hospitals, clinics, doctors, pharmacies
- **Real-time Data**: Live facility information and ratings

## 📅 Appointment Management System

### Booking Process
1. **Facility Selection**: Choose from map or search results
2. **Date/Time Selection**: Calendar with availability checking
3. **Form Completion**: Reason, notes, insurance information
4. **Validation**: Weekend/holiday restrictions, time slot conflicts
5. **Confirmation**: Appointment created with pending status

### Appointment States
- **Pending** - Awaiting doctor confirmation
- **Confirmed** - Doctor approved the appointment
- **Cancelled** - Appointment cancelled by user or doctor
- **Completed** - Appointment finished

### Business Rules
- No weekend bookings
- No past date bookings
- 2-hour cancellation window
- Time slot conflict prevention
- German holiday restrictions

## 👨‍⚕️ Doctor Dashboard Features

### Appointment Management
- View assigned appointments
- Filter by status and date
- Confirm/cancel/complete appointments
- Create prescriptions
- View patient medical history

### Facility Integration
- Doctor must be assigned to a facility
- Appointments filtered by facility
- Facility-specific medical records

## 🏥 Medical Records System

### Record Types
- **Test Results** - Lab results with reference ranges
- **Prescriptions** - Medication prescriptions
- **Procedures** - Medical procedures and surgeries
- **Vaccinations** - Immunization records
- **Diagnosis** - Medical diagnoses

### Features
- Doctor-patient relationship tracking
- Follow-up scheduling
- File attachments support
- Status tracking (pending, completed, cancelled)

## 🔧 Technical Features

### Frontend Technologies
- **React Hooks**: useState, useEffect, useContext
- **Date Handling**: date-fns library
- **Form Management**: Controlled components
- **State Management**: Context API with local state
- **HTTP Requests**: Axios with interceptors
- **File Upload**: Multer with Cloudinary integration

### Backend Technologies
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer with Cloudinary
- **Email**: Nodemailer
- **Validation**: Mongoose schema validation
- **Error Handling**: Custom error response utility

### Security Measures
- Password hashing and salting
- JWT token authentication
- CORS configuration
- Input validation and sanitization
- Role-based access control
- Secure file upload handling

## 🌐 Deployment & Configuration

### Environment Variables
- **Database**: MONGODB_URI
- **JWT**: JWT_SECRET, JWT_EXPIRE
- **Cloudinary**: CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET
- **Google Maps**: VITE_GOOGLE_MAPS_API_KEY
- **Email**: SMTP configuration

### Build Process
- **Frontend**: Vite build with React
- **Backend**: Node.js with nodemon for development
- **Static Assets**: Cloudinary for image storage

## 📱 User Experience Features

### Responsive Design
- Mobile-first approach
- Tailwind CSS for styling
- Responsive grid layouts
- Touch-friendly interfaces

### User Interface
- Clean, modern design
- Intuitive navigation
- Loading states and error handling
- Success/error notifications
- Confirmation dialogs

### Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility

## 🔄 Data Flow & State Management

### Authentication Flow
1. User registers/logs in
2. JWT token stored in localStorage
3. AuthContext manages user state
4. Protected routes check authentication
5. API requests include authorization header

### Appointment Flow
1. User finds facility on map
2. Selects facility and navigates to booking
3. Fills appointment form with validation
4. Appointment created with pending status
5. Doctor can confirm/cancel/complete
6. User receives notifications

### State Management
- **Global State**: AuthContext for user authentication
- **Local State**: Component-level state with hooks
- **API State**: Axios interceptors for request/response handling
- **Form State**: Controlled components with validation

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Google Maps API key (optional)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Doctor-appointment
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Set up environment variables**
```bash
# Backend (.env)
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend (.env)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

5. **Start the development servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🚀 Future Enhancement Roadmap

### Phase 1: Enhanced Navigation & Directions (Short-term)
- **Google Maps Directions Integration**
  - Real walking, biking, and driving directions
  - Turn-by-turn navigation for each facility
  - Travel time estimates based on transportation mode
  - Real-time traffic conditions for driving routes

- **Smart Distance Calculation**
  - Actual walking/biking time calculations
  - Consideration of terrain and accessibility
  - Public transit integration for commute options
  - Parking availability indicators

- **Enhanced Facility Cards**
  - Show estimated travel times: "8 min walk", "3 min bike ride"
  - Real-time traffic updates for driving routes
  - Public transit schedules and routes
  - Accessibility information (wheelchair accessible routes)

### Phase 2: Advanced Location Features (Medium-term)
- **Interactive Route Preview**
  - Show actual routes on embedded map
  - Highlight bike lanes, walking paths, and driving routes
  - Real-time traffic visualization
  - Alternative route suggestions

- **Smart Search Filters**
  - Filter by transportation mode (walking, biking, driving, transit)
  - Accessibility filters (wheelchair accessible, elevator access)
  - Parking availability filters
  - Public transit connectivity

- **Location Intelligence**
  - Popular times and wait times for facilities
  - Crowd-sourced reviews and ratings
  - Real-time facility status (open/closed, busy/quiet)
  - Weather-aware routing suggestions

### Phase 3: Advanced Features (Long-term)
- **AI-Powered Recommendations**
  - Machine learning-based facility recommendations
  - Personalized search results based on user history
  - Predictive appointment scheduling
  - Smart notification system

- **Real-Time Integration**
  - Live appointment availability
  - Real-time queue management
  - Emergency facility status
  - Live traffic and transit updates

- **Advanced Analytics**
  - User behavior analytics
  - Facility performance metrics
  - Appointment success rates
  - Geographic usage patterns

### Phase 4: Mobile App Features
- **Native Mobile App**
  - React Native or Flutter implementation
  - Offline map support
  - Push notifications
  - GPS-based automatic check-ins

- **Wearable Integration**
  - Apple Watch/Android Wear support
  - Health data integration
  - Emergency contact features
  - Medication reminders

### Technical Implementation Notes

#### Google Maps API Integration
```javascript
// Real walking directions
const getWalkingDirections = (userLocation, facilityLocation) => {
  return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${facilityLocation.lat},${facilityLocation.lng}&travelmode=walking`;
};

// Real biking directions
const getBikingDirections = (userLocation, facilityLocation) => {
  return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${facilityLocation.lat},${facilityLocation.lng}&travelmode=bicycling`;
};
```

#### Route Planning API Integration
- **Google Directions API** - Get actual routes, travel times, and turn-by-turn directions
- **Mapbox Directions API** - Alternative with different pricing
- **OpenRouteService** - Free option with good coverage

#### Smart Distance Calculation
```javascript
// Calculate actual walking/biking time
const calculateTravelTime = (distance, transportMode) => {
  const speeds = {
    walking: 5, // km/h
    biking: 15, // km/h
    driving: 30, // km/h (city traffic)
    transit: 20 // km/h (average)
  };
  
  return (distance / speeds[transportMode]) * 60; // minutes
};
```

## 📞 Support

For support, email support@doctorappointment.com or create an issue in the repository.

---

**Built with ❤️ using React, Node.js, and MongoDB**

