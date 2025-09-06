"use client"

import { motion } from "framer-motion"

interface HoverScaleProps {
  children: React.ReactNode
  scale?: number
  duration?: number
  className?: string
  onClick?: () => void
}

export function HoverScale({ 
  children, 
  scale = 1.05, 
  duration = 0.2,
  className = "",
  onClick
}: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ 
        scale,
        transition: { duration, ease: "easeOut" }
      }}
      whileTap={{ 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
