// components/HeroCarousel.tsx
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade, A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function SwiperGPT({
  images,
  ctaHref = "/customize-tee",
  ctaLabel = "Customize Now",
  title = "Design Your Identity",
  subtitle = "Customize premium tees with your style — bold, unique, and made for you."
}) {

  // Normalize slides whether array is strings or objects
  const slides = useMemo(
    () =>
      images.map((i, idx) =>
        typeof i === "string"
          ? { src: i, alt: `Banner ${idx + 1}` }
          : { ...i, alt: i.alt || `Banner ${idx + 1}` }
      ),
    [images]
  );

  return (
    <section aria-label="Promotional banner" className="relative">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade, A11y, Keyboard]}
        effect="fade"
        speed={900}
        loop
        keyboard={{ enabled: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        className="group/hero"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full">
              {/* Background image with responsive aspect & Ken Burns effect */}
              <div className="relative w-full overflow-hidden">
                <img
                  src={slide.src.startsWith("/") ? slide.src : `/${slide.src}`}
                  alt={slide.alt}
                  className="w-full object-cover h-[58vh] sm:h-[64vh] lg:h-[72vh] 2xl:h-[76vh] 
                             scale-105 will-change-transform animate-[kenburns_12s_ease-in-out_infinite]"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                />
                {/* Dark gradient overlay with subtle vignette */}
                <div className="absolute inset-0 
                                bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-black/10" />
              </div>

              {/* Content */}
              <div className="absolute inset-0">
                <div className="mx-auto flex h-full max-w-7xl items-end px-4 sm:px-6 lg:px-8">
                  <div className="mb-10 w-full md:max-w-xl lg:max-w-2xl">
                    {/* Badge (optional) */}
                    {(slide.badge ?? "New") && (
                      <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-md ring-1 ring-white/20">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {slide.badge ?? "New collection"}
                      </span>
                    )}

                    {/* Headline */}
                    <h2 className="text-3xl/tight sm:text-5xl/tight lg:text-6xl/tight font-extrabold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
                      {slide.title || title}
                    </h2>

                    {/* Subheadline */}
                    <p className="mt-3 text-sm sm:text-base lg:text-lg text-white/85 max-w-prose">
                      {slide.subtitle || subtitle}
                    </p>

                    {/* CTA row */}
                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
                      <Link
                        href={ctaHref}
                        className="relative inline-flex items-center justify-center rounded-xl
                                   bg-gradient-to-r from-blue-600 to-indigo-700 
                                   px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20
                                   transition-all duration-300 hover:from-blue-500 hover:to-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400"
                        aria-label={ctaLabel}
                      >
                        {/* Shine effect */}
                        <span className="absolute inset-0 overflow-hidden rounded-xl">
                          <span className="absolute -inset-y-12 -left-12 w-10 rotate-12 bg-white/25 blur-md transition-all duration-700 ease-out group-hover/hero:translate-x-[140%]" />
                        </span>

                        <span className="relative flex items-center gap-2">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          {ctaLabel}
                        </span>
                      </Link>

                      {/* Secondary link */}
                      <Link
                        href="/gallery"
                        className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
                      >
                        View Gallery
                        <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>

                    {/* Trust row */}
                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/70">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400"></span> 100% Cotton
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-sky-400"></span> Eco-friendly inks
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-violet-400"></span> Made in BD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Local styles for Swiper UI polish */}
      <style jsx global>{`
        /* Ken Burns */
        @keyframes kenburns {
          0%   { transform: scale(1.08) translate3d(0, 0, 0); }
          50%  { transform: scale(1.12) translate3d(0, 0, 0); }
          100% { transform: scale(1.08) translate3d(0, 0, 0); }
        }
        /* Navigation buttons */
        .swiper-button-next, .swiper-button-prev {
          color: white;
          width: 42px;
          height: 42px;
          border-radius: 9999px;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(6px);
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .swiper-button-next:hover, .swiper-button-prev:hover {
          background: rgba(0,0,0,0.55);
          transform: scale(1.04);
        }
        .swiper-button-next:after, .swiper-button-prev:after {
          font-size: 16px;
          font-weight: 800;
        }
        /* Pagination bullets */
        .swiper-pagination-bullet {
          background: rgba(255,255,255,0.5);
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: #ffffff;
          transform: scale(1.15);
        }
      `}</style>
    </section>
  );
}
