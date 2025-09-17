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
    "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-2xl text-body-sm font-medium transition-all duration-200",
    variant === 'button' && "cursor-pointer hover:scale-105",
    variant === 'status' && "border-2",
    className
  );

  const variantClasses = {
    default: "bg-neutral-100 text-neutral-700 border-neutral-200",
    status: "bg-neutral-100 text-neutral-700",
    button: active
      ? "bg-neutral-900 text-neutral-0 border border-neutral-900 shadow-md"
      : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
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
            ? "bg-white/20 text-neutral-0" 
            : "bg-neutral-200 text-neutral-600"
        )}>
          {count}
        </span>
      )}
    </Component>
  );
}
