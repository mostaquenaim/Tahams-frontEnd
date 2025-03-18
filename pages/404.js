import React from 'react';
import NavbarCompTwo from '../components/Header/NavbarComp';
import Footer from '../components/Footer/Footer';
import Head from 'next/head';

const Custom404 = () => {
    return (
        <>
            {/* <NavbarCompTwo /> */}
            <Head>
                <title>404 - Not Found </title>
            </Head>
            <div className="min-h-screen flex flex-col justify-center items-center">
                <h1 className="text-4xl font-extrabold mb-4">404 - Page Not Found</h1>
                <p className="text-gray-500">The page you are looking for doesn't exist.</p>
            </div>
            {/* <Footer /> */}
        </>

    );
};

export default Custom404;
