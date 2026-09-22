import React from 'react';
import { FaPaintBrush, FaHandshake, FaCheckCircle } from 'react-icons/fa';
import Head from 'next/head';
import ArtistApplicationForm from '/components/Forms/ArtistApplicationForm';

const Artist = () => {
  return (
    <div>
      <Head>
        <title>Artist Collaboration</title>
      </Head>
      <div className="min-h-screen bg-gray-50 pt-40 lg:pt-56">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <section className="mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-3">Collaborate with Tahams</h1>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              We are always looking for creative artists to collaborate with us. If you have a passion for fashion and art, we would love to hear
              from you!
            </p>
          </section>

          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <FaPaintBrush className="text-3xl text-gray-800 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About Us</h3>
                <p className="text-sm text-gray-600">
                  Tahams is a brand that merges fashion with art, creating
                  unique pieces that stand out in the industry. We value
                  creativity, innovation, and quality.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <FaHandshake className="text-3xl text-gray-800 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Collaboration Process
                </h3>
                <p className="text-sm text-gray-600">
                  Our collaboration process is straightforward. Submit your
                  portfolio, get selected, and start working with our design
                  team to bring your vision to life.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <FaCheckCircle className="text-3xl text-gray-800 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Benefits</h3>
                <p className="text-sm text-gray-600">
                  Enjoy a range of benefits including exposure, profit sharing,
                  and the opportunity to have your art featured on our exclusive
                  clothing line.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Apply Now</h3>
            <ArtistApplicationForm />
          </section>

          {/* <section className='mb-12'>
                        <h3 className='text-xl font-semibold text-gray-900 mb-4'>Previous Collaborations</h3>
                        <p className='text-gray-500 text-base sm:text-lg max-w-2xl mx-auto'>
                            Here are some of the amazing artists we have worked with in the past:
                        </p>
                    </section> */}
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Artist;
