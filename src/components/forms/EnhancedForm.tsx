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
            <label className="block text-body-sm font-medium text-neutral-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                error ? 'border-red-300' : 'border-neutral-300'
              }`}
              rows={4}
            />
            <FieldValidation className="text-sm">
              {error && <span className="text-red-500">{error}</span>}
              {!error && value.length > 0 && <span className="text-green-500">Поле заповнено</span>}
            </FieldValidation>
          </div>
        )

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-body-sm font-medium text-neutral-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                error ? 'border-red-300' : 'border-neutral-300'
              }`}
            >
              <option value="">Оберіть опцію</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldValidation className="text-sm">
              {error && <span className="text-red-500">{error}</span>}
              {!error && value.length > 0 && <span className="text-green-500">Опція обрана</span>}
            </FieldValidation>
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.name} className="space-y-2">
            <AnimatedCheckbox
              checked={value}
              onChange={(checked: boolean) => handleFieldChange(field.name, checked)}
              label={field.label}
            />
            <FieldValidation className="text-sm">
              {error && <span className="text-red-500">{error}</span>}
            </FieldValidation>
          </div>
        )

      default:
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-body-sm font-medium text-neutral-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent ${
                error ? 'border-red-300' : 'border-neutral-300'
              }`}
            />
            <FieldValidation className="text-sm">
              {error && <span className="text-red-500">{error}</span>}
              {!error && value.length > 0 && <span className="text-green-500">Поле заповнено</span>}
            </FieldValidation>
          </div>
        )
    }
  }

  return (
    <div className={className}>
      {showProgress && (
        <FormProgress 
          progress={(currentStep / fields.length) * 100}
          className="mb-6"
        />
      )}

      {notification && (
        <FormNotification className="mb-6">
          <div className={`p-3 rounded ${
            notification.type === 'error' ? 'bg-red-100 text-red-700' :
            notification.type === 'success' ? 'bg-green-100 text-green-700' :
            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {notification.message}
          </div>
        </FormNotification>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map(renderField)}

        <AnimatedSubmitButton
          className="w-full bg-accent text-brand hover:bg-accent-light font-medium py-3 px-6 rounded-lg transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Відправка...' : submitText}
        </AnimatedSubmitButton>
      </form>
    </div>
  )
}
