"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"

interface AnimatedInputProps {
  label: string
  type?: "text" | "email" | "password" | "number" | "tel"
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  success?: boolean
  disabled?: boolean
  required?: boolean
  className?: string
  autoComplete?: string
}

export function AnimatedInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  success = false,
  disabled = false,
  required = false,
  className = "",
  autoComplete
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isPassword = type === "password"
  const inputType = isPassword && showPassword ? "text" : type
  const hasValue = value.length > 0
  const hasError = !!error
  const isSuccess = success && !hasError

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
    inputRef.current?.focus()
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <motion.input
          ref={inputRef}
          type={inputType}
          placeholder={isFocused || hasValue ? placeholder : ""}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={`
            w-full px-4 pt-6 pb-2 border rounded-lg transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${hasError 
              ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
              : isSuccess
              ? "border-green-300 focus:ring-green-500 focus:border-green-500"
              : isFocused
              ? "border-brand-yellow focus:ring-brand-yellow focus:border-brand-yellow"
              : "border-gray-300 focus:ring-brand-yellow focus:border-brand-yellow"
            }
            ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
          `}
        />

        {/* Floating Label */}
        <motion.label
          className={`
            absolute left-4 transition-all duration-200 pointer-events-none
            ${isFocused || hasValue
              ? "top-2 text-caption font-medium"
              : "top-1/2 -translate-y-1/2 text-base"
            }
            ${hasError 
              ? "text-red-600" 
              : isSuccess
              ? "text-green-600"
              : isFocused
              ? "text-brand-yellow"
              : "text-gray-500"
            }
          `}
          animate={{
            y: isFocused || hasValue ? -8 : 0,
            scale: isFocused || hasValue ? 0.85 : 1
          }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </motion.label>

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Status Icons */}
        <AnimatePresence>
          {(hasError || isSuccess) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {hasError ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 flex items-center gap-2 text-body-sm text-red-600"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
