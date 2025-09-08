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
          console.warn('⚠️ Google Maps API key not configured. Please add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file');
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
          // Filter for medical facilities
          if (place.types.some(type => 
            ['hospital', 'doctor', 'health', 'pharmacy', 'physiotherapist'].includes(type)
          )) {
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

    const request = {
      location: new window.google.maps.LatLng(lat, lng),
      radius: radius,
      type: 'hospital',
      keyword: 'clinic doctor medical'
    };

    placesService.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        // Clear existing markers
        markers.forEach(marker => marker.setMap(null));
        
        const newMarkers = [];
        const clinicResults = [];

        results.forEach((place) => {
          const marker = new window.google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name,
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }
          });

          marker.addListener('click', () => {
            if (onPlaceSelect) {
              onPlaceSelect({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                name: place.name,
                address: place.vicinity,
                rating: place.rating,
                user_ratings_total: place.user_ratings_total,
                place_id: place.place_id
              });
            }
          });

          newMarkers.push(marker);
          clinicResults.push({
            name: place.name,
            address: place.vicinity,
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            },
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            place_id: place.place_id
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
      }
    });
  };

  // Expose search methods
  useEffect(() => {
    if (map && onMapLoad) {
      onMapLoad(map, { searchClinics, searchNearby });
    }
  }, [map]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

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
            To enable clinic search functionality, you need to configure your Google Maps API key.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-yellow-800 mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Get a Google Maps API key from <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>2. Enable the following APIs: Maps JavaScript API, Places API</li>
              <li>3. Create a <code className="bg-yellow-100 px-1 rounded">.env</code> file in the frontend directory</li>
              <li>4. Add: <code className="bg-yellow-100 px-1 rounded">REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here</code></li>
              <li>5. Restart the development server</li>
            </ol>
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
