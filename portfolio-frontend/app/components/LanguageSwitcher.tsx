import { useTranslation } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LanguageSwitcher = () => {
  const { lang, setLang } = useTranslation();

  return (
    <div className="fixed top-6 right-6 z-[60]">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
          className="bg-black/50 border-white/10 backdrop-blur-xl text-white hover:bg-white/10 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] rounded-full px-4 overflow-hidden relative transition-all duration-300 cursor-pointer"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={lang}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex items-center"
            >
              <Globe className="mr-2 h-4 w-4" />
              {lang === 'en' ? 'Español' : 'English'}
            </motion.div>
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  );
};
