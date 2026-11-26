import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import profileFallback from '../../src/profilelogo.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ProfileView = () => {
  const { auth, logout } = useAuth();
  const user = auth.user;
  const navigate = useNavigate();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    try {
      setLoading(true);
      await axios.patch(`${BASE_URL}/api/admin/passwordUpdate`, {
        currentPassword: formData.currentPassword,
        password: formData.password
      }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });

      setSuccess('Password changed successfully');
      setFormData({ currentPassword: '', password: '', confirmPassword: '' });
      setShowPasswordForm(false);
      logout();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const profileImage = user.profileImage ? `${BASE_URL}/${user.profileImage}` : profileFallback;

  return (
    <Box
      sx={{
        maxWidth: 600,
        width: '100%',
        mx: 'auto',
        mt: { xs: 1, sm: 2 },
        p: { xs: 1, sm: 2 },
        bgcolor: 'transparent'
      }}
    >
      <Card
        sx={{
          borderRadius: '18px',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 12px 32px -12px rgba(15,23,42,0.18)',
          border: '1px solid rgba(226,232,240,0.8)',
          overflow: 'visible'
        }}
      >
        {/* HEADER GRADIENT UPDATED */}
        <Box
          sx={{
            background: '#111827',
            borderBottom: '1px solid rgba(16,24,40,0.08)',
            height: 100,
            borderRadius: '17px 17px 0 0',
            position: 'relative'
          }}
        >
          <Avatar
            src={profileImage}
            alt={user.userName}
            sx={{
              width: 120,
              height: 120,
              border: '4px solid white',
              boxShadow: '0 10px 24px -8px rgba(11,15,25,0.45)',
              position: 'absolute',
              bottom: -60,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'background.paper'
            }}
          />
        </Box>

        <CardContent sx={{ pt: 10, pb: 4 }}>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em', wordBreak: 'break-word' }}
          >
            {user.userName}
          </Typography>

          <Typography align="center" sx={{ mb: 2, color: '#64748b', fontSize: '0.95rem', wordBreak: 'break-all' }}>
            {user.email}
          </Typography>

          {user.role && (
            <Box sx={{ mb: 2.5, mx: 'auto', maxWidth: 360, textAlign: 'center', borderRadius: '12px', border: '1px solid rgba(226,232,240,0.9)', bgcolor: 'rgba(248,250,252,0.8)', px: 2, py: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                Role: {user.role.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                Permissions: {user.role.permission?.length || 0}
              </Typography>
            </Box>
          )}

          <Typography variant="body2" align="center" sx={{ color: '#94a3b8' }}>
            Joined on: {new Date(user.createdAt).toLocaleDateString()}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            {/* BUTTON COLOR UPDATED */}
            <Button
              variant="outlined"
              onClick={() => setShowPasswordForm(true)}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderColor: '#cbd5e1',
                color: '#0f172a',
                '&:hover': {
                  borderColor: '#d0d5dd',
                  backgroundColor: 'rgba(16,24,40,0.08)'
                }
              }}
            >
              Change Password
            </Button>
          </Box>
        </CardContent>
      </Card>

      {showPasswordForm && (
        <Card sx={{ mt: 3, borderRadius: '18px', border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 12px 32px -12px rgba(15,23,42,0.18)' }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
              Change Password
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <form onSubmit={handlePasswordChange}>
              <TextField fullWidth label="Current Password" name="currentPassword" type="password" value={formData.currentPassword} onChange={handleChange} margin="normal" required />
              <TextField fullWidth label="New Password" name="password" type="password" value={formData.password} onChange={handleChange} margin="normal" required />
              <TextField fullWidth label="Confirm New Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} margin="normal" required />

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mt: 3 }}>
                {/* MAIN BUTTON GRADIENT UPDATED */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.25,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    background: '#111827',
                    color: '#fff',
                    boxShadow: '0 6px 18px -6px rgba(11,15,25,0.55)',
                    '&:hover': {
                      background: '#111827',
                      boxShadow: '0 0 0 1px rgba(16,24,40,0.08), 0 10px 26px -8px rgba(11,15,25,0.6)'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Change Password'}
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => setShowPasswordForm(false)}
                  fullWidth
                  sx={{
                    py: 1.25,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    borderColor: '#cbd5e1',
                    color: '#334155',
                    '&:hover': {
                      borderColor: '#94a3b8',
                      backgroundColor: 'rgba(15,23,42,0.04)'
                    }
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ProfileView;