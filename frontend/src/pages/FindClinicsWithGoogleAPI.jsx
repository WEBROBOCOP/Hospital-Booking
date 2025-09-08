import { useState, useEffect } from 'react';
import { 
  FaShieldAlt,
  FaUserMd,
  FaHospital,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import GoogleMapsAPI from '../components/map/GoogleMapsAPI';

const FindMedicalFacilitiesWithGoogleAPI = () => {
  const navigate = useNavigate();
  
  // State
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(5); // Default to 5km
  
  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        () => {
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
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Medical Facilities with Google Maps
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover <span className="font-semibold text-blue-600">hospitals, clinics, doctors, and pharmacies</span> within a <span className="font-semibold text-blue-600">{searchRadius}km radius</span> of your location using real-time Google Places data.
          </p>
          
          {/* Google API Indicator */}
          <div className="mt-4 flex justify-center gap-4">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Powered by Google Places API</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Real-time Data</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
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
          </div>
        </div>
        
        {/* Google Maps API Component */}
        <GoogleMapsAPI
          userLocation={userLocation}
          searchRadius={searchRadius}
          onLocationSelect={handleFacilitySelect}
        />
        
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

        {/* Benefits Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Use Google Places API?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-time Data
              </h3>
              <p className="text-gray-600">
                Get up-to-date information about medical facilities, including ratings, reviews, and contact details
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Accurate Results
              </h3>
              <p className="text-gray-600">
                Google&apos;s comprehensive database ensures you find all available medical facilities in your area
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Fast & Reliable
              </h3>
              <p className="text-gray-600">
                Powered by Google&apos;s infrastructure for fast, reliable search results and map rendering
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindMedicalFacilitiesWithGoogleAPI;
