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
  
  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          // Use default location (Berlin, Germany)
          setUserLocation({ lat: 52.5200, lng: 13.4050 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      // Fallback: use default location
      setUserLocation({ lat: 52.5200, lng: 13.4050 });
    }
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

  // Handle clinics found
  const handleClinicsFound = (foundClinics) => {
    setClinics(foundClinics);
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find All Medical Facilities
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover <span className="font-semibold text-blue-600">hospitals, clinics, doctors, and pharmacies</span> within a <span className="font-semibold text-blue-600">{searchRadius}km radius</span> of your location. 
            This map is completely <span className="font-semibold text-green-600">FREE</span> and doesn't require any API keys!
          </p>
          
          {/* Free Map Indicator */}
          <div className="mt-4 flex justify-center gap-4">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">100% FREE - No API Key Required</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Search Radius: {searchRadius}km</span>
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
          
          {/* Find Clinics Near Me Button */}
          <div className="text-center space-x-2">
            <button
              onClick={() => {
                if (userLocation) {
                  searchClinicsNearby(userLocation.lat, userLocation.lng);
                  if (map.current) {
                    map.current.setCenter([userLocation.lng, userLocation.lat]);
                    map.current.setZoom(14);
                  }
                } else {
                  // Try to get location again
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { latitude, longitude } = position.coords;
                        setUserLocation({ lat: latitude, lng: longitude });
                        setCenter({ lat: latitude, lng: longitude });
                        searchClinicsNearby(latitude, longitude);
                        if (map.current) {
                          map.current.setCenter([longitude, latitude]);
                          map.current.setZoom(14);
                        }
                      },
                      () => {
                        alert('Unable to get your location. Please try searching for a specific area.');
                      }
                    );
                  }
                }
              }}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed mr-4"
            >
              {loading ? 'Searching...' : 'Find Clinics Near Me'}
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
            
            {/* Debug button for testing */}
            <button
              onClick={() => {
                console.log('🧪 Debug: Testing clinic search with default coordinates');
                console.log('📍 Current center:', center);
                console.log('🗺️ Map status:', map.current ? 'Ready' : 'Not ready');
                console.log('🔍 Map style loaded:', map.current ? map.current.isStyleLoaded() : 'N/A');
                
                // Test the Mapbox API directly
                const testUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/.json?proximity=${center.lng},${center.lat}&types=poi&limit=10&access_token=${mapboxgl.accessToken}`;
                console.log('🧪 Testing URL:', testUrl);
                
                fetch(testUrl)
                  .then(response => response.json())
                  .then(data => {
                    console.log('🧪 Raw Mapbox response:', data);
                    console.log('🧪 Features found:', data.features ? data.features.length : 0);
                    if (data.features) {
                      data.features.forEach((feature, index) => {
                        console.log(`🧪 Feature ${index + 1}:`, {
                          text: feature.text,
                          place_name: feature.place_name,
                          types: feature.place_type,
                          properties: feature.properties
                        });
                      });
                    }
                  })
                  .catch(error => {
                    console.error('🧪 Test fetch error:', error);
                  });
                
                searchClinicsNearby(center.lat, center.lng);
              }}
              className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              🧪 Test Search
            </button>
          </div>
        </div>
        
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
