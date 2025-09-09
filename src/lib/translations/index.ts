import { vi } from './vi';
import { en } from './en';

export type Language = 'vi' | 'en';

export const translations = {
  vi,
  en,
} as const;

export type TranslationKeys = typeof vi;

