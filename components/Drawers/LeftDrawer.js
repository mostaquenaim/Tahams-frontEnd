import { DrawerContext } from '/Contexts/DrawerProvider';
import { DrawerLinks } from '/utils/DrawerFunctions';
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useContext,
} from 'react';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';

const LeftDrawer = ({ ListStyle, ListComponent, categories, genders }) => {
  const { isOpen, setIsOpen } = useContext(DrawerContext);
  const drawerRef = useRef(null);

  // Close drawer on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        !event.target.closest('.drawer-button')
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close drawer on escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleDrawer = () => {
    setIsOpen((prev) => !prev);
  };

  const links = DrawerLinks(ListStyle, ListComponent, categories, genders);

  return (
    <div className="relative z-50">
      {/* Drawer Toggle Button */}
      <button
        className="drawer-button p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        onClick={toggleDrawer}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
      >
        <AiOutlineMenu className="text-2xl text-gray-700" />
      </button>

      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div
        data-theme="light"
        ref={drawerRef}
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
          <button
            onClick={toggleDrawer}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Close navigation menu"
          >
            <AiOutlineClose className="text-xl text-gray-600" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="h-full overflow-y-auto">
          <ul className="p-4 space-y-2">{links}</ul>
        </nav>
      </div>
    </div>
  );
};

export default LeftDrawer;
