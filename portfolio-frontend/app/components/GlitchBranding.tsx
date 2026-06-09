import React from 'react';
import { cn } from '@/lib/utils';

interface GlitchBrandingProps {
  text: string;
  className?: string;
}

const GlitchBranding = ({ text, className }: GlitchBrandingProps) => {
  return (
    <div className={cn("relative group cursor-default", className)}>
      <h1 className="relative text-7xl font-black tracking-tighter text-white uppercase mix-blend-lighten">
        <span className="relative z-10">{text}</span>
        
        {/* Red Layer */}
        <span className="absolute top-0 left-0 -z-10 text-red-500 opacity-0 group-hover:opacity-70 animate-glitch-1 group-hover:block transition-all duration-75">
          {text}
        </span>
        
        {/* Blue Layer */}
        <span className="absolute top-0 left-0 -z-10 text-cyan-500 opacity-0 group-hover:opacity-70 animate-glitch-2 group-hover:block transition-all duration-75">
          {text}
        </span>

        {/* Scanline line */}
        <div className="absolute inset-0 h-[2px] bg-white/20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:animate-scanline" />
      </h1>
      
      <style>{`
        @keyframes glitch-1 {
          0% { transform: translate(0); }
          20% { transform: translate(-3px, 2px); }
          40% { transform: translate(-3px, -2px); }
          60% { transform: translate(3px, 2px); }
          80% { transform: translate(3px, -2px); }
          100% { transform: translate(0); }
        }
        @keyframes glitch-2 {
          0% { transform: translate(0); }
          20% { transform: translate(3px, -2px); }
          40% { transform: translate(3px, 2px); }
          60% { transform: translate(-3px, -2px); }
          80% { transform: translate(-3px, 2px); }
          100% { transform: translate(0); }
        }
        @keyframes scanline {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .animate-glitch-1 { animation: glitch-1 0.2s infinite; }
        .animate-glitch-2 { animation: glitch-2 0.2s infinite alternate-reverse; }
        .animate-scanline { animation: scanline 1.5s linear infinite; }
      `}</style>
    </div>
  );
};

export default GlitchBranding;
