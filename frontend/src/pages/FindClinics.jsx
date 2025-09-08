import { useState, useEffect } from 'react';
import { 
  FaMapMarkerAlt, 
  FaDirections, 
  FaCalendarAlt, 
  FaPhone, 
  FaGlobe, 
  FaStar, 
  FaClock, 
  FaShieldAlt,
  FaUserMd,
  FaHospital,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import GoogleMap from '../components/map/GoogleMap';

const FindMedicalFacilities = () => {
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(5); // Default to 5km
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [clinics, setClinics] = useState([]);
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState({ lat: 52.5200, lng: 13.4050 }); // Default to Berlin
  const [locationStatus, setLocationStatus] = useState('detecting'); // 'detecting', 'success', 'error', 'denied'
  const [locationError, setLocationError] = useState(null);
  
  // Enhanced location detection with better error handling
  const detectUserLocation = () => {
    setLocationStatus('detecting');
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Geolocation is not supported by this browser');
      setUserLocation({ lat: 52.5200, lng: 13.4050 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setUserLocation(location);
        setCenter(location);
        setLocationStatus('success');
        setLocationError(null);
        
        // Auto-search for clinics near the user
        setTimeout(() => {
          searchClinicsNearby(latitude, longitude);
        }, 1000);
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        let status = 'error';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions in your browser.';
            status = 'denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Using default location (Berlin).';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Using default location (Berlin).';
            break;
          default:
            errorMessage = 'Location detection failed. Using default location (Berlin).';
            break;
        }
        
        setLocationStatus(status);
        setLocationError(errorMessage);
        setUserLocation({ lat: 52.5200, lng: 13.4050 });
      },
      {
        enableHighAccuracy: false, // Changed to false for better compatibility
        timeout: 10000, // Reduced timeout
        maximumAge: 60000 // 1 minute
      }
    );
  };

  // Get user location on component mount
  useEffect(() => {
    detectUserLocation();
  }, []);

  // Book appointment
  const handleBookAppointment = (facility) => {
    navigate('/book', { 
      state: { 
        clinicName: facility.name,
        clinicAddress: facility.address,
        clinicCoordinates: facility.coordinates,
        clinicType: facility.type,
        clinicPhone: facility.phone,
        clinicWebsite: facility.website,
        clinicSpecialties: facility.specialties
      }
    });
  };

  const handleFacilitySelect = (facility) => {
    handleBookAppointment(facility);
  };

  // Handle search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    // Trigger Google Maps search
    if (window.mapSearchMethods && window.mapSearchMethods.searchClinics) {
      window.mapSearchMethods.searchClinics(searchQuery);
    }
  };

  // Search clinics nearby using coordinates
  const searchClinicsNearby = (lat, lng) => {
    setLoading(true);
    // Trigger Google Maps nearby search
    if (window.mapSearchMethods && window.mapSearchMethods.searchNearby) {
      window.mapSearchMethods.searchNearby(lat, lng, searchRadius * 1000); // Convert km to meters
    }
  };

  // Handle map load
  const handleMapLoad = (mapInstance, searchMethods) => {
    setMap(mapInstance);
    // Store search methods for later use
    if (searchMethods) {
      window.mapSearchMethods = searchMethods;
    }
  };

  // Handle place selection from map
  const handlePlaceSelect = (place) => {
    setSelectedFacility(place);
    if (place.lat && place.lng) {
      setCenter({ lat: place.lat, lng: place.lng });
    }
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  // Handle clinics found with distance calculation and sorting
  const handleClinicsFound = (foundClinics) => {
    if (userLocation && foundClinics.length > 0) {
      // Add distance to each clinic and sort by proximity
      const clinicsWithDistance = foundClinics.map(clinic => ({
        ...clinic,
        distance: calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          clinic.coordinates.lat, 
          clinic.coordinates.lng
        )
      })).sort((a, b) => a.distance - b.distance);

      setClinics(clinicsWithDistance);
    } else {
      setClinics(foundClinics);
    }
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Medical Facilities Near You
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover <span className="font-semibold text-blue-600">hospitals, clinics, doctors, and pharmacies</span> within a <span className="font-semibold text-blue-600">{searchRadius}km radius</span> of your location. 
            Get exact distances and book appointments instantly!
          </p>
          
          {/* Status Indicators */}
          <div className="mt-4 flex justify-center gap-4 flex-wrap">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Real-time Location Detection</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Search Radius: {searchRadius}km</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium">Instant Booking</span>
            </div>
          </div>
        </div>
        
        {/* Radius Selector */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="mb-4 text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Radius
            </label>
            <div className="flex justify-center gap-2">
              {[1, 3, 5, 10, 15].map((radius) => (
                <button
                  key={radius}
                  onClick={() => setSearchRadius(radius)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    searchRadius === radius
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {radius}km
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Choose how far to search for clinics
            </p>
          </div>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search for clinics, hospitals, or medical centers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {/* Location Status and Find Clinics Near Me Button */}
          <div className="text-center space-y-4">
            {/* Location Status Display */}
            {locationStatus === 'detecting' && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Detecting your location...</span>
              </div>
            )}
            
            {locationStatus === 'success' && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <FaMapMarkerAlt className="h-4 w-4" />
                <span className="text-sm">Location detected successfully!</span>
              </div>
            )}
            
            {locationStatus === 'denied' && (
              <div className="flex items-center justify-center gap-2 text-red-600">
                <FaMapMarkerAlt className="h-4 w-4" />
                <span className="text-sm">Location access denied</span>
              </div>
            )}
            
            {locationStatus === 'error' && (
              <div className="flex items-center justify-center gap-2 text-red-600">
                <FaMapMarkerAlt className="h-4 w-4" />
                <span className="text-sm">Location detection failed</span>
              </div>
            )}

            <button
              onClick={() => {
                if (userLocation && locationStatus === 'success') {
                  searchClinicsNearby(userLocation.lat, userLocation.lng);
                  if (map && map.setCenter) {
                    map.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
                    map.setZoom(14);
                  }
                } else {
                  // Try to detect location again
                  detectUserLocation();
                }
              }}
              disabled={loading || locationStatus === 'detecting'}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed mr-4"
            >
              {loading ? 'Searching...' : 
               locationStatus === 'detecting' ? 'Detecting Location...' :
               locationStatus === 'success' ? 'Find Clinics Near Me' :
               'Try Location Again'}
            </button>
            
            {/* Manual Search Buttons for Common Medical Terms */}
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">Try searching for specific types:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { term: 'Arzt', label: '👨‍⚕️ Arzt (Doctor)' },
                  { term: 'Klinik', label: '🏥 Klinik (Clinic)' },
                  { term: 'Physiotherapie', label: '💪 Physiotherapie' },
                  { term: 'Apotheke', label: '💊 Apotheke (Pharmacy)' },
                  { term: 'Praxis', label: '🏥 Praxis (Practice)' }
                ].map((searchTerm) => (
                  <button
                    key={searchTerm.term}
                    onClick={() => {
                      setSearchQuery(searchTerm.term);
                      handleSearch();
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 text-sm"
                  >
                    {searchTerm.label}
                  </button>
                ))}
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Clinic Results */}
        {clinics.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Found {clinics.length} Medical Facilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clinics.slice(0, 6).map((clinic, index) => (
                <div key={clinic.place_id || index} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{clinic.name}</h3>
                    {clinic.distance && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {clinic.distance.toFixed(1)} km
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{clinic.address}</p>
                  {clinic.rating && (
                    <div className="flex items-center gap-1 mb-3">
                      <FaStar className="h-3 w-3 text-yellow-400" />
                      <span className="text-xs text-gray-600">
                        {clinic.rating} ({clinic.user_ratings_total} reviews)
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => handleBookAppointment(clinic)}
                    className="w-full bg-blue-600 text-white text-xs py-2 px-3 rounded hover:bg-blue-700 transition-colors"
                  >
                    Book Appointment
                  </button>
                </div>
              ))}
            </div>
            {clinics.length > 6 && (
              <p className="text-center text-sm text-gray-600 mt-4">
                Showing first 6 results. Use the map to explore more clinics.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <GoogleMap
              center={center}
              zoom={13}
              onMapLoad={handleMapLoad}
              onPlaceSelect={handlePlaceSelect}
              searchQuery={searchQuery}
              onClinicsFound={handleClinicsFound}
            />
          </div>
          
          {/* Instructions */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                How to Use This Free Map
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Get Your Location</h3>
                    <p className="text-sm text-gray-600">Click "Find Near Me" to automatically detect your current location</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Filter by Type</h3>
                    <p className="text-sm text-gray-600">Use the filter buttons to show hospitals, clinics, doctors, or pharmacies</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Search & View</h3>
                    <p className="text-sm text-gray-600">Search for specific facilities and view them on the map</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Book Appointment</h3>
                    <p className="text-sm text-gray-600">Click "Select" to book an appointment at your chosen facility</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Facility Types */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Available Facility Types
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaHospital className="text-red-600" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Hospitals</span>
                    <p className="text-xs text-gray-600">Emergency care, surgery, specialized treatments</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaHospital className="text-blue-600" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Clinics</span>
                    <p className="text-xs text-gray-600">General practice, urgent care, family medicine</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaUserMd className="text-purple-600" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Doctors</span>
                    <p className="text-xs text-gray-600">Specialists, private practices, consultations</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaShieldAlt className="text-green-600" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Pharmacies</span>
                    <p className="text-xs text-gray-600">Prescriptions, over-the-counter, health products</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Benefits */}
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h2 className="text-xl font-semibold text-green-900 mb-4">
                Why This Map is Better
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-green-600 mt-1">✅</div>
                  <div>
                    <h3 className="font-medium text-green-900">100% Free</h3>
                    <p className="text-sm text-green-700">No API keys, no billing, no setup required</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="text-green-600 mt-1">✅</div>
                  <div>
                    <h3 className="font-medium text-green-900">All Facility Types</h3>
                    <p className="text-sm text-green-700">Hospitals, clinics, doctors, and pharmacies in one place</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="text-green-600 mt-1">✅</div>
                  <div>
                    <h3 className="font-medium text-green-900">Easy Filtering</h3>
                    <p className="text-sm text-green-700">Filter by facility type to find exactly what you need</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="text-green-600 mt-1">✅</div>
                  <div>
                    <h3 className="font-medium text-green-900">Real Google Maps</h3>
                    <p className="text-sm text-green-700">Uses the same Google Maps you know and trust</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
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

export default FindMedicalFacilities;
