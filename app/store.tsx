// store.ts
import { create } from 'zustand';
import { persist, PersistOptions } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations as initialTranslations} from '@/app/helpers/translations';

type userDataType = {
  country: string;
  flag: string;
  description: string;
  baseLanguage: string;
  mostFamousLandmark: string;
};

interface StoreState {
  userData: userDataType;
  setUserData: (data: userDataType) => void;
  translations: typeof initialTranslations;
  setTranslations: (newTranslations: typeof initialTranslations) => void;
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
}

type MyPersist = (
  config: (set: any, get: any, api: any) => StoreState,
  options: PersistOptions<StoreState>
) => (set: any, get: any, api: any) => StoreState;

const useStore = create<StoreState>(
  (persist as MyPersist)(
    (set) => ({
      userData: { country: "", flag: "", description: "", mostFamousLandmark: "", baseLanguage: "" },
      setUserData: (data: userDataType) => set({ userData: data }),
      translations: initialTranslations,
      setTranslations: (newTranslations) => set({ translations: newTranslations }),
      currentLanguage: 'en',
      setCurrentLanguage: (lang) => set({ currentLanguage: lang }),
    }),
    {
      name: "app-storage",
      getStorage: () => AsyncStorage,
    }
  )
);

export default useStore;
export type { userDataType };