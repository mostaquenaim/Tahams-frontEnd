import { createContext, useEffect, useState } from 'react';
import ThemeProvider from '/Contexts/ThemeProvider';
import MySwiper from '/components/Swiper/MySwiper';
import ShopByCategory from '/components/ShopByCategory/ShopByCategory';
import NewArrival from '/components/NewArrival/NewArrival';
import WhyUs from '/components/WhyUs/WhyUs';
import Payment from '/components/Payment/Payment';
import Modal from 'react-modal';
import TagManager from "react-gtm-module";
import Head from 'next/head';
import useLoadActivePop from '/./Hooks/useLoadActivePop';

export const CompanyContext = createContext(null); {/* unused */ }

export default function Home() {
  const [images, setImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const activePop = useLoadActivePop()

  const tagManagerArgs = {
    gtmId: "GTM-K89SSG9W", // Replace with your GTM ID
  };

  useEffect(() => {
    TagManager.initialize(tagManagerArgs);
    fetch('/banner-images.json')
      .then((res) => res.json())
      .then((data) => setImages(data));
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (activePop?.title) {
      localStorage.setItem(activePop.title, 'true');
    }
  };

  useEffect(() => {
    if (!activePop || !activePop.isActive) return;

    const isPopupSeen = localStorage.getItem(activePop.title) == 'true';
    const now = new Date();

    if (!isPopupSeen &&
      new Date(activePop.startDate) <= now &&
      new Date(activePop.endDate) >= now
    ) {
      setIsModalOpen(true);
    }
    else{
      setIsModalOpen(false);
    }
  }, [activePop]);

  return (
    <div>
      <CompanyContext.Provider value="unused">
        <ThemeProvider>
          <Head>
            <title>Tahams - THE UNIQUE WAY OF LIFE </title>
          </Head>

          {/* Modal */}
          <Modal
            isOpen={isModalOpen}
            onRequestClose={handleCloseModal}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
            overlayClassName="overlay"
            ariaHideApp={false}
          >
            <div className="relative bg-white rounded-lg p-6 text-center max-w-sm mx-auto shadow-lg">
              <img
                src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${activePop?.filename}`}
                alt="Pop-Up"
                className="w-full rounded-md"
              />
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleCloseModal}
                  className="bg-black text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:bg-gray-800 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-gray-900"
                >
                  Let’s Go
                </button>
              </div>
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-3 text-gray-400 hover:text-black transition-transform duration-300 transform hover:rotate-90 hover:scale-110"
              >
                ×
              </button>
            </div>
          </Modal>
          {/* Main Content */}
          {/* {!isModalOpen && */}
            <MySwiper images={images}></MySwiper>
             {/* <TriangleLoader/> */}
          {/* } */}
          <NewArrival></NewArrival>
          <WhyUs></WhyUs>
          <ShopByCategory></ShopByCategory>
          <Payment></Payment>
          {/* <Footer></Footer> */}
        </ThemeProvider>
      </CompanyContext.Provider>
    </div>
  );
}
