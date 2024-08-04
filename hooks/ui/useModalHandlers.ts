// hooks/useSituationAndTaboo.ts
import { getFunctions, httpsCallable } from "firebase/functions";
import { useState } from "react";
import { Linking, Alert } from "react-native";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { useUpdateUserScore } from "@/hooks/logic/useUserScore";
import useStore from "@/app/store";

interface RecommendedTrip {
  name: string;
  description: string;
  latitude: string;
  longitude: string;
}

export const useModalHandlers = (
  mutateAsync: any,
  setTabooModalVisible: (visible: boolean) => void
) => {
  const [userSituation, setUserSituation] = useState<string>("");
  const [userMoodAndDesires, setUserMoodAndDesires] = useState<string>("");
  const [userMoodModalLoading, setUserMoodModalLoading] = useState<boolean>(false);
  const [recommendedTrip, setRecommendedTrip] = useState<RecommendedTrip | null>(null);
  const { userData } = useStore();
  const { translate } = useTranslations();
  const { mutateAsync: updateUserScore } = useUpdateUserScore();

  const handleSituationSubmit = async () => {
    await mutateAsync({
      promptType: "situation",
      inputData: {
        userSituation,
        country: userData.country,
      },
    });
    updateUserScore({
      cultural: 10,
    })
  };

  const handleTabooSubmit = async () => {
    setTabooModalVisible(true);
    await mutateAsync({
      promptType: "taboo",
      inputData: { country: userData?.country, currentLanguage: userData?.currentLanguage },
    });
    updateUserScore({
      cultural: 10,
    })
  };

  const openMapWithLocation = async (
    latitude: string,
    longitude: string,
    name: string
  ) => {
    const encodedName = encodeURIComponent(name);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodedName}`;

    try {
      const supported = await Linking.canOpenURL(mapsUrl);
      if (supported) {
        await Linking.openURL(mapsUrl);
      } else {
        Alert.alert(translate("unableToOpenMaps"));
      }
    } catch (err) {
      Alert.alert(err instanceof Error ? err.message : translate("unknownError"));
    }
  };

  const openUber = async (latitude: string, longitude: string) => {
    const uberUrl = `uber://?action=setPickup&pickup=my_location&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}`;

    try {
      const supported = await Linking.canOpenURL(uberUrl);
      if (supported) {
        await Linking.openURL(uberUrl);
      } else {
        // Fallback to Uber website if the app is not installed
        const uberWebUrl = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}`;
        await Linking.openURL(uberWebUrl);
      }
    } catch (err) {
      Alert.alert(err instanceof Error ? err.message : translate("unableToOpenUber"));
    }
  };

  const handleTripRecommendationSubmit = async () => {
    try {
      setUserMoodModalLoading(true);
      updateUserScore({
        cultural: 10,
      })
      const functions = getFunctions();
      const result = (await httpsCallable(
        functions,
        "scheduleTrip"
      )({ userInput: {userMoodAndDesires, country: userData?.country} })) as any;

      const { name, description, latitude, longitude } = result.data;

      setRecommendedTrip({ name, description, latitude, longitude });
      setUserMoodModalLoading(false);
    } catch (error) {
      setUserMoodModalLoading(false);
      setRecommendedTrip(null);
      Alert.alert(
        translate("unexpectedError"),
        error instanceof Error ? error.message : translate("unexpectedError")
      );
    }
  };

  return {
    userSituation,
    setUserSituation,
    handleSituationSubmit,
    handleTabooSubmit,
    userMoodAndDesires,
    setUserMoodAndDesires,
    handleTripRecommendationSubmit,
    userMoodModalLoading,
    recommendedTrip,
    openMapWithLocation,
    openUber,
    setRecommendedTrip,
  };
};