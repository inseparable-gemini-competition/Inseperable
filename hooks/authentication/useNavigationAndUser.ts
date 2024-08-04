import { NavigationProp } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { useNavigation } from "expo-router";
import useStore from "@/app/store";
import { auth } from "@/app/helpers/firebaseConfig";
import { I18nManager } from "react-native";
import * as Updates from "expo-updates";

export const useNavigationAndUser = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const {
    userData,
    setUserData,
    setTranslations,
    setCurrentLanguage,
    translations,
  } = useStore();

  const handleResetAndLogout = async () => {
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
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return {
    navigation,
    userData,
    handleResetAndLogout,
  };
};
