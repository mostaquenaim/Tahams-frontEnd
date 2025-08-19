'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const AnimatedCustomizeButton = () => {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const handleClick = () => {
    if (!isLoading) {
      setIsLoading(true)
      
      // Simulate loading process
      setTimeout(() => {
        setCompleted(true)
      }, 1500)
      
      // Reset after completion
      setTimeout(() => {
        setIsLoading(false)
        setCompleted(false)
      }, 2500)
    }
  }

  return (
    <div className="relative flex justify-center items-center mt-8">
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Circular progress background */}
        <motion.div
          className="absolute -inset-2 rounded-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isHovered || isLoading ? 0.6 : 0,
            scale: isHovered || isLoading ? 1 : 0.8
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Animated progress circle */}
        <svg 
          className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)]" 
          viewBox="0 0 100 100"
        >
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            stroke="#16a34a"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="251.2"
            strokeDashoffset="251.2"
            animate={{ 
              strokeDashoffset: completed ? 0 : 251.2,
              opacity: isLoading ? 1 : 0
            }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        </svg>
        
        {/* Button */}
        <Link href={'/customize-tee'} onClick={handleClick}>
          <motion.div
            className="btn btn-md bg-black/80 text-white hover:bg-black relative overflow-hidden"
            animate={{
              backgroundColor: completed ? '#16a34a' : 'rgba(0, 0, 0, 0.8)'
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.span
              animate={{ 
                opacity: isLoading ? 0 : 1,
                y: isLoading ? 10 : 0
              }}
            >
              Customize
            </motion.span>
            
            <motion.span
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ 
                opacity: isLoading ? 1 : 0,
                y: isLoading ? 0 : -10
              }}
            >
              Ready!
            </motion.span>
          </motion.div>
        </Link>
      </motion.div>
    </div>
  )
}

export default AnimatedCustomizeButton