import { useState } from 'react';
import { useGenerateTextMutation } from '@/hooks/useGenerateText';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useCamera } from './useCamera';
import { useVoiceCommands } from '@/hooks/useVoiceCommand';
import { useDonation } from './useDonation';
import { useNavigationAndUser } from './useNavigationAndUser';

export const useMain = () => {
  const [currentPrompt, setCurrentPrompt] = useState("");
  const { speak, stop } = useTextToSpeech();


  const dismissFeedback = () => {
    setCapturedImage(null);
    stop();
  };

  const {
    mutateAsync,
    isLoading: isLoadingFromGemini,
    data: feedbackText,
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
  } = useCamera(mutateAsync, currentPrompt);

  const handleCommand = async (command: string) => {
    onVoiceRecognitionClosed();

    switch (command) {
      case "read":
      case "identify":
      case "price":
        let prompt = "";
        if (command === "read") {
          prompt = "Read the text in this image.";
        } else if (command === "identify") {
          prompt = "Identify the image, give a concise and professional description within three lines. If it's a historical landmark, provide brief information about it.";
        } else if (command === "price") {
          prompt = "Analyze the photo to identify the item. If uncertain, provide a reasonable assumption based on visual cues. Determine the fair market price range for the item (or assumed equivalent) in Egypt as of July 2024, considering its condition if possible. Respond with the item name (or assumption) followed by the estimated price range in Egyptian Pounds (EGP), omitting any introductory phrases";
        }
        setCurrentPrompt(prompt);
        handleShowCamera({ autoCapture: true });
        break;
      case "donate":
        const donatePrompt = `Tell me about donation entities or organizations you have to give url, name and description (6 exact lines) for the organization that could benefit from my donation in ${userData?.country}`;
        await handleDonate(donatePrompt);
        break;
      case "plan":
        navigation.navigate("Plan");
        break;
      case "shop":
        navigation.navigate("Shopping");
        break;
      default:
        console.log("Unknown command:", command);
    }
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
  };
};
