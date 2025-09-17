'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || React.useId()

    return (
      <div className="flex items-center space-x-2">
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            id={checkboxId}
            className={cn(
              "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
              className
            )}
            {...props}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-current opacity-0 peer-checked:opacity-100">
            <Check className="h-3 w-3" />
          </div>
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
export default Checkbox