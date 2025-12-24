import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// --- Utils ---
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// --- Components ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-95";

    const variants = {
      // Indigo/Purple for primary actions
      primary: "bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700",
      // Green/Emerald for secondary/positive actions
      secondary: "bg-secondary-500 text-white shadow-lg shadow-secondary-500/20 hover:bg-secondary-600",
      ghost: "text-text-muted hover:bg-white/5 hover:text-text",
      danger: "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600",
      outline: "border border-white/10 bg-transparent text-text-muted hover:bg-white/5 hover:text-text"
    };

    const sizes = {
      sm: "h-9 px-3 text-xs",
      md: "h-11 px-5 text-sm",
      lg: "h-14 px-8 text-base",
      icon: "h-11 w-11 p-0"
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-lg border border-white/10 bg-[#151620] px-4 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary-500 focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all",
            icon && "pl-11",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

// Card is now a simple container, animations can be added in the page.
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
      <div
        ref={ref}
        className={cn("rounded-2xl border border-white/10 bg-surface p-6 shadow-md", className)}
        {...props}
      >
        {children}
      </div>
    )
);


export const Badge: React.FC<{ children: React.ReactNode, variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger', className?: string }> = ({ children, variant = 'default', className }) => {
  const styles = {
    default: "bg-slate-700/80 text-slate-300 border-slate-600/50",
    primary: "bg-primary-500/10 text-primary-400 border-primary-500/20",
    success: "bg-secondary-500/10 text-secondary-400 border-secondary-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold", styles[variant], className)}>
      {children}
    </span>
  );
};