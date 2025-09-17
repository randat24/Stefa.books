"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check, AlertCircle } from "lucide-react"

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface AnimatedSelectProps {
  label: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export function AnimatedSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Оберіть опцію",
  error,
  disabled = false,
  required = false,
  className = ""
}: AnimatedSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const selectRef = useRef<HTMLDivElement | null | null>(null)

  const hasValue = value.length > 0
  const hasError = !!error
  const selectedOption = options.find(option => option.value === value)

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => {
    setIsFocused(false)
    // Delay closing to allow option selection
    setTimeout(() => setIsOpen(false), 150)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <motion.div
          ref={selectRef}
          tabIndex={disabled ? -1 : 0}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={handleToggle}
          className={`
            w-full px-4 pt-6 pb-2 border rounded-lg cursor-pointer transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${hasError 
              ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
              : isFocused
              ? "border-accent focus:ring-accent focus:border-accent"
              : "border-neutral-300 focus:ring-accent focus:border-accent"
            }
            ${disabled ? "bg-neutral-100 cursor-not-allowed" : "bg-white"}
          `}
          whileHover={!disabled ? { scale: 1.01 } : {}}
          whileTap={!disabled ? { scale: 0.99 } : {}}
        >
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
                : isFocused
                ? "text-accent"
                : "text-neutral-500"
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

          {/* Selected Value */}
          <div className="text-neutral-900">
            {selectedOption ? selectedOption.label : placeholder}
          </div>

          {/* Dropdown Icon */}
          <motion.div
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>

          {/* Error Icon */}
          {hasError && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
        </motion.div>

        {/* Dropdown Options */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {options.map((option, index) => (
                <motion.div
                  key={option.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  className={`
                    px-4 py-3 cursor-pointer transition-colors duration-150
                    flex items-center justify-between
                    ${option.disabled
                      ? "text-neutral-400 cursor-not-allowed"
                      : "hover:bg-neutral-50 text-neutral-900"
                    }
                    ${value === option.value ? "bg-accent/10" : ""}
                  `}
                  whileHover={!option.disabled ? {
                    backgroundColor: "rgba(0, 0, 0, 0.05)"
                  } : {}}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Check className="w-4 h-4 text-accent" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
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
