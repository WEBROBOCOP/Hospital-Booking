# 🚀 Complete Guide: Enable Google Maps APIs for Real Medical Facilities

## Current Status
- ✅ **API Key**: `AIzaSyCG8US97DGQKdOTMmZHD--iTHrXCxA9coM` (Configured)
- ✅ **Free Version**: Working with medical database
- ❌ **Google APIs**: Need billing and API activation

## Step-by-Step Setup for Real Google APIs

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Make sure you're in the correct project

### 2. Enable Billing (REQUIRED)
- Go to **"Billing"** in the left sidebar
- Click **"Link a billing account"** or **"Create billing account"**
- Add a payment method (credit/debit card)
- **Important**: Google provides $200 free credits monthly

### 3. Enable Required APIs
Go to **"APIs & Services"** → **"Library"** and enable:

#### ✅ Maps JavaScript API
- Search: "Maps JavaScript API"
- Click "Enable"
- **Cost**: $7 per 1,000 map loads

#### ✅ Places API (New) - IMPORTANT!
- Search: "Places API (New)" 
- Click "Enable"
- **Cost**: $17 per 1,000 requests
- ⚠️ **NOT** the legacy "Places API"

#### ✅ Geocoding API
- Search: "Geocoding API"
- Click "Enable"
- **Cost**: $5 per 1,000 requests

### 4. Configure API Key Restrictions
- Go to **"APIs & Services"** → **"Credentials"**
- Click on your API key: `AIzaSyCG8US97DGQKdOTMmZHD--iTHrXCxA9coM`
- Under **"API restrictions"**, select **"Restrict key"**
- Choose the APIs you enabled above

### 5. Switch to Google Maps Component
After enabling APIs, run these commands:

```bash
# Switch to Google Maps component
sed -i 's/import FreeMapWithFallback from/import GoogleMapsWithGeolocation from/' src/pages/FindClinics.jsx
sed -i 's/FreeMapWithFallback/GoogleMapsWithGeolocation/g' src/pages/FindClinics.jsx
sed -i 's/import GoogleMapsWithGeolocation from '\''..\/components\/map\/FreeMapWithFallback'\''/import GoogleMapsWithGeolocation from '\''..\/components\/map\/GoogleMapsWithGeolocation'\''/' src/pages/FindClinics.jsx
sed -i 's/Free Map with Medical Database/Google Places API with Real Location/g' src/pages/FindClinics.jsx
```

### 6. Test Your Setup
```bash
node test-google-maps.mjs
```

## Expected Results After Setup
- ✅ Real user location from GPS
- ✅ Real medical facilities from Google's database
- ✅ Interactive map with markers
- ✅ All facility types: Hospitals, Clinics, Doctors, Pharmacies
- ✅ Live data: ratings, phone numbers, websites, hours

## Cost Information
- **Free Tier**: $200 monthly credit
- **Maps JavaScript API**: $7 per 1,000 loads
- **Places API**: $17 per 1,000 requests  
- **Geocoding API**: $5 per 1,000 requests

For a small application, the $200 free credit should be sufficient.

## Current Working Solution
Right now you have:
- ✅ **Free Map with Medical Database** - Works immediately
- ✅ **Real geolocation** - Uses your device's GPS
- ✅ **All facility types** - Hospitals, Clinics, Doctors, Pharmacies
- ✅ **Interactive features** - Search, filter, select
- ✅ **Appointment booking** - Ready to use

## Troubleshooting
If you still get errors after setup:
1. Wait 5-10 minutes for changes to propagate
2. Clear browser cache (Ctrl+Shift+R)
3. Check API key restrictions
4. Verify billing is enabled

## Next Steps
1. **Test current free version** - It's working now!
2. **When ready for production** - Enable Google APIs
3. **Switch components** - Use the commands above
4. **Enjoy real-time data** - From Google's database
