import React from 'react';
import NavbarCompTwo from '../../../components/Header/NavbarComp';
import Footer from '../../../components/Footer/Footer';
import { FaPaintBrush, FaHandshake, FaCheckCircle } from 'react-icons/fa';

const Artist = () => {
    return (
        <div>
            {/* <NavbarCompTwo /> */}
            <div className='min-h-screen bg-gray-100 pt-40'>
                <div className='container mx-auto p-8'>
                    <section className='mb-12 text-center'>
                        <h1 className='text-4xl font-bold mb-4'>Collaborate with Tahams</h1>
                        <p className='text-gray-700 text-lg'>
                            We are always looking for creative artists to collaborate with us. If you have a passion for fashion and art, we would love to hear from you!
                        </p>
                    </section>

                    <section className='mb-12'>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
                            <div className='bg-white p-6 rounded-lg shadow-md'>
                                <FaPaintBrush className='text-6xl text-blue-500 mx-auto mb-4' />
                                <h3 className='text-xl font-semibold mb-2'>About Us</h3>
                                <p className='text-gray-600'>
                                    Tahams is a brand that merges fashion with art, creating unique pieces that stand out in the industry. We value creativity, innovation, and quality.
                                </p>
                            </div>
                            <div className='bg-white p-6 rounded-lg shadow-md'>
                                <FaHandshake className='text-6xl text-green-500 mx-auto mb-4' />
                                <h3 className='text-xl font-semibold mb-2'>Collaboration Process</h3>
                                <p className='text-gray-600'>
                                    Our collaboration process is straightforward. Submit your portfolio, get selected, and start working with our design team to bring your vision to life.
                                </p>
                            </div>
                            <div className='bg-white p-6 rounded-lg shadow-md'>
                                <FaCheckCircle className='text-6xl text-yellow-500 mx-auto mb-4' />
                                <h3 className='text-xl font-semibold mb-2'>Benefits</h3>
                                <p className='text-gray-600'>
                                    Enjoy a range of benefits including exposure, profit sharing, and the opportunity to have your art featured on our exclusive clothing line.
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
                                <label className='block text-gray-700 text-sm font-bold mb-2'>Portfolio Link</label>
                                <input
                                    type='url'
                                    className='w-full px-3 py-2 border rounded-lg'
                                    placeholder='Enter your portfolio link'
                                />
                            </div>
                            <button className='bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600'>
                                Submit
                            </button>
                        </form>
                    </section>

                    {/* <section className='mb-12'>
                        <h3 className='text-2xl font-bold mb-4'>Previous Collaborations</h3>
                        <p className='text-gray-700 text-lg'>
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
