import { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import ShowBanner2 from './components/ShowBanner2';
import Banners from './admin/Show/Banners';
import ResponsiveNavBar from './components/Header/ResponsiveNavBar';
import ThemeProvider from './Contexts/ThemeProvider';
import Bot from './components/Bot';
import TestNavbar from './components/Header/TestNavbar';
import MySwiper from './components/Swiper/MySwiper';
import ShopByCategory from './components/ShopByCategory/ShopByCategory';
import NewArrival from './components/NewArrival/NewArrival';
import WhyUs from './components/WhyUs/WhyUs';
import Payment from './components/Payment/Payment';
import Footer from './components/Footer/Footer';
import NavbarCompTwo from './components/Header/NavbarComp';

export const CompanyContext = createContext(null); {/* unused  */ }

export default function Home() {

  const [images, setImages] = useState([])

  useEffect(() => {
    fetch('/banner-images.json')
      .then(res => res.json())
      .then(data => setImages(data))
  }, [])

  return (
    <div className=''>

      <CompanyContext.Provider value='unused'>  
        <ThemeProvider>
          {/* <NavbarComp></NavbarComp> */}
          <NavbarCompTwo></NavbarCompTwo>
          {/* <Bot></Bot> */}
          <MySwiper images={images}></MySwiper>
          <NewArrival></NewArrival>
           <WhyUs></WhyUs>
          {/*<ShopByCategory></ShopByCategory>
          <Payment></Payment>
          <Footer></Footer> */}
        </ThemeProvider>
      </CompanyContext.Provider>  
    </div>
  );


}


