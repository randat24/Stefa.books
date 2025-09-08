'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  id: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
  required?: boolean;
  error?: string;
  helpText?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  disabled?: boolean;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

/**
 * Доступное поле формы с валидацией и ARIA атрибутами
 */
export function FormField({
  label,
  id,
  type = 'text',
  required = false,
  error,
  helpText,
  placeholder,
  value,
  onChange,
  onBlur,
  className = '',
  disabled = false,
  autoComplete,
  maxLength,
  minLength,
  pattern
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const showError = error && (hasInteracted || isFocused);
  const isValid = !error && hasInteracted && value.length > 0;

  const handleBlur = () => {
    setIsFocused(false);
    setHasInteracted(true);
    onBlur?.();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={id}
        className="block text-body-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="обов'язкове поле">
            *
          </span>
        )}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-colors duration-200
            ${showError 
              ? 'border-red-300 focus:ring-red-500' 
              : isValid 
                ? 'border-green-300 focus:ring-green-500'
                : 'border-gray-300'
            }
          `}
          aria-describedby={`
            ${error ? `${id}-error` : ''} 
            ${helpText ? `${id}-help` : ''}
          `.trim()}
          aria-invalid={showError ? 'true' : 'false'}
          aria-required={required}
        />
        
        {/* Иконка статуса */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {showError && (
            <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
          )}
          {isValid && (
            <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Сообщение об ошибке */}
      {showError && (
        <p 
          id={`${id}-error`}
          className="text-body-sm text-red-600 flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {/* Справка */}
      {helpText && !showError && (
        <p 
          id={`${id}-help`}
          className="text-body-sm text-gray-500"
        >
          {helpText}
        </p>
      )}
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  id: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  rows?: number;
}

/**
 * Доступное текстовое поле с валидацией
 */
export function TextAreaField({
  label,
  id,
  required = false,
  error,
  helpText,
  placeholder,
  value,
  onChange,
  onBlur,
  className = '',
  disabled = false,
  maxLength,
  minLength,
  rows = 4
}: TextAreaFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showError = error && (hasInteracted || isFocused);
  const isValid = !error && hasInteracted && value.length > 0;

  const handleBlur = () => {
    setIsFocused(false);
    setHasInteracted(true);
    onBlur?.();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={id}
        className="block text-body-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="обов'язкове поле">
            *
          </span>
        )}
      </label>
      
      <div className="relative">
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          rows={rows}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-colors duration-200 resize-vertical
            ${showError 
              ? 'border-red-300 focus:ring-red-500' 
              : isValid 
                ? 'border-green-300 focus:ring-green-500'
                : 'border-gray-300'
            }
          `}
          aria-describedby={`
            ${error ? `${id}-error` : ''} 
            ${helpText ? `${id}-help` : ''}
          `.trim()}
          aria-invalid={showError ? 'true' : 'false'}
          aria-required={required}
        />
        
        {/* Иконка статуса */}
        <div className="absolute top-2 right-2 flex items-center pointer-events-none">
          {showError && (
            <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
          )}
          {isValid && (
            <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Сообщение об ошибке */}
      {showError && (
        <p 
          id={`${id}-error`}
          className="text-body-sm text-red-600 flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {/* Справка */}
      {helpText && !showError && (
        <p 
          id={`${id}-help`}
          className="text-body-sm text-gray-500"
        >
          {helpText}
        </p>
      )}

      {/* Счетчик символов */}
      {maxLength && (
        <p className="text-caption text-gray-500 text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  id: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  disabled?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

/**
 * Доступное поле выбора с валидацией
 */
export function SelectField({
  label,
  id,
  required = false,
  error,
  helpText,
  value,
  onChange,
  onBlur,
  className = '',
  disabled = false,
  options,
  placeholder
}: SelectFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  const showError = error && (hasInteracted || isFocused);
  const isValid = !error && hasInteracted && value.length > 0;

  const handleBlur = () => {
    setIsFocused(false);
    setHasInteracted(true);
    onBlur?.();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={id}
        className="block text-body-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="обов'язкове поле">
            *
          </span>
        )}
      </label>
      
      <div className="relative">
        <select
          ref={selectRef}
          id={id}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-colors duration-200 appearance-none bg-white
            ${showError 
              ? 'border-red-300 focus:ring-red-500' 
              : isValid 
                ? 'border-green-300 focus:ring-green-500'
                : 'border-gray-300'
            }
          `}
          aria-describedby={`
            ${error ? `${id}-error` : ''} 
            ${helpText ? `${id}-help` : ''}
          `.trim()}
          aria-invalid={showError ? 'true' : 'false'}
          aria-required={required}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Стрелка вниз */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Сообщение об ошибке */}
      {showError && (
        <p 
          id={`${id}-error`}
          className="text-body-sm text-red-600 flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {/* Справка */}
      {helpText && !showError && (
        <p 
          id={`${id}-help`}
          className="text-body-sm text-gray-500"
        >
          {helpText}
        </p>
      )}
    </div>
  );
}
