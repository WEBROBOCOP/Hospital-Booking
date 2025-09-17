import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserMd, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center">
            <div className="animate-fade-in">
              <h1 className="text-responsive-4xl tracking-tight font-extrabold text-gray-900">
                <span className="block">Find the Right</span>
                <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Medical Care
                </span>
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-responsive-base text-gray-600 leading-relaxed">
                Connect with trusted healthcare providers, book appointments, and manage your health journey with ease. 
                Your health is our priority.
              </p>
            </div>
            <div className="mt-8 max-w-lg mx-auto sm:flex sm:justify-center sm:space-x-4">
              <div className="animate-slide-up">
                <Link
                  to="/find-clinics"
                  className="btn-primary w-full sm:w-auto text-responsive-base px-8 py-4 shadow-lg hover:shadow-xl"
                >
                  Find Clinics
                </Link>
              </div>
              <div className="mt-4 sm:mt-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <Link
                  to="/signup"
                  className="btn-outline w-full sm:w-auto text-responsive-base px-8 py-4"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-fade-in">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-4 text-responsive-3xl font-extrabold tracking-tight text-gray-900">
                Everything you need for healthcare
              </p>
              <p className="mt-4 max-w-2xl mx-auto text-responsive-base text-gray-600">
                Our comprehensive platform provides all the tools you need to manage your healthcare journey effectively.
              </p>
            </div>
          </div>

          <div className="mt-16">
            <div className="grid-cards">
              <div className="card-hover group animate-slide-up">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <FaUserMd className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                      Find Doctors
                    </h3>
                    <p className="mt-2 text-gray-600 leading-relaxed">
                      Discover qualified healthcare providers in your area with detailed profiles, specialties, and patient reviews.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-hover group animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <FaCalendarAlt className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                      Book Appointments
                    </h3>
                    <p className="mt-2 text-gray-600 leading-relaxed">
                      Schedule appointments online with ease, receive instant confirmations, and get automated reminders.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-hover group animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <FaMapMarkerAlt className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                      Find Clinics
                    </h3>
                    <p className="mt-2 text-gray-600 leading-relaxed">
                      Locate nearby medical facilities with interactive maps, real-time directions, and facility information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
        <div className="relative max-w-4xl mx-auto text-center py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            <h2 className="text-responsive-3xl font-extrabold text-white">
              <span className="block">Ready to get started?</span>
              <span className="block bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
                Sign up today.
              </span>
            </h2>
            <p className="mt-6 text-responsive-lg leading-relaxed text-blue-100 max-w-2xl mx-auto">
              Join thousands of users who trust us for their healthcare needs. Start your journey to better health today.
            </p>
            <div className="mt-8">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-responsive-base font-medium rounded-xl text-blue-700 bg-white hover:bg-blue-50 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign up for free
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
