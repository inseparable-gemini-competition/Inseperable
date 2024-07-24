import { useState } from "react";
import { useGenerateTextMutation } from "@/hooks/gemini/useGenerateText";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useCamera } from "../useCamera";
import { useVoiceCommands } from "@/hooks/useVoiceCommand";
import { useDonation } from "./useDonation";
import { useNavigationAndUser } from "../authentication/useNavigationAndUser";

export const useMain = () => {
  const [currentPromptType, setCurrentPromptType] = useState("");
  const [tabooModalVisible, setTabooModalVisible] = useState(false);
  const [whatToSayModalVisible, setWhatToSayModalVisible] = useState(false);
  const [userSituation, setUserSituation] = useState("");
  const { speak, stop } = useTextToSpeech();

  const [tipsModalVisible, setTipsModalVisible] = useState(false);
  const [selectedTipType, setSelectedTipType] = useState("");

  const dismissFeedback = () => {
    setCapturedImage(null);
    stop();
  };

  const {
    mutateAsync,
    isLoading: isLoadingFromGemini,
    data: feedbackText,
    reset,
  } = useGenerateTextMutation({
    onSuccess: (data: any) => {
      if (data && typeof data === "string") {
        speak(data);
      }
    },
  });

  const {
    showCamera,
    capturedImage,
    cameraRef,
    handleManualCapture,
    handleCancelCountdown,
    handleShowCamera,
    handleCleanup,
    animatedStyle,
    cameraAnimatedStyle,
    permission,
    requestPermission,
    setCapturedImage,
    facing,
    setFacing,
    countdown,
  } = useCamera(mutateAsync, currentPromptType);

  const handleCommand = async (command: string) => {
    onVoiceRecognitionClosed();
    setCurrentPromptType(command);
    switch (command) {
      case "read":
      case "identify":
      case "price":
        handleShowCamera({ autoCapture: true });
        break;
      case "donate":
        await handleDonate();
        break;
      case "taboo":
        handleTabooSumbit();
        break;
      case "whatToSay":
        setWhatToSayModalVisible(true);
        break;
      case "plan":
        navigation.navigate("Plan");
        break;
      case "shop":
        navigation.navigate("Shopping");
        break;
      case "impact":
        navigation.navigate("EnvImpact");
        break;
      case "tibs":
        setTipsModalVisible(true);
        break;
      default:
        console.log("Unknown command:", command);
    }
  };

  const handleSituationSubmit = async () => {
    await mutateAsync({
      promptType: "situation",
      inputData: {
        userSituation,
        country: userData.country,
      },
    });
  };

  const handleSelectTipType = async (selectedType: string) => {
    await mutateAsync({ promptType: "tibs", inputData: {selectedType} });
  };

  const handleTabooSumbit = async () => {
    setTabooModalVisible(true);
    await mutateAsync({ promptType: "taboo", inputData: {country: userData?.country} });
  };
  const {
    listening,
    voiceCountdown,
    activateVoiceCommand,
    onVoiceRecognitionClosed,
    command,
  } = useVoiceCommands(handleCommand);

  const {
    donationModalVisible,
    setDonationModalVisible,
    isDonationLoading,
    donationResult,
    handleDonate,
  } = useDonation();

  const { navigation, userData, handleResetAndLogout } = useNavigationAndUser();

  const handleLongPress = () => {
    if (!showCamera || !capturedImage) {
      activateVoiceCommand();
    }
  };

  return {
    showCamera,
    voiceCountdown,
    capturedImage,
    listening,
    setCapturedImage,
    countdown,
    cameraRef,
    handleManualCapture,
    animatedStyle,
    cameraAnimatedStyle,
    handleCommand,
    handleCancelCountdown,
    isLoadingFromGemini,
    feedbackText,
    handleCleanup,
    stopSpeech: stop,
    onVoiceRecognitionClosed,
    facing,
    setFacing,
    isDonationLoading,
    donationResult,
    permission,
    requestPermission,
    donationModalVisible,
    setDonationModalVisible,
    activateVoiceCommand,
    userData,
    handleResetAndLogout,
    handleLongPress,
    dismissFeedback,
    command,
    tabooModalVisible,
    setTabooModalVisible,
    whatToSayModalVisible,
    setWhatToSayModalVisible,
    handleSituationSubmit,
    userSituation,
    setUserSituation,
    resetGeneratedText: reset,
    tipsModalVisible,
    setTipsModalVisible,
    selectedTipType,
    handleSelectTipType,
  };
};
