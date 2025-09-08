#!/usr/bin/env node

/**
 * Test script to verify Google Maps API setup
 * Run this script to check if your API key and configuration are working
 */

import https from 'https';
import { readFileSync } from 'fs';

// Load environment variables
let API_KEY = 'your_api_key_here';
try {
  const envContent = readFileSync('.env', 'utf8');
  const match = envContent.match(/VITE_GOOGLE_MAPS_API_KEY=(.+)/);
  if (match) {
    API_KEY = match[1].trim();
  }
} catch (error) {
  console.log('Could not read .env file, using default API key');
}

const TEST_LOCATION = { lat: 52.5200, lng: 13.4050 }; // Berlin, Germany

console.log('🔍 Testing Google Maps API Setup...\n');

// Test 1: Check if API key is configured
console.log('1. Checking API Key Configuration:');
if (API_KEY === 'your_api_key_here' || !API_KEY) {
  console.log('   ❌ API key not configured');
  console.log('   📝 Please add VITE_GOOGLE_MAPS_API_KEY to your .env file\n');
} else {
  console.log('   ✅ API key is configured');
  console.log(`   🔑 Key: ${API_KEY.substring(0, 10)}...\n`);
}

// Test 2: Test Geocoding API
console.log('2. Testing Geocoding API:');
testGeocodingAPI();

// Test 3: Test Places API
console.log('3. Testing Places API:');
testPlacesAPI();

function testGeocodingAPI() {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=Berlin,Germany&key=${API_KEY}`;
  
  https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.status === 'OK') {
          console.log('   ✅ Geocoding API is working');
          console.log(`   📍 Found: ${response.results[0].formatted_address}\n`);
        } else {
          console.log(`   ❌ Geocoding API error: ${response.status}`);
          console.log(`   📝 Error: ${response.error_message || 'Unknown error'}\n`);
        }
      } catch (error) {
        console.log('   ❌ Failed to parse response\n');
      }
    });
  }).on('error', (error) => {
    console.log(`   ❌ Network error: ${error.message}\n`);
  });
}

function testPlacesAPI() {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${TEST_LOCATION.lat},${TEST_LOCATION.lng}&radius=1000&type=hospital&key=${API_KEY}`;
  
  https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.status === 'OK') {
          console.log('   ✅ Places API is working');
          console.log(`   🏥 Found ${response.results.length} hospitals near Berlin\n`);
        } else {
          console.log(`   ❌ Places API error: ${response.status}`);
          console.log(`   📝 Error: ${response.error_message || 'Unknown error'}\n`);
        }
      } catch (error) {
        console.log('   ❌ Failed to parse response\n');
      }
    });
  }).on('error', (error) => {
    console.log(`   ❌ Network error: ${error.message}\n`);
  });
}

// Instructions
console.log('📋 Setup Instructions:');
console.log('1. Get API key from Google Cloud Console');
console.log('2. Enable required APIs (Maps JavaScript, Places, Geocoding)');
console.log('3. Add API key to .env file: VITE_GOOGLE_MAPS_API_KEY=your_key');
console.log('4. Restart your development server');
console.log('5. Run this test again to verify setup\n');

console.log('🔗 Useful Links:');
console.log('- Google Cloud Console: https://console.cloud.google.com/');
console.log('- Maps JavaScript API: https://console.cloud.google.com/marketplace/product/google/maps-backend.googleapis.com');
console.log('- Places API: https://console.cloud.google.com/marketplace/product/google/places-backend.googleapis.com');
console.log('- Setup Guide: ./GOOGLE_MAPS_SETUP.md');
