import React from 'react';
import NavbarCompTwo from '../components/Header/NavbarComp';
import Footer from '../components/Footer/Footer';
import Head from 'next/head';
import Link from 'next/link';

const Custom404 = () => {
  return (
    <>
      <Head>
        <title>404 - Not Found </title>
      </Head>
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-4xl font-extrabold mb-4">404 - Page Not Found</h1>
        <p className="text-gray-500">
          The page you are looking for doesn't exist.
        </p>
        <div className="text-center mt-4">
          <Link
          href={'/login'}
            className="btn btn-primary bg-black hover:-translate-y-1 hover:scale-105 hover:shadow-lg hover:shadow-black"
          >
            Login
          </Link>
        </div>
      </div>
    </>
  );
};

export default Custom404;
