import PropTypes from 'prop-types';
import { Link, useLocation, matchPath } from 'react-router-dom';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import IconButton from 'components/@extended/IconButton';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// ==============================|| NAVIGATION - LIST ITEM ||============================== //

export default function NavItem({ item, level, isParents = false, setSelectedID }) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  let itemTarget = '_self';
  if (item.target) {
    itemTarget = '_blank';
  }

  const itemHandler = () => {
    if (downLG) handlerDrawerOpen(false);

    if (isParents && setSelectedID) {
      setSelectedID(item.id);
    }
  };

  const Icon = item.icon;
  const itemIcon = item.icon ? (
    <Icon
      style={{
        fontSize: drawerOpen ? '1rem' : '1.25rem',
        ...(isParents && { fontSize: 20, stroke: '1.5' })
      }}
    />
  ) : (
    false
  );

  const { pathname } = useLocation();
  const isSelected = !!matchPath({ path: item?.link ? item.link : item.url, end: false }, pathname);

  // Dark theme colors
  const textColor = '#FFFFFF'; // White text
  const iconSelectedColor = '#00E676'; // Green accent for selected
  const hoverBgColor = 'rgba(0, 230, 118, 0.1)'; // Green with low opacity
  const selectedBgColor = 'rgba(0, 230, 118, 0.15)'; // Slightly darker green for selected
  const borderColor = '#00E676'; // Green border for selected

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <ListItemButton
          component={Link}
          to={item.url}
          target={itemTarget}
          disabled={item.disabled}
          selected={isSelected}
          sx={(theme) => ({
            zIndex: 1201,
            pl: drawerOpen ? `${level * 28}px` : 1.5,
            py: !drawerOpen && level === 1 ? 1.25 : 1,
            ...(drawerOpen && {
              '&:hover': { 
                bgcolor: hoverBgColor,
                '& .MuiTypography-root': {
                  color: '#00E676'
                }
              },
              '&.Mui-selected': {
                bgcolor: selectedBgColor,
                borderRight: '2px solid',
                borderColor: borderColor,
                '& .MuiTypography-root': {
                  color: iconSelectedColor
                },
                '& .MuiListItemIcon-root': {
                  color: iconSelectedColor
                },
                '&:hover': { 
                  bgcolor: selectedBgColor,
                  '& .MuiTypography-root': {
                    color: iconSelectedColor
                  }
                }
              }
            }),
            ...(!drawerOpen && {
              '&:hover': { bgcolor: 'transparent' },
              '&.Mui-selected': { 
                '&:hover': { bgcolor: 'transparent' }, 
                bgcolor: 'transparent' 
              }
            })
          })}
          onClick={() => itemHandler()}
        >
          {itemIcon && (
            <ListItemIcon
              sx={(theme) => ({
                minWidth: 28,
                color: isSelected ? iconSelectedColor : textColor,
                ...(!drawerOpen && {
                  borderRadius: 1.5,
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': { 
                    bgcolor: hoverBgColor,
                    color: '#00E676'
                  }
                }),
                ...(!drawerOpen &&
                  isSelected && {
                    bgcolor: selectedBgColor,
                    color: iconSelectedColor,
                    '&:hover': { 
                      bgcolor: selectedBgColor,
                      color: iconSelectedColor
                    }
                  })
              })}
            >
              {itemIcon}
            </ListItemIcon>
          )}
          {(drawerOpen || (!drawerOpen && level !== 1)) && (
            <ListItemText
              primary={
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: isSelected ? iconSelectedColor : textColor,
                    fontWeight: isSelected ? 600 : 400
                  }}
                >
                  {item.title}
                </Typography>
              }
            />
          )}
          {(drawerOpen || (!drawerOpen && level !== 1)) && item.chip && (
            <Chip
              color={item.chip.color}
              variant={item.chip.variant}
              size={item.chip.size}
              label={item.chip.label}
              avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
              sx={{
                ...(item.chip.color === 'primary' && {
                  bgcolor: '#00E676',
                  color: '#000000',
                  '& .MuiChip-label': {
                    color: '#000000'
                  }
                })
              }}
            />
          )}
        </ListItemButton>
        {(drawerOpen || (!drawerOpen && level !== 1)) &&
          item?.actions &&
          item?.actions.map((action, index) => {
            const ActionIcon = action.icon;
            const callAction = action?.function;
            return (
              <IconButton
                key={index}
                {...(action.type === 'function' && {
                  onClick: (event) => {
                    event.stopPropagation();
                    callAction();
                  }
                })}
                {...(action.type === 'link' && {
                  component: Link,
                  to: action.url,
                  target: action.target ? '_blank' : '_self'
                })}
                color="secondary"
                variant="outlined"
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 20,
                  zIndex: 1202,
                  width: 20,
                  height: 20,
                  mr: -1,
                  ml: 1,
                  color: isSelected ? '#00E676' : 'rgba(255, 255, 255, 0.7)',
                  borderColor: isSelected ? 'rgba(0, 230, 118, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                  '&:hover': { 
                    borderColor: '#00E676',
                    color: '#00E676',
                    bgcolor: 'rgba(0, 230, 118, 0.1)'
                  }
                }}
              >
                <ActionIcon style={{ fontSize: '0.625rem' }} />
              </IconButton>
            );
          })}
      </Box>
    </>
  );
}

NavItem.propTypes = {
  item: PropTypes.any,
  level: PropTypes.number,
  isParents: PropTypes.bool,
  setSelectedID: PropTypes.oneOfType([PropTypes.any, PropTypes.func])
};