import React from "react";
import { cn } from "@/lib/utils";

interface BrandedLoaderProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  text?: string;
}

const BrandedLoader: React.FC<BrandedLoaderProps> = ({
  className,
  size = "md",
  showText = false,
  text = "Loading experience...",
}) => {
  const sizeClasses = {
    xs: "h-4 w-auto",
    sm: "h-6 w-auto",
    md: "h-10 w-auto",
    lg: "h-16 w-auto",
    xl: "h-24 w-auto",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="relative">
        {/* Subtle background glow */}
        <div className={cn(
          "absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse",
          size === "sm" ? "blur-md" : size === "xl" ? "blur-2xl" : "blur-xl"
        )} />
        
        <img
          src="/logos/CareerGuide_Logo.png"
          alt="CareerGuide AI"
          className={cn(
            sizeClasses[size],
            "relative z-10 animate-pulse drop-shadow-md brightness-110"
          )}
        />
      </div>
      
      {showText && (
        <span className="text-sm font-bold tracking-tight text-primary/60 animate-pulse uppercase">
          {text}
        </span>
      )}
    </div>
  );
};

export default BrandedLoader;
