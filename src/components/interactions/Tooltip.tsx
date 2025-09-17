"use client"

import { useState, useRef , ReactNode } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"

interface TooltipProps {
  children: React.ReactNode
  content: string
  position?: "top" | "bottom" | "left" | "right"
  delay?: number
  className?: string
}

export function Tooltip({
  children,
  content,
  position = "top",
  delay = 500,
  className = ""
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement | null | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null | null | null>(null)

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        const scrollX = window.scrollX || window.pageXOffset
        const scrollY = window.scrollY || window.pageYOffset
        
        let x = rect.left + scrollX + rect.width / 2
        let y = rect.top + scrollY
        
        switch (position) {
          case "top":
            y -= 8
            break
          case "bottom":
            y += rect.height + 8
            break
          case "left":
            x = rect.left + scrollX - 8
            y += rect.height / 2
            break
          case "right":
            x = rect.right + scrollX + 8
            y += rect.height / 2
            break
        }
        
        setTooltipPosition({ x, y })
        setIsVisible(true)
      }
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const getTooltipClasses = () => {
    const baseClasses = "absolute z-50 px-3 py-2 text-body-sm text-neutral-0 bg-neutral-900 rounded-lg shadow-lg whitespace-nowrap"
    
    switch (position) {
      case "top":
        return `${baseClasses} -translate-x-1/2 -translate-y-full`
      case "bottom":
        return `${baseClasses} -translate-x-1/2`
      case "left":
        return `${baseClasses} -translate-x-full -translate-y-1/2`
      case "right":
        return `${baseClasses} -translate-y-1/2`
      default:
        return baseClasses
    }
  }

  const getArrowClasses = () => {
    const baseClasses = "absolute w-2 h-2 bg-neutral-900 transform rotate-45"
    
    switch (position) {
      case "top":
        return `${baseClasses} top-full left-1/2 -translate-x-1/2 -translate-y-1/2`
      case "bottom":
        return `${baseClasses} bottom-full left-1/2 -translate-x-1/2 translate-y-1/2`
      case "left":
        return `${baseClasses} left-full top-1/2 -translate-y-1/2 -translate-x-1/2`
      case "right":
        return `${baseClasses} right-full top-1/2 -translate-y-1/2 translate-x-1/2`
      default:
        return baseClasses
    }
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={className}
      >
        {children}
      </div>

      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className={getTooltipClasses()}
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y
              }}
            >
              {content}
              <div className={getArrowClasses()} />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
