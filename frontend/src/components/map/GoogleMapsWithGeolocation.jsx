import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaHospital, FaPhone, FaDirections, FaSearch, FaUserMd, FaShieldAlt, FaStar, FaClock, FaGlobe } from 'react-icons/fa';

const GoogleMapsWithGeolocation = ({ 
  userLocation = null, 
  searchRadius = 5,
  onLocationSelect = null 
}) => {
  const [currentLocation, setCurrentLocation] = useState(userLocation);
  const [nearbyFacilities, setNearbyFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [map, setMap] = useState(null);
  const [placesService, setPlacesService] = useState(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [locationPermission, setLocationPermission] = useState(null);
  const mapRef = useRef(null);
  const scriptLoadedRef = useRef(false);
  
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Update currentLocation when userLocation prop changes
  useEffect(() => {
    if (userLocation) {
      setCurrentLocation(userLocation);
    }
  }, [userLocation]);

  // Trigger search when searchRadius changes
  useEffect(() => {
    if (currentLocation && !loading && googleLoaded) {
      searchNearbyPlaces();
    }
  }, [searchRadius, currentLocation, googleLoaded]);

  // Check if we should use Google API
  useEffect(() => {
    if (GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key_here') {
      loadGoogleMapsAPI();
    } else {
      setError('Google Maps API key not configured. Please add your API key to .env file.');
    }
  }, [GOOGLE_MAPS_API_KEY]);

  // Get user location with proper permission handling
  useEffect(() => {
    if (!currentLocation) {
      getCurrentLocation();
    }
  }, []);

  // Get current location with permission handling
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setCurrentLocation({ lat: 52.5200, lng: 13.4050 }); // Default to Berlin
      return;
    }

    setLoading(true);
    setLocationPermission('requesting');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setCurrentLocation(location);
        setLocationPermission('granted');
        setLoading(false);
        console.log('Location obtained:', location);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationPermission('denied');
        setError(`Location access ${error.message}. Using default location (Berlin).`);
        setCurrentLocation({ lat: 52.5200, lng: 13.4050 });
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Load Google Maps API
  const loadGoogleMapsAPI = () => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setGoogleLoaded(true);
      return;
    }

    if (scriptLoadedRef.current) {
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        setGoogleLoaded(true);
      });
      return;
    }

    scriptLoadedRef.current = true;
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error("Google Maps API failed to load");
      setError('Failed to load Google Maps API. Please check your API key and internet connection.');
    };
    
    window.initGoogleMaps = () => {
      setGoogleLoaded(true);
      delete window.initGoogleMaps;
    };
    
    document.head.appendChild(script);
  };

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (googleLoaded && currentLocation && !map) {
      initializeGoogleMap();
    }
  }, [googleLoaded, currentLocation, map]);

  // Initialize Google Map
  const initializeGoogleMap = () => {
    if (!currentLocation || !window.google || !window.google.maps) return;

    try {
      const mapOptions = {
        center: currentLocation,
        zoom: 13,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi.medical',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      };

      const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);

      const service = new window.google.maps.places.PlacesService(newMap);
      setPlacesService(service);

      // Add user location marker
      new window.google.maps.Marker({
        position: currentLocation,
        map: newMap,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="#fff" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="#fff"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24)
        }
      });

      // Search for nearby places after a short delay
      setTimeout(() => {
        searchNearbyPlaces();
      }, 1000);

    } catch (error) {
      console.error("Google Maps initialization error:", error);
      setError('Failed to initialize Google Maps. Please check your API key configuration.');
    }
  };

  // Search for nearby medical facilities using Google Places API
  const searchNearbyPlaces = () => {
    if (!placesService || !currentLocation || !window.google) return;

    setLoading(true);
    setError(null);
    console.log('Searching for medical facilities near:', currentLocation, 'radius:', searchRadius);

    const allFacilities = [];

    // Define search configurations for different medical facility types
    const searchConfigs = [
      {
        type: 'hospitals',
        placeTypes: ['hospital'],
        keywords: ['hospital', 'medical center', 'health center', 'emergency room'],
        specialties: ['Emergency Care', 'Surgery', 'Cardiology', 'Neurology', 'Oncology', 'Intensive Care']
      },
      {
        type: 'clinics',
        placeTypes: ['establishment'],
        keywords: ['medical clinic', 'health clinic', 'urgent care', 'family medicine', 'general practice', 'walk-in clinic'],
        specialties: ['General Practice', 'Family Medicine', 'Urgent Care', 'Pediatrics', 'Internal Medicine']
      },
      {
        type: 'doctors',
        placeTypes: ['establishment'],
        keywords: ['doctor', 'physician', 'specialist', 'medical practice', 'private practice', 'consultation'],
        specialties: ['Specialist Consultation', 'Private Practice', 'Telemedicine', 'General Medicine']
      },
      {
        type: 'pharmacies',
        placeTypes: ['pharmacy', 'drugstore'],
        keywords: ['pharmacy', 'drugstore', 'chemist', 'pharmaceutical', 'prescription'],
        specialties: ['Prescriptions', 'Over-the-counter', 'Health Products', 'Consultation', 'Vaccinations']
      }
    ];

    const searchPromises = searchConfigs.map(config => {
      return new Promise((resolve) => {
        const typeFacilities = [];
        
        const typePromises = config.placeTypes.map(placeType => {
          return new Promise((typeResolve) => {
            config.keywords.forEach(keyword => {
              const request = {
                location: currentLocation,
                radius: searchRadius * 1000, // Convert km to meters
                type: placeType,
                keyword: keyword
              };

              placesService.nearbySearch(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                  const facilities = results.map(place => ({
                    id: place.place_id,
                    name: place.name,
                    address: place.vicinity,
                    coordinates: {
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng()
                    },
                    rating: place.rating || 0,
                    userRatingsTotal: place.user_ratings_total || 0,
                    type: config.type,
                    phone: null,
                    website: null,
                    specialties: config.specialties,
                    distance: calculateDistance(
                      currentLocation.lat, currentLocation.lng,
                      place.geometry.location.lat(), place.geometry.location.lng()
                    ),
                    placeId: place.place_id
                  }));
                  typeFacilities.push(...facilities);
                } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                  console.log(`No ${config.type} found for keyword: ${keyword}`);
                } else {
                  console.error(`Places API error for ${config.type}:`, status);
                }
                typeResolve();
              });
            });
          });
        });

        Promise.all(typePromises).then(() => {
          // Remove duplicates based on place_id
          const uniqueFacilities = typeFacilities.filter((facility, index, self) => 
            index === self.findIndex(f => f.id === facility.id)
          );
          resolve(uniqueFacilities);
        });
      });
    });

    Promise.all(searchPromises).then((results) => {
      const allFacilities = results.flat();
      const uniqueFacilities = allFacilities.filter((facility, index, self) => 
        index === self.findIndex(f => f.id === facility.id)
      );
      
      console.log('Found facilities:', uniqueFacilities.length, uniqueFacilities);
      
      // Get detailed information for each facility
      const facilitiesToProcess = uniqueFacilities.slice(0, 20); // Limit to 20 for performance
      const detailPromises = facilitiesToProcess.map(facility => 
        getPlaceDetails(facility.placeId).then(details => ({
          ...facility,
          phone: details.phone,
          website: details.website,
          openingHours: details.openingHours
        }))
      );

      Promise.all(detailPromises).then(facilitiesWithDetails => {
        facilitiesWithDetails.sort((a, b) => a.distance - b.distance);
        setNearbyFacilities(facilitiesWithDetails);
        setLoading(false);
        addMarkersToMap(facilitiesWithDetails);
      }).catch(error => {
        console.error('Error getting place details:', error);
        const facilitiesWithDetails = facilitiesToProcess.map(facility => ({
          ...facility,
          phone: null,
          website: null,
          openingHours: null
        }));
        setNearbyFacilities(facilitiesWithDetails);
        setLoading(false);
        addMarkersToMap(facilitiesWithDetails);
      });
    }).catch(error => {
      console.error('Error searching for places:', error);
      setLoading(false);
      setError('Failed to search for medical facilities. Please try again.');
    });
  };

  // Get detailed information for a place
  const getPlaceDetails = (placeId) => {
    return new Promise((resolve) => {
      if (!placesService || !window.google) {
        resolve({ phone: null, website: null, openingHours: null });
        return;
      }

      const request = {
        placeId: placeId,
        fields: ['formatted_phone_number', 'website', 'opening_hours', 'formatted_address']
      };

      placesService.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve({
            phone: place.formatted_phone_number || null,
            website: place.website || null,
            openingHours: place.opening_hours ? place.opening_hours.weekday_text : null,
            address: place.formatted_address || null
          });
        } else {
          resolve({ phone: null, website: null, openingHours: null, address: null });
        }
      });
    });
  };

  // Add markers to map for each facility
  const addMarkersToMap = (facilities) => {
    if (!map || !window.google) return;

    facilities.forEach(facility => {
      const marker = new window.google.maps.Marker({
        position: facility.coordinates,
        map: map,
        title: facility.name,
        icon: getMarkerIcon(facility.type)
      });

      marker.addListener('click', () => {
        handleFacilitySelect(facility);
      });
    });
  };

  // Get marker icon based on facility type
  const getMarkerIcon = (type) => {
    const colors = {
      hospitals: '#DC2626',
      clinics: '#2563EB',
      doctors: '#7C3AED',
      pharmacies: '#059669'
    };

    const color = colors[type] || '#6B7280';

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="${color}" stroke="#fff" stroke-width="2"/>
          <circle cx="16" cy="16" r="6" fill="#fff"/>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(32, 32)
    };
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
    if (currentLocation && placesService) {
      searchNearbyPlaces();
    }
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
      case 'hospitals': return <FaHospital className="text-red-600" />;
      case 'clinics': return <FaHospital className="text-blue-600" />;
      case 'doctors': return <FaUserMd className="text-purple-600" />;
      case 'pharmacies': return <FaShieldAlt className="text-green-600" />;
      default: return <FaMapMarkerAlt className="text-gray-600" />;
    }
  };

  // Get facility count by type
  const getFacilityCounts = () => {
    const counts = {
      all: nearbyFacilities.length,
      hospitals: nearbyFacilities.filter(f => f.type === 'hospitals').length,
      clinics: nearbyFacilities.filter(f => f.type === 'clinics').length,
      doctors: nearbyFacilities.filter(f => f.type === 'doctors').length,
      pharmacies: nearbyFacilities.filter(f => f.type === 'pharmacies').length
    };
    return counts;
  };

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-red-600">❌</div>
          <h3 className="text-lg font-semibold text-red-900">Error Loading Map</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <div className="space-y-2">
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Reload Page
          </button>
          <button
            onClick={getCurrentLocation}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors ml-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (!googleLoaded || loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <h3 className="text-lg font-semibold text-blue-900">
            {!googleLoaded ? 'Loading Google Maps...' : 'Finding Medical Facilities...'}
          </h3>
        </div>
        <p className="text-blue-700">
          {!googleLoaded ? 'Please wait while we load the Google Maps API.' : 'Searching for medical facilities near your location...'}
        </p>
        {locationPermission === 'requesting' && (
          <p className="text-sm text-blue-600 mt-2">Please allow location access in your browser.</p>
        )}
      </div>
    );
  }

  const facilityCounts = getFacilityCounts();

  return (
    <div className="space-y-6">
      {/* Status Indicator */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700">Google Places API Active</span>
          </div>
          <div className="text-sm text-gray-600">
            Found {facilityCounts.all} facilities within {searchRadius}km
          </div>
        </div>
        {currentLocation && (
          <div className="text-xs text-gray-500 mt-1">
            Location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
          </div>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for medical facilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Filter Buttons with Counts */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Facilities', icon: <FaMapMarkerAlt /> },
            { key: 'hospitals', label: 'Hospitals', icon: <FaHospital /> },
            { key: 'clinics', label: 'Clinics', icon: <FaHospital /> },
            { key: 'doctors', label: 'Doctors', icon: <FaUserMd /> },
            { key: 'pharmacies', label: 'Pharmacies', icon: <FaShieldAlt /> }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => handleFilterChange(filter.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === filter.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.icon}
              {filter.label}
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                {facilityCounts[filter.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
            <div className="h-96" ref={mapRef}></div>
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Searching for medical facilities...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Facilities List */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nearby Medical Facilities ({getFilteredFacilities().length})
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Searching...</p>
              </div>
            ) : getFilteredFacilities().length === 0 ? (
              <div className="text-center py-8">
                <FaMapMarkerAlt className="text-gray-400 text-3xl mx-auto mb-2" />
                <p className="text-gray-600">No facilities found in this area</p>
                <p className="text-sm text-gray-500 mt-2">Try increasing your search radius</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getFilteredFacilities().map((facility) => (
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
                          const directionsUrl = `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${facility.coordinates.lat},${facility.coordinates.lng}`;
                          window.open(directionsUrl, '_blank');
                        }}
                        className="flex items-center gap-1 bg-gray-100 text-gray-700 text-sm py-1 px-3 rounded hover:bg-gray-200 transition-colors"
                      >
                        <FaDirections />
                        Directions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Facility Type Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Facility Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaHospital className="text-red-600" />
                  <span className="text-sm font-medium">Hospitals</span>
                </div>
                <span className="text-sm text-gray-600">{facilityCounts.hospitals}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaHospital className="text-blue-600" />
                  <span className="text-sm font-medium">Clinics</span>
                </div>
                <span className="text-sm text-gray-600">{facilityCounts.clinics}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaUserMd className="text-purple-600" />
                  <span className="text-sm font-medium">Doctors</span>
                </div>
                <span className="text-sm text-gray-600">{facilityCounts.doctors}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-green-600" />
                  <span className="text-sm font-medium">Pharmacies</span>
                </div>
                <span className="text-sm text-gray-600">{facilityCounts.pharmacies}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsWithGeolocation;
