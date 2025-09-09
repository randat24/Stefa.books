'use client'

import { memo, useCallback, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/cn'
import PerformanceButton from './PerformanceButton'

interface FormFieldProps {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'textarea' | 'select'
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: { value: string; label: string }[]
  className?: string
}

const FormField = memo(function FormField({
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  disabled = false,
  options = [],
  className = '',
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(e.target.value)
  }, [onChange])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    onBlur?.()
  }, [onBlur])

  const fieldId = `field-${name}`

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={fieldId}
        className={cn(
          'block text-body-sm font-medium text-neutral-700',
          error && 'text-red-600',
          disabled && 'text-neutral-400'
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          id={fieldId}
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={4}
          className={cn(
            'w-full px-3 py-2 border rounded-md shadow-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            error
              ? 'border-red-300 focus:ring-red-500'
              : isFocused
              ? 'border-blue-300'
              : 'border-neutral-300',
            disabled && 'bg-neutral-50 cursor-not-allowed'
          )}
        />
      ) : type === 'select' ? (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          id={fieldId}
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 border rounded-md shadow-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            error
              ? 'border-red-300 focus:ring-red-500'
              : isFocused
              ? 'border-blue-300'
              : 'border-neutral-300',
            disabled && 'bg-neutral-50 cursor-not-allowed'
          )}
        >
          <option value="">{placeholder || 'Оберіть опцію'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 border rounded-md shadow-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            error
              ? 'border-red-300 focus:ring-red-500'
              : isFocused
              ? 'border-blue-300'
              : 'border-neutral-300',
            disabled && 'bg-neutral-50 cursor-not-allowed'
          )}
        />
      )}

      {error && (
        <p className="text-body-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})

interface OptimizedFormProps {
  onSubmit: (data: Record<string, string>) => void
  fields: Omit<FormFieldProps, 'value' | 'onChange' | 'error'>[]
  initialValues?: Record<string, string>
  validation?: (data: Record<string, string>) => Record<string, string>
  submitText?: string
  loading?: boolean
  className?: string
}

const OptimizedForm = memo(function OptimizedForm({
  onSubmit,
  fields,
  initialValues = {},
  validation,
  submitText = 'Відправити',
  loading = false,
  className = '',
}: OptimizedFormProps) {
  const [values, setValues] = useState<Record<string, string>>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleFieldChange = useCallback((name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }, [errors])

  const handleFieldBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    // Валидация
    if (validation) {
      const validationErrors = validation(values)
      setErrors(validationErrors)
      
      if (Object.keys(validationErrors).length > 0) {
        return
      }
    }
    
    onSubmit(values)
  }, [values, validation, onSubmit])

  // Валидация в реальном времени
  useEffect(() => {
    if (validation && Object.keys(touched).length > 0) {
      const validationErrors = validation(values)
      setErrors(prev => {
        const newErrors = { ...prev }
        Object.keys(validationErrors).forEach(key => {
          if (touched[key]) {
            newErrors[key] = validationErrors[key]
          }
        })
        return newErrors
      })
    }
  }, [values, validation, touched])

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {fields.map((field) => (
        <FormField
          key={field.name}
          {...field}
          value={values[field.name] || ''}
          onChange={(value) => handleFieldChange(field.name, value)}
          onBlur={() => handleFieldBlur(field.name)}
          error={errors[field.name]}
        />
      ))}
      
      <PerformanceButton
        type="submit"
        loading={loading}
        disabled={loading}
        className="w-full"
      >
        {submitText}
      </PerformanceButton>
    </form>
  )
})

export default OptimizedForm
export { FormField }
