import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      if (result.resetLink) {
        setResetLink(result.resetLink);
      }
    } else {
      setError(result.error || 'Failed to send reset email');
    }
  };

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3" sx={{ color: '#FFFFFF' }}>Forgot Password</Typography>
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
              {resetLink ? (
                <>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Password reset link (development mode):
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      wordBreak: 'break-all',
                      bgcolor: 'rgba(0,0,0,0.3)',
                      p: 1,
                      borderRadius: 1
                    }}
                  >
                    {resetLink}
                  </Typography>
                </>
              ) : (
                'If an account exists with this email, a reset link will be sent.'
              )}
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                    Enter your email address and we'll send you a link to reset your password.
                  </Typography>
                  
                  <TextField
                    fullWidth
                    required
                    id="email"
                    name="email"
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    {loading ? <CircularProgress size={24} sx={{ color: '#000000' }} /> : 'Send Reset Link'}
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