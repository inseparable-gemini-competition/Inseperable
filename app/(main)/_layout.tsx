import React from "react";
import * as Updates from "expo-updates";
import { QueryClient, QueryClientProvider } from "react-query";
import useStore from "../store";
import { polyfill as polyfillEncoding } from "react-native-polyfill-globals/src/encoding";
import { polyfill as polyfillReadableStream } from "react-native-polyfill-globals/src/readable-stream";
import useGoogleImageSearch from "@/hooks/ui/useGoogleImageSearch";
import { db } from "../helpers/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { createStackNavigator } from "@react-navigation/stack";
import Main from "@/app/screens/Main";
import Chat from "@/app/screens/Chat";
import Plan from "@/app/screens/Plan";
import HandmadeItems from "@/app/screens/HandmadeItems";
import Questionnaire from "../screens/Questionnaire";
import EnvironmentalImpactQuestionnaire from "@/app/screens/EnvironmentalImpactQuestionnaire";
import { useNavigation } from "expo-router";
import { I18nManager } from "react-native";
import Toast from "react-native-toast-message";
import ShortQuestionnaire from "@/app/screens/ShortQuestionnaire";
import TravelPhotoScreen from "@/app/screens/TravelPhotoScreen";
import AuthScreen from "@/app/screens/Auth";
import { useAuth } from "@/hooks/logic/useAuth";
import ChatScreenModal from "@/app/components/ChatModal";

polyfillEncoding();
polyfillReadableStream();

const Stack = createStackNavigator();

function NavigationWrapper({ onFinish }: any) {
  const { userData, translations } = useStore();
  const { goBack } = useNavigation();
  useAuth({ fromLayout: true });

  if (!userData?.id) {
    return (
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Auth"
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    );
  }

  if (!userData?.country) {
    return (
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="InitialQuestionnaire"
      >
        <Stack.Screen name="InitialQuestionnaire">
          {(props) => <Questionnaire {...props} onFinish={onFinish} />}
        </Stack.Screen>
        <Stack.Screen name="ShortQuestionnaire">
          {(props) => <ShortQuestionnaire {...props} onFinish={onFinish} />}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Main"
    >
      <Stack.Screen name="Main" component={Main} />
      <Stack.Screen name="Plan" component={Plan} />
      <Stack.Screen name="Photos" component={TravelPhotoScreen} />
      <Stack.Screen name="Shopping" component={HandmadeItems} />
      <Stack.Screen
        name="ChatScreenModal"
        component={ChatScreenModal}
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen name="EnvImpact">
        {(props) => (
          <EnvironmentalImpactQuestionnaire {...props} onFinish={goBack} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Chat" component={Chat} />
      <Stack.Screen name="Questionnaire">
        {(props) => <Questionnaire {...props} onFinish={onFinish} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default function TabLayout() {
  const queryClient = new QueryClient();
  const { fetchPhotos } = useGoogleImageSearch();
  const { setUserData, translations, userData } = useStore();

  const onFinish = async ({
    setLocalLoading,
    result,
  }: {
    setLocalLoading: (loading: boolean) => void;
    result: any;
  }) => {
    if (result?.country) {
      setLocalLoading(true);

      const landmarkUri = await fetchPhotos(result?.mostFamousLandmark);
      const updatedUserData = {
        ...result,
        id: userData?.id,
        mostFamousLandmark: landmarkUri || "",
      };
      // Save updated user data to Firestore
      try {
        if (userData) {
          await setDoc(doc(db, "users", userData?.id), updatedUserData);
        }
      } catch (error) {
        console.error("Error saving user data: ", error);
      }
      setLocalLoading(false);
      I18nManager.forceRTL(translations.isRTL === true);
      setUserData(updatedUserData);
      if (translations.isRTL) Updates.reloadAsync();
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationWrapper onFinish={onFinish} />
      <Toast />
    </QueryClientProvider>
  );
}
