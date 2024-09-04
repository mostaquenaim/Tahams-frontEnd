import React from 'react';
import NavbarCompTwo from '../../../components/Header/NavbarComp';
import Footer from '../../../components/Footer/Footer';
import { FaBullhorn, FaHandshake, FaGift } from 'react-icons/fa';

const Influencer = () => {
    return (
        <div>
            {/* <NavbarCompTwo /> */}
            <div className='min-h-screen bg-gray-100 pt-40'>
                <div className='container mx-auto p-8'>
                    <section className='mb-12 text-center'>
                        <h1 className='text-4xl font-bold mb-4'>Collaborate with Tahams as an Influencer</h1>
                        <p className='text-gray-700 text-lg'>
                            We are always excited to work with influencers who share our passion for fashion and lifestyle. If you're interested in collaborating with us, let's connect!
                        </p>
                    </section>

                    <section className='mb-12'>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
                            <div className='bg-white p-6 rounded-lg shadow-md'>
                                <FaBullhorn className='text-6xl text-purple-500 mx-auto mb-4' />
                                <h3 className='text-xl font-semibold mb-2'>About Us</h3>
                                <p className='text-gray-600'>
                                    Tahams is more than just a clothing brand; it's a lifestyle. We blend fashion, art, and culture to create something unique and impactful.
                                </p>
                            </div>
                            <div className='bg-white p-6 rounded-lg shadow-md'>
                                <FaHandshake className='text-6xl text-green-500 mx-auto mb-4' />
                                <h3 className='text-xl font-semibold mb-2'>Collaboration Process</h3>
                                <p className='text-gray-600'>
                                    Our process is simple: reach out with your ideas, get selected, and let's create something amazing together that resonates with your audience.
                                </p>
                            </div>
                            <div className='bg-white p-6 rounded-lg shadow-md'>
                                <FaGift className='text-6xl text-red-500 mx-auto mb-4' />
                                <h3 className='text-xl font-semibold mb-2'>Benefits</h3>
                                <p className='text-gray-600'>
                                    Receive exclusive products, special offers, and earn commissions. Plus, get featured across our channels for maximum exposure.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className='mb-12'>
                        <h3 className='text-2xl font-bold mb-4'>Apply Now</h3>
                        <form className='bg-white p-8 rounded-lg shadow-md'>
                            <div className='mb-4'>
                                <label className='block text-gray-700 text-sm font-bold mb-2'>Name</label>
                                <input
                                    type='text'
                                    className='w-full px-3 py-2 border rounded-lg'
                                    placeholder='Enter your name'
                                />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-gray-700 text-sm font-bold mb-2'>Email</label>
                                <input
                                    type='email'
                                    className='w-full px-3 py-2 border rounded-lg'
                                    placeholder='Enter your email'
                                />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-gray-700 text-sm font-bold mb-2'>Social Media Handle</label>
                                <input
                                    type='text'
                                    className='w-full px-3 py-2 border rounded-lg'
                                    placeholder='Enter your social media handle'
                                />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-gray-700 text-sm font-bold mb-2'>Audience Details</label>
                                <textarea
                                    className='w-full px-3 py-2 border rounded-lg'
                                    placeholder='Tell us about your audience'
                                    rows='4'
                                ></textarea>
                            </div>
                            <button className='bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600'>
                                Submit
                            </button>
                        </form>
                    </section>

                    {/* <section className='mb-12'>
                        <h3 className='text-2xl font-bold mb-4'>Successful Collaborations</h3>
                        <p className='text-gray-700 text-lg'>
                            Check out some of the amazing influencers we've worked with:
                        </p>
                    </section> */}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Influencer;
