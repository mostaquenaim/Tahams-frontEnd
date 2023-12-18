
const WhyUs = () => {
    return (
        <section className="pt-4 md:pt-8 lg:pt-10 bg-white">
            <div className="container mx-auto flex flex-col md:grid md:grid-cols-3 items-center justify-center lg:justify-between">
                {/* Left Section */}
                <div className="text-center lg:text-left lg:px-14 mb-8 lg:mb-0 col-span-2">

                    <h2 className="text-4xl font-extrabold text-gray-800 mb-4">
                        Why Tahams?
                    </h2>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Your Subheading Here
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                        At Tahams, we take immense pride in offering you the finest clothing and accessories. Our unwavering commitment to excellence sets us apart, and here's why you should choose us:
                    </p>
                </div>

                {/* Right Section */}
                <div className="lg:w-1/2 lg:px-8 mx-auto">
                    {/* Add your image here */}
                    <img className="w-full h-auto" src="https://i.ibb.co/f22ckGR/bgrmvy-removebg-preview.png" alt="Image" />
                </div>
            </div>
        </section>
    );
};

export default WhyUs;
