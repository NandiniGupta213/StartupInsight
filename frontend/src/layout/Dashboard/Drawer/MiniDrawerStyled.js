// material-ui
import { styled } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';

// project imports
import { DRAWER_WIDTH } from 'config';

const openedMixin = (theme) => ({
  width: DRAWER_WIDTH,
  borderRight: '1px solid',
  borderRightColor: '#333333',
  backgroundColor: '#000000',

  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),

  overflowX: 'hidden',
  boxShadow: 'none',
  
  // Style the menu items inside
  '& .MuiListItemButton-root': {
    backgroundColor: '#000000 !important',
    color: '#FFFFFF !important',
    
    '&:hover': {
      backgroundColor: '#333333 !important',
    },
    
    '&.Mui-selected': {
      backgroundColor: '#00E676 !important',
      
      // Target the text specifically
      '& .MuiTypography-root, & .MuiTypography-h6, & .MuiListItemText-primary': {
        color: '#FFFFFF !important',
      },
      
      '& .MuiListItemIcon-root': {
        color: '#FFFFFF !important',
      }
    }
  },
  
  '& .MuiListItemIcon-root': {
    color: '#00E676 !important',
  },
  
  // Default text color
  '& .MuiTypography-root, & .MuiTypography-h6, & .MuiListItemText-primary': {
    color: '#FFFFFF !important',
  }
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),

  overflowX: 'hidden',
  width: theme.spacing(7.5),
  borderRight: 'none',
  boxShadow: theme.vars.customShadows.z1,
  backgroundColor: '#000000',
  
  // Style the menu items inside (for collapsed state)
  '& .MuiListItemButton-root': {
    backgroundColor: '#000000 !important',
    color: '#FFFFFF !important',
    
    '&:hover': {
      backgroundColor: '#333333 !important',
    },
    
    '&.Mui-selected': {
      backgroundColor: '#00E676 !important',
      
      // Target the text specifically
      '& .MuiTypography-root, & .MuiTypography-h6, & .MuiListItemText-primary': {
        color: '#FFFFFF !important',
      },
      
      '& .MuiListItemIcon-root': {
        color: '#FFFFFF !important',
      }
    }
  },
  
  '& .MuiListItemIcon-root': {
    color: '#00E676 !important',
  },
  
  // Default text color
  '& .MuiTypography-root, & .MuiTypography-h6, & .MuiListItemText-primary': {
    color: '#FFFFFF !important',
  }
});

// ==============================|| DRAWER - MINI STYLED ||============================== //

const MiniDrawerStyled = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  variants: [
    {
      props: ({ open }) => open,
      style: { 
        ...openedMixin(theme), 
        '& .MuiDrawer-paper': openedMixin(theme) 
      }
    },
    {
      props: ({ open }) => !open,
      style: { 
        ...closedMixin(theme), 
        '& .MuiDrawer-paper': closedMixin(theme) 
      }
    }
  ]
}));

export default MiniDrawerStyled;