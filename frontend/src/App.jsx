import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SearchProvider } from './contexts/SearchContext';
import router from 'routes';
import ThemeCustomization from 'themes';
import ScrollTop from 'components/ScrollTop';

export default function App() {
  return (
    <ThemeCustomization>
      <AuthProvider>
        <SearchProvider>
          <ScrollTop>
            <RouterProvider router={router} />
          </ScrollTop>
        </SearchProvider>
      </AuthProvider>
    </ThemeCustomization>
  );
}