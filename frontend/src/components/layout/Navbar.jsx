// vite-project/src/components/layout/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaHeartbeat } from 'react-icons/fa';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setProfileDropdownOpen(false);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get user initials for fallback avatar
  const getUserInitials = (user) => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center space-x-2">
              <FaHeartbeat className="text-blue-500 text-2xl animate-pulse" />
              <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200">
                DoctorApp
              </Link>
            </div>
            <div className="hidden lg:ml-6 lg:flex lg:items-center lg:space-x-8">
              <Link
                to="/"
                className="nav-link inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200"
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>
              {currentUser && (
                <>
                  <Link
                    to="/dashboard"
                    className="nav-link inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/book"
                    className="nav-link inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200"
                    onClick={() => setMobileOpen(false)}
                  >
                    Book Appointment
                  </Link>
                  <Link
                    to="/appointments"
                    className="nav-link inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200"
                    onClick={() => setMobileOpen(false)}
                  >
                    My Appointments
                  </Link>
                  <Link
                    to="/find-clinics"
                    className="nav-link inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200"
                    onClick={() => setMobileOpen(false)}
                  >
                    Find Medical Facilities
                  </Link>
                  {currentUser?.role === "doctor" && (
                    <Link
                      to="/doctor-dashboard"
                      className="nav-link inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200"
                      onClick={() => setMobileOpen(false)}
                    >
                      Doctor Dashboard
                    </Link>
                  )}
                  {currentUser?.role === "admin" && (
                    <Link
                      to="/admin-dashboard"
                      className="nav-link inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200"
                      onClick={() => setMobileOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="hidden lg:ml-6 lg:flex lg:items-center">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:bg-gray-50 px-3 py-2 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                    {currentUser.profilePicture ? (
                      <img
                        src={currentUser.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full flex items-center justify-center text-white font-medium text-sm ${
                        currentUser.profilePicture ? 'hidden' : 'flex'
                      }`}
                    >
                      {getUserInitials(currentUser)}
                    </div>
                  </div>
                  <span className="text-gray-700 font-medium">
                    {currentUser.firstName || 'User'}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      profileDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-200 animate-fade-in">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>My Profile</span>
                      </div>
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/login"
                  className="btn-outline text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen(prev => !prev)}
            >
              {mobileOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="lg:hidden" id="mobile-menu">
            <div className="pt-2 pb-3 space-y-1 bg-gray-50 rounded-lg mx-2 mb-2">
              <Link
                to="/"
                className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-all duration-200 rounded-r-lg"
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>
              {currentUser && (
                <>
                  <Link
                    to="/dashboard"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/book"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    onClick={() => setMobileOpen(false)}
                  >
                    Book Appointment
                  </Link>
                  <Link
                    to="/appointments"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    onClick={() => setMobileOpen(false)}
                  >
                    My Appointments
                  </Link>
                  <Link
                    to="/find-clinics"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    onClick={() => setMobileOpen(false)}
                  >
                    Find Medical Facilities
                  </Link>
                  {currentUser?.role === "doctor" && (
                    <Link
                      to="/doctor-dashboard"
                      className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                      onClick={() => setMobileOpen(false)}
                    >
                      Doctor Dashboard
                    </Link>
                  )}
                  {currentUser?.role === "admin" && (
                    <Link
                      to="/admin-dashboard"
                      className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                      onClick={() => setMobileOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    onClick={() => setMobileOpen(false)}
                  >
                    My Profile
                  </Link>
                </>
              )}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {currentUser ? (
                <div className="space-y-1">
                  <div className="flex items-center px-3 py-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center mr-3">
                      {currentUser.profilePicture ? (
                        <img
                          src={currentUser.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full flex items-center justify-center text-white font-medium text-sm ${
                          currentUser.profilePicture ? 'hidden' : 'flex'
                        }`}
                      >
                        {getUserInitials(currentUser)}
                      </div>
                    </div>
                    <div>
                      <div className="text-base font-medium text-gray-800">
                        {currentUser.firstName} {currentUser.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{currentUser.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    to="/login"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-blue-600 hover:bg-gray-50 hover:border-gray-300"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-50 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
