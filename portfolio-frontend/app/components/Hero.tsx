
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { WavyBackground } from './WavyBackground';
import { useTranslation } from '@/lib/translations';
import GlitchBranding from './GlitchBranding';

const Hero = () => {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.fromTo(titleRef.current, 
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo(buttonsRef.current?.children as unknown as gsap.TweenTarget,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
        '-=0.3'
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" className="relative min-h-screen">
      <WavyBackground className="max-w-4xl mx-auto pb-40" containerClassName="h-screen">
        <div ref={heroRef} className="text-center px-4 flex flex-col items-center">
          <div ref={titleRef} className="mb-6">
            <GlitchBranding text="DEVPOINT" />
            <h2 className="text-xl md:text-3xl font-bold text-white/80 mt-2 tracking-[0.3em]">
              {t('hero.title')}
            </h2>
          </div>
          
          <p 
            ref={subtitleRef}
            className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
          >
            {t('hero.subtitle')}
          </p>

          <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="mailto:info@victortejada.dev" className="bg-white text-black hover:bg-slate-200 font-bold px-10 py-6 rounded-full inline-flex items-center transition-all">
              <Mail className="mr-2 h-5 w-5" />
              {t('hero.connect')}
            </a>
            <a href="/resume.pdf" download className="border border-white/20 text-white hover:bg-white/10 px-10 py-6 rounded-full backdrop-blur-sm inline-flex items-center transition-all">
              <Download className="mr-2 h-5 w-5" />
              {t('hero.resume')}
            </a>
          </div>

          <div className="flex justify-center space-x-8 mt-16">
            <a href="https://github.com/MisteryPoints" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-all transform hover:scale-110">
  <Github size={32} />
</a>
<a href="https://linkedin.com/in/DevPoint" target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-all transform hover:scale-110">
  <Linkedin size={32} />
</a>
<a href="mailto:info@victortejada.dev" className="text-white/60 hover:text-white transition-all transform hover:scale-110">
  <Mail size={32} />
</a>

          </div>
        </div>
      </WavyBackground>

      {/* Technical Stats Dashboard */}
      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: t('stats.uptime'), value: '99.9%', sub: 'Availability' },
            { label: t('stats.codebase'), value: '250K+', sub: 'Lines of Code' },
            { label: t('stats.dsa'), value: 'Expert', sub: 'Tree/Graph/DP' },
            { label: t('stats.deployments'), value: '1,200+', sub: 'CI/CD Pipelines' },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl hover:border-purple-500/50 transition-all group"
            >
              <div className="text-slate-500 text-xs font-mono mb-1 uppercase tracking-widest">{stat.label}</div>
              <div className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors">{stat.value}</div>
              <div className="text-slate-600 text-[10px] font-mono mt-1">{stat.sub}</div>
              
              <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="w-1/2 h-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
