'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/context/language-context';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const { language } = useLanguage();

  useEffect(() => {
    // Update the html lang attribute based on the current language
    document.documentElement.lang = language;
  }, [language]);

  return <>{children}</>;
}

