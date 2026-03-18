import PropTypes from 'prop-types';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

// project imports
import Logo from 'components/Logo';

const AuthWrapper = ({ children }) => {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0A0A0A' }}>
      <Container maxWidth="sm">
        <Grid container direction="column" justifyContent="center" sx={{ minHeight: '100vh' }}>
          <Grid item xs={12}>
            <Grid container justifyContent="center" spacing={2}>
              <Grid item xs={12}>
                <Card sx={{ 
                  bgcolor: '#121212', 
                  border: '1px solid #00E676',
                  boxShadow: '0 0 30px rgba(0,230,118,0.1)'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                      <Logo />
                    </Box>
                    {children}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

AuthWrapper.propTypes = {
  children: PropTypes.node
};

export default AuthWrapper;