import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const GoogleMap = ({ 
  center = { lat: 52.5200, lng: 13.4050 }, 
  zoom = 13, 
  onMapLoad, 
  onPlaceSelect,
  searchQuery = '',
  onClinicsFound 
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [placesService, setPlacesService] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const initMap = async () => {
      try {
        // You'll need to add your Google Maps API key here
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
        
        if (apiKey === 'YOUR_API_KEY_HERE') {
          console.warn('⚠️ Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file');
          return;
        }

        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        const { Map } = await loader.importLibrary('maps');
        const { PlacesService } = await loader.importLibrary('places');

        const mapInstance = new Map(mapRef.current, {
          center: center,
          zoom: zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        const placesServiceInstance = new PlacesService(mapInstance);

        setMap(mapInstance);
        setPlacesService(placesServiceInstance);

        if (onMapLoad) {
          onMapLoad(mapInstance);
        }

        // Add click listener for map
        mapInstance.addListener('click', (event) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          if (onPlaceSelect) {
            onPlaceSelect({ lat, lng });
          }
        });

      } catch (error) {
        console.error('Error loading Google Maps:', error);
        
        // Handle specific Google Maps API errors
        if (error.message.includes('BillingNotEnabledMapError')) {
          console.error('❌ Google Maps billing is not enabled. Please enable billing in Google Cloud Console.');
        } else if (error.message.includes('ApiNotActivatedMapError')) {
          console.error('❌ Google Maps API is not activated. Please enable Maps JavaScript API and Places API in Google Cloud Console.');
        } else if (error.message.includes('InvalidKeyMapError')) {
          console.error('❌ Invalid Google Maps API key. Please check your API key.');
        }
      }
    };

    initMap();
  }, []);

  // Search for clinics when searchQuery changes
  useEffect(() => {
    if (placesService && searchQuery.trim()) {
      searchClinics(searchQuery);
    }
  }, [searchQuery, placesService]);

  const searchClinics = (query) => {
    if (!placesService || !map) return;

    const request = {
      query: query,
      fields: ['name', 'geometry', 'formatted_address', 'place_id', 'rating', 'user_ratings_total', 'types'],
      locationBias: map.getCenter()
    };

    placesService.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        // Clear existing markers
        markers.forEach(marker => marker.setMap(null));
        
        const newMarkers = [];
        const clinicResults = [];

        results.forEach((place) => {
          // Filter for medical facilities - expanded list
          if (place.types.some(type => 
            ['hospital', 'doctor', 'health', 'pharmacy', 'physiotherapist', 'clinic', 'medical_center', 'dentist', 'veterinary_care', 'health_center', 'general_practitioner', 'specialist', 'urgent_care', 'emergency_room'].includes(type)
          ) || place.name.toLowerCase().includes('praxis') || place.name.toLowerCase().includes('arztpraxis')) {
            const marker = new window.google.maps.Marker({
              position: place.geometry.location,
              map: map,
              title: place.name,
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
              }
            });

            // Add click listener to marker
            marker.addListener('click', () => {
              if (onPlaceSelect) {
                onPlaceSelect({
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                  name: place.name,
                  address: place.formatted_address,
                  rating: place.rating,
                  user_ratings_total: place.user_ratings_total,
                  place_id: place.place_id
                });
              }
            });

            newMarkers.push(marker);
            clinicResults.push({
              name: place.name,
              address: place.formatted_address,
              coordinates: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              },
              rating: place.rating,
              user_ratings_total: place.user_ratings_total,
              place_id: place.place_id
            });
          }
        });

        setMarkers(newMarkers);
        
        if (onClinicsFound) {
          onClinicsFound(clinicResults);
        }

        // Fit map to show all results
        if (clinicResults.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          clinicResults.forEach(clinic => {
            bounds.extend(clinic.coordinates);
          });
          map.fitBounds(bounds);
        }
      }
    });
  };

  const searchNearby = (lat, lng, radius = 5000) => {
    if (!placesService || !map) return;

    // Search for multiple types of medical facilities
    const medicalTypes = ['hospital', 'pharmacy', 'doctor', 'health'];
    let allResults = [];
    let completedSearches = 0;

    // Add a specific search for praxis/medical practices
    const praxisRequest = {
      location: new window.google.maps.LatLng(lat, lng),
      radius: radius,
      keyword: 'praxis arztpraxis medizinische praxis doctor office medical practice'
    };

    // Search for praxis first
    placesService.nearbySearch(praxisRequest, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        allResults = allResults.concat(results);
      }
      completedSearches++;
      
      // Process results when all searches are complete
      if (completedSearches === medicalTypes.length + 1) {
        processNearbyResults(allResults, lat, lng);
      }
    });

    // Then search for other medical types
    medicalTypes.forEach((type, index) => {
      const request = {
        location: new window.google.maps.LatLng(lat, lng),
        radius: radius,
        type: type,
        keyword: 'medical clinic doctor hospital pharmacy praxis arztpraxis medizinische praxis'
      };

      placesService.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          allResults = allResults.concat(results);
        }
        
        completedSearches++;
        
        // Process results when all searches are complete
        if (completedSearches === medicalTypes.length + 1) {
          processNearbyResults(allResults, lat, lng);
        }
      });
    });
  };

  const processNearbyResults = (results, lat, lng) => {
    // Remove duplicates based on place_id
    const uniqueResults = results.filter((place, index, self) => 
      index === self.findIndex(p => p.place_id === place.place_id)
    );

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    const newMarkers = [];
    const clinicResults = [];

    uniqueResults.forEach((place) => {
      // Determine marker color based on facility type
      let iconColor = 'blue';
      if (place.types) {
        if (place.types.includes('hospital')) iconColor = 'red';
        else if (place.types.includes('pharmacy')) iconColor = 'green';
        else if (place.types.includes('doctor')) iconColor = 'purple';
      }

      const marker = new window.google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name,
        icon: {
          url: `https://maps.google.com/mapfiles/ms/icons/${iconColor}-dot.png`
        }
      });

      marker.addListener('click', () => {
        if (onPlaceSelect) {
          onPlaceSelect({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            name: place.name,
            address: place.vicinity || place.formatted_address,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            place_id: place.place_id
          });
        }
      });

      newMarkers.push(marker);

      // Determine facility type for display
      let facilityType = 'Medical Facility';
      if (place.types) {
        if (place.types.includes('hospital')) facilityType = 'Hospital';
        else if (place.types.includes('pharmacy')) facilityType = 'Pharmacy';
        else if (place.types.includes('doctor')) facilityType = 'Doctor';
        else if (place.types.includes('clinic')) facilityType = 'Clinic';
        else if (place.types.includes('medical_center')) facilityType = 'Medical Center';
        else if (place.types.includes('health')) facilityType = 'Health Center';
      }
      
      // Check name for praxis-specific terms
      if (place.name && (
        place.name.toLowerCase().includes('praxis') ||
        place.name.toLowerCase().includes('arztpraxis') ||
        place.name.toLowerCase().includes('medizinische') ||
        place.name.toLowerCase().includes('doctor office') ||
        place.name.toLowerCase().includes('medical practice')
      )) {
        facilityType = 'Praxis';
      }

      clinicResults.push({
        name: place.name,
        address: place.vicinity || place.formatted_address,
        coordinates: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        },
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        place_id: place.place_id,
        type: facilityType,
        types: place.types || []
      });
    });

    setMarkers(newMarkers);

    if (onClinicsFound) {
      onClinicsFound(clinicResults);
    }

    // Fit map to show all results
    if (clinicResults.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      clinicResults.forEach(clinic => {
        bounds.extend(clinic.coordinates);
      });
      map.fitBounds(bounds);
    }
  };

  // Expose search methods
  useEffect(() => {
    if (map && onMapLoad) {
      onMapLoad(map, { searchClinics, searchNearby });
    }
  }, [map]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

  // Debug: Log the API key (first 10 characters for security)
  console.log('Google Maps API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');

  if (apiKey === 'YOUR_API_KEY_HERE') {
    return (
      <div 
        style={{ 
          width: '100%', 
          height: '400px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">🗺️ Google Maps Integration</h3>
          <p className="text-gray-600 mb-4">
            To enable clinic search functionality, you need to configure your Google Maps API key and enable billing.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left mb-4">
            <h4 className="font-semibold text-red-800 mb-2">⚠️ Current Issues:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Billing is not enabled on your Google Cloud project</li>
              <li>• Maps JavaScript API and Places API need to be activated</li>
            </ul>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-yellow-800 mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>2. <strong>Enable billing</strong> and add a payment method</li>
              <li>3. Enable these APIs: <strong>Maps JavaScript API</strong>, <strong>Places API</strong></li>
              <li>4. Create a <code className="bg-yellow-100 px-1 rounded">.env</code> file in the frontend directory</li>
              <li>5. Add: <code className="bg-yellow-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</code></li>
              <li>6. Restart the development server</li>
            </ol>
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-xs text-green-700">
                💡 <strong>Note:</strong> Google provides $200 free credits monthly for Maps API usage
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '400px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }} 
    />
  );
};

export default GoogleMap;
