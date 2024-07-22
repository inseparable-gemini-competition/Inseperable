import { NavigationProp } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { useNavigation } from "expo-router";
import useStore from "@/app/store";
import { auth } from "@/app/helpers/firebaseConfig";

export const useNavigationAndUser = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { userData, setUserData } = useStore();

  const handleResetAndLogout = async () => {
    try {
      await signOut(auth);
      setUserData(null as any);
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
