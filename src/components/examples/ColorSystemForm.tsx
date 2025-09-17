'use client';

import React, { useState } from 'react';

interface FormFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function FormField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg transition-colors
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error 
            ? 'border-error focus:ring-error-500' 
            : 'border-neutral-200 focus:ring-brand-500'
          }
          ${disabled ? 'bg-neutral-100' : 'bg-white'}
        `}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg transition-colors
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error 
            ? 'border-error focus:ring-error-500' 
            : 'border-neutral-200 focus:ring-brand-500'
          }
          ${disabled ? 'bg-neutral-100' : 'bg-white'}
        `}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

export function TextAreaField({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  rows = 4
}: TextAreaFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        disabled={disabled}
        rows={rows}
        className={`
          w-full px-3 py-2 border rounded-lg transition-colors resize-vertical
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error 
            ? 'border-error focus:ring-error-500' 
            : 'border-neutral-200 focus:ring-brand-500'
          }
          ${disabled ? 'bg-neutral-100' : 'bg-white'}
        `}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
}

// Example usage component
export function FormExamples() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      alert('Form submitted successfully!');
    }
  };
  
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-neutral-900 text-xl font-semibold">Form Examples</h2>
      
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Full Name"
              value={formData.name}
              onChange={(value) => setFormData({...formData, name: value})}
              error={errors.name}
              required
              placeholder="Enter your full name"
            />
            
            <FormField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({...formData, email: value})}
              error={errors.email}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(value) => setFormData({...formData, phone: value})}
              placeholder="Enter your phone number"
            />
            
            <SelectField
              label="Category"
              value={formData.category}
              onChange={(value) => setFormData({...formData, category: value})}
              error={errors.category}
              required
              options={[
                { value: '', label: 'Select a category' },
                { value: 'general', label: 'General Inquiry' },
                { value: 'support', label: 'Technical Support' },
                { value: 'billing', label: 'Billing Question' },
                { value: 'feedback', label: 'Feedback' }
              ]}
            />
          </div>
          
          <TextAreaField
            label="Message"
            value={formData.message}
            onChange={(value) => setFormData({...formData, message: value})}
            placeholder="Enter your message here..."
            rows={4}
          />
          
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-brand text-neutral-0 px-6 py-2 rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
            >
              Submit
            </button>
            <button
              type="button"
              className="bg-white text-neutral-900 border border-neutral-300 px-6 py-2 rounded-lg hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      
      {/* Form States */}
      <div>
        <h3 className="text-neutral-700 text-lg font-medium mb-4">Form States</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Normal State */}
          <div>
            <h4 className="text-neutral-600 text-sm font-medium mb-2">Normal State</h4>
            <FormField
              label="Normal Input"
              value=""
              onChange={() => {}}
              placeholder="Normal input field"
            />
          </div>
          
          {/* Error State */}
          <div>
            <h4 className="text-neutral-600 text-sm font-medium mb-2">Error State</h4>
            <FormField
              label="Error Input"
              value=""
              onChange={() => {}}
              error="This field is required"
              placeholder="Input with error"
            />
          </div>
          
          {/* Disabled State */}
          <div>
            <h4 className="text-neutral-600 text-sm font-medium mb-2">Disabled State</h4>
            <FormField
              label="Disabled Input"
              value="Disabled value"
              onChange={() => {}}
              disabled
              placeholder="Disabled input field"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
