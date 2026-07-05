import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import ToastContainer from './components/ToastContainer';
import InstallPrompt from './components/InstallPrompt';
import { startTokenAutoRefresh } from './utils/tokenAutoRefresh';

export default function App() {
  // Renovação proativa do token: mantém a sessão viva antes de expirar.
  useEffect(() => {
    startTokenAutoRefresh();
  }, []);

  return (
    <>
      <AppRoutes />
      <ToastContainer />
      <InstallPrompt />
    </>
  );
}
