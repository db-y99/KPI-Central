'use client';

import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = language === 'vi' ? 'en' : 'vi';
    setLanguage(newLanguage);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
    >
      <Languages className="h-4 w-4" />
      <span className="hidden sm:inline">
        {language === 'vi' ? t.language.english : t.language.vietnamese}
      </span>
      <span className="sm:hidden">
        {language === 'vi' ? 'EN' : 'VI'}
      </span>
    </Button>
  );
}