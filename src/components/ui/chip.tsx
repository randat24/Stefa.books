"use client";

import { cn } from "@/lib/cn";

interface ChipProps {
  active?: boolean;
  count?: number;
  variant?: 'default' | 'status' | 'button';
  as?: 'div' | 'button';
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Chip({
  active,
  count,
  children,
  className,
  variant = 'default',
  as = 'div',
  ...props
}: ChipProps) {
  const baseClasses = cn(
    "inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-body-sm font-medium transition-all duration-200",
    variant === 'button' && "cursor-pointer hover:scale-105",
    variant === 'status' && "border-2",
    className
  );

  const variantClasses = {
    default: "bg-gray-100 text-gray-700 border-gray-200",
    status: "border-2",
    button: cn(
      "border",
      active
        ? "bg-gray-900 text-white border-gray-900 shadow-md"
        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
    )
  };

  const Component = as === 'button' ? 'button' : 'div';

  return (
    <Component
      {...props}
      className={cn(baseClasses, variantClasses[variant])}
    >
      <span>{children}</span>
      {typeof count === "number" && (
        <span className={cn(
          "text-caption rounded-2xl px-2 py-0.5 font-bold",
          variant === 'button' && active 
            ? "bg-white/20 text-white" 
            : "bg-gray-200 text-gray-600"
        )}>
          {count}
        </span>
      )}
    </Component>
  );
}
