import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { resetPassword } = useAuth();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'newPassword' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const validateForm = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (formData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    
    const result = await resetPassword(
      token,
      formData.newPassword,
      formData.confirmPassword
    );

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setError(result.error || 'Failed to reset password');
    }
  };

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3" sx={{ color: '#FFFFFF' }}>Reset Password</Typography>
            <Typography 
              component={Link} 
              to="/login" 
              variant="body1" 
              sx={{ 
                textDecoration: 'none', 
                color: '#00E676',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Back to Login
            </Typography>
          </Stack>
        </Grid>

        <Grid size={12}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                bgcolor: '#FF525220', 
                color: '#FF5252',
                border: '1px solid #FF525240'
              }}
            >
              {error}
            </Alert>
          )}

          {success ? (
            <Alert 
              severity="success" 
              sx={{ 
                bgcolor: '#00E67620', 
                color: '#00E676',
                border: '1px solid #00E67640'
              }}
            >
              Password reset successfully! Redirecting to login...
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    required
                    id="newPassword"
                    name="newPassword"
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={handleChange}
                    error={!!passwordError}
                    helperText={passwordError}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#00E676' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#FFFFFF',
                        bgcolor: 'rgba(255,255,255,0.02)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover fieldset': { borderColor: '#00E676' },
                        '&.Mui-focused fieldset': { borderColor: '#00E676' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                      '& .MuiFormHelperText-root': { color: '#FF5252' }
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    required
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{ color: '#00E676' }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#FFFFFF',
                        bgcolor: 'rgba(255,255,255,0.02)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover fieldset': { borderColor: '#00E676' },
                        '&.Mui-focused fieldset': { borderColor: '#00E676' }
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      bgcolor: '#00E676',
                      color: '#000000',
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      mt: 2,
                      '&:hover': { bgcolor: '#00C853' },
                      '&.Mui-disabled': { bgcolor: 'rgba(0,230,118,0.3)' }
                    }}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: '#000000' }} /> : 'Reset Password'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}