import PropTypes from 'prop-types';
import { useMemo } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';

// project imports
import DrawerHeader from './DrawerHeader';
import DrawerContent from './DrawerContent';
import MiniDrawerStyled from './MiniDrawerStyled';

import { DRAWER_WIDTH } from 'config';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// ==============================|| MAIN LAYOUT - DRAWER ||============================== //

export default function MainDrawer({ window }) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  // responsive drawer container
  const container = window !== undefined ? () => window().document.body : undefined;

  // header content
  const drawerContent = useMemo(() => <DrawerContent />, []);
  const drawerHeader = useMemo(() => <DrawerHeader open={drawerOpen} />, [drawerOpen]);

  return (
    <Box component="nav" sx={{ flexShrink: { md: 0 }, zIndex: 1200 }} aria-label="mailbox folders">
      {!downLG ? (
        <MiniDrawerStyled variant="permanent" open={drawerOpen}>
          {drawerHeader}
          {drawerContent}
        </MiniDrawerStyled>
      ) : (
       <Drawer
  container={container}
  variant="temporary"
  open={drawerOpen}
  onClose={() => handlerDrawerOpen(!drawerOpen)}
  ModalProps={{ keepMounted: true }}
  sx={{ display: { xs: drawerOpen ? 'block' : 'none', lg: 'none' } }}
  slotProps={{
    paper: {
      sx: {
        boxSizing: 'border-box',
        width: DRAWER_WIDTH,
        borderRight: '1px solid',
        borderRightColor: '#333333',
        boxShadow: 'inherit',
        backgroundColor: '#000000',
        '& .MuiListItemButton-root': {
          backgroundColor: '#000000',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#333333',
          },
          '&.Mui-selected': {
            backgroundColor: '#00E676',
            color: '#FFFFFF !important', // Changed from '#000000' to '#FFFFFF'
            '&:hover': {
              backgroundColor: '#00C853',
            },
            '& .MuiListItemIcon-root': {
              color: '#FFFFFF !important', // Changed from '#000000' to '#FFFFFF'
            },
            '& .MuiListItemText-primary': {
              color: '#FFFFFF', // Ensure text is white when selected
            }
          }
        },
        '& .MuiListItemIcon-root': {
          color: '#00E676',
        },
        '& .MuiListItemText-primary': {
          color: '#FFFFFF',
        }
      }
    }
  }}
>
  {drawerHeader}
  {drawerContent}
</Drawer>
      )}
    </Box>
  );
}

MainDrawer.propTypes = { window: PropTypes.func };