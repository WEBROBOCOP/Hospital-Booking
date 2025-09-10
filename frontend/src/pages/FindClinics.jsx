// Import React hooks for state management and side effects
import { useState, useEffect } from 'react';
// Import Font Awesome icons for UI elements
import { 
  FaShieldAlt,  // Shield icon for pharmacies
  FaUserMd,     // User doctor icon for doctors
  FaHospital,   // Hospital icon for hospitals and clinics
  FaMapMarkerAlt, // Map marker icon
  FaExclamationTriangle, // Warning icon
  FaCheckCircle, // Success icon
  FaSpinner, // Loading spinner
} from 'react-icons/fa';
// Import React Router hook for navigation
import { useNavigate } from 'react-router-dom';
// Import the map component that handles medical facility display
import FreeMapWithFallback from '../components/map/FreeMapWithFallback';

// Main component for finding medical facilities
const FindMedicalFacilities = () => {
  // Initialize navigation hook for programmatic routing
  const navigate = useNavigate();
  
  // State management for component data
  // State to store user's current location coordinates
  const [userLocation, setUserLocation] = useState(null);
  // State to store search radius in kilometers (default 5km)
  const [searchRadius, setSearchRadius] = useState(5);
  // State for location detection status
  const [locationStatus, setLocationStatus] = useState('detecting'); // 'detecting', 'success', 'error', 'denied'
  // State for location accuracy
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  // State for debugging
  const [debugInfo, setDebugInfo] = useState('');
  
  // Effect hook to get user's location when component mounts
  useEffect(() => {
    detectUserLocation();
  }, []); // Empty dependency array means this runs only once on mount

  // Enhanced location detection function
  const detectUserLocation = () => {
    setLocationStatus('detecting');
    setDebugInfo('Starting location detection...');
    
    // Check if browser supports geolocation API
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setDebugInfo('Geolocation not supported by browser');
      setUserLocation({ lat: 52.5200, lng: 13.4050 });
      return;
    }

    setDebugInfo('Requesting location permission...');

    // Request user's current position with enhanced options
    navigator.geolocation.getCurrentPosition(
      // Success callback - when location is obtained
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Update state with user's coordinates and accuracy
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationAccuracy(accuracy);
        setLocationStatus('success');
        setDebugInfo(`Location obtained: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (accuracy: ±${Math.round(accuracy)}m)`);
        
        console.log('Location obtained:', { lat: latitude, lng: longitude, accuracy });
      },
      // Error callback - when location access is denied or fails
      (error) => {
        console.error('Location error:', error);
        setDebugInfo(`Location error: ${error.message}`);
        
        // Handle different error types
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus('denied');
            setDebugInfo('Location access denied by user');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationStatus('error');
            setDebugInfo('Location information unavailable');
            break;
          case error.TIMEOUT:
            setLocationStatus('error');
            setDebugInfo('Location request timed out');
            break;
          default:
            setLocationStatus('error');
            setDebugInfo('Unknown location error');
        }
        
        // Use default location (Berlin, Germany) as fallback
        setUserLocation({ lat: 52.5200, lng: 13.4050 });
        setDebugInfo(prev => prev + ' - Using default location (Berlin)');
      },
      // Enhanced geolocation options for better accuracy and performance
      {
        enableHighAccuracy: true,  // Use GPS for better accuracy
        timeout: 15000,           // Wait max 15 seconds for location
        maximumAge: 60000         // Cache location for 1 minute
      }
    );
  };

  // Function to handle appointment booking navigation
  const handleBookAppointment = (facility) => {
    // Navigate to booking page with facility data
    navigate('/book', { 
      // Pass facility information as state to booking page
      state: { 
        clinicName: facility.name,           // Facility name
        clinicAddress: facility.address,     // Facility address
        clinicCoordinates: facility.coordinates, // GPS coordinates
        clinicType: facility.type,           // Type (hospital, clinic, etc.)
        clinicPhone: facility.phone,         // Contact phone number
        clinicWebsite: facility.website,     // Website URL
        clinicSpecialties: facility.specialties // Medical specialties
      }
    });
  };

  // Function to handle facility selection from map component
  const handleFacilitySelect = (facility) => {
    // Call appointment booking function with selected facility
    handleBookAppointment(facility);
  };

  // Function to retry location detection
  const retryLocationDetection = () => {
    setLocationStatus('detecting');
    setDebugInfo('Retrying location detection...');
    detectUserLocation();
  };

  // Get location status icon and color
  const getLocationStatusDisplay = () => {
    switch (locationStatus) {
      case 'detecting':
        return { icon: FaSpinner, color: 'text-blue-600', bg: 'bg-blue-50', text: 'Detecting your location...' };
      case 'success':
        return { icon: FaCheckCircle, color: 'text-green-600', bg: 'bg-green-50', text: 'Location detected successfully' };
      case 'denied':
        return { icon: FaExclamationTriangle, color: 'text-red-600', bg: 'bg-red-50', text: 'Location access denied' };
      case 'error':
        return { icon: FaExclamationTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', text: 'Location detection failed' };
      default:
        return { icon: FaMapMarkerAlt, color: 'text-gray-600', bg: 'bg-gray-50', text: 'Location unknown' };
    }
  };

  const statusDisplay = getLocationStatusDisplay();
  const StatusIcon = statusDisplay.icon;
  
  // Main component render
  return (
    // Main container with full height and gray background
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Container with max width and responsive padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header section with title and description */}
        <div className="text-center mb-8">
          {/* Main page title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Medical Facilities Near You
          </h1>
        </div>
        
        {/* Search radius selector section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="mb-4 text-center">
            {/* Label for radius selector */}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Radius
            </label>
            {/* Button group for radius selection */}
            <div className="flex justify-center gap-2">
              {/* Map through radius options to create buttons */}
              {[1, 3, 5, 10, 15].map((radius) => (
                <button
                  key={radius} // Unique key for React list rendering
                  onClick={() => setSearchRadius(radius)} // Update radius state on click
                  // Conditional styling based on selected radius
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    searchRadius === radius
                      ? 'bg-blue-600 text-white shadow-md' // Selected state
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200' // Default state
                  }`}
                >
                  {radius}km {/* Display radius value */}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main content - full width map */}
        <div className="w-full">
          {/* Map component with enhanced props */}
          <FreeMapWithFallback
            userLocation={userLocation}        // Pass user's location
            searchRadius={searchRadius}        // Pass search radius
            onLocationSelect={handleFacilitySelect} // Pass selection handler
          />
        </div>
        
        {/* Features grid section at bottom of page */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Hospitals feature card */}
          <div className="text-center">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FaHospital className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Find Hospitals
            </h3>
            <p className="text-gray-600">
              Locate hospitals and emergency care facilities near you
            </p>
          </div>
          
          {/* Clinics feature card */}
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FaHospital className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Find Clinics
            </h3>
            <p className="text-gray-600">
              Discover medical clinics and urgent care centers
            </p>
          </div>
          
          {/* Doctors feature card */}
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FaUserMd className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Find Doctors
            </h3>
            <p className="text-gray-600">
              Search for specialists and private practice doctors
            </p>
          </div>
          
          {/* Pharmacies feature card */}
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FaShieldAlt className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Find Pharmacies
            </h3>
            <p className="text-gray-600">
              Locate pharmacies for prescriptions and health products
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export the component as default for use in other files
export default FindMedicalFacilities;
