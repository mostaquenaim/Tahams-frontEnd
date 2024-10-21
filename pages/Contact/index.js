import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';

const Contact = () => {
    return (
        <div className="bg-gray-100 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">Get in Touch</h1>
                    <p className="text-gray-600 text-lg">We’d love to hear from you! Fill out the form below or contact us through the information provided.</p>
                </header>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <div className="bg-white p-8 shadow-lg rounded-lg">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Contact Form</h2>
                        <form className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    placeholder="Enter your name"
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Your Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    placeholder="Enter your email"
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Your Message</label>
                                <textarea
                                    name="message"
                                    id="message"
                                    rows="4"
                                    placeholder="Write your message"
                                    className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 px-4 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white p-8 shadow-lg rounded-lg space-y-8">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Contact Information</h2>
                            <p className="text-gray-600">Feel free to reach out to us using the information below:</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <FaMapMarkerAlt className="text-2xl text-black" />
                            <div>
                                <p className="font-semibold text-gray-800">Address</p>
                                <p className="text-gray-600">2nd Floor, 2-G/8, Maa House, Golden Street, Ring Rd, Dhaka 1207</p>
                                
                                <p className="text-gray-600"><span className='font-semibold'>Display Center:</span> 35-36, 2nd Floor, Shahabuddin Plaza, Ring Road, Dhaka 1207</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <FaPhone className="text-2xl text-black" />
                            <div>
                                <p className="font-semibold text-gray-800">Phone</p>
                                <p className="text-gray-600">01602054102</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <FaEnvelope className="text-2xl text-black" />
                            <div>
                                <p className="font-semibold text-gray-800">Email</p>
                                <p className="text-gray-600">tahamsbd@gmail.com</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-800">Follow Us</h3>
                            <div className="flex space-x-4 text-2xl">
                                <a href="https://www.facebook.com/tahamsbd/" target="_blank" rel="noreferrer" className="hover:text-gray-700">
                                    <FaFacebook />
                                </a>
                                <a href="https://www.instagram.com/tahams_bd/" target="_blank" rel="noreferrer" className="hover:text-gray-700">
                                    <FaInstagram />
                                </a>
                                <a href="https://www.tiktok.com/@tahams_bd" target="_blank" rel="noreferrer" className="hover:text-gray-700">
                                    <FaTiktok />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
