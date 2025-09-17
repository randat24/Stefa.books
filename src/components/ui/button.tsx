import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] font-semibold transition-[box-shadow,transform] active:translate-y-px",
  {
    variants: {
      variant: {
        default:   "bg-[var(--brand)] text-[#111827] border-0 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:bg-[var(--brand-600)]",
        primary:   "bg-[var(--brand)] text-[#111827] border-0 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:bg-[var(--brand-600)]",
        secondary: "bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] shadow-[var(--shadow-sm)] hover:bg-[var(--surface-2)]",
        outline:   "bg-transparent text-[var(--brand)] border border-[var(--brand)] hover:bg-[var(--brand)] hover:text-[#111827]",
        ghost:     "bg-transparent text-[var(--text)] hover:bg-[var(--surface-2)]",
        dark:      "bg-gray-900 text-white hover:bg-gray-800",
        destructive: "bg-[var(--error)] text-white hover:bg-[var(--error)]/90",
        link: "text-[var(--brand)] hover:text-[var(--brand-600)]" },
      size: {
        sm: "py-[10px] px-[14px] text-sm",
        md: "py-[12px] px-[16px] text-base",
        lg: "py-[14px] px-[18px] text-lg",
        xl: "py-[16px] px-[22px] text-[clamp(1rem,0.9rem+0.6vw,1.125rem)]",
        icon: "h-10 w-10" }
    },
    defaultVariants: { 
      variant: "default", 
      size: "md" 
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  title?: string;
}

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(function Button({ className, variant, size, asChild = false, ...props }, ref) {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

export { Button, buttonVariants };