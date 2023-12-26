import '../styles/globals.css'
import '/styles/custom.css'
import '/styles/navStyle.css'
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import AuthProvider from './Contexts/Auth/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()
export default function App({ Component, pageProps }) {

  
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </AuthProvider>
  )

}
