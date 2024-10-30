import '../styles/globals.css'
import '/styles/custom.css'
import '/styles/navStyle.css'
import { useContext, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import AuthProvider from '/Contexts/Auth/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import AdminDrawer from '../components/Drawers/AdminDrawer';
import { AuthContext } from '../Contexts/Auth/AuthProvider';
import AdminCheck from '../components/Auth/AdminCheck';
import CustomerCheck from '../components/Auth/CustomerCheck';
import CountProvider from '../Contexts/CountProvider';

const queryClient = new QueryClient()
export default function App({ Component, pageProps }) {

  useEffect(() => {
    AOS.init();
  }, [])

  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith('/admin');


  return (
    <AuthProvider>
      <CountProvider>
        <QueryClientProvider client={queryClient}>
          {isAdminRoute ? (
            <AdminCheck>
              <Component {...pageProps} />
            </AdminCheck>
          ) : (
            <CustomerCheck>
              <Component {...pageProps} />
            </CustomerCheck>
          )}
          <Toaster />
        </QueryClientProvider>
      </CountProvider>
    </AuthProvider>
  )

}
