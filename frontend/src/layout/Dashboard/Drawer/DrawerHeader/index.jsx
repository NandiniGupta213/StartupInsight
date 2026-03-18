import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

// project imports
import DrawerHeaderStyled from './DrawerHeaderStyled';
import Logo from 'components/logo';

// ==============================|| DRAWER HEADER ||============================== //

export default function DrawerHeader({ open }) {
  return (
    <DrawerHeaderStyled
      open={open}
      sx={{
        minHeight: '60px',
        width: 'initial',
        paddingTop: '8px',
        paddingBottom: '8px',
        paddingLeft: open ? '24px' : 0,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}
    >
     
      
      {open && (
        <Typography
          variant="h3"
          sx={{
            color: '#00E676',
            bgcolor:'#00E676',
            fontWeight: 600,
            letterSpacing: '0.7px'
          }}
        >
          StartupInsight
        </Typography>
      )}
    </DrawerHeaderStyled>
  );
}

DrawerHeader.propTypes = { open: PropTypes.bool };