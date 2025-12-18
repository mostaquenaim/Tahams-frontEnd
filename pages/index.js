import { createContext, useEffect, useState } from 'react';
import ThemeProvider from '/Contexts/ThemeProvider';
import MySwiper from '/components/Swiper/MySwiper';
import ShopByCategory from '/components/ShopByCategory/ShopByCategory';
import WhyUs from '/components/WhyUs/WhyUs';
import Payment from '/components/Payment/Payment';
import Modal from 'react-modal';
import TagManager from 'react-gtm-module';
import Head from 'next/head';
import useLoadActivePop from '/./Hooks/useLoadActivePop';
import NewArrival from '/components/Home/NewArrival/NewArrival';
import Popular from '/components/Home/Popular/Popular';
import bannerImages from '../public/banner-images.json';
import ProfessionalSwiper from '/components/Swiper/SwiperDS';
import NewArrivalDraft from '/components/Home/NewArrival/NewArrivalDraft';
import SectionShow from '/components/Home/SectionShow/SectionShow';
import Link from 'next/link';
import PerfumeBox from '/components/Home/PerfumeBox';
import { getGuestCustomerInfo } from '/utils/guestCustomer';
import ZipperSpecial from '/components/Home/WinterSpecial/ZipperSpecial';
import KangarooSpecial from '/components/Home/WinterSpecial/KangarooSpecial';
import SweatshirtSpecial from '/components/Home/WinterSpecial/SweatshirtSpecial';

export const CompanyContext = createContext(null);
{
  /* unused */
}

export default function Home() {
  // const [images, setImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const activePop = useLoadActivePop();

  useEffect(() => {
    getGuestCustomerInfo();
  }, []);

  const tagManagerArgs = {
    gtmId: 'GTM-K89SSG9W', // Replace with your GTM ID
  };

  useEffect(() => {
    TagManager.initialize(tagManagerArgs);
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

    if (
      !isPopupSeen &&
      new Date(activePop.startDate) <= now &&
      new Date(activePop.endDate) >= now
    ) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [activePop]);

  const [photos, setPhotos] = useState([
    {
      link: '/products/details/bangladesh-map-customized-t-shirt-682',
      name: 'Signature Prints',
      item: '/customized/rivers-of-bd-og.jpg',
      onHover: '/customized/Animated_Water_Video_Generation.mp4',
    },
    {
      link: '/customize-tee',
      name: 'Customize Your Own Tee',
      item: '/customized/customization-cover.jpg',
    },
    {
      link: '/products/details/just-cant-customize-733',
      // name: 'Signature Prints',
      item: '/customized/just-cant.jpg',
    },
    {
      link: '/products/details/dragon-ball-z-customized-t-shirt--742',
      // name: 'Signature Prints',
      item: '/customized/dragon-ball-z.jpg',
    },
    {
      link: '/products/details/power-rangers-customize--741',
      // name: 'Signature Prints',
      item: '/customized/adventure.jpg',
    },
    {
      link: '/products/details/best-life-customize--740',
      // name: 'Signature Prints',
      item: '/customized/sky-high-vibe.jpg',
    },
  ]);

  const [bigbossProducts, srtBigbossProducts] = useState([
    {
      link: '/products/details/bangladesh-map-customized-t-shirt-682',
      item: '/bigboss/Black-Basic-Tee-BB.jpg',
    },
    {
      link: '/customize-tee',
      item: '/bigboss/thumbnail.jpg',
    },
    {
      link: '/products/details/just-cant-customize-733',
      item: '/bigboss/Maroon-Basic-Tee-BB.jpg',
    },
    {
      link: '/products/details/dragon-ball-z-customized-t-shirt--742',
      item: '/bigboss/Marshmallow-Basic-Tee-BB.jpg',
    },
    {
      link: '/products/details/power-rangers-customize--741',
      item: '/bigboss/Navy-Basic-Tee-BB.jpg',
    },
  ]);

  const [layout, setLayout] = useState('style1');
  const [treasureClicked, setTreasureClicked] = useState(false);
  const [isTreasureClicked, setIsTreasureClicked] = useState(false);

  useEffect(() => {
    const treasureClicked = localStorage.getItem('treasureClicked') === 'true';
    setIsTreasureClicked(treasureClicked);
  }, [treasureClicked]);

  const handleTreasureBox = () => {
    localStorage.setItem('treasureClicked', true);
    setTreasureClicked(!treasureClicked);
  };

  return (
    <div className="">
      <CompanyContext.Provider value="unused">
        <ThemeProvider>
          <Head>
            <title>Tahams - The Unique Way of Life</title>
            <meta
              name="description"
              content="Discover the unique lifestyle with Tahams."
            />
            <meta
              property="og:title"
              content="Tahams - The Unique Way of Life"
            />
            <meta
              property="og:description"
              content="Discover the unique lifestyle with Tahams."
            />
            <meta property="og:url" content="https://tahamsbd.com/" />
            <meta property="og:type" content="website" />
            <meta
              property="og:image"
              content="https://tahamsbd.com/og-image.jpg"
            />

            {/* 🔥 Preload LCP image */}
            <link
              rel="preload"
              as="image"
              href="/cover-photos/Tahams-Winter-Cover.jpg"
              fetchpriority="high"
            />
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

          <ProfessionalSwiper images={bannerImages}></ProfessionalSwiper>
          <div className="relative">
            <section id="new-arrival">
              <NewArrival />
              {/* <NewArrivalDraft/> */}
            </section>
            <section id='zipper-hoodie'>
              <ZipperSpecial></ZipperSpecial>
            </section>
            <section id='sweatshirt'>
              <SweatshirtSpecial></SweatshirtSpecial>
            </section>
            <section id='kangaroo-hoodie'>
              <KangarooSpecial></KangarooSpecial>
            </section>
            <section id="new-section">
              <SectionShow
                layout={layout}
                photos={photos}
                isEditing={true}
                onLayoutChange={setLayout}
              />{' '}
            </section>
            <Popular />
            <section id="about">
              <WhyUs></WhyUs>
            </section>
            {/* <section id="bigboss-section">
            <SectionShow
              layout={'style6'}
              photos={bigbossProducts}
              isEditing={true}
              onLayoutChange={setLayout}
            />{' '}
          </section> */}
            <ShopByCategory></ShopByCategory>
            <PerfumeBox
              handleTreasureBox={handleTreasureBox}
              treasureClicked={treasureClicked}
              isTreasureClicked={isTreasureClicked}
            />
          </div>
          <Payment></Payment>
          {/* <Footer></Footer> */}
        </ThemeProvider>
      </CompanyContext.Provider>
    </div>
  );
}
