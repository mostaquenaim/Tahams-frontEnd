import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PerfumeBox = ({
  treasureClicked,
  handleTreasureBox,
  isTreasureClicked,
}) => {
  // console.log(isTreasureClicked, 'isTreasureClicked');
  const [activePerfume, setActivePerfume] = useState(null);
  const router = useRouter();

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

  const handlePerfumeClick = (p) => {
    setActivePerfume(p);
    setTimeout(() => router.push(p.url), 1200); // navigate after animation
  };

  const handleClose = () => {
    handleTreasureBox();
  };

  return (
    <>
      {/* ✖ Close button */}
      {/* <button
        onClick={handleClose}
        className={`fixed top-6 right-6 text-black text-3xl w-14 h-14 font-bold z-[110] hover:text-black/60 transition-opacity bg-red-200 rounded-xl opacity-0 ${
          treasureClicked ? 'opacity-100' : 'opacity-0 '
        }`}
      >
        ×
      </button> */}
      <div className="inset-0 bg-black h-full w-full"></div>
      {/* TREASURE BOX */}
      <div
        className={`hidden md:block fixed z-50 bottom-4 right-4 ${
          !isTreasureClicked &&
          !treasureClicked &&
          'animate-zoomInOut hover:animate-none'
        }`}
      >
        <figure
          className={`w-20 h-20 transition-all duration-700 ease-in-out 
            ${
              treasureClicked ? 'scale-[5]' : 'hover:scale-110 hover:rotate-3'
            }`}
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
          {/* <div
            className={`absolute h-24 w-24 bg-yellow-100 rounded-full transition-all duration-1000`}
          ></div> */}
          {/* Glow Background */}
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
            className="absolute -mt-2 transition-opacity z-10 cursor-pointer opacity-100"
          />

          {/* Perfumes */}
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
                  transitionDelay: treasureClicked
                    ? `${i * 100 + 500}ms`
                    : '0ms',
                }}
              >
                <div
                  className={`absolute inset-0 rounded-full blur-lg transition-opacity duration-500
                    ${treasureClicked ? 'opacity-100' : 'opacity-0'} ${
                    p.color
                  }`}
                ></div>

                <div
                  onClick={() => handlePerfumeClick(p)}
                  className="relative block transition-all duration-300 hover:scale-125 hover:rotate-6 group cursor-pointer"
                >
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-300
                      ${
                        treasureClicked ? `${p.glow} shadow-xl` : 'shadow-none'
                      } group-hover:scale-110`}
                  ></div>

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
                </div>
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

      {/* FULLSCREEN PERFUME OVERLAY */}
      <AnimatePresence>
        {activePerfume && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
          >
            {/* Perfume image */}
            <motion.img
              key={activePerfume.src}
              src={activePerfume.src}
              alt={activePerfume.alt}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.2, opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="max-h-[80vh] w-auto drop-shadow-[0_0_60px_rgba(255,255,255,0.3)] rounded-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PerfumeBox;
