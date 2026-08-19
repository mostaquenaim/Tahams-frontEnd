import Link from 'next/link';
import { AiTwotoneHeart } from 'react-icons/ai';
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from 'react-icons/fa';

const CONTACT_INFO = {
  headquarters: {
    address:
      '2nd Floor, 2-G/8, Maa House,\nGolden Street, Ring Road,\nShyamoli, Dhaka-1207',
    phone: '+8801602054102',
  },
  displayCenters: [
    {
      title: 'Display Center 1',
      address: '2nd Floor, Shop No: 35 & 36\nShahabuddin Plaza, Adabor',
      phone: '01314188605',
    },
    {
      title: 'Display Center 2',
      address:
        'Shop No: 1, Block: A, Level: 5\nBashundhara City Shopping Complex',
      phone: '01332136066',
    },
    {
      title: 'Display Center 3',
      address: '23, 4-C Shaista Khan Rd,\nLalbagh, Dhaka',
      phone: '01349019745',
    },
  ],
  email: 'tahamsbd@gmail.com',
};

const COMPANY_LINKS = [
  { href: '/about', label: 'About us' },
  { href: '/contact', label: 'Contact' },
  { href: '/careers', label: 'Careers' },
  { href: '/press', label: 'Press Kit' },
  { href: '/showrooms', label: 'Our Showrooms' },
];

const SUPPORT_LINKS = [
  { href: '/help', label: 'Help Center' },
  { href: '/contact', label: 'Become Affiliate' },
  { href: '/affiliate-faq', label: 'Affiliate FAQ' },
  { href: '/my-orders', label: 'Track Orders' },
  { href: '/shipping', label: 'Shipping Info' },
  { href: '/returns', label: 'Returns & Refunds' },
];

const LEGAL_LINKS = [
  { href: '/terms', label: 'Terms of Use' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/cookies', label: 'Cookie Policy' },
];

const SOCIAL_LINKS = [
  {
    href: 'https://www.facebook.com/tahamsbd/',
    icon: FaFacebook,
    label: 'Facebook',
    hoverColor: 'hover:bg-blue-600',
  },
  {
    href: 'https://www.instagram.com/tahams_bd/',
    icon: FaInstagram,
    label: 'Instagram',
    hoverColor: 'hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-600 hover:to-orange-500',
  },
  {
    href: 'https://www.tiktok.com/@tahams_bd',
    icon: FaTiktok,
    label: 'TikTok',
    hoverColor: 'hover:bg-black',
  },
];

// Subcomponents
const ContactLink = ({ href, icon: Icon, label, iconColor }) => (
  <a
    href={href}
    className="flex items-center text-gray-400 hover:text-white transition-colors duration-300 group py-1"
  >
    <Icon
      className={`mr-3 ${iconColor} text-sm transition-transform duration-300 group-hover:scale-110`}
    />
    <span className="text-sm">{label}</span>
  </a>
);

const DisplayCenter = ({ title, address, phone }) => (
  <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors duration-300">
    <h4 className="font-semibold text-white mb-2 text-sm">{title}</h4>
    <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line mb-2">
      {address}
    </p>
    <a 
      href={`tel:${phone}`}
      className="text-green-400 hover:text-green-300 text-xs transition-colors"
    >
      {phone}
    </a>
  </div>
);

const SocialLink = ({ href, icon: Icon, label, hoverColor }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`bg-gray-700 ${hoverColor} p-3 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
    aria-label={label}
  >
    <Icon className="text-xl" />
  </a>
);

const SectionTitle = ({ children }) => (
  <h3 className="text-lg font-bold mb-6 text-white border-l-4 border-blue-500 pl-3">
    {children}
  </h3>
);

const NavLink = ({ href, children }) => (
  <Link
    href={href}
    className="text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block py-1"
  >
    {children}
  </Link>
);

// Main Component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white" role="contentinfo">
      {/* Main Footer Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Contact Information - Takes full width on mobile, 7 cols on desktop */}
            <section
              className="lg:col-span-7"
              aria-labelledby="contact-heading"
            >
              <SectionTitle>
                <span id="contact-heading">Contact Information</span>
              </SectionTitle>

              <div className="space-y-8">
                {/* Headquarters */}
                <div className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800/70 transition-colors duration-300">
                  <h4 className="font-semibold text-white mb-4 flex items-center text-lg">
                    <FaMapMarkerAlt
                      className="mr-3 text-blue-400 text-xl"
                      aria-hidden="true"
                    />
                    Headquarters
                  </h4>
                  <address className="text-gray-400 mb-4 leading-relaxed not-italic whitespace-pre-line text-base">
                    {CONTACT_INFO.headquarters.address}
                  </address>
                  <a 
                    href={`tel:${CONTACT_INFO.headquarters.phone}`}
                    className="text-green-400 hover:text-green-300 transition-colors font-medium"
                  >
                    {CONTACT_INFO.headquarters.phone}
                  </a>
                </div>

                {/* Display Centers - Responsive grid */}
                <div>
                  <h4 className="font-semibold text-white mb-4 text-lg flex items-center">
                    <FaMapMarkerAlt
                      className="mr-3 text-blue-400"
                      aria-hidden="true"
                    />
                    Display Centers
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CONTACT_INFO.displayCenters.map((center, index) => (
                      <DisplayCenter key={index} {...center} />
                    ))}
                  </div>
                </div>

                {/* Contact Links */}
                <div className="flex flex-wrap gap-6">
                  <ContactLink
                    href={`mailto:${CONTACT_INFO.email}`}
                    icon={FaEnvelope}
                    label="Email Us"
                    iconColor="text-yellow-400"
                  />
                  <div className="hidden sm:block text-gray-600">|</div>
                  <ContactLink
                    href={`tel:${CONTACT_INFO.headquarters.phone}`}
                    icon={FaPhone}
                    label="Call HQ"
                    iconColor="text-green-400"
                  />
                </div>
              </div>
            </section>

            {/* Navigation Links - Takes full width on mobile, 5 cols on desktop */}
            <div className="lg:col-span-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12">
                {/* Company Links */}
                <nav aria-labelledby="company-heading">
                  <SectionTitle>
                    <span id="company-heading">Company</span>
                  </SectionTitle>
                  <div className="space-y-3">
                    {COMPANY_LINKS.map((link) => (
                      <div key={link.href}>
                        <NavLink href={link.href}>{link.label}</NavLink>
                      </div>
                    ))}
                  </div>
                </nav>

                {/* Support Links */}
                <nav aria-labelledby="support-heading">
                  <SectionTitle>
                    <span id="support-heading">Support</span>
                  </SectionTitle>
                  <div className="space-y-3">
                    {SUPPORT_LINKS.map((link) => (
                      <div key={link.href}>
                        <NavLink href={link.href}>{link.label}</NavLink>
                      </div>
                    ))}
                  </div>
                </nav>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="border-t border-gray-700 mt-8 lg:mt-12 pt-8">
            <nav
              className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-6 lg:gap-8"
              aria-label="Legal"
            >
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors text-sm px-2 py-1 rounded hover:bg-gray-800/50"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <p className="text-gray-400 text-sm mb-2">
                COPYRIGHT © {new Date().getFullYear()} TahamsBD. ALL RIGHTS RESERVED.
              </p>
              <p className="flex items-center justify-center lg:justify-start text-gray-400 text-sm flex-wrap gap-1">
                <span className="inline-flex items-center">
                  Crafted with
                  <AiTwotoneHeart
                    className="mx-1 text-red-500"
                    aria-label="love"
                  />
                  by
                </span>
                <a
                  href="https://www.facebook.com/sammtech.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded px-1"
                >
                  SammTech
                </a>
              </p>
            </div>

            {/* Social Media */}
            <nav className="flex gap-3 order-1 lg:order-2" aria-label="Social Media">
              {SOCIAL_LINKS.map((social) => (
                <SocialLink key={social.label} {...social} />
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;