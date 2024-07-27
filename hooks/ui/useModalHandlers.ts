// hooks/useSituationAndTaboo.ts
import { useNavigationAndUser } from "@/hooks/authentication";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useState } from "react";
import { Alert, Linking } from "react-native";

export const useModalHandlers = (
  mutateAsync: any,
  setTabooModalVisible: (visible: boolean) => void
) => {
  const [userSituation, setUserSituation] = useState<string>("");
  const [userUberText, setUserUberText] = useState<string>("");
  const { userData } = useNavigationAndUser();

  const handleSituationSubmit = async () => {
    await mutateAsync({
      promptType: "situation",
      inputData: {
        userSituation,
        country: userData.country,
      },
    });
  };

  const handleTabooSubmit = async () => {
    setTabooModalVisible(true);
    await mutateAsync({
      promptType: "taboo",
      inputData: { country: userData?.country },
    });
  };
  const [uberModalLoading, setUberModalLoading] = useState(false);

  const openuber = async (latitude: string, longitude: string) => {
    const uberUrl = `uber://?action=setPickup&pickup=my_location&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}`;

    Linking.canOpenURL(uberUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(uberUrl);
        } else {
          // Fallback to a web URL if Uber app is not installed
          const uberWebUrl = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}`;
          return Linking.openURL(uberWebUrl);
        }
      })
      .catch((err) => {
        Alert.alert("An error occurred", err.message);
      });
  };

  const handleUberSubmit = async () => {
    setUberModalLoading(true);
    try {
      const functions = getFunctions();
      const result = (await httpsCallable(
        functions,
        "scheduleTrip"
      )({ userInput: userUberText })) as any;

      openuber(
        result.data.destination.latitude,
        result.data.destination.longitude
      );
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setUberModalLoading(false);
    }
  };

  return {
    userSituation,
    setUserSituation,
    handleSituationSubmit,
    handleTabooSubmit,
    userUberText,
    setUserUberText,
    handleUberSubmit,
    uberModalLoading,
  };
};
