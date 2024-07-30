// store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations as initialTranslations } from '@/app/helpers/translations';

export type TranslationsType = {
  [key: string]: {
    [key: string]: string;
  } | boolean
};

interface StoreState {
  userData: any | null;
  setUserData: (data: any | null) => void;
  translations: TranslationsType;
  setTranslations: (newTranslations: Partial<TranslationsType>) => void;
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
}

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      userData: null,
      setUserData: (data) => set(() => {
        return { userData: data ? { ...data } : null };
      }),
      translations: {},  // Start with an empty object
      setTranslations: (newTranslations) => set((state) => {
        const updatedTranslations = {
          ...state.translations,
          ...newTranslations
        };
        return { translations: updatedTranslations };
      }),
      currentLanguage: 'en',
      setCurrentLanguage: (lang) => set(() => {
        return { currentLanguage: lang };
      }),
      logEntireState: () => {
        const state = get();
      },
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        userData: state.userData, 
        translations: state.translations, 
        currentLanguage: state.currentLanguage 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // If no translations were persisted, use the initial translations
          if (Object.keys(state.translations).length === 0) {
            useStore.setState({ translations: initialTranslations });
          }
        }
      },
    }
  )
);



export default useStore;