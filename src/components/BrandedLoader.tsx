import React from "react";
import { cn } from "@/lib/utils";

interface BrandedLoaderProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  text?: string;
  fullScreen?: boolean;
}

const BrandedLoader: React.FC<BrandedLoaderProps> = ({
  className,
  size = "md",
  showText = false,
  text = "Loading experience...",
  fullScreen = false,
}) => {
  const sizeClasses = {
    xs: "h-4 w-auto",
    sm: "h-6 w-auto",
    md: "h-10 w-auto",
    lg: "h-16 w-auto",
    xl: "h-24 w-auto",
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-4",
      fullScreen && "fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl",
      className
    )}>
      <div className="relative">
        {/* Subtle background glow */}
        <div className={cn(
          "absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse",
          size === "sm" ? "blur-md" : size === "xl" ? "blur-2xl" : "blur-xl"
        )} />
        
        <img
          src="/logos/CareerGuide_Logo.webp"
          alt="CareerGuide AI"
          width="160"
          height="40"
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
