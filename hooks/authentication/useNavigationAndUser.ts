import { signOut } from "firebase/auth";
import useStore from "@/app/store";
import { auth } from "@/app/helpers/firebaseConfig";
import { I18nManager } from "react-native";
import * as Updates from "expo-updates";
import { useState } from "react";

export const useNavigationAndUser = () => {
  const {
    userData,
    setUserData,
    setTranslations,
    setCurrentLanguage,
    translations,
  } = useStore();

  const [isLoading, setIsloading] = useState(false);

  const handleResetAndLogout = async () => {
    setIsloading(true);
    const isRTL = translations?.isRTL;
    try {
      await signOut(auth);
      setUserData(null as any);
      setTranslations(null as any);
      setCurrentLanguage(null as any);
      if (isRTL) {
        I18nManager.forceRTL(false);
        Updates.reloadAsync();
      }
      setIsloading(false);
    } catch (error) {
      console.error("Error logging out:", error);
      setIsloading(false);
    }
  };

  const handleRecommendation = async () => {
    try {
      setUserData({ ...userData, country: null, travelPlan: [] });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return {
    handleResetAndLogout,
    handleRecommendation,
    isLoading,
  };
};
