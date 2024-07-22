import { NavigationProp } from '@react-navigation/native';
import { useState, useRef, useCallback, useEffect } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useGenerateTextMutation } from "@/hooks/useGenerateText";
import Voice from "@react-native-voice/voice";
import * as Speech from "expo-speech";
import { translate } from "@/app/helpers/i18n";
import { useJsonControlledGeneration } from "@/hooks/useJsonControlledGeneration";
import { generateSchema } from "@/hooks/utils/generateSchema";
import useStore from "@/app/store";
import { auth } from "@/app/helpers/firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigation } from "expo-router";

export const useMain = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const opacity = useSharedValue(1);
  const cameraOpacity = useSharedValue(0);
  const [facing, setFacing] = useState("back");
  const { speak, stop } = useTextToSpeech();
  const [permission, requestPermission] = useCameraPermissions();
  const [listening, setListening] = useState<boolean>(false);
  const [voiceCountdown, setVoiceCountdown] = useState<number | null>(null);
  const voiceCountdownRef = useRef<NodeJS.Timeout | null>(null);
  const [command, setCommand] = useState<string>("");
  const [donationModalVisible, setDonationModalVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<any>>();

  const { userData, setUserData } = useStore();


  const schema = generateSchema("recommendation donation entity name", {
    name: ["string", "donation entity name"],
    websiteLink: ["string", "donation entity website link"],
    description: ["string", "donation entity 6 lines description"],
  });
  const { generate, isLoading: isDonationLoading, result: donationResult } = useJsonControlledGeneration(schema);

  const {
    mutateAsync,
    isLoading: isLoadingFromGemini,
    data: feedbackText,
  } = useGenerateTextMutation({
    onSuccess: (data: any) => {
      if (data && typeof data === 'string') {
        speak(data);
      }
    },
  });

  const handleLongPress = () => {
    if (!showCamera || !capturedImage) {
      console.log("Deep click (long press) detected");
      activateVoiceCommand();
    }
  };


  const handleResetAndLogout = async () => {
    try {
      await signOut(auth);
      setUserData(null as any);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const dismissFeedback = () => {
    setCapturedImage(null);
    stopSpeech();
  };


  const handleCapture = useCallback(async () => {
    if (cameraRef.current) {
      const photo = (await cameraRef.current.takePictureAsync()) as any;
      setCapturedImage(photo.uri);
      setShowCamera(false);
      handleCancelCountdown();
      cameraOpacity.value = 0;
      opacity.value = withTiming(1, {
        duration: 700,
        easing: Easing.inOut(Easing.ease),
      });
      await mutateAsync({ imageUri: photo.uri, text: currentPrompt });
    }
  }, [currentPrompt, mutateAsync]);

  const stopSpeech = () => {
    stop();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const cameraAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cameraOpacity.value,
    };
  });

  const handleShowCamera = useCallback(({ autoCapture = false }: { autoCapture?: boolean } = {}) => {
    opacity.value = withTiming(
      0,
      {
        duration: 500,
        easing: Easing.inOut(Easing.ease),
      },
      () => {
        runOnJS(setShowCamera)(true);
        runOnJS(startCountdown)();
        if (autoCapture) {
          runOnJS(handleAutoCapture)();
        }
        cameraOpacity.value = withTiming(1, {
          duration: 700,
          easing: Easing.inOut(Easing.ease),
        });
      }
    );
  }, []);

  const startCountdown = useCallback(() => {
    handleCancelCountdown();
    setCountdown(10);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 0) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          return null;
        }
        return prev! - 1;
      });
    }, 1000);
  }, []);

  const handleCancelCountdown = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = null;
    setCountdown(null);
  }, []);

  const handleManualCapture = useCallback(() => {
    handleCancelCountdown();
    handleCapture();
  }, [handleCancelCountdown, handleCapture]);

  const handleAutoCapture = useCallback(() => {
    const captureInterval = setInterval(() => {
      if (countdown === 0) {
        clearInterval(captureInterval);
        handleCapture();
      }
    }, 100);
  }, [countdown, handleCapture]);

  const handleCleanup = useCallback(() => {
    setShowCamera(false);
    setCapturedImage(null);
    handleCancelCountdown();
    cameraOpacity.value = 0;
    opacity.value = withTiming(1, {
      duration: 700,
      easing: Easing.inOut(Easing.ease),
    });
  }, [handleCancelCountdown]);

  useEffect(() => {
    if (showCamera && !permission?.granted) {
      requestPermission();
    }
  }, [showCamera]);

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechPartialResults = (e) => {
      setCommand(e?.value?.[e?.value?.length - 1]?.split(" ")?.pop() || "");
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = (e: any) => {
    console.log("onSpeechStart:", e);
  };

  const onSpeechEnd = (e: any) => {
    console.log("onSpeechEnd:", e);
  };

  const onSpeechError = (e: any) => {
    console.log("onSpeechError:", e);
  };

  const onSpeechResults = (result: any) => {
    console.log("onSpeechResults:", result);
    const commands = result.value[0].toLowerCase().split(" ");
    const command = commands[commands.length - 1];
    handleCommand(command);
  };

  const handleCommand = async (command: string) => {
    Speech.stop();
    onVoiceRecognitionClosed();

    switch (command) {
      case "read":
      case "identify":
      case "price":
        let prompt = "";
        if (command === "read") {
          prompt = "Read the text in this image.";
        } else if (command === "identify") {
          prompt =
            "Identify the image, give a concise and professional description within three lines. If it's a historical landmark, provide brief information about it.";
        } else if (command === "price") {
          prompt =
            "Analyze the photo to identify the item. If uncertain, provide a reasonable assumption based on visual cues. Determine the fair market price range for the item (or assumed equivalent) in Egypt as of July 2024, considering its condition if possible. Respond with the item name (or assumption) followed by the estimated price range in Egyptian Pounds (EGP), omitting any introductory phrases";
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

  const handleDonate = async (prompt: string) => {
    try {
      await generate(prompt);
      setDonationModalVisible(true);
    } catch (error) {
      console.error("Error fetching donation information:", error);
    }
  };

  const activateVoiceCommand = () => {
    console.log("Activating voice command");
    setListening(true);
    Speech.speak(translate("youHave10Seconds"), {
      onDone: () => {
        console.log("Speech finished, starting voice recognition");
        startVoiceCountdown();
        Voice.start("en-US")
          .then(() => {
            console.log("Voice recognition started");
          })
          .catch((err) => {
            console.log("Voice recognition start error:", err);
          });
      },
      onError: (err) => {
        console.log("Speech error:", err);
      },
    });
  };

  const startVoiceCountdown = () => {
    console.log("Starting voice countdown");
    clearVoiceCountdown();
    setVoiceCountdown(10);
    voiceCountdownRef.current = setInterval(() => {
      setVoiceCountdown((prev) => {
        if (prev && prev <= 1) {
          clearVoiceCountdown();
          console.log(translate("countdownFinished"));
          setListening(false);
          Voice.stop()
            .then(() => {
              console.log(translate("voiceRecognitionStopped"));
            })
            .catch((err) => {
              console.log("Voice recognition stop error:", err);
            });
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const clearVoiceCountdown = () => {
    if (voiceCountdownRef.current) {
      clearInterval(voiceCountdownRef.current);
      voiceCountdownRef.current = null;
    }
  };

  const onVoiceRecognitionClosed = () => {
    setListening(false);
    clearVoiceCountdown();
    setVoiceCountdown(null);
    Voice.stop();
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
    stopSpeech,
    onVoiceRecognitionClosed,
    facing,
    isDonationLoading,
    donationResult,
    permission,
    requestPermission,
    donationModalVisible, 
    setDonationModalVisible,
    command,
    handleLongPress,
    dismissFeedback,
    userData,
    handleResetAndLogout,
  };
};