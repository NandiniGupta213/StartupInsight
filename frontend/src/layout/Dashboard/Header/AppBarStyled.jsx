// material-ui
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';

// project imports
import { DRAWER_WIDTH } from 'config';

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: '#000000 !important', // 👈 Black background
  borderBottom: '1px solid #333333', // 👈 Dark border
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  variants: [
    {
      props: ({ open }) => !open,
      style: {
        width: `calc(100% - ${theme.spacing(7.5)})`,
        '& .MuiToolbar-root': {
          backgroundColor: '#000000',
          color: '#FFFFFF'
        }
      }
    },
    {
      props: ({ open }) => open,
      style: {
        marginLeft: DRAWER_WIDTH,
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen
        }),
        '& .MuiToolbar-root': {
          backgroundColor: '#000000',
          color: '#FFFFFF'
        }
      }
    }
  ]
}));

export default AppBarStyled;