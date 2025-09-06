"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface ShakeProps {
  children: React.ReactNode
  trigger?: boolean
  className?: string
}

export function Shake({ children, trigger = false, className = "" }: ShakeProps) {
  const [shouldShake, setShouldShake] = useState(false)

  useEffect(() => {
    if (trigger) {
      setShouldShake(true)
      const timer = setTimeout(() => setShouldShake(false), 600)
      return () => clearTimeout(timer)
    }
  }, [trigger])

  return (
    <motion.div
      animate={shouldShake ? {
        x: [-10, 10, -10, 10, -5, 5, 0],
        transition: { duration: 0.6, ease: "easeInOut" }
      } : {}}
      className={className}
    >
      {children}
    </motion.div>
  )
}
