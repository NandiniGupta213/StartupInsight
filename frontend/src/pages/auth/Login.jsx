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
import AuthWrapper from '../auth/AuthWrapper';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login({
      email: formData.email,
      password: formData.password
    });

    setLoading(false);

    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error || 'Invalid email or password');
    }
  };

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3" sx={{ color: '#FFFFFF' }}>Login</Typography>
            <Typography 
              component={Link} 
              to="/register" 
              variant="body1" 
              sx={{ 
                textDecoration: 'none', 
                color: '#00E676',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Don't have an account?
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
                  id="email"
                  name="email"
                  label="Email Address"
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
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }
                  }}
                />
              </Grid>

              <Grid size={12}>
                <Stack direction="row" justifyContent="flex-end">
                  <Typography 
                    component={Link} 
                    to="/forgot-password" 
                    variant="body2" 
                    sx={{ 
                      textDecoration: 'none', 
                      color: '#00E676',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Forgot Password?
                  </Typography>
                </Stack>
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
                    '&:hover': { bgcolor: '#00C853' },
                    '&.Mui-disabled': { bgcolor: 'rgba(0,230,118,0.3)' }
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: '#000000' }} /> : 'Sign In'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}