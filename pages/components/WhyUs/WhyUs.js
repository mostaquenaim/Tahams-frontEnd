import React from 'react';

const WhyUs = () => {
    return (
        <section className="pt-20 md:pt-16 lg:pt-10 shadow-md bg-white">
            <div className="container mx-auto text-center">
                <h2 className="text-4xl font-extrabold text-gray-800 mb-8">
                    Why Choose Tahams?
                </h2>
                <p className="text-lg text-gray-600 mb-10 lg:px-32">
                    At Tahams, we take immense pride in offering you the finest clothing and accessories. Our unwavering commitment to excellence sets us apart, and here's why you should choose us:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-10">
                    <div className="h-96 flex flex-col justify-end bg-gradient-to-r from-zinc-200 to-white p-8 rounded-lg shadow-lg text-center">
                        <img className='sticky w-48 mx-auto' src='https://i.ibb.co/f22ckGR/bgrmvy-removebg-preview.png'></img>
                        <h3 className="text-3xl font-semibold text-black mb-4">Quality Products</h3>
                        <p className="text-black text-opacity-80">
                            We meticulously source the highest quality materials to craft clothing that not only looks great but also feels incredibly comfortable and remarkably durable.
                        </p>
                    </div>

                    <div className="h-96 flex flex-col justify-end bg-gradient-to-r from-zinc-200 to-white p-8 rounded-lg shadow-lg text-center">
                        <img className='sticky w-48 mx-auto' src='https://i.ibb.co/sQxwkPH/bgrmvz-removebg-preview.png'></img>
                        <h3 className="text-3xl font-semibold text-black mb-4">Unique Designs</h3>
                        <p className="text-black text-opacity-80">
                            We meticulously source the highest quality materials to craft clothing that not only looks great but also feels incredibly comfortable and remarkably durable.
                        </p>
                    </div>

                    <div className="h-96 flex flex-col justify-end bg-gradient-to-r from-zinc-200 to-white p-8 rounded-lg shadow-lg text-center">
                        <img className='sticky w-48 mx-auto' src='https://i.ibb.co/LYxGn8Q/bgrmvx-removebg-preview.png'></img>
                        <h3 className="text-3xl font-semibold text-black mb-4">Exceptional Service</h3>
                        <p className="text-black text-opacity-80">
                            We meticulously source the highest quality materials to craft clothing that not only looks great but also feels incredibly comfortable and remarkably durable.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyUs;
