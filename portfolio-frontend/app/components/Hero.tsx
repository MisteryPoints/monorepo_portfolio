import { Github, Linkedin, Mail, Download } from 'lucide-react';
import GlitchBranding from './GlitchBranding';
import { useTranslation } from '@/lib/translations';
import { useInView } from '@/hooks/use-in-view';

const Hero = () => {
  const { t, lang } = useTranslation();
  const [statsRef, statsInView] = useInView();

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-700 text-xs text-purple-400 font-mono uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {t('hero.available')}
        </div>

        <span className="text-lg text-slate-400 font-mono tracking-[0.3em] uppercase mb-4">
          {t('hero.title')}
        </span>

        <GlitchBranding text="Victor Tejada" />

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 mt-6 text-sm text-slate-500 font-mono">
          <a href="mailto:info@victortejada.dev" className="hover:text-purple-400 transition-colors">
            info@victortejada.dev
          </a>
          <a href="https://linkedin.com/in/DevPoint" target="_blank" rel="noreferrer" className="hover:text-purple-400 transition-colors">
            linkedin.com/in/DevPoint
          </a>
          <a href="https://github.com/MisteryPoints" target="_blank" rel="noreferrer" className="hover:text-purple-400 transition-colors">
            github.com/MisteryPoints
          </a>
          <span>{t('hero.location')}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
          <a href="mailto:info@victortejada.dev" className="bg-white text-black hover:bg-slate-200 font-semibold px-8 py-4 rounded-full inline-flex items-center transition-all text-sm">
            <Mail className="mr-2 h-4 w-4" />
            {t('hero.connect')}
          </a>
          <a href={lang === 'en' ? '/Victor_Tejada_Resume.pdf' : '/Victor_Tejada_CV.pdf'} download={lang === 'en' ? 'Victor_Tejada_Resume.pdf' : 'Victor_Tejada_CV.pdf'} className="border border-slate-700 text-white hover:bg-slate-800 px-8 py-4 rounded-full inline-flex items-center transition-all text-sm">
            <Download className="mr-2 h-4 w-4" />
            {t('hero.resume')}
          </a>
        </div>

        <div className="flex justify-center space-x-6 mt-8">
          <a href="https://github.com/MisteryPoints" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-white transition-colors">
            <Github size={20} />
          </a>
          <a href="https://linkedin.com/in/DevPoint" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-white transition-colors">
            <Linkedin size={20} />
          </a>
          <a href="mailto:info@victortejada.dev" className="text-slate-600 hover:text-white transition-colors">
            <Mail size={20} />
          </a>
        </div>
      </div>

      <div ref={statsRef} className="max-w-5xl mx-auto px-4 mt-16 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-800/50 overflow-hidden rounded-xl">
          {[
            { label: t('stats.uptime'), value: '99.9%' },
            { label: t('stats.codebase'), value: '250K+' },
            { label: t('stats.dsa'), value: 'Expert' },
            { label: t('stats.deployments'), value: '1,200+' },
          ].map((stat, i) => (
            <div
              key={i}
              className={`bg-slate-950/80 p-6 transition-all duration-700 ${
                statsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="text-slate-500 text-xs font-mono mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold text-white ${statsInView ? 'animate-count-up' : ''}`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
