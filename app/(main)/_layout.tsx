import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import useStore from "../store";
import { polyfill as polyfillEncoding } from "react-native-polyfill-globals/src/encoding";
import { polyfill as polyfillReadableStream } from "react-native-polyfill-globals/src/readable-stream";
import useGoogleImageSearch from "@/hooks/ui/useGoogleImageSearch";
import { db } from "../helpers/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useSignIn } from "@/hooks/authentication/useSignIn";
import { createStackNavigator } from "@react-navigation/stack";
import Main from "@/app/screens/Main";
import Chat from "@/app/screens/Chat";
import Plan from "@/app/screens/Plan";
import HandmadeItems from "@/app/screens/HandmadeItems";
import Questionnaire from "../screens/Questionnaire";
import EnvironmentalImpactQuestionnaire from "@/app/screens/EnvironmentalImpactQuestionnaire";
import { useNavigation } from "expo-router";

polyfillEncoding();
polyfillReadableStream();

const Stack = createStackNavigator();

function NavigationWrapper({onFinish}: any) {
  const { userData } = useStore();
  const { goBack } = useNavigation();
  
  if (!userData?.country) {
    return <Questionnaire onFinish={onFinish} />;
  }
  
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Main"
    >
      <Stack.Screen name="Main" component={Main} />
      <Stack.Screen name="Plan" component={Plan} />
      <Stack.Screen name="Shopping" component={HandmadeItems} />
      <Stack.Screen name="EnvImpact">
        {(props) => <EnvironmentalImpactQuestionnaire {...props} onFinish={goBack} />}
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
  const { fetchPhotos, setLoading, loading } = useGoogleImageSearch();
  const { authenticateUser } = useSignIn();
  const { setUserData } = useStore();

  const onFinish = async ({
    userData,
    setLocalLoading,
  }: {
    userData: any;
    setLocalLoading: (loading: boolean) => void;
  }) => {
    if (userData?.country) {
      setLocalLoading(loading);
      const landmarkUri = await fetchPhotos(userData?.mostFamousLandmark);
      const updatedUserData = {
        ...userData,
        mostFamousLandmark: landmarkUri || "",
      };
      setUserData(updatedUserData);

      // Save updated user data to Firestore
      const userId = await authenticateUser();
      try {
        if (userId) {
          await setDoc(doc(db, "users", userId), updatedUserData);
          console.log("User data saved successfully!");
        } else {
          console.error("User ID is not available.");
        }
      } catch (error) {
        console.error("Error saving user data: ", error);
      }

      setLoading(false);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationWrapper onFinish={onFinish} />
    </QueryClientProvider>
  );
}

