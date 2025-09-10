import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaHospital, FaPhone, FaDirections, FaSearch, FaUserMd, FaShieldAlt, FaStar, FaGlobe } from 'react-icons/fa';

const FreeMapWithFallback = ({ 
  userLocation = null, 
  searchRadius = 5,
  onLocationSelect = null 
}) => {
  const [currentLocation, setCurrentLocation] = useState(userLocation);
  const [nearbyFacilities, setNearbyFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [debugInfo, setDebugInfo] = useState('');

  // Update currentLocation when userLocation prop changes
  useEffect(() => {
    if (userLocation) {
      setCurrentLocation(userLocation);
      setDebugInfo(`Location updated: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`);
    }
  }, [userLocation]);

  // Generate facilities when location or radius changes
  useEffect(() => {
    if (currentLocation) {
      generateFacilities();
    }
  }, [currentLocation, searchRadius]);

  // Get user location if not provided
  useEffect(() => {
    if (!currentLocation && navigator.geolocation) {
      setLoading(true);
      setDebugInfo('Getting user location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setCurrentLocation(location);
          setLoading(false);
          setDebugInfo(`Location obtained: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          console.log('Location obtained:', location);
        },
        (error) => {
          console.log('Location error, using default location (Berlin)');
          setDebugInfo(`Location error: ${error.message}, using default location`);
          const defaultLocation = { lat: 52.5200, lng: 13.4050 };
          setCurrentLocation(defaultLocation);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else if (!currentLocation) {
      setCurrentLocation({ lat: 52.5200, lng: 13.4050 });
      setDebugInfo('Using default location (Berlin)');
    }
  }, []);

  // Generate comprehensive medical facilities
  const generateFacilities = () => {
    if (!currentLocation) {
      setDebugInfo('No location available for facility generation');
      return;
    }

    setLoading(true);
    setDebugInfo(`Generating facilities for location: ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)} with radius: ${searchRadius}km`);
    
    const facilities = [];
    
    // Hospital facilities
    const hospitals = [
      { name: 'City General Hospital', specialties: ['Emergency Care', 'Surgery', 'Cardiology'] },
      { name: 'Regional Medical Center', specialties: ['Intensive Care', 'Neurology', 'Oncology'] },
      { name: 'University Hospital', specialties: ['Research', 'Specialized Care', 'Teaching'] },
      { name: 'Community Hospital', specialties: ['General Medicine', 'Emergency Care', 'Surgery'] },
      { name: 'Metro Health Center', specialties: ['Emergency Care', 'Trauma', 'Critical Care'] }
    ];

    // Clinic facilities
    const clinics = [
      { name: 'Family Health Clinic', specialties: ['General Practice', 'Family Medicine', 'Pediatrics'] },
      { name: 'Urgent Care Center', specialties: ['Urgent Care', 'Walk-in Clinic', 'Minor Injuries'] },
      { name: 'Community Health Center', specialties: ['Primary Care', 'Preventive Medicine', 'Health Education'] },
      { name: 'Medical Group Practice', specialties: ['Internal Medicine', 'Family Practice', 'Preventive Care'] },
      { name: 'Wellness Medical Clinic', specialties: ['Preventive Care', 'Health Screening', 'Wellness'] }
    ];

    // Doctor facilities
    const doctors = [
      { name: 'Dr. Smith Medical Practice', specialties: ['Internal Medicine', 'Consultation', 'Preventive Care'] },
      { name: 'Specialist Medical Group', specialties: ['Specialist Consultation', 'Private Practice', 'Telemedicine'] },
      { name: 'Health & Wellness Clinic', specialties: ['Holistic Medicine', 'Wellness', 'Alternative Care'] },
      { name: 'Dr. Johnson Family Practice', specialties: ['Family Medicine', 'General Practice', 'Preventive Care'] },
      { name: 'Dr. Williams Specialist Center', specialties: ['Specialist Care', 'Consultation', 'Advanced Treatment'] }
    ];

    // Pharmacy facilities
    const pharmacies = [
      { name: 'City Pharmacy', specialties: ['Prescriptions', 'Over-the-counter', 'Health Products'] },
      { name: '24/7 Medical Pharmacy', specialties: ['Emergency Prescriptions', 'Consultation', 'Vaccinations'] },
      { name: 'Community Drugstore', specialties: ['Prescriptions', 'Health Advice', 'Medical Supplies'] },
      { name: 'Health Plus Pharmacy', specialties: ['Prescriptions', 'Health Products', 'Consultation'] },
      { name: 'Metro Pharmacy', specialties: ['Prescriptions', 'Health Screening', 'Medical Equipment'] }
    ];

    // Generate facilities with realistic coordinates
    const facilityTypes = [
      { type: 'hospitals', data: hospitals, color: '#DC2626' },
      { type: 'clinics', data: clinics, color: '#2563EB' },
      { type: 'doctors', data: doctors, color: '#7C3AED' },
      { type: 'pharmacies', data: pharmacies, color: '#059669' }
    ];

    facilityTypes.forEach(({ type, data, color }) => {
      data.forEach((facility, index) => {
        // Generate realistic coordinates around the user location
        const offsetLat = (Math.random() - 0.5) * 0.02; // ~1km variation
        const offsetLng = (Math.random() - 0.5) * 0.02;
        
        const facilityLat = currentLocation.lat + offsetLat;
        const facilityLng = currentLocation.lng + offsetLng;
        
        const distance = calculateDistance(currentLocation.lat, currentLocation.lng, facilityLat, facilityLng);
        
        // Only include facilities within search radius
        if (distance <= searchRadius) {
          facilities.push({
            id: `${type}_${index}`,
            name: facility.name,
            address: `${Math.floor(Math.random() * 999) + 1} Main St, City`,
            coordinates: { lat: facilityLat, lng: facilityLng },
            rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0 rating
            userRatingsTotal: Math.floor(Math.random() * 200) + 10,
            type: type,
            phone: `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
            website: `https://${facility.name.toLowerCase().replace(/\s+/g, '')}.com`,
            specialties: facility.specialties,
            distance: distance,
            color: color
          });
        }
      });
    });

    // Sort by distance
    facilities.sort((a, b) => a.distance - b.distance);
    
    setDebugInfo(`Generated ${facilities.length} facilities within ${searchRadius}km radius`);
    console.log('Generated facilities:', facilities.length, facilities);
    setNearbyFacilities(facilities);
    setLoading(false);
  };

  // Calculate distance between two points
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Handle facility selection
  const handleFacilitySelect = (facility) => {
    if (onLocationSelect) {
      onLocationSelect({
        name: facility.name,
        address: facility.address,
        coordinates: facility.coordinates,
        phone: facility.phone,
        website: facility.website,
        type: facility.type,
        specialties: facility.specialties,
        rating: facility.rating,
        distance: facility.distance
      });
    }
  };

  // Handle search
  const handleSearch = () => {
    generateFacilities();
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  // Get filtered facilities
  const getFilteredFacilities = () => {
    let filtered = nearbyFacilities;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(facility => facility.type === selectedFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(facility => 
        facility.name.toLowerCase().includes(query) ||
        facility.specialties.some(specialty => specialty.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => a.distance - b.distance);
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'hospitals':
        return <FaHospital className="text-red-600" />;
      case 'clinics':
        return <FaHospital className="text-blue-600" />;
      case 'doctors':
        return <FaUserMd className="text-purple-600" />;
      case 'pharmacies':
        return <FaShieldAlt className="text-green-600" />;
      default:
        return <FaMapMarkerAlt className="text-gray-600" />;
    }
  };

  // Get type label
  const getTypeLabel = (type) => {
    switch (type) {
      case 'hospitals':
        return 'Hospital';
      case 'clinics':
        return 'Clinic';
      case 'doctors':
        return 'Doctor';
      case 'pharmacies':
        return 'Pharmacy';
      default:
        return 'Facility';
    }
  };

  // Generate Google Maps URL with user location
  const getGoogleMapsUrl = () => {
    if (!currentLocation) return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2428.123456789!2d13.4050!3d52.5200!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDLCsDMxJzEyLjAiTiAxM8KwMjQnMTguMCJF!5e0!3m2!1sen!2sde!4v1234567890123!5m2!1sen!2sde&q=medical%20facilities';
    
    const lat = currentLocation.lat;
    const lng = currentLocation.lng;
    
    // Create a more dynamic Google Maps embed URL
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2428.123456789!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${Math.abs(lat).toFixed(0)}s${Math.abs(lat * 60 % 60).toFixed(0)}m${Math.abs(lat * 3600 % 60).toFixed(0)}s${lat >= 0 ? 'N' : 'S'}%20${Math.abs(lng).toFixed(0)}s${Math.abs(lng * 60 % 60).toFixed(0)}m${Math.abs(lng * 3600 % 60).toFixed(0)}s${lng >= 0 ? 'E' : 'W'}!5e0!3m2!1sen!2sde!4v1234567890123!5m2!1sen!2sde&q=medical%20facilities`;
  };

  const filteredFacilities = getFilteredFacilities();

  return (
    <div className="space-y-6">
      {/* Debug information */}
      {debugInfo && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>Debug:</strong> {debugInfo}
          </p>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search facilities or specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {['all', 'hospitals', 'clinics', 'doctors', 'pharmacies'].map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
            <iframe
              className="w-full h-96"
              src={getGoogleMapsUrl()}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading medical facilities...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Facilities List */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nearby Medical Facilities ({filteredFacilities.length})
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Searching...</p>
              </div>
            ) : filteredFacilities.length === 0 ? (
              <div className="text-center py-8">
                <FaMapMarkerAlt className="text-gray-400 text-3xl mx-auto mb-2" />
                <p className="text-gray-600">No facilities found in this area</p>
                <p className="text-sm text-gray-500 mt-2">Try increasing your search radius</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredFacilities.map((facility) => (
                  <div
                    key={facility.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleFacilitySelect(facility)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-lg mt-1">
                        {getTypeIcon(facility.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {facility.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {facility.address}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaMapMarkerAlt />
                            {facility.distance.toFixed(1)} km
                          </span>
                          {facility.rating > 0 && (
                            <span className="flex items-center gap-1">
                              <FaStar className="text-yellow-500" />
                              {facility.rating.toFixed(1)} ({facility.userRatingsTotal})
                            </span>
                          )}
                        </div>
                        {facility.phone && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <FaPhone />
                            {facility.phone}
                          </div>
                        )}
                        {facility.website && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <FaGlobe />
                            <a href={facility.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFacilitySelect(facility);
                        }}
                        className="flex-1 bg-blue-600 text-white text-sm py-1 px-3 rounded hover:bg-blue-700 transition-colors"
                      >
                        Select
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates.lat},${facility.coordinates.lng}`, '_blank');
                        }}
                        className="flex-1 bg-gray-600 text-white text-sm py-1 px-3 rounded hover:bg-gray-700 transition-colors"
                      >
                        Directions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeMapWithFallback;
