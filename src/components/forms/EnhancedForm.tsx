"use client"

import { useState } from 'react'
import { 
  FormNotification, 
  FieldValidation, 
  AnimatedSubmitButton, 
  FormProgress,
  AnimatedCheckbox 
} from '@/components/animations'

interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox'
  required?: boolean
  validation?: (value: string) => string | null
  options?: { value: string; label: string }[]
}

interface EnhancedFormProps {
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => Promise<void>
  submitText?: string
  showProgress?: boolean
  className?: string
}

export function EnhancedForm({ 
  fields, 
  onSubmit, 
  submitText = "Відправити",
  showProgress = false,
  className = ""
}: EnhancedFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
  } | null>(null)
  const [currentStep] = useState(1)

  // Валидация поля
  const validateField = (name: string, value: string): string | null => {
    const field = fields.find(f => f.name === name)
    if (!field) return null

    if (field.required && !value.trim()) {
      return 'Це поле обов\'язкове'
    }

    if (field.validation) {
      return field.validation(value)
    }

    return null
  }

  // Обработка изменения поля
  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Валидация в реальном времени
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error || '' }))
  }

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Валидация всех полей
    const newErrors: Record<string, string> = {}
    fields.forEach(field => {
      const error = validateField(field.name, formData[field.name] || '')
      if (error) {
        newErrors[field.name] = error
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setNotification({
        type: 'error',
        message: 'Будь ласка, виправте помилки в формі'
      })
      return
    }

    setIsSubmitting(true)
    setNotification(null)

    try {
      await onSubmit(formData)
      setNotification({
        type: 'success',
        message: 'Форма успішно відправлена!'
      })
      setFormData({})
      setErrors({})
    } catch {
      setNotification({
        type: 'error',
        message: 'Помилка при відправці форми. Спробуйте ще раз.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Рендер поля
  const renderField = (field: FormField) => {
    const value = formData[field.name] || ''
    const error = errors[field.name]

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={4}
            />
            <FieldValidation 
              isValid={!error && value.length > 0}
              errorMessage={error}
              successMessage={value.length > 0 ? 'Поле заповнено' : undefined}
            />
          </div>
        )

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Оберіть опцію</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldValidation 
              isValid={!error && value.length > 0}
              errorMessage={error}
              successMessage={value.length > 0 ? 'Опція обрана' : undefined}
            />
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.name} className="space-y-2">
            <AnimatedCheckbox
              checked={value}
              onChange={(checked) => handleFieldChange(field.name, checked)}
              label={field.label}
            />
            <FieldValidation 
              isValid={!error}
              errorMessage={error}
            />
          </div>
        )

      default:
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <FieldValidation 
              isValid={!error && value.length > 0}
              errorMessage={error}
              successMessage={value.length > 0 ? 'Поле заповнено' : undefined}
            />
          </div>
        )
    }
  }

  return (
    <div className={className}>
      {showProgress && (
        <FormProgress 
          currentStep={currentStep} 
          totalSteps={fields.length} 
          className="mb-6"
        />
      )}

      {notification && (
        <FormNotification
          type={notification.type}
          message={notification.message}
          className="mb-6"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map(renderField)}

        <AnimatedSubmitButton
          isLoading={isSubmitting}
          className="w-full bg-brand-yellow text-brand hover:bg-brand-yellow-light font-medium py-3 px-6 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Відправка...' : submitText}
        </AnimatedSubmitButton>
      </form>
    </div>
  )
}
