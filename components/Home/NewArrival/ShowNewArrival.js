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
      <Link href={`/search-product?search=${encodeURIComponent(prop.name)}`}>
        <span className="block">
          {/* Card Container */}
          <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-md hover:shadow-2xl transition-all duration-500">
            {/* Image Container with Aspect Ratio */}
            <div className="relative w-full aspect-[4/5] overflow-hidden">
              <motion.img
                src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${prop.filename}`}
                alt={prop.name || 'New Arrival'}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />

              {/* Hover overlay with a Shop Now button (hover-capable screens only) */}
              <div className="absolute inset-0 hidden bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 sm:block">
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold text-sm">
                    Shop Now
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Subtle Border Glow on Hover */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/20 transition-all duration-500"></div>

              {/* New Badge (Optional) */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                <span className="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white text-black text-xs sm:text-sm font-bold rounded-full shadow-lg">
                  NEW
                </span>
              </div>
            </div>

            {/* Name is always visible - touch screens have no hover */}
            <div className="p-3 sm:p-4 bg-white">
              <h3 className="text-gray-900 text-sm sm:text-base font-bold line-clamp-2">
                {prop.name}
              </h3>
              {prop.subsub?.name && (
                <p className="mt-1 text-gray-500 text-xs font-medium uppercase tracking-wide">
                  {prop.subsub.name}
                </p>
              )}
            </div>
          </div>
        </span>
      </Link>
    </motion.div>
  );
};

export default ShowNewArrival;
