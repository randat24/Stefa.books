import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const button = cva(
  // базовые гарантии стабильности
  "inline-flex select-none items-center justify-center whitespace-nowrap " +
    "rounded-full font-semibold " +
    "leading-[1.1] h-12 px-6 " +                       // фиксируем line-height + высоту
    "transition-all duration-200 ease-out active:scale-[.98] shadow-md hover:shadow-lg " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none " +
    "antialiased",                                     // сглаживание текста

  {
    variants: {
      variant: {
        primary:
          "bg-yellow-500 text-slate-900 hover:bg-yellow-400",
        outline:
          "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-slate-300",
        ghost:
          "bg-transparent text-slate-900 hover:bg-slate-50",
        dark:
          "bg-slate-900 text-white hover:bg-slate-800"
      },
      size: {
        md: "h-11 px-5 text-[15px]",
        lg: "h-12 px-6 text-[16px]",                   // по умолчанию
        xl: "h-[52px] px-7 text-[17px]"
      },
      full: {
        true: "w-full",
        false: ""
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
      full: false
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  full,
  asChild,
  children,
  ...props
}: ButtonProps) {
  const buttonClasses = twMerge(button({ variant, size, full }), className);
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...props,
      className: twMerge(buttonClasses, (children as React.ReactElement<any>).props.className)
    });
  }
  
  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
}
