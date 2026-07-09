import { cn } from '@/lib/utils';

interface GlitchBrandingProps {
  text: string;
  className?: string;
}

const GlitchBranding = ({ text, className }: GlitchBrandingProps) => {
  return (
    <h1 className={cn("text-6xl md:text-8xl font-bold tracking-tighter text-white transition-colors duration-300 hover:text-purple-300", className)}>
      {text}
    </h1>
  );
};

export default GlitchBranding;
