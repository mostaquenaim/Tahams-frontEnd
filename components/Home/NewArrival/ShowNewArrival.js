import Link from 'next/link';
import { motion } from 'framer-motion';

const ShowNewArrival = ({ ind, prop }) => {
  if (!prop) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: ind * 0.1 }}
      className="relative w-full h-full mx-auto group cursor-pointer"
    >
      <Link href={`/search-product?search=${prop.name}`}>
        <span className="block">
          {/* Card Container */}
          <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-md hover:shadow-2xl transition-all duration-500">
            {/* Image Container with Aspect Ratio */}
            <div className="relative w-full aspect-[4/5] overflow-hidden">
              <motion.img
                src={
                  `${process.env.NEXT_PUBLIC_API}/admin/getimage/${prop.filename}` ||
                  '/placeholder.jpg'
                }
                alt={prop.name || 'New Arrival'}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                loading="lazy"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
              />

              {/* Gradient Overlay - Always Visible on Mobile */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <h3 className="hidden md:block text-white text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1 sm:mb-2 line-clamp-2">
                      {prop.name}
                    </h3>
                    {prop.subsub?.name && (
                      <p className="md:hidden text-gray-200 text-xs sm:text-sm font-medium uppercase tracking-wide">
                        {prop.subsub.name}
                      </p>
                    )}
                  </motion.div>
                  
                  {/* Shop Now Button - Hidden on Mobile, Visible on Hover for Desktop */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="hidden sm:block mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500"
                  >
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors">
                      Shop Now
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Subtle Border Glow on Hover */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/20 transition-all duration-500"></div>

              {/* New Badge (Optional) */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                <span className="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 bg-blue-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg">
                  NEW
                </span>
              </div>
            </div>

            {/* Bottom Info Section - Mobile Only */}
            <div className="sm:hidden p-3 bg-white">
              <h3 className="text-gray-900 text-sm font-bold mb-1 ">
                {prop.name}
              </h3>
              {/* {prop.subsub?.name && (
                <p className="text-gray-600 text-xs font-medium uppercase tracking-wide">
                  {prop.subsub.name}
                </p>
              )} */}
            </div>
          </div>
        </span>
      </Link>
    </motion.div>
  );
};

export default ShowNewArrival;