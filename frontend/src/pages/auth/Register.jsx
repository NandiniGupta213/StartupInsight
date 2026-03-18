import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';

export default function Register() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
    // role removed - will default to 3 on backend
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    if (!formData.username || !formData.email) {
      setError('All fields are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    
    const result = await signup({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword
      // role not sent - backend will set default
    });

    setLoading(false);

    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error || 'Signup failed');
    }
  };

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3" sx={{ color: '#FFFFFF' }}>Sign up</Typography>
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
              Already have an account?
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

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  required
                  id="username"
                  name="username"
                  label="Username"
                  value={formData.username}
                  onChange={handleChange}
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
                <TextField
                  fullWidth
                  required
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
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
                <TextField
                  fullWidth
                  required
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!passwordError}
                  helperText={passwordError}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button 
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{ 
                            minWidth: 'auto', 
                            color: '#00E676',
                            fontSize: '0.75rem',
                            textTransform: 'none'
                          }}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </Button>
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
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          sx={{ 
                            minWidth: 'auto', 
                            color: '#00E676',
                            fontSize: '0.75rem',
                            textTransform: 'none'
                          }}
                        >
                          {showConfirmPassword ? 'Hide' : 'Show'}
                        </Button>
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
                  {loading ? <CircularProgress size={24} sx={{ color: '#000000' }} /> : 'Sign Up'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}