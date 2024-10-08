// useTranslations.ts
import useStore from '@/app/store';

export const useTranslations = () => {
  const { translations, currentLanguage, setTranslations, setCurrentLanguage } = useStore();

  const capitalizeIfApplicable = (text: string): string => {
    if (text.length === 0) return text;

    // Check if the first character has an uppercase variant
    const firstChar = text.charAt(0);
    const upperFirstChar = firstChar.toUpperCase();

    // If the character changes when uppercased, it's eligible for capitalization
    if (firstChar !== upperFirstChar) {
      return upperFirstChar + text.slice(1);
    }

    // If no change, return the original text
    return text;
  };

  const formatKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1') // Insert space before each uppercase letter
      .replace(/^./, str => str.toUpperCase()); // Capitalize the first letter
  };

  const translate = (key: string, language?: string): string => {
    const translation = (translations[language || currentLanguage] as { [key: string]: string })?.[key] || formatKey(key);
    return capitalizeIfApplicable(translation);
  };

  return {
    translate,
    setTranslations,
    translations,
    currentLanguage,
    setCurrentLanguage,
    isRTL: translations.isRTL,
  };
};
