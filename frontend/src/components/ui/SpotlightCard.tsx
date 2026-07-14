import React from "react";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  gradient?: string;
}

export function SpotlightCard({ 
  children, 
  className = ""
}: SpotlightCardProps) {
  return (
    <div
      className={`relative rounded-2xl border border-zinc-800 bg-zinc-900/30 
                 overflow-hidden transition-all duration-300
                 hover:border-zinc-700 hover:bg-zinc-900/50 ${className}`}
    >
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 