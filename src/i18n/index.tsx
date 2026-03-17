import React, {createContext, useContext, useState, ReactNode} from 'react';
import {en} from './en';
import {hi} from './hi';

export type Language = 'en' | 'hi';
export type Strings = typeof en;

interface I18nContextType {
  language: Language;
  t: Strings;
  setLanguage: (lang: Language) => void;
  isHindi: boolean;
}

const translations: Record<Language, Strings> = {en, hi};

const I18nContext = createContext<I18nContextType>({
  language: 'hi',
  t: hi,
  setLanguage: () => {},
  isHindi: true,
});

export const I18nProvider = ({children}: {children: ReactNode}) => {
  const [language, setLanguage] = useState<Language>('hi');

  const value: I18nContextType = {
    language,
    t: translations[language],
    setLanguage,
    isHindi: language === 'hi',
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
