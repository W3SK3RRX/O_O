import AppRoutes from './routes/AppRoutes';
import ToastContainer from './components/ToastContainer';
import InstallPrompt from './components/InstallPrompt';

export default function App() {
  return (
    <>
      <AppRoutes />
      <ToastContainer />
      <InstallPrompt />
    </>
  );
}
