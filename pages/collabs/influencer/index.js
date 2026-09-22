import React from 'react';
import { FaBullhorn, FaHandshake, FaGift } from 'react-icons/fa';
import Head from 'next/head';
import InfluencerApplicationForm from '/components/Forms/InfluencerApplicationForm';

const Influencer = () => {
  return (
    <div>
      <Head>
        <title>Influencer Collaboration</title>
      </Head>
      <div className="min-h-screen bg-gray-50 pt-40 lg:pt-56">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <section className="mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-3">
              Collaborate with Tahams as an Influencer
            </h1>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              We are always excited to work with influencers who share our
              passion for fashion and lifestyle. If you're interested in
              collaborating with us, let's connect!
            </p>
          </section>

          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <FaBullhorn className="text-3xl text-gray-800 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About Us</h3>
                <p className="text-sm text-gray-600">
                  Tahams is more than just a clothing brand; it's a lifestyle.
                  We blend fashion, art, and culture to create something unique
                  and impactful.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <FaHandshake className="text-3xl text-gray-800 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Collaboration Process
                </h3>
                <p className="text-sm text-gray-600">
                  Our process is simple: reach out with your ideas, get
                  selected, and let's create something amazing together that
                  resonates with your audience.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <FaGift className="text-3xl text-gray-800 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Benefits</h3>
                <p className="text-sm text-gray-600">
                  Receive exclusive products, special offers, and earn
                  commissions. Plus, get featured across our channels for
                  maximum exposure.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Apply Now</h3>
            <InfluencerApplicationForm />
          </section>

          {/* <section className='mb-12'>
                        <h3 className='text-xl font-semibold text-gray-900 mb-4'>Successful Collaborations</h3>
                        <p className='text-gray-500 text-base sm:text-lg max-w-2xl mx-auto'>
                            Check out some of the amazing influencers we've worked with:
                        </p>
                    </section> */}
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Influencer;
