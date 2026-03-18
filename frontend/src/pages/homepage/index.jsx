import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../contexts/SearchContext';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Ant Design Icons
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import RocketOutlined from '@ant-design/icons/RocketOutlined';
import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import FundViewOutlined from '@ant-design/icons/FundViewOutlined';
import BulbOutlined from '@ant-design/icons/BulbOutlined';

// project imports
import MainCard from 'components/MainCard';

export default function HomePage() {
  const navigate = useNavigate();
  const { updateSearch } = useSearch();
  const [searchValue, setSearchValue] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      // Update global context with the search query
      updateSearch(searchValue.trim());
      
      // Show success message
      setSnackbar({
        open: true,
        message: `✨ Analyzing "${searchValue.trim()}"...`,
        severity: 'success'
      });
      
      // Navigate to dashboard (analysis page)
      navigate('/dashboard');
    }
  };

  const handleTrendingClick = (startup) => {
    // Update global context with the trending idea
    updateSearch(startup);
    
    setSnackbar({
      open: true,
      message: `✨ Analyzing "${startup}"...`,
      severity: 'success'
    });
    
    navigate('/dashboard');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const trendingStartups = [
    { name: 'AI-powered fitness coach app', category: 'HealthTech', growth: '+156%' },
    { name: 'Sustainable fashion marketplace', category: 'E-commerce', growth: '+89%' },
    { name: 'Telemedicine for pets', category: 'PetTech', growth: '+67%' },
    { name: 'EdTech platform for coding kids', category: 'EdTech', growth: '+124%' },
    { name: 'Meal prep subscription service', category: 'FoodTech', growth: '+92%' }
  ];

  const features = [
    {
      icon: <BulbOutlined style={{ fontSize: '2rem' }} />,
      title: 'Idea Analysis',
      description: 'Get comprehensive AI-powered analysis of your startup idea including market potential, risks, and feasibility score'
    },
    {
      icon: <FundViewOutlined style={{ fontSize: '2rem' }} />,
      title: 'Market Intelligence',
      description: 'Identify competitors, target customers, and potential business models for your startup'
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '2rem' }} />,
      title: 'Risk Assessment',
      description: 'AI-powered risk evaluation and feasibility scoring to validate your business concept'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#0A0A0A',
      color: '#FFFFFF'
    }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 8 } }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} textAlign="center">
            <Chip 
              label="🚀 Startup Idea Analyzer" 
              sx={{ 
                bgcolor: 'rgba(0, 230, 118, 0.1)', 
                color: '#00E676',
                border: '1px solid rgba(0, 230, 118, 0.3)',
                mb: 3,
                fontWeight: 500
              }} 
            />
            
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                background: 'linear-gradient(135deg, #FFFFFF 0%, #00E676 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                lineHeight: 1.2
              }}
            >
              Analyze Your Startup Idea
              <br />
              in Seconds
            </Typography>
            
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 5,
                fontWeight: 400,
                maxWidth: '700px',
                mx: 'auto'
              }}
            >
              Get instant AI-powered insights on market potential, competition, 
              risks, and feasibility for any startup concept
            </Typography>

            <Paper
              component="form"
              onSubmit={handleSearch}
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                maxWidth: 700,
                mx: 'auto',
                mb: 4,
                bgcolor: 'rgba(18, 18, 18, 0.95)',
                border: '1px solid rgba(0, 230, 118, 0.2)',
                borderRadius: 4,
                '&:hover': {
                  border: '1px solid rgba(0, 230, 118, 0.5)',
                  boxShadow: '0 0 20px rgba(0, 230, 118, 0.15)'
                }
              }}
            >
              <IconButton sx={{ p: '10px', color: '#00E676' }} aria-label="search">
                <SearchOutlined />
              </IconButton>
              <InputBase
                sx={{ ml: 1, flex: 1, color: '#FFFFFF' }}
                placeholder="Enter your startup idea... (e.g., 'juice startup in food industry')"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <Button 
                type="submit"
                sx={{ 
                  bgcolor: '#00E676',
                  color: '#000000',
                  px: 3,
                  py: 1,
                  mr: 0.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#00C853'
                  }
                }}
              >
                Analyze
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Trending Ideas Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'rgba(255,255,255,0.7)', 
            mb: 2,
            textAlign: 'center'
          }}
        >
          Popular Startup Ideas to Analyze
        </Typography>
        <Box sx={{ 
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {trendingStartups.map((startup, index) => (
            <Chip
              key={index}
              label={startup.name}
              onClick={() => handleTrendingClick(startup.name)}
              icon={<RiseOutlined />}
              sx={{
                bgcolor: 'rgba(0,230,118,0.1)',
                color: '#00E676',
                border: '1px solid rgba(0,230,118,0.3)',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'rgba(0,230,118,0.2)',
                }
              }}
            />
          ))}
        </Box>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          textAlign="center" 
          sx={{ 
            mb: 5,
            fontWeight: 600,
            color: '#FFFFFF'
          }}
        >
          How It Works
        </Typography>

        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            justifyContent: 'center',
          }}
        >
          {features.map((feature, index) => (
            <Box 
              key={index}
              sx={{ 
                flex: 1,
              }}
            >
              <MainCard
                sx={{
                  bgcolor: '#121212',
                  border: '1px solid #2A2A2A',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: '1px solid #00E676',
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <Box sx={{ color: '#00E676', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h5" sx={{ color: '#FFFFFF', mb: 1, fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {feature.description}
                </Typography>
              </MainCard>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={4}>
            <Box textAlign="center">
              <Typography variant="h2" sx={{ color: '#00E676', fontWeight: 700 }}>
                500+
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Ideas Analyzed
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box textAlign="center">
              <Typography variant="h2" sx={{ color: '#00E676', fontWeight: 700 }}>
                15+
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Industries Covered
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box textAlign="center">
              <Typography variant="h2" sx={{ color: '#00E676', fontWeight: 700 }}>
                98%
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Accuracy Rate
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            bgcolor: snackbar.severity === 'success' ? '#1B5E1F' : 
                    snackbar.severity === 'error' ? '#B71C1C' : '#FF6F00',
            color: '#FFFFFF'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}