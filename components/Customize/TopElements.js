import { BsInstagram, BsMessenger } from 'react-icons/bs';
import { FaFacebook } from 'react-icons/fa';

const TopElements = () => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 mt-24 sm:mt-5 lg:mt-12">
      {/* Left side: Title & Subtitle */}
      <div className="w-full lg:w-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center lg:text-left">
          T-Shirt Design Studio
        </h1>
        <p className="text-gray-500 text-center lg:text-left mt-1 text-sm sm:text-base">
          Create custom apparel designs for your business
        </p>
      </div>

      {/* Right side: Contact Section */}
      <div className="w-full lg:w-auto flex flex-col items-start lg:items-end bg-gray-50 border border-gray-200 rounded-md p-4 shadow-sm">
        <p className="text-sm sm:text-base text-indigo-700 font-semibold bg-indigo-50 px-3 py-2 rounded-md border border-indigo-200 shadow-sm lg:text-right">
          Contact us for custom design consultations & orders
        </p>

        <div className="flex gap-3 sm:gap-4 w-full lg:w-auto justify-center sm:justify-start lg:justify-end mt-2">
          <a
            href="https://www.facebook.com/tahamsbd"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-all px-2 py-1 rounded-md hover:bg-blue-50"
            title="Message us on Facebook for custom t-shirt designs"
          >
            <FaFacebook className="w-4 h-4 sm:w-5 sm:h-5 mr-1 hover:scale-110 transition-transform" />
            <span className="hidden sm:block text-xs sm:text-sm font-medium">
              Facebook
            </span>
          </a>

          <a
            href="https://m.me/111664024670524"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-all px-2 py-1 rounded-md hover:bg-indigo-50"
            title="Direct message for instant design quotes"
          >
            <BsMessenger className="w-4 h-4 sm:w-5 sm:h-5 mr-1 hover:scale-110 transition-transform" />
            <span className="hidden sm:block text-xs sm:text-sm font-medium">
              Messenger
            </span>
          </a>

          <a
            href="https://www.instagram.com/tahams_bd"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-pink-600 hover:text-pink-800 transition-all px-2 py-1 rounded-md hover:bg-pink-50"
            title="View our portfolio & DM for custom orders"
          >
            <BsInstagram className="w-4 h-4 sm:w-5 sm:h-5 mr-1 hover:scale-110 transition-transform" />
            <span className="hidden sm:block text-xs sm:text-sm font-medium">
              Instagram
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopElements;
