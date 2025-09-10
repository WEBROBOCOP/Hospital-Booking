import { useState, useEffect } from 'react';
import { 
  FaMapMarkerAlt, 
  FaStar, 
  FaPhone,
  FaSearch,
  FaHospital,
  FaUserMd,
  FaShieldAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import GoogleMap from '../components/map/GoogleMap';
import MapDiagnostic from '../components/map/MapDiagnostic';

const FindClinics = () => {
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(5);
  const [clinics, setClinics] = useState([]);
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState({ lat: 52.5200, lng: 13.4050 });
  const [locationStatus, setLocationStatus] = useState('detecting');

  // Get user location
  const detectUserLocation = () => {
    setLocationStatus('detecting');
    
    if (!navigator.geolocation) {
      setLocationStatus('error');
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
        
        // Auto-search for clinics
        setTimeout(() => {
          searchClinicsNearby(latitude, longitude);
        }, 1000);
      },
      (error) => {
        setLocationStatus('error');
        setUserLocation({ lat: 52.5200, lng: 13.4050 });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    detectUserLocation();
  }, []);

  // Search function
  const searchClinicsNearby = (lat, lng) => {
    setLoading(true);
    if (window.mapSearchMethods && window.mapSearchMethods.searchNearby) {
      window.mapSearchMethods.searchNearby(lat, lng, searchRadius * 1000);
    }
  };

  const handleMapLoad = (mapInstance, searchMethods) => {
    setMap(mapInstance);
    if (searchMethods) {
      window.mapSearchMethods = searchMethods;
    }
  };

  const handlePlaceSelect = (place) => {
    if (place.lat && place.lng) {
      setCenter({ lat: place.lat, lng: place.lng });
    }
  };

  // Calculate distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleClinicsFound = (foundClinics) => {
    if (userLocation && foundClinics.length > 0) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Medical Facilities Near You
          </h1>
          <p className="text-lg text-gray-600">
            Hospitals, clinics, doctors, and pharmacies in your area
          </p>
        </div>

        {/* Diagnostic Component */}
        <MapDiagnostic />

        {/* Loading Status */}
        {locationStatus === 'detecting' && (
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-lg">Finding medical facilities near you...</span>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <GoogleMap
                center={center}
                zoom={13}
                onMapLoad={handleMapLoad}
                onPlaceSelect={handlePlaceSelect}
                onClinicsFound={handleClinicsFound}
              />
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {clinics.length > 0 ? `Found ${clinics.length} Facilities` : 'Search Results'}
              </h2>
              
              {clinics.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {clinics.map((clinic, index) => (
                    <div key={clinic.place_id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{clinic.name}</h3>
                          {clinic.type && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full mt-1 inline-block">
                              {clinic.type}
                            </span>
                          )}
                        </div>
                        {clinic.distance && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
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
              ) : (
                <div className="text-center py-8">
                  <FaSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No facilities found</h3>
                  <p className="text-gray-600">
                    {loading ? 'Searching...' : 'Use the search above or click "Find Near Me" to find medical facilities.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindClinics;