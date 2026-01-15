import { useState, useEffect } from 'react';

const MapDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState({
    apiKeyLoaded: false,
    googleMapsLoaded: false,
    placesApiLoaded: false,
    errors: []
  });

  useEffect(() => {
    const runDiagnostics = () => {
      const results = {
        apiKeyLoaded: false,
        googleMapsLoaded: false,
        placesApiLoaded: false,
        errors: []
      };

      // Check if API key is loaded
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      results.apiKeyLoaded = !!apiKey && apiKey !== 'YOUR_API_KEY_HERE';
      
      if (!results.apiKeyLoaded) {
        results.errors.push('API key not found in environment variables');
      }

      // Check if Google Maps is loaded
      if (window.google && window.google.maps) {
        results.googleMapsLoaded = true;
      } else {
        results.errors.push('Google Maps JavaScript API not loaded');
      }

      // Check if Places API is available
      if (window.google && window.google.maps && window.google.maps.places) {
        results.placesApiLoaded = true;
      } else {
        results.errors.push('Google Places API not loaded');
      }

      setDiagnostics(results);
    };

    // Run diagnostics after a short delay to allow Google Maps to load
    const timer = setTimeout(runDiagnostics, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Google Maps Diagnostic</h3>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${diagnostics.apiKeyLoaded ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">
            API Key: {diagnostics.apiKeyLoaded ? '✅ Loaded' : '❌ Not Found'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${diagnostics.googleMapsLoaded ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">
            Google Maps: {diagnostics.googleMapsLoaded ? '✅ Loaded' : '❌ Not Loaded'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${diagnostics.placesApiLoaded ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">
            Places API: {diagnostics.placesApiLoaded ? '✅ Loaded' : '❌ Not Loaded'}
          </span>
        </div>
      </div>

      {diagnostics.errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">Issues Found:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {diagnostics.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {diagnostics.apiKeyLoaded && !diagnostics.googleMapsLoaded && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Next Steps:</h4>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
            <li>2. Enable <strong>billing</strong> for your project</li>
            <li>3. Enable <strong>Maps JavaScript API</strong></li>
            <li>4. Enable <strong>Places API</strong></li>
            <li>5. Check API key restrictions</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default MapDiagnostic;
