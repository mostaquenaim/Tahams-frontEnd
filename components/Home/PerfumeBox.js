import Link from 'next/link';
import React from 'react';

const PerfumeBox = ({ treasureClicked, handleTreasureBox }) => {
  const perfumes = [
    {
      src: '/perfumes/212-vip.png',
      alt: '212 vip',
      offset: '-translate-x-[44px]',
      color: 'bg-cyan-400/40',
      glow: 'shadow-cyan-400/50',
      url: '/products/84',
    },
    {
      src: '/perfumes/bleu-de-chanel.png',
      alt: 'bleu-de-chanel',
      offset: '-translate-x-[20px]',
      color: 'bg-blue-400/40',
      glow: 'shadow-blue-400/50',
      url: '/products/81',
    },
    {
      src: '/perfumes/cool-water.png',
      alt: 'cool-water',
      offset: 'translate-x-[4px]',
      color: 'bg-slate-400/40',
      glow: 'shadow-slate-400/50',
      url: '/products/83',
    },
    {
      src: '/perfumes/ehsas-al-arab.png',
      alt: 'ehsas-al-arab',
      offset: 'translate-x-[28px]',
      color: 'bg-yellow-400/40',
      glow: 'shadow-yellow-400/50',
      url: '/products/79',
    },
    {
      src: '/perfumes/hugo-boss.png',
      alt: 'hugo-boss',
      offset: 'translate-x-[52px]',
      color: 'bg-sky-400/40',
      glow: 'shadow-sky-400/50',
      url: '/products/80',
    },
    {
      src: '/perfumes/vampire-blood.png',
      alt: 'vampire-blood',
      offset: 'translate-x-[76px]',
      color: 'bg-red-400/40',
      glow: 'shadow-red-400/50',
      url: '/products/87',
    },
    {
      src: '/perfumes/versace.png',
      alt: 'versace',
      offset: 'translate-x-[100px]',
      color: 'bg-yellow-400/40',
      glow: 'shadow-yellow-400/50',
      url: '/products/86',
    },
  ];

  return (
    <div className="hidden md:block fixed z-50 bottom-4 right-4">
      <figure
        className={`w-20 h-20 transition-all duration-700 ease-in-out 
          ${treasureClicked ? 'scale-[5]' : 'hover:scale-110 hover:rotate-3'}`}
        style={{
          transform: treasureClicked
            ? 'translate(-50%, -50%) scale(5)'
            : 'none',
          position: treasureClicked ? 'fixed' : 'relative',
          top: treasureClicked ? '50%' : 'auto',
          left: treasureClicked ? '50%' : 'auto',
          right: treasureClicked ? 'auto' : '1rem',
          bottom: treasureClicked ? 'auto' : '1rem',
        }}
      >
        {/* Enhanced Background Glow */}
        <div
          className={`absolute inset-0 rounded-2xl blur-2xl transition-all duration-1000
          ${
            treasureClicked
              ? 'bg-yellow-400 scale-150'
              : 'bg-gradient-to-br from-yellow-400/20 to-amber-600/20 animate-pulse'
          }`}
        ></div>

        {/* TOP IMAGE */}
        <img
          onClick={handleTreasureBox}
          src="/treasure/treasure-cover.png"
          alt="Treasure Cover"
          className={`translate-y-6 origin-bottom transition-transform duration-700 ease-in-out scale-[1.2] z-30 relative cursor-pointer
            ${
              treasureClicked
                ? 'delay-300 duration-1000 rotate-[-180deg]'
                : 'rotate-0'
            }
          `}
        />

        {/* MIDDLE IMAGE */}
        <img
          onClick={handleTreasureBox}
          src="/treasure/tbox-3d part.png"
          alt="Treasure Glow"
          className={`absolute -mt-2 transition-opacity z-10 cursor-pointer ${
            !treasureClicked ? 'opacity-100' : 'opacity-100'
          }`}
        />

        {/* Perfumes with colored glow */}
        <div className="flex gap-2">
          {perfumes.map((p, i) => (
            <div
              key={p.alt}
              className={`absolute transition-all duration-700 ease-out
                  ${
                    treasureClicked
                      ? `opacity-100 ${p.offset} -translate-y-16`
                      : 'opacity-0 -translate-y-2'
                  }`}
              style={{
                transitionDelay: treasureClicked ? `${i * 100 + 500}ms` : '0ms',
              }}
            >
              {/* Individual Perfume Glow */}
              <div
                className={`absolute inset-0 rounded-full blur-lg transition-opacity duration-500
                  ${treasureClicked ? 'opacity-100' : 'opacity-0'} ${p.color}`}
              ></div>

              <Link
                href={p.url}
                className="relative block transition-all duration-300 hover:scale-125 hover:rotate-6 group"
              >
                {/* Enhanced Perfume Shadow */}
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-300
                    ${
                      treasureClicked ? `${p.glow} shadow-xl` : 'shadow-none'
                    } group-hover:scale-110`}
                ></div>

                {/* FIXED: Simplified image transitions */}
                <img
                  src={p.src}
                  alt={p.alt}
                  className={`h-10 relative z-10 transition-all duration-500
                    ${
                      treasureClicked
                        ? 'drop-shadow-2xl translate-y-0'
                        : 'drop-shadow-md translate-y-1'
                    } 
                    group-hover:drop-shadow-2xl`}
                />
              </Link>
            </div>
          ))}
        </div>

        {/* BOTTOM IMAGE */}
        <img
          onClick={handleTreasureBox}
          src="/treasure/tbox-2d.png"
          alt="Treasure Box Base"
          className="z-20 relative cursor-pointer"
        />
      </figure>
    </div>
  );
};

export default PerfumeBox;
