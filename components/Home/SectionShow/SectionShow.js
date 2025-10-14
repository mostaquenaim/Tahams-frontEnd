import Link from 'next/link';
import Heading from '/components/Header/Heading';
import { useState, useEffect } from 'react';

const SectionShow = ({ layout, photos, fullCollection, isEditing, onLayoutChange }) => {
  const [loading, setLoading] = useState(true);

  // Simulate loading for 1s (can be adjusted or tied to real image loading)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [photos]);

  const layoutStyles = {
    style1: {
      container:
        'grid grid-cols-2 grid-rows-2 md:grid-cols-5 md:grid-rows-2 gap-6',
      items: [
        { span: 'col-span-2 row-span-2', index: 0 },
        { span: 'col-span-2 row-span-1 md:col-span-3 md:row-span-1', index: 1 },
        { span: 'col-span-1 row-span-1', index: 2 },
        { span: 'col-span-1 row-span-1', index: 3 },
        { span: 'col-span-1 row-span-1', index: 4 },
        { span: 'col-span-1 row-span-1 md:hidden', index: 5 },
      ],
    },
    style6: {
      container:
        // mobile = single column, md+ = grid layout
        'grid grid-cols-2 grid-rows-3 md:grid-cols-4 md:grid-rows-2 gap-6',

      items: [
        // mobile: show item[1] first (spanning 2 cols, 2 rows)
        // md+: keep item[1] in its big spot
        {
          span: 'col-span-2 row-span-2 order-1 md:order-none',
          index: 1,
        },
        // remaining smaller ones
        {
          span: 'col-span-1 row-span-1 order-2 md:order-none',
          index: 0,
        },
        {
          span: 'col-span-1 row-span-1 order-3 md:order-none',
          index: 2,
        },
        {
          span: 'col-span-1 row-span-1 order-4 md:order-none',
          index: 3,
        },
        {
          span: 'col-span-1 row-span-1 order-5 md:order-none',
          index: 4,
        },
      ],
    },
  };

  const currentLayout = layoutStyles[layout] || layoutStyles['style1'];
  const displayPhotos = photos.slice(0, currentLayout.items.length);

  return (
    <div className="space-y-8 py-12 px-2 sm:px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <Heading
          first="Featured Collection"
          second="Our Products"
          theme="dark"
        />
      </div>

      {/* Grid Container */}
      <div className={currentLayout.container}>
        {loading
          ? // --- SKELETONS ---
            Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-gray-200 animate-pulse rounded-2xl w-full h-48 md:h-64"
              />
            ))
          : // --- REAL CONTENT ---
            currentLayout.items.map((item, idx) => {
              const photo = displayPhotos[item.index];
              if (!photo) return null;

              return (
                <Link
                  href={photo.link}
                  key={idx}
                  className={`${item.span} group relative overflow-hidden rounded-2xl bg-white shadow-2xl md:shadow-lg md:hover:shadow-2xl transition-all duration-500 ease-out transform md:hover:-translate-y-2`}
                >
                  {/* Image / Video Container */}
                  <div className="relative h-full w-full overflow-hidden">
                    {/* Static Image */}
                    <img
                      src={photo.item}
                      alt={photo.name || 'product'}
                      onLoad={() => setLoading(false)}
                      className={`w-full h-full object-cover transform scale-110 md:scale-100 md:group-hover:scale-110 transition duration-700 ease-out ${
                        photo.onHover ? 'opacity-0' : ''
                      }`}
                      loading="lazy"
                    />

                    {/* On-hover video */}
                    {photo.onHover && (
                      <video
                        src={photo.onHover}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        disablePictureInPicture
                        controls={false}
                        className="absolute inset-0 w-full h-full object-cover opacity-100 transition-opacity duration-700 ease-out pointer-events-none"
                      />
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Shine Effect */}
                    <div className="absolute inset-0 -translate-x-full md:group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-0 transition-transform duration-300">
                    <div className="space-y-2">
                      {photo.name && (
                        <h3 className="text-xl font-semibold tracking-tight group-hover:text-white/95 transition-colors">
                          {photo.name}
                        </h3>
                      )}
                      {photo.price && (
                        <p className="text-lg font-medium text-emerald-200">
                          {photo.price}
                        </p>
                      )}
                      {photo.category && (
                        <p className="text-sm text-gray-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500">
                          {photo.category}
                        </p>
                      )}
                    </div>

                    {/* CTA Button */}
                    <div className="mt-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-all duration-500 delay-200">
                      <span className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30 hover:bg-white/30 transition-colors">
                        View Details
                        <svg
                          className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Badge */}
                  {photo.featured && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white backdrop-blur-sm">
                        Featured
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
      </div>

      {/* View All Button */}
      <div className="text-center mt-12">
        <Link
          href="/categories/Printed"
          className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-gray-50 md:bg-white md:hover:bg-gray-50 shadow-lg md:shadow-none md:hover:shadow-lg transition-all duration-300 -translate-y-1 md:translate-y-0 transform hover:-translate-y-1"
        >
          View Full Collection
          <svg
            className="ml-2 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default SectionShow;
