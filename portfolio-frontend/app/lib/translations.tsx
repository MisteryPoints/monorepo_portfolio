import { useState, useEffect, createContext, useContext } from 'react';
import { fetchTranslations } from './api';

export const localTranslations = {
  en: {
    hero: {
      title: "Full Stack Developer",
      subtitle: "Engineering robust backends and immersive frontends. Merging deep technical logic with premium aesthetics.",
      connect: "Connect",
      resume: "Resume.json"
    },
    terminal: {
      welcome: "System initialized. Type 'help' for commands.",
      prompt: "guest@antigravity:~$"
    },
    skills: {
      title: "Technical Skill Tree",
      subtitle: "N-ary tree representation of my engineering stack"
    },
    projects: {
      title: "Engineering Showcase",
      subtitle: "Selected works and system architectures"
    },
    stats: {
      uptime: "System Uptime",
      codebase: "Codebase",
      dsa: "DSA Proficiency",
      deployments: "Deployments"
    }
  },
  es: {
    hero: {
      title: "Desarrollador Full Stack",
      subtitle: "Ingeniería de backends robustos y frontends inmersivos. Fusionando lógica técnica profunda con estética premium.",
      connect: "Conectar",
      resume: "Currículum.json"
    },
    terminal: {
      welcome: "Sistema inicializado. Escribe 'help' para comandos.",
      prompt: "invitado@antigravity:~$"
    },
    skills: {
      title: "Árbol de Habilidades Técnicas",
      subtitle: "Representación en árbol N-ario de mi stack de ingeniería"
    },
    projects: {
      title: "Showcase de Ingeniería",
      subtitle: "Trabajos seleccionados y arquitecturas de sistemas"
    },
    stats: {
      uptime: "Uptime del Sistema",
      codebase: "Base de Código",
      dsa: "Competencia en DSA",
      deployments: "Despliegues"
    }
  }
};

type Language = 'en' | 'es';

interface TranslationContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (path: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>('en');
  const [apiTranslations, setApiTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Language;
    if (savedLang) setLang(savedLang);
  }, []);

  useEffect(() => {
    fetchTranslations(lang)
      .then(data => setApiTranslations(data))
      .catch(err => console.error('Error fetching translations:', err));
  }, [lang]);

  const handleSetLang = (l: Language) => {
    setLang(l);
    localStorage.setItem('lang', l);
  };

  const t = (path: string) => {
    if (apiTranslations[path]) return apiTranslations[path];
    
    const local = path.split('.').reduce((obj, key) => obj?.[key], (localTranslations as any)[lang]);
    return typeof local === 'string' ? local : path;
  };

  return (
    <TranslationContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) throw new Error('useTranslation must be used within a TranslationProvider');
  return context;
};
