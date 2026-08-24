import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft } from "lucide-react";

const Custom404 = () => {
  return (
    <>
      <Head>
        <title>404 - Not Found </title>
      </Head>
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-4xl font-extrabold mb-4">404 - Page Not Found</h1>
        <p className="text-gray-500 mb-8">
          The page you are looking for doesn't exist.
        </p>
        {/* <div className="text-center mt-4"> */}
        <Link href="/" className="btn btn-outline capitalize gap-2 group mt-3">
          <ArrowLeft
            size={18}
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />
          Back to Home
        </Link>
        {/* </div> */}
      </div>
    </>
  );
};

export default Custom404;
