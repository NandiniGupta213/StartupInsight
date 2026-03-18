import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

// ==============================|| MAIN LAYOUT ||============================== //

export default function MainLayout() {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#0A0A0A', // Dark background for homepage
      color: '#FFFFFF'
    }}>
      <Outlet />
    </Box>
  );
}