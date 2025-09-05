"use client"

import { motion } from "framer-motion"

interface PulseProps {
  children: React.ReactNode
  duration?: number
  scale?: number
  className?: string
}

export function Pulse({ 
  children, 
  duration = 2,
  scale = 1.1,
  className = ""
}: PulseProps) {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1],
        opacity: [1, 0.7, 1]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
