import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import useStore, { userDataType } from "../store";
import { polyfill as polyfillEncoding } from "react-native-polyfill-globals/src/encoding";
import { polyfill as polyfillReadableStream } from "react-native-polyfill-globals/src/readable-stream";
import useGoogleImageSearch from "@/hooks/useGoogleImageSearch";
import { db } from "../helpers/firebaseConfig"; // Import the Firestore instance
import { doc, setDoc } from "firebase/firestore";
import { useSignIn } from "@/hooks/useSignIn";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Main from "@/app/screens/Main";
import Plan from "@/app/screens/Plan";
import Questionnaire from "../screens/Questionnaire";

polyfillEncoding();
polyfillReadableStream();

export default function TabLayout() {
  const { userData, setUserData } = useStore();
  const queryClient = new QueryClient();
  const { fetchPhotos, setLoading, loading } = useGoogleImageSearch();
  const { authenticateUser } = useSignIn(); // Assuming this hook provides the userId correctly
  const Stack = createStackNavigator();

  const onFinish = async ({
    userData,
    setLocalLoading,
  }: {
    userData: userDataType;
    setLocalLoading: (loading: boolean) => void;
  }) => {
    if (userData?.country) {
      setLocalLoading(loading);
      const landmarkUri = await fetchPhotos(userData.mostFamousLandmark);
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
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={userData?.country ? "Main" : "Questionnaire"}
      >
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="Plan" component={Plan} />
        <Stack.Screen name="Questionnaire">
          {(props) => <Questionnaire {...props} onFinish={onFinish} />}
        </Stack.Screen>
      </Stack.Navigator>
    </QueryClientProvider>
  );
}

export { userDataType };
