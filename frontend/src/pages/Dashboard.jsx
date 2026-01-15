import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUserMd, FaMoneyBillWave } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import StatCard from '../components/dashboard/StatCard';
import ActivityItem from '../components/dashboard/ActivityItem';
import AppointmentCard from '../components/appointments/AppointmentCard';
import Button from '../components/common/Button';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalSpent: 0
  });
  const [nextAppointment, setNextAppointment] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/appointments');
        const appointments = response.data.data || [];
        
        // Calculate statistics
        const totalAppointments = appointments.length;
        const upcomingAppointments = appointments && Array.isArray(appointments) && appointments.filter(apt => 
          new Date(apt.date) > new Date() && apt.status === 'scheduled'
        ).length;
        const totalSpent = appointments && Array.isArray(appointments) && appointments.reduce((sum, apt) => 
          apt.status === 'completed' ? sum + (apt.consultationFee || 0) : sum, 0
        );

        setStats({
          totalAppointments,
          upcomingAppointments,
          totalSpent: totalSpent.toFixed(2)
        });

        // Find next appointment
        const nextAppt = appointments
          .filter(apt => new Date(apt.date) > new Date() && apt.status === 'scheduled')
          .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
        setNextAppointment(nextAppt);

        // Process recent activity
        const activities = appointments && Array.isArray(appointments) && appointments.map(apt => ({
          id: apt._id,
          type: apt.status === 'cancelled' ? 'cancellation' : 
                new Date(apt.date) > new Date() ? 'booking' : 'completion',
          description: `${
            apt.status === 'cancelled' ? 'Cancelled' :
            new Date(apt.date) > new Date() ? 'Booked' : 'Completed'
          } appointment with ${apt.doctorName}`,
          date: apt.createdAt || apt.date,
          doctorName: apt.doctorName,
          appointmentDate: apt.date,
          appointmentTime: apt.time,
          status: apt.status
        }));
        
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentActivity(activities.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(
          err.response?.data?.message || 
          'Failed to load dashboard data. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="spinner h-12 w-12 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-responsive-base">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-red-600 mb-4 text-responsive-base">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await api.patch(`/appointments/${appointmentId}/cancel`);
      // Refresh dashboard data after cancellation
      if (currentUser) {
        await api.get('/appointments');
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError(
        err.response?.data?.message || 
        'Failed to cancel appointment. Please try again.'
      );
    }
  };

  const quickActions = [
    { 
      label: 'Book Appointment', 
      link: '/find-clinics', 
      primary: true,
      icon: '📅'
    },
    { 
      label: 'View Appointments', 
      link: '/appointments', 
      primary: false,
      icon: '👨‍⚕️'
    },
    { 
      label: 'Find a Doctor', 
      link: '/find-clinics', 
      primary: false,
      icon: '🔍'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div className="animate-fade-in">
            <h1 className="text-responsive-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-responsive-base text-gray-600">Welcome back, {currentUser?.firstName || 'User'}!</p>
          </div>
          <div className="animate-slide-up">
            <Link to="/find-clinics">
              <Button variant="primary" className="w-full sm:w-auto">
                Book New Appointment
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="animate-slide-up">
            <StatCard 
              title="Total Appointments" 
              value={stats.totalAppointments}
              icon={<FaCalendarAlt className="h-6 w-6" />}
              className="card-gradient"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <StatCard 
              title="Upcoming Appointments" 
              value={stats.upcomingAppointments}
              icon={<FaUserMd className="h-6 w-6" />}
              className="card-gradient"
            />
          </div>
          <div className="animate-slide-up sm:col-span-2 lg:col-span-1" style={{ animationDelay: '0.2s' }}>
            <StatCard 
              title="Total Spent" 
              value={`$${stats.totalSpent}`}
              icon={<FaMoneyBillWave className="h-6 w-6" />}
              className="card-gradient"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card animate-slide-up">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Next Appointment</h2>
              {nextAppointment ? (
                <AppointmentCard 
                  appointment={nextAppointment} 
                  onCancel={handleCancelAppointment}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FaCalendarAlt className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-6 text-responsive-base">No upcoming appointments</p>
                  <Link to="/find-clinics">
                    <Button variant="primary">Book an Appointment</Button>
                  </Link>
                </div>
              )}
            </div>

            <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={index} to={action.link} className="group">
                    <Button 
                      variant={action.primary ? "primary" : "secondary"}
                      className="w-full flex items-center justify-center group-hover:scale-105 transition-transform duration-200"
                    >
                      <span className="mr-2 text-lg">{action.icon}</span>
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Recent Activity</h2>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FaUserMd className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-responsive-sm">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 