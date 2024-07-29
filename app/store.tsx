// store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations as initialTranslations } from '@/app/helpers/translations';
import { userDataType } from '@/app/(main)/_layout';

export type TranslationsType = {
  [key: string]: {
    [key: string]: string;
  };
};

interface StoreState {
  userData: userDataType | null;
  setUserData: (data: userDataType | null) => void;
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
        console.log('userData updated:', data);
        return { userData: data ? { ...data } : null };
      }),
      translations: {},  // Start with an empty object
      setTranslations: (newTranslations) => set((state) => {
        const updatedTranslations = {
          ...state.translations,
          ...newTranslations
        };
        console.log('translations updated:', updatedTranslations);
        return { translations: updatedTranslations };
      }),
      currentLanguage: 'en',
      setCurrentLanguage: (lang) => set(() => {
        console.log('currentLanguage updated:', lang);
        return { currentLanguage: lang };
      }),
      logEntireState: () => {
        const state = get();
        console.log('Entire Zustand State:', state);
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
        console.log('State after rehydration:', state);
        if (state) {
          // If no translations were persisted, use the initial translations
          if (Object.keys(state.translations).length === 0) {
            console.log('No persisted translations found, using initial translations');
            useStore.setState({ translations: initialTranslations });
          } else {
            console.log('Rehydrated translations:', state.translations);
          }
        }
      },
    }
  )
);

// Log initial state
console.log('Initial Zustand State:', useStore.getState());

// Subscribe to state changes
useStore.subscribe((state) => {
  console.log('Zustand State Updated:', state);
});

export default useStore;