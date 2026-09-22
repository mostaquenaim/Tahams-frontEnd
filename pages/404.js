import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { buttonPrimary, buttonSecondary } from '../components/Storefront/StorefrontUI';

const Custom404 = () => {
  return (
    <>
      <Head>
        <title>Page not found - Tahams</title>
      </Head>
      <section className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pb-16 pt-32">
        <div className="max-w-md text-center">
          <p className="text-7xl font-bold tracking-tight text-gray-200 sm:text-8xl">
            404
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">
            We can&apos;t find that page
          </h1>
          <p className="mt-2 text-gray-500">
            The link may be broken or the page may have moved. Let&apos;s get you
            back to something good.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className={buttonPrimary}>
              Back to home
            </Link>
            <Link href="/contact" className={buttonSecondary}>
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Custom404;
