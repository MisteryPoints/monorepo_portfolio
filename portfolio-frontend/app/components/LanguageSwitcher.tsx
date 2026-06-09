
import React from 'react';
import { useTranslation } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { lang, setLang } = useTranslation();

  return (
    <div className="fixed top-6 right-6 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
        className="bg-black/50 border-white/10 backdrop-blur-xl text-white hover:bg-white/10 rounded-full px-4"
      >
        <Globe className="mr-2 h-4 w-4" />
        {lang === 'en' ? 'Español' : 'English'}
      </Button>
    </div>
  );
};
