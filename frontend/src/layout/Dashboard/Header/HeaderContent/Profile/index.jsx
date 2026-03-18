import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';
import CardContent from '@mui/material/CardContent';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';

// project imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';

// assets
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import avatar1 from 'assets/images/users/avatar-1.png';

// Import your auth context
import { useAuth } from '../../../../../contexts/AuthContext'; // Adjust path as needed

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

export default function Profile() {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Get user data from auth context
  const { user, logout } = useAuth(); // Assuming you have user and logout in your context

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout(); // Call your logout function
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  // Get user data (adjust based on your user object structure)
  const userName = user?.username || user?.name || 'User';
  const userEmail = user?.email || 'user@example.com';
  const userAvatar = user?.avatar || avatar1;

  return (
   <></>
  );
}

Profile.propTypes = {
  value: PropTypes.number,
  index: PropTypes.number,
  other: PropTypes.any
};