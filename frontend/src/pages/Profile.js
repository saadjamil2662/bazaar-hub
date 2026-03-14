import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, getProfile } from '../services/api';
import { FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Profile = () => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await getProfile();
      const { user: userData } = response.data;
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });
      setMessage('Profile updated successfully');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!editing ? (
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <FiUser className="text-2xl text-blue-600 mr-4" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="text-lg font-semibold">{formData.name}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <FiMail className="text-2xl text-blue-600 mr-4" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-semibold">{formData.email}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <FiPhone className="text-2xl text-blue-600 mr-4" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-lg font-semibold">
                    {formData.phone || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <FiMapPin className="text-2xl text-blue-600 mr-4" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="text-lg font-semibold">
                    {formData.address || 'Not provided'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email (Cannot change)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 opacity-50"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    fetchProfileData();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
