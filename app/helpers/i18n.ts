import { translations } from "./translations";

export const translate = (key: string, lang = "en") => {
  return translations[lang][key] || key;
};
