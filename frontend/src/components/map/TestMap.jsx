import { useEffect, useRef } from 'react';

const TestMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    const testGoogleMaps = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
          console.log('❌ No API key found');
          return;
        }

        console.log('✅ API key found:', apiKey.substring(0, 10) + '...');

        // Test if Google Maps script can be loaded
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.onload = () => {
          console.log('✅ Google Maps script loaded successfully');
          
          // Test if we can create a map
          if (window.google && window.google.maps) {
            console.log('✅ Google Maps API is available');
            
            const map = new window.google.maps.Map(mapRef.current, {
              center: { lat: 52.5200, lng: 13.4050 },
              zoom: 13
            });
            
            console.log('✅ Map created successfully');
          } else {
            console.log('❌ Google Maps API not available');
          }
        };
        
        script.onerror = (error) => {
          console.error('❌ Failed to load Google Maps script:', error);
        };
        
        document.head.appendChild(script);
        
      } catch (error) {
        console.error('❌ Error testing Google Maps:', error);
      }
    };

    testGoogleMaps();
  }, []);

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Google Maps Test</h3>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '300px',
          border: '1px solid #ccc',
          borderRadius: '8px'
        }}
      />
      <p className="text-sm text-gray-600 mt-2">
        Check the browser console for test results.
      </p>
    </div>
  );
};

export default TestMap;
