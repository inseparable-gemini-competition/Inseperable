import create from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the user data type
type userDataType = {
  country: string;
  flag: string;
  plan: string;
  description: string;
};

// Define the store state and actions
interface StoreState {
  userData: userDataType;
  setUserData: (data: userDataType) => void;
}

// Custom persist options to type the `persist` configuration
type MyPersist = (
  config: (set: any, get: any, api: any) => StoreState,
  options: PersistOptions<StoreState>
) => (set: any, get: any, api: any) => StoreState;

// Create the Zustand store with persistence
const useStore = create<StoreState>(
  (persist as MyPersist)(
    (set) => ({
      userData: { country: "", flag: "", plan: "", description: "" },
      setUserData: (data: userDataType) => set({ userData: data }),
    }),
    {
      name: "user-data-storage", // unique name
      getStorage: () => AsyncStorage, // use AsyncStorage for persistence
    }
  )
);

export default useStore;
export type { userDataType };
