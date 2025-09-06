"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface AnimatedButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  className?: string
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
}

export function AnimatedButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  className = "",
  icon,
  iconPosition = "left"
}: AnimatedButtonProps) {
  const baseClasses = `
    relative inline-flex items-center justify-center font-semibold rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? "w-full" : ""}
  `

  const variantClasses = {
    primary: `
      bg-brand-yellow text-brand hover:bg-brand-yellow-light
      focus:ring-brand-yellow shadow-md hover:shadow-lg
    `,
    secondary: `
      bg-gray-100 text-gray-900 hover:bg-gray-200
      focus:ring-gray-500 shadow-sm hover:shadow-md
    `,
    outline: `
      border border-gray-300 bg-white text-gray-700 hover:bg-gray-50
      focus:ring-brand-yellow hover:border-brand-yellow
    `,
    ghost: `
      text-gray-700 hover:bg-gray-100 focus:ring-gray-500
    `,
    destructive: `
      bg-red-600 text-white hover:bg-red-700
      focus:ring-red-500 shadow-md hover:shadow-lg
    `
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm h-8",
    md: "px-4 py-2 text-base h-10",
    lg: "px-6 py-3 text-lg h-12"
  }

  const isDisabled = disabled || loading

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      whileHover={!isDisabled ? {
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={!isDisabled ? {
        scale: 0.98,
        transition: { duration: 0.1 }
      } : {}}
      whileFocus={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      {/* Loading Spinner */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        className={`flex items-center gap-2 ${loading ? "opacity-0" : "opacity-100"}`}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {icon && iconPosition === "left" && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {icon}
          </motion.span>
        )}
        
        <span>{children}</span>
        
        {icon && iconPosition === "right" && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {icon}
          </motion.span>
        )}
      </motion.div>

      {/* Ripple Effect */}
      <motion.div
        className="absolute inset-0 rounded-lg overflow-hidden"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{
          scale: 1,
          opacity: [0, 0.1, 0],
          transition: { duration: 0.3 }
        }}
      >
        <div className="w-full h-full bg-white/20" />
      </motion.div>
    </motion.button>
  )
}
