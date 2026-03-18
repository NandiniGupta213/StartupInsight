import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

// assets
import EditOutlined from '@ant-design/icons/EditOutlined';
import SaveOutlined from '@ant-design/icons/SaveOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';

export default function Profile() {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth(); // Get user from auth context
  
  // Profile data - pre-filled with user data
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  
  // Password data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Password visibility states (using text toggle instead of icons)
  const [showPasswordFields, setShowPasswordFields] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
  };

  const toggleShowPassword = (field) => {
    setShowPasswordFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Update profile
  const handleUpdateProfile = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/users/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: profileData.username,
          email: profileData.email
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile updated successfully');
        updateUser(data.data); // Update user in context
        setEditMode(false);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setPasswordError('');
    setPasswordSuccess('');
    setPasswordLoading(true);

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSuccess('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setPasswordError('Network error. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#0A0A0A', minHeight: '100vh', color: '#FFFFFF' }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid size={12}>
          <Typography variant="h3" sx={{ color: '#FFFFFF', mb: 2 }}>
            Profile Settings
          </Typography>
          <Divider sx={{ borderColor: '#333333' }} />
        </Grid>

        {/* Profile Information Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: '#1E1E1E', color: '#FFFFFF', height: '100%' }}>
            <CardHeader
              title={
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5" sx={{ color: '#FFFFFF' }}>
                    Profile Information
                  </Typography>
                  {!editMode ? (
                    <IconButton onClick={() => setEditMode(true)} sx={{ color: '#00E676' }}>
                      <EditOutlined />
                    </IconButton>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => setEditMode(false)} sx={{ color: '#FF5252' }}>
                        <CloseOutlined />
                      </IconButton>
                      <IconButton onClick={handleUpdateProfile} disabled={loading} sx={{ color: '#00E676' }}>
                        <SaveOutlined />
                      </IconButton>
                    </Stack>
                  )}
                </Stack>
              }
            />
            <CardContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2, bgcolor: '#FF525220', color: '#FF5252' }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2, bgcolor: '#00E67620', color: '#00E676' }}>
                  {success}
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid size={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: '#00E676',
                      fontSize: '2.5rem'
                    }}
                  >
                    {profileData.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    disabled={!editMode || loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#FFFFFF',
                        '& fieldset': { borderColor: '#333333' },
                        '&:hover fieldset': { borderColor: '#00E676' },
                        '&.Mui-focused fieldset': { borderColor: '#00E676' },
                        '&.Mui-disabled': { '& fieldset': { borderColor: '#333333' } }
                      },
                      '& .MuiInputLabel-root': { color: '#B0B0B0' },
                      '& .MuiInputLabel-root.Mui-disabled': { color: '#666666' }
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    disabled={!editMode || loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#FFFFFF',
                        '& fieldset': { borderColor: '#333333' },
                        '&:hover fieldset': { borderColor: '#00E676' },
                        '&.Mui-focused fieldset': { borderColor: '#00E676' },
                        '&.Mui-disabled': { '& fieldset': { borderColor: '#333333' } }
                      },
                      '& .MuiInputLabel-root': { color: '#B0B0B0' },
                      '& .MuiInputLabel-root.Mui-disabled': { color: '#666666' }
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: '#1E1E1E', color: '#FFFFFF', height: '100%' }}>
            <CardHeader
              title={
                <Typography variant="h5" sx={{ color: '#FFFFFF' }}>
                  Change Password
                </Typography>
              }
            />
            <CardContent>
              {passwordError && (
                <Alert severity="error" sx={{ mb: 2, bgcolor: '#FF525220', color: '#FF5252' }}>
                  {passwordError}
                </Alert>
              )}
              {passwordSuccess && (
                <Alert severity="success" sx={{ mb: 2, bgcolor: '#00E67620', color: '#00E676' }}>
                  {passwordSuccess}
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type={showPasswordFields.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            onClick={() => toggleShowPassword('current')}
                            sx={{
                              minWidth: 'auto',
                              color: '#00E676',
                              textTransform: 'none',
                              fontSize: '0.75rem'
                            }}
                          >
                            {showPasswordFields.current ? 'Hide' : 'Show'}
                          </Button>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#FFFFFF',
                        '& fieldset': { borderColor: '#333333' },
                        '&:hover fieldset': { borderColor: '#00E676' },
                        '&.Mui-focused fieldset': { borderColor: '#00E676' }
                      },
                      '& .MuiInputLabel-root': { color: '#B0B0B0' }
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type={showPasswordFields.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            onClick={() => toggleShowPassword('new')}
                            sx={{
                              minWidth: 'auto',
                              color: '#00E676',
                              textTransform: 'none',
                              fontSize: '0.75rem'
                            }}
                          >
                            {showPasswordFields.new ? 'Hide' : 'Show'}
                          </Button>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#FFFFFF',
                        '& fieldset': { borderColor: '#333333' },
                        '&:hover fieldset': { borderColor: '#00E676' },
                        '&.Mui-focused fieldset': { borderColor: '#00E676' }
                      },
                      '& .MuiInputLabel-root': { color: '#B0B0B0' }
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type={showPasswordFields.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            onClick={() => toggleShowPassword('confirm')}
                            sx={{
                              minWidth: 'auto',
                              color: '#00E676',
                              textTransform: 'none',
                              fontSize: '0.75rem'
                            }}
                          >
                            {showPasswordFields.confirm ? 'Hide' : 'Show'}
                          </Button>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#FFFFFF',
                        '& fieldset': { borderColor: '#333333' },
                        '&:hover fieldset': { borderColor: '#00E676' },
                        '&.Mui-focused fieldset': { borderColor: '#00E676' }
                      },
                      '& .MuiInputLabel-root': { color: '#B0B0B0' }
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    sx={{
                      bgcolor: '#00E676',
                      color: '#000000',
                      '&:hover': { bgcolor: '#00C853' },
                      '&.Mui-disabled': { bgcolor: 'rgba(0,230,118,0.3)' }
                    }}
                  >
                    {passwordLoading ? <CircularProgress size={24} sx={{ color: '#000000' }} /> : 'Change Password'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}