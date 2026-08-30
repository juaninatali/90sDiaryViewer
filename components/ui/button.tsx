import * as React from "react";
import { cn } from "@/lib/utils"; // Assuming you have a cn function

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"; // Accept "variant"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
          variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
