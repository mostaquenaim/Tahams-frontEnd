import '../styles/globals.css';
import '/styles/custom.css';
import '/styles/navStyle.css';
import { useContext, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import AuthProvider from '/Contexts/Auth/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import AdminCheck from '../components/Auth/AdminCheck';
import CustomerCheck from '../components/Auth/CustomerCheck';
import CountProvider from '../Contexts/CountProvider';
import Head from 'next/head';
import CustomizationOrderCountProvider from '/Contexts/CustomizationOrderCountProvider';
import AdminDrawerProvider from '/Contexts/AdminDrawerProvider';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const queryClient = new QueryClient();
export default function App({ Component, pageProps }) {
  useEffect(() => {
    AOS.init();
  }, []);

  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith('/admin');
  const isAdminAdd = router.pathname.startsWith('/admin/add');

  return (
    <div className={montserrat.className}>
      <AuthProvider>
        <CountProvider>
          <CustomizationOrderCountProvider>
            <Head>
              <link rel="icon" href="/favicon.ico" />
              {isAdminAdd ? (
                <title>Admin - Add</title>
              ) : isAdminRoute ? (
                <title>Admin Dashboard</title>
              ) : (
                <title>Tahams - The Unique Way of Life </title>
              )}
            </Head>

            <QueryClientProvider client={queryClient}>
              {isAdminRoute ? (
                <AdminDrawerProvider>
                  <AdminCheck>
                    <Component {...pageProps} />
                  </AdminCheck>
                </AdminDrawerProvider>
              ) : (
                <CustomerCheck>
                  <Component {...pageProps} />
                </CustomerCheck>
              )}
              <Toaster />
            </QueryClientProvider>
          </CustomizationOrderCountProvider>
        </CountProvider>
      </AuthProvider>
    </div>
  );
}
