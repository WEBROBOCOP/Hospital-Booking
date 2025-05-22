import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/common/Button'
import ProfilePicture from '../components/profile/ProfilePicture'
import { updateProfile as updateFirebaseProfile } from 'firebase/auth'
import { auth } from '../config/firebase'
import UserAppointments from '../components/profile/UserAppointments'

function Profile() {
  const { user, updateProfile, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    bloodGroup: user?.bloodGroup || ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // In a real app, you would make an API call here
      updateProfile(formData)
      setMessage({ type: 'success', text: 'Profile updated successfully' })
      setIsEditing(false)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePhotoUpdate = async (photoURL) => {
    try {
      await updateFirebaseProfile(auth.currentUser, { photoURL })
      updateProfile({ photoURL })
      setMessage({ type: 'success', text: 'Profile picture updated successfully' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile picture' })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <div className="space-x-4">
            {!isEditing && (
              <Button 
                variant="secondary" 
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
            <Button 
              variant="secondary" 
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-md mb-6 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="mb-8">
          <ProfilePicture 
            photoURL={user?.photoURL}
            onPhotoUpdate={handlePhotoUpdate}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{user?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{user?.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{user?.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{user?.dateOfBirth || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              {isEditing ? (
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="text-gray-900">{user?.gender || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group
              </label>
              {isEditing ? (
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              ) : (
                <p className="text-gray-900">{user?.bloodGroup || 'Not set'}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            {isEditing ? (
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{user?.address || 'Not set'}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    address: user?.address || '',
                    dateOfBirth: user?.dateOfBirth || '',
                    gender: user?.gender || '',
                    bloodGroup: user?.bloodGroup || ''
                  })
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          )}
        </form>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <UserAppointments />
        </div>
      </div>
    </div>
  )
}

export default Profile 