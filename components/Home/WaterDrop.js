import React, { useState, useEffect, useCallback } from 'react';

const WaterDropEffect = () => {
  const [drops, setDrops] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [ripples, setRipples] = useState([]);

  const generateDrop = useCallback(() => {
    const id = Date.now() + Math.random();
    const startX = Math.random() * 100;
    const size = Math.random() * 20 + 15;
    const animationDuration = Math.random() * 2000 + 3000;
    
    return {
      id,
      x: startX,
      y: -10,
      size,
      animationDuration,
      opacity: Math.random() * 0.3 + 0.7,
    };
  }, []);

  const createRipple = useCallback((x, y) => {
    const rippleId = Date.now() + Math.random();
    const newRipple = {
      id: rippleId,
      x,
      y,
      scale: 0,
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 800);
  }, []);

  const handleDropComplete = useCallback((drop) => {
    // Create ripple effect at drop position
    createRipple(drop.x, 95);
    
    // Remove the drop
    setDrops(prev => prev.filter(d => d.id !== drop.id));
  }, [createRipple]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        const newDrop = generateDrop();
        setDrops(prev => [...prev, newDrop]);
        
        // Auto-remove drop after animation completes
        setTimeout(() => {
          handleDropComplete(newDrop);
        }, newDrop.animationDuration);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [isActive, generateDrop, handleDropComplete]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    createRipple(x, y);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-blue-800 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">

        {/* Water Container */}
        <div 
          className="relative w-full h-96 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 rounded-xl overflow-hidden cursor-pointer shadow-2xl"
          onClick={handleClick}
          style={{
            boxShadow: 'inset 0 -20px 40px rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.4)'
          }}
        >
          {/* Water surface shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" 
               style={{ 
                 background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                 animation: 'shimmer 3s ease-in-out infinite'
               }} />
          
          {/* Drops */}
          {drops.map((drop) => (
            <div
              key={drop.id}
              className="absolute rounded-full bg-gradient-to-b from-blue-200 to-blue-300 shadow-lg"
              style={{
                left: `${drop.x}%`,
                width: `${drop.size}px`,
                height: `${drop.size}px`,
                opacity: drop.opacity,
                transform: 'translateX(-50%)',
                animation: `fall ${drop.animationDuration}ms linear`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            />
          ))}

          {/* Ripples */}
          {ripples.map((ripple) => (
            <div
              key={ripple.id}
              className="absolute border-2 border-white rounded-full pointer-events-none"
              style={{
                left: `${ripple.x}%`,
                top: `${ripple.y}%`,
                width: '40px',
                height: '40px',
                transform: 'translate(-50%, -50%)',
                animation: 'ripple 800ms ease-out',
                borderColor: 'rgba(255,255,255,0.6)'
              }}
            />
          ))}

          {/* Additional ripple rings */}
          {ripples.map((ripple) => (
            <div
              key={`${ripple.id}-2`}
              className="absolute border border-white rounded-full pointer-events-none"
              style={{
                left: `${ripple.x}%`,
                top: `${ripple.y}%`,
                width: '60px',
                height: '60px',
                transform: 'translate(-50%, -50%)',
                animation: 'ripple 1000ms ease-out 100ms',
                borderColor: 'rgba(255,255,255,0.3)'
              }}
            />
          ))}

          {/* Water depth gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-700 to-transparent opacity-60" />
        </div>

        {/* Statistics */}
        <div className="mt-6 text-center text-blue-200">
          <p>Active Drops: {drops.length} | Active Ripples: {ripples.length}</p>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fall {
          0% {
            top: -20px;
            transform: translateX(-50%) scaleY(1.2);
          }
          70% {
            transform: translateX(-50%) scaleY(1.2);
          }
          90% {
            top: 95%;
            transform: translateX(-50%) scaleY(0.8) scaleX(1.1);
          }
          100% {
            top: 95%;
            transform: translateX(-50%) scaleY(0.6) scaleX(1.2);
            opacity: 0;
          }
        }

        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          70% {
            opacity: 0.4;
          }
          100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default WaterDropEffect;