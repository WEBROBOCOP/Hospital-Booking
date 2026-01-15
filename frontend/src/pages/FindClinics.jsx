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
    // Main container with full height and gradient background
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      {/* Container with max width and responsive padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header section with title and description */}
        <div className="text-center mb-8 animate-fade-in">
          {/* Main page title */}
          <h1 className="text-responsive-3xl font-bold text-gray-900 mb-4">
            Medical Facilities Near You
          </h1>
          <p className="text-responsive-base text-gray-600 max-w-2xl mx-auto">
            Discover healthcare providers in your area and book appointments with ease
          </p>
        </div>
        
        {/* Enhanced Search radius selector section */}
        <div className="max-w-5xl mx-auto mb-8 animate-slide-up">
          <div className="mb-6 text-center">
            {/* Label for radius selector */}
            <label className="block text-sm font-medium text-gray-700 mb-6">
              How far are you willing to travel?
            </label>
            
            {/* Creative radius selection options */}
            <div className="space-y-6">
              {/* Option 1: Slider with visual indicators */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">Distance Range</span>
                  <span className="text-lg font-bold text-blue-600">{searchRadius} km</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(searchRadius / 25) * 100}%, #E5E7EB ${(searchRadius / 25) * 100}%, #E5E7EB 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1km</span>
                    <span>5km</span>
                    <span>10km</span>
                    <span>15km</span>
                    <span>25km</span>
                  </div>
                </div>
              </div>

              {/* Option 2: Distance-based preset buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { value: 1, label: 'Nearby', desc: '1km', color: 'green' },
                  { value: 3, label: 'Close', desc: '3km', color: 'blue' },
                  { value: 5, label: 'Moderate', desc: '5km', color: 'yellow' },
                  { value: 10, label: 'Far', desc: '10km', color: 'orange' },
                  { value: 15, label: 'Very Far', desc: '15km+', color: 'red' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSearchRadius(option.value)}
                    className={`group relative p-4 rounded-xl text-center transition-all duration-200 transform hover:scale-105 ${
                      searchRadius === option.value
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105' 
                        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                      option.color === 'green' ? 'bg-green-500' :
                      option.color === 'blue' ? 'bg-blue-500' :
                      option.color === 'yellow' ? 'bg-yellow-500' :
                      option.color === 'orange' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}></div>
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs opacity-75">{option.desc}</div>
                    {searchRadius === option.value && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Option 3: Visual distance indicators */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Search Coverage</h3>
                  <p className="text-sm text-gray-600">Your search will cover this area</p>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Your location</span>
                  </div>
                  <div className="flex-1 h-1 bg-gradient-to-r from-blue-500 to-blue-200 rounded-full relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((searchRadius / 15) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-sm font-medium text-gray-700">{searchRadius}km radius</div>
                </div>
              </div>
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
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Hospitals feature card */}
          <div className="card-hover text-center group animate-slide-up">
            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <FaHospital className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-200">
              Find Hospitals
            </h3>
            <p className="text-gray-600 text-responsive-sm">
              Locate hospitals and emergency care facilities near you
            </p>
          </div>
          
          {/* Clinics feature card */}
          <div className="card-hover text-center group animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <FaHospital className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
              Find Clinics
            </h3>
            <p className="text-gray-600 text-responsive-sm">
              Discover medical clinics and urgent care centers
            </p>
          </div>
          
          {/* Doctors feature card */}
          <div className="card-hover text-center group animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <FaUserMd className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-200">
              Find Doctors
            </h3>
            <p className="text-gray-600 text-responsive-sm">
              Search for specialists and private practice doctors
            </p>
          </div>
          
          {/* Pharmacies feature card */}
          <div className="card-hover text-center group animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <FaShieldAlt className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-200">
              Find Pharmacies
            </h3>
            <p className="text-gray-600 text-responsive-sm">
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
