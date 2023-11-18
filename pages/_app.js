import '../styles/globals.css'
import '/styles/custom.css'
import '/styles/navStyle.css'
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function App({ Component, pageProps }) {

  return <Component {...pageProps} />
}
