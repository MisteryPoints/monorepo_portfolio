import { Github, Linkedin, Mail, Heart } from 'lucide-react';
import { useTranslation } from '@/lib/translations';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex space-x-6">
            <a href="https://github.com/MisteryPoints" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
              <Github size={24} />
            </a>
            <a href="https://linkedin.com/in/DevPoint" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors">
              <Linkedin size={24} />
            </a>
            <a href="mailto:info@victortejada.dev" className="text-gray-400 hover:text-purple-400 transition-colors">
              <Mail size={24} />
            </a>
          </div>

          <div className="text-center text-gray-400">
            <p className="flex items-center justify-center">
              {t('footer.madeWith')} <Heart className="mx-2 h-4 w-4 text-red-400" fill="currentColor" /> {t('footer.using')}
            </p>
            <p className="mt-2">&copy; {new Date().getFullYear()} Victor Tejada. {t('footer.rights')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
