// project import
import dashboard from './dashboard';
import pages from './page';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [dashboard, ...pages] // Spread the pages array to include both groups
};

export default menuItems;