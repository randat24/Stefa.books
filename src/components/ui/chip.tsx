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
    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
    variant === 'button' && "cursor-pointer hover:scale-105",
    variant === 'status' && "border-2",
    className
  );

  const variantClasses = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    status: "border-2",
    button: cn(
      "border",
      active
        ? "bg-slate-900 text-white border-slate-900 shadow-md"
        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
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
          "text-xs rounded-full px-2 py-0.5 font-bold",
          variant === 'button' && active 
            ? "bg-white/20 text-white" 
            : "bg-slate-200 text-slate-600"
        )}>
          {count}
        </span>
      )}
    </Component>
  );
}
