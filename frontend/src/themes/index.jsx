import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import { createTheme, StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// project imports
import useConfig from 'hooks/useConfig';
import CustomShadows from './custom-shadows';
import componentsOverride from './overrides';
import { buildPalette } from './palette';
import Typography from './typography';

// ==============================|| DEFAULT THEME - MAIN ||============================== //

export default function ThemeCustomization({ children }) {
  const { state } = useConfig();

  const themeTypography = useMemo(() => Typography(state.fontFamily), [state.fontFamily]);

  const palette = useMemo(() => buildPalette(state.presetColor), [state.presetColor]);

  const themeOptions = useMemo(
    () => ({
      breakpoints: {
        values: {
          xs: 0,
          sm: 768,
          md: 1024,
          lg: 1266,
          xl: 1440
        }
      },
      direction: 'ltr',
      mixins: {
        toolbar: {
          minHeight: 60,
          paddingTop: 8,
          paddingBottom: 8
        }
      },
      typography: themeTypography,
      colorSchemes: {
        light: {
          palette: palette.light,
          customShadows: CustomShadows(palette.light, 'light')
        }
      },
      cssVariables: {
        cssVarPrefix: '',
        colorSchemeSelector: 'data-color-scheme'
      },
      components: {
  // Drawer (sidebar background)
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: '#000000', // Black background
        borderRight: '1px solid #333333'
      }
    }
  },
  
  // List items (menu items)
  MuiListItemButton: {
    styleOverrides: {
      root: {
        color: '#FFFFFF',
        '&:hover': {
          backgroundColor: '#333333',
        },
        '&.Mui-selected': {
          backgroundColor: '#00E676',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#00C853',
          },
          '& .MuiListItemIcon-root': {
            color: '#000000',
          }
        }
      }
    }
  },
  
  // Menu item icons
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        color: '#00E676',
        minWidth: 40
      }
    }
  },
  
  // Menu item text
  MuiListItemText: {
    styleOverrides: {
      primary: {
        color: '#FFFFFF',
        fontWeight: 500
      }
    }
  },
  
  // Menu items (alternative selector)
  MuiMenuItem: {
    styleOverrides: {
      root: {
        backgroundColor: '#000000',
        color: '#FFFFFF',
        '&:hover': {
          backgroundColor: '#333333',
        },
        '&.Mui-selected': {
          backgroundColor: '#00E676',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#00C853',
          }
        }
      }
    }
  },
  
  // Toolbar (header inside drawer)
  MuiToolbar: {
    styleOverrides: {
      root: {
        backgroundColor: '#000000',
        color: '#FFFFFF'
      }
    }
  }
}
    }),
    
    [themeTypography, palette]
  );

  const themes = createTheme(themeOptions);
  themes.components = componentsOverride(themes);
  

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider disableTransitionOnChange theme={themes} modeStorageKey="theme-mode" defaultMode='light'>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

ThemeCustomization.propTypes = { children: PropTypes.node };