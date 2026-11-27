import { BsInstagram, BsMessenger } from 'react-icons/bs';
import { FaFacebook } from 'react-icons/fa';
import useSiteSettings from '../../Hooks/useSiteSettings';

const CONTACT_LINKS = [
  {
    key: 'facebook',
    label: 'Facebook',
    title: 'Message us on Facebook for custom t-shirt designs',
    icon: FaFacebook,
    className: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50',
  },
  {
    key: 'messenger',
    label: 'Messenger',
    title: 'Direct message for instant design quotes',
    icon: BsMessenger,
    className: 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    title: 'View our portfolio & DM for custom orders',
    icon: BsInstagram,
    className: 'text-pink-600 hover:text-pink-800 hover:bg-pink-50',
  },
];

const TopElements = () => {
  const { social } = useSiteSettings();
  const links = CONTACT_LINKS.filter((link) => social[link.key]);

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
      {links.length > 0 && (
        <div className="w-full lg:w-auto flex flex-col items-start lg:items-end bg-gray-50 border border-gray-200 rounded-md p-4 shadow-sm">
          <p className="text-sm sm:text-base text-indigo-700 font-semibold bg-indigo-50 px-3 py-2 rounded-md border border-indigo-200 shadow-sm lg:text-right">
            Contact us for custom design consultations & orders
          </p>

          <div className="flex gap-3 sm:gap-4 w-full lg:w-auto justify-center sm:justify-start lg:justify-end mt-2">
            {links.map(({ key, label, title, icon: Icon, className }) => (
              <a
                key={key}
                href={social[key]}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center transition-all px-2 py-1 rounded-md ${className}`}
                title={title}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 hover:scale-110 transition-transform" />
                <span className="hidden sm:block text-xs sm:text-sm font-medium">
                  {label}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopElements;
