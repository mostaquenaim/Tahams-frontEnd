import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

const HomeNav = () => {
  const router = useRouter();
  const [hovered, setHovered] = useState();

  const navItems = [
    { name: 'Solid', path: '/categories/Solid' },
    { name: 'Customize', path: '/categories/Customize' },
  ];

  return (
    <nav className="bg-white/50 backdrop-blur-lg border-b shadow-sm top-0 z-50">
      <div className="">
        <div className="flex items-center justify-between h-16 relative">
          {/* Nav Item - Solid */}
          <Link href={navItems[0].path} className="flex-1 text-center">
            <motion.div
              className={`text-xl font-medium text-gray-800 transition duration-300`}
              onMouseEnter={() => setHovered(navItems[0].name)}
              onMouseLeave={() => setHovered(null)}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {navItems[0].name}
            </motion.div>
          </Link>

          {/* Curved Center Line */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-0 h-16 w-1 bg-gray-300 rotate-45 rounded-full"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 45 }}
            // transition={{ duration: 0.5 }}
          />

          {/* Nav Item - Customize */}
          <Link href={navItems[1].path} className="flex-1 text-center">
            <motion.div
              className={`text-xl font-medium text-gray-800 transition duration-300`}
              onMouseEnter={() => setHovered(navItems[1].name)}
              onMouseLeave={() => setHovered(null)}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {navItems[1].name}
            </motion.div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default HomeNav;
