import Link from 'next/link';
import React from 'react';

const PerfumeBox = ({ treasureClicked, handleTreasureBox }) => {
  const perfumes = [
    {
      src: '/perfumes/212-vip.png',
      alt: '212 vip',
      offset: '-translate-x-12',
      color: 'bg-yellow-400/40',
      url: '/products/84',
    },
    {
      src: '/perfumes/bleu-de-chanel.png',
      alt: 'bleu-de-chanel',
      offset: '-translate-x-8',
      color: 'bg-blue-400/40',
      url: '/products/81',
    },
    {
      src: '/perfumes/cool-water.png',
      alt: 'cool-water',
      offset: '-translate-x-4',
      color: 'bg-cyan-400/40',
      url: '/products/83',
    },
    {
      src: '/perfumes/ehsas-al-arab.png',
      alt: 'ehsas-al-arab',
      offset: 'translate-x-0',
      color: 'bg-emerald-400/40',
      url: '/products/79',
    },
    {
      src: '/perfumes/hugo-boss.png',
      alt: 'hugo-boss',
      offset: 'translate-x-4',
      color: 'bg-red-400/40',
      url: '/products/80',
    },
    {
      src: '/perfumes/vampire-blood.png',
      alt: 'vampire-blood',
      offset: 'translate-x-8',
      color: 'bg-purple-400/40',
      url: '/products/87',
    },
    {
      src: '/perfumes/versace.png',
      alt: 'versace',
      offset: 'translate-x-12',
      color: 'bg-pink-400/40',
      url: '/products/86',
    },
  ];

  return (
    <figure
      className={`w-20 h-20 fixed z-50 transition-all duration-700 ease-in-out 
    ${
      treasureClicked
        ? 'bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 scale-[5]'
        : 'bottom-4 right-4 translate-x-0 translate-y-0'
    }`}
    >
      <div className="absolute inset-0 rounded-full blur-xl bg-yellow-400/40 animate-pulse"></div>

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
            className={`absolute transition-all hover:scale-105 duration-500 z-[15] h-10 ml-${
              i * 2
            }`}
          >
            {/* Perfume image */}
            <Link href={p?.url} className="relative transition-all z-[15] ">
              <img
                src={p.src}
                alt={p.alt}
                className={`h-10
                ${
                  treasureClicked
                    ? `opacity-100 delay-1000 duration-[0.${
                        i + 1
                      }s] -translate-y-12 ${p.offset}`
                    : 'opacity-100 -translate-y-2'
                }`}
              />
              {/* Colored glow behind each perfume */}
              {/* <div
                className={`absolute inset-0 blur-md rounded-full ${p.color} animate-pulse ${
                  treasureClicked
                    ? `opacity-100 delay-1000 duration-[0.${
                        i + 1
                      }s] -translate-y-12 ${p.offset}`
                    : 'opacity-0 -translate-y-2'
                }`}
                style={{ zIndex: 5 }}
              ></div> */}
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
  );
};

export default PerfumeBox;
