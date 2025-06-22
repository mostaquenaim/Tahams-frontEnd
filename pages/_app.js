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
import AdminCheck from '../components/Auth/AdminCheck';
import CustomerCheck from '../components/Auth/CustomerCheck';
import CountProvider from '../Contexts/CountProvider';
import Head from 'next/head';

const queryClient = new QueryClient()
export default function App({ Component, pageProps }) {

  useEffect(() => {
    AOS.init();
  }, [])

  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith('/admin');
  const isAdminAdd = router.pathname.startsWith('/admin/Add');


  return (
    <AuthProvider>
      <CountProvider>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta property="og:title" content="Tahams - The Unique Way of Life" />
          <meta property="og:description" content="Discover the unique lifestyle with Tahams." />
          <meta property="og:url" content="https://tahamsbd.com/" />
          <meta property="og:type" content="website" />

          <meta property="og:image" content="/preview-image/5-years-tahams.jpg" />
          {
            isAdminAdd ?
              <title>Admin - Add</title>
              : isAdminRoute ?
                <title>Admin Dashboard</title>
                : <title>Tahams - The Unique Way of Life </title>
          }
        </Head>

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
