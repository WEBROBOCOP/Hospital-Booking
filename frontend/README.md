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

## 🚀 Code Improvement & Implementation Roadmap

### 📋 **IMPLEMENTATION PRIORITY CHECKLIST**

This roadmap provides a step-by-step guide to improve the codebase from its current state to production-ready enterprise-grade software.

---

## 🔥 **PHASE 1: CRITICAL FIXES (Week 1-2)**

### **1.1 Code Organization & Maintainability**
- [ ] **Break down large components** (AdminDashboard.jsx - 727 lines)
  - [ ] Extract `UserManagement` component
  - [ ] Extract `AppointmentManagement` component
  - [ ] Extract `StatisticsDashboard` component
  - [ ] Create reusable `DataTable` component

- [ ] **Create custom hooks** for common logic
  - [ ] `useApi` hook for API calls
  - [ ] `useLocalStorage` hook for local storage
  - [ ] `useAuth` hook for authentication logic
  - [ ] `usePagination` hook for paginated data

- [ ] **Implement error boundaries**
  - [ ] Create `ErrorBoundary` component
  - [ ] Add error fallback UI
  - [ ] Implement error logging

### **1.2 Performance Optimization**
- [ ] **Add pagination** for large data sets
  - [ ] Implement pagination in AdminDashboard
  - [ ] Add pagination to appointments list
  - [ ] Create reusable `Pagination` component

- [ ] **Optimize re-renders**
  - [ ] Add `React.memo` to expensive components
  - [ ] Implement `useCallback` for event handlers
  - [ ] Use `useMemo` for computed values

### **1.3 Error Handling & User Experience**
- [ ] **Standardize error responses** across all API endpoints
- [ ] **Add skeleton loading states** instead of simple spinners
- [ ] **Improve form validation** with real-time feedback
- [ ] **Add global error notification system**

---

## 🔶 **PHASE 2: PERFORMANCE & SECURITY (Week 3-4)**

### **2.1 Security Enhancements**
- [ ] **Implement rate limiting** for API endpoints
  ```javascript
  const rateLimit = require('express-rate-limit');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  });
  ```

- [ ] **Add input sanitization** for all user inputs
- [ ] **Implement CSRF protection**
- [ ] **Add request logging** and monitoring

### **2.2 Database & API Improvements**
- [ ] **Add database indexing** for frequently queried fields
  ```javascript
  UserSchema.index({ email: 1 });
  UserSchema.index({ role: 1 });
  UserSchema.index({ assignedDoctor: 1 });
  AppointmentSchema.index({ userId: 1, date: 1 });
  ```

- [ ] **Implement API versioning** (v1, v2, etc.)
- [ ] **Add database connection pooling**
- [ ] **Implement soft deletes** instead of hard deletes

### **2.3 Performance Optimizations**
- [ ] **Add React.memo and useCallback** to prevent unnecessary re-renders
- [ ] **Implement virtual scrolling** for large lists
- [ ] **Add lazy loading** for routes and components
- [ ] **Implement caching** with Redis or in-memory cache

---

## 🔷 **PHASE 3: TESTING & DOCUMENTATION (Week 5-6)**

### **3.1 Testing Implementation**
- [ ] **Add unit tests** for components and utilities
  ```bash
  npm install --save-dev @testing-library/react @testing-library/jest-dom jest
  ```

- [ ] **Implement integration tests** for API endpoints
  ```bash
  npm install --save-dev supertest jest
  ```

- [ ] **Add end-to-end tests** for critical user flows
  ```bash
  npm install --save-dev cypress
  ```

- [ ] **Set up code coverage** reporting
- [ ] **Add automated testing** in CI/CD pipeline

### **3.2 Documentation & Standards**
- [ ] **Add comprehensive README** with setup instructions
- [ ] **Create API documentation** (Swagger/OpenAPI)
- [ ] **Add component documentation** (Storybook)
- [ ] **Create deployment guides**
- [ ] **Add troubleshooting documentation**

### **3.3 Code Quality & Standards**
- [ ] **Add ESLint rules** for consistent code style
- [ ] **Implement Prettier** for code formatting
- [ ] **Add pre-commit hooks** for code quality checks
- [ ] **Create coding standards** documentation

---

## 🔷 **PHASE 4: ADVANCED FEATURES (Week 7-8)**

### **4.1 Real-time Features**
- [ ] **Add real-time notifications** (WebSocket/SSE)
- [ ] **Implement appointment reminders** (email/SMS)
- [ ] **Add live chat** for patient-doctor communication
- [ ] **Implement real-time appointment updates**

### **4.2 Integration & External Services**
- [ ] **Add calendar integration** (Google Calendar, Outlook)
- [ ] **Implement file upload** for medical documents
- [ ] **Add payment integration** for consultation fees
- [ ] **Implement SMS notifications** with Twilio

### **4.3 Advanced UI/UX**
- [ ] **Add multi-language support** (i18n)
- [ ] **Implement dark mode** theme
- [ ] **Add accessibility improvements** (ARIA labels, keyboard navigation)
- [ ] **Create mobile app** with React Native

---

## 📊 **DETAILED IMPLEMENTATION GUIDE**

### **Step 1: Component Refactoring**

#### **Break Down AdminDashboard.jsx**
```javascript
// Create separate components
const AdminDashboard = () => {
  return (
    <div>
      <AdminHeader />
      <AdminTabs />
      <AdminContent />
    </div>
  );
};

// Extract UserManagement component
const UserManagement = ({ users, onUserUpdate, onUserDelete }) => {
  // User management logic
};

// Extract AppointmentManagement component
const AppointmentManagement = ({ appointments, onAppointmentUpdate }) => {
  // Appointment management logic
};
```

#### **Create Custom Hooks**
```javascript
// hooks/useApi.js
const useApi = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(url);
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [url]);
  
  return { data, loading, error };
};

// hooks/usePagination.js
const usePagination = (data, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);
  
  return {
    currentData,
    currentPage,
    totalPages,
    setCurrentPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};
```

### **Step 2: Error Handling Implementation**

#### **Error Boundary Component**
```javascript
// components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

#### **API Response Standardization**
```javascript
// utils/responseHandler.js
const sendResponse = (res, statusCode, data, message = 'Success') => {
  res.status(statusCode).json({
    success: statusCode < 400,
    data,
    message,
    timestamp: new Date().toISOString(),
    requestId: req.id
  });
};

// Usage in routes
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    sendResponse(res, 200, users, 'Users retrieved successfully');
  } catch (error) {
    sendResponse(res, 500, null, 'Internal server error');
  }
});
```

### **Step 3: Performance Optimization**

#### **Pagination Implementation**
```javascript
// components/Pagination.jsx
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  return (
    <div className="flex justify-center items-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 border rounded disabled:opacity-50"
      >
        Previous
      </button>
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 border rounded ${
            page === currentPage ? 'bg-blue-500 text-white' : ''
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};
```

#### **React.memo Implementation**
```javascript
// components/UserCard.jsx
const UserCard = React.memo(({ user, onUpdate, onDelete }) => {
  return (
    <div className="user-card">
      {/* User card content */}
    </div>
  );
});

// components/AppointmentCard.jsx
const AppointmentCard = React.memo(({ appointment, onUpdate, onCancel }) => {
  return (
    <div className="appointment-card">
      {/* Appointment card content */}
    </div>
  );
});
```

### **Step 4: Testing Setup**

#### **Unit Testing Setup**
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Create jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

#### **Component Testing Example**
```javascript
// __tests__/UserCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import UserCard from '../components/UserCard';

test('renders user information correctly', () => {
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'patient'
  };
  
  render(<UserCard user={user} />);
  
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
});
```

### **Step 5: Security Implementation**

#### **Rate Limiting**
```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Apply to routes
app.use('/api/auth/', createRateLimiter(15 * 60 * 1000, 5, 'Too many login attempts'));
app.use('/api/', createRateLimiter(15 * 60 * 1000, 100, 'Too many requests'));
```

#### **Input Validation**
```javascript
// middleware/validation.js
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

---

## 🎯 **SUCCESS METRICS**

### **Phase 1 Completion Criteria**
- [ ] All components under 200 lines
- [ ] Error boundaries implemented
- [ ] Pagination working on all data tables
- [ ] Loading states improved

### **Phase 2 Completion Criteria**
- [ ] Rate limiting active
- [ ] Database indexes added
- [ ] Performance improved by 50%
- [ ] Security vulnerabilities addressed

### **Phase 3 Completion Criteria**
- [ ] Test coverage above 80%
- [ ] Documentation complete
- [ ] CI/CD pipeline working
- [ ] Code quality standards enforced

### **Phase 4 Completion Criteria**
- [ ] Real-time features working
- [ ] External integrations complete
- [ ] Mobile app deployed
- [ ] Production-ready system

---

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

