import { useState, useEffect, createContext, useContext } from 'react';
import { fetchTranslations } from './api';

export const localTranslations = {
  en: {
    hero: {
      title: "Full Stack Developer",
      subtitle: "Engineering robust backends and immersive frontends. Merging deep technical logic with premium aesthetics.",
      connect: "Connect",
      resume: "Resume.json",
      available: "Available for work",
      location: "Remote / Dominican Republic"
    },
    terminal: {
      welcome: "System initialized. Type 'help' for commands.",
      prompt: "guest@antigravity:~$",
      help: "Available commands: help, ls, cd <dir>, cat <file>, pwd, clear, whoami, version, status",
      noSuchDir: "No such directory",
      noSuchFile: "No such file or directory",
      missingOperand: "cat: missing operand",
      cmdNotFound: "Command not found",
      whoami: "Lead Full Stack Developer | DSA Enthusiast | AI Integrator",
      version: "DevOS v2.4.0-stable (build 2026-05-11)",
      status: "System: Online\nUptime: 1,440 hours\nCPU: 4.2GHz\nRAM: 64GB",
      header: "bash — dev@portfolio — 80x24"
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
    },
    nav: {
      about: "About",
      experience: "Experience",
      skills: "Skills",
      projects: "Projects",
      blog: "Blog",
      contact: "Contact",
      admin: "Admin"
    },
    blog: {
      title: "Latest Blog Posts",
      viewAll: "View All Posts",
      author: "Author",
      minRead: "min read"
    },
    contact: {
      title: "Get In Touch",
      subtitle: "Let's build something great together",
      description: "I'm actively seeking new engineering challenges. Whether you have a full-time role, a contract opportunity, or just want to discuss system architecture, I'd love to hear from you.",
      cardTitle: "Send a Message",
      cardDescription: "Fill out the form below and I'll get back to you within 24 hours.",
      namePlaceholder: "Your Name",
      emailPlaceholder: "Your Email",
      subjectPlaceholder: "Subject",
      messagePlaceholder: "Your Message",
      send: "Send Message",
      sending: "Sending...",
      successTitle: "Message sent!",
      successDescription: "Thank you for your message. I'll get back to you within 24 hours.",
      errorTitle: "Error",
      errorDescription: "Failed to send message. Please try again or email me directly.",
      remote: "Remote / Dominican Republic"
    },
    footer: {
      madeWith: "Made with",
      using: "using React, TypeScript & Tailwind CSS",
      rights: "All rights reserved."
    },
    hireMe: {
      available: "Available Full Stack Developer",
      button: "Hire Me"
    },
    skillWheel: {
      center: "Full\nStack"
    },
    experience: {
      title: "Experience",
      present: "Present"
    }
  },
  es: {
    hero: {
      title: "Desarrollador Full Stack",
      subtitle: "Ingeniería de backends robustos y frontends inmersivos. Fusionando lógica técnica profunda con estética premium.",
      connect: "Conectar",
      resume: "Currículum.json",
      available: "Disponible para trabajar",
      location: "Remoto / República Dominicana"
    },
    terminal: {
      welcome: "Sistema inicializado. Escribe 'help' para comandos.",
      prompt: "invitado@antigravity:~$",
      help: "Comandos disponibles: help, ls, cd <dir>, cat <file>, pwd, clear, whoami, version, status",
      noSuchDir: "No existe el directorio",
      noSuchFile: "No existe el archivo o directorio",
      missingOperand: "cat: falta operando",
      cmdNotFound: "Comando no encontrado",
      whoami: "Lead Full Stack Developer | Entusiasta de DSA | Integrador de IA",
      version: "DevOS v2.4.0-stable (build 2026-05-11)",
      status: "Sistema: En línea\nTiempo activo: 1,440 horas\nCPU: 4.2GHz\nRAM: 64GB",
      header: "bash — dev@portfolio — 80x24"
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
    },
    nav: {
      about: "Sobre mí",
      experience: "Experiencia",
      skills: "Habilidades",
      projects: "Proyectos",
      blog: "Blog",
      contact: "Contacto",
      admin: "Admin"
    },
    blog: {
      title: "Últimos Artículos",
      viewAll: "Ver Todos",
      author: "Autor",
      minRead: "min de lectura"
    },
    contact: {
      title: "Contáctame",
      subtitle: "Construyamos algo grandioso juntos",
      description: "Busco activamente nuevos desafíos de ingeniería. Ya sea una oportunidad de tiempo completo, un contrato, o solo quieras discutir arquitectura de sistemas, me encantaría saber de ti.",
      cardTitle: "Enviar Mensaje",
      cardDescription: "Completa el formulario y te responderé en menos de 24 horas.",
      namePlaceholder: "Tu Nombre",
      emailPlaceholder: "Tu Email",
      subjectPlaceholder: "Asunto",
      messagePlaceholder: "Tu Mensaje",
      send: "Enviar Mensaje",
      sending: "Enviando...",
      successTitle: "Mensaje enviado",
      successDescription: "Gracias por tu mensaje. Te responderé en menos de 24 horas.",
      errorTitle: "Error",
      errorDescription: "No se pudo enviar el mensaje. Intenta de nuevo o escríbeme directamente.",
      remote: "Remoto / República Dominicana"
    },
    footer: {
      madeWith: "Hecho con",
      using: "usando React, TypeScript y Tailwind CSS",
      rights: "Todos los derechos reservados."
    },
    hireMe: {
      available: "Full Stack Developer Disponible",
      button: "Contrátame"
    },
    skillWheel: {
      center: "Full\nStack"
    },
    experience: {
      title: "Experiencia",
      present: "Presente"
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
