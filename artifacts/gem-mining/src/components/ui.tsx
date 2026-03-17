import React from "react";
import { cn } from "@/lib/utils";

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' }>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg px-5 py-2.5 font-display font-bold tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
          variant === 'default' && "bg-gradient-to-r from-primary to-amber-600 text-primary-foreground shadow-[0_0_15px_rgba(251,191,36,0.25)] hover:shadow-[0_0_25px_rgba(251,191,36,0.45)] border border-amber-300/50 hover:-translate-y-0.5",
          variant === 'outline' && "border-2 border-primary/50 text-primary hover:bg-primary/10 shadow-[0_0_10px_rgba(251,191,36,0.1)] hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:border-primary",
          variant === 'ghost' && "text-foreground hover:bg-primary/10 hover:text-primary",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex w-full rounded-lg border border-primary/30 bg-input/50 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition-all shadow-inner",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export function Card({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn("glass-panel rounded-2xl", className)}>{children}</div>;
}

export function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block text-sm font-semibold text-primary/90 mb-1.5", className)} {...props}>{children}</label>;
}

export function Badge({ className, children, variant = 'default' }: { className?: string, children: React.ReactNode, variant?: 'default' | 'success' | 'destructive' | 'warning' }) {
  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-bold border backdrop-blur-sm",
      variant === 'default' && "bg-primary/10 text-primary border-primary/30",
      variant === 'success' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      variant === 'destructive' && "bg-red-500/10 text-red-400 border-red-500/30",
      variant === 'warning' && "bg-amber-500/10 text-amber-400 border-amber-500/30",
      className
    )}>
      {children}
    </span>
  );
}
