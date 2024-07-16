import { useState, useRef, useEffect } from "react";
import { CameraView } from "expo-camera";
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Speech from "expo-speech";
import Voice from "@react-native-voice/voice";
import { useGenerateTextMutation } from "@/hooks/useGenerateText";

export const useMain = ({ currentPrompt }: any) => {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [listening, setListening] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const opacity = useSharedValue(1);
  const cameraOpacity = useSharedValue(0);
  const {
    mutateAsync,
    isLoading: isLoadingFromGemini,
    data: feedbackText,
  } = useGenerateTextMutation({
    onSuccess: () => {
      Speech.speak(feedbackText || "", { language: "en-US" });
    },
  });

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

  const handleAutoCapture = (autoCapture?: boolean) => {
    console.log("autoCapture", autoCapture);
    if (autoCapture) {
      setTimeout(() => {
        handleCapture();
      }, 100);
    }
  };

  const handleShowCamera = ({ autoCapture }: { autoCapture?: boolean } = {}) => {
    opacity.value = withTiming(
      0,
      {
        duration: 500,
        easing: Easing.inOut(Easing.ease),
      },
      () => {
        runOnJS(setShowCamera)(true);
        runOnJS(startCountdown)();
        runOnJS(handleAutoCapture)(autoCapture);
        cameraOpacity.value = withTiming(1, {
          duration: 700,
          easing: Easing.inOut(Easing.ease),
        });
      }
    );
  };

  const startCountdown = () => {
    handleCancelCountdown(); // Ensure any previous countdown is cleared
    setCountdown(6);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          handleCapture();
        }
        return prev! - 1 > 0 ? prev! - 1 : 0;
      });
    }, 1000);
  };

  const handleCancelCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = null;
    setCountdown(null);
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = (await cameraRef.current.takePictureAsync()) as any;
      setCapturedImage(photo.uri);
      setShowCamera(false);
      handleCancelCountdown(); // Ensure the countdown is reset
      cameraOpacity.value = 0;
      opacity.value = withTiming(1, {
        duration: 700,
        easing: Easing.inOut(Easing.ease),
      });
      await mutateAsync({ imageUri: photo.uri, text: currentPrompt });
    }
  };

  const handleManualCapture = () => {
    handleCancelCountdown();
    handleCapture();
  };

  const handleVoiceCommandStart = () => {
    setListening(true);
    Speech.speak("You have 10 seconds to say your command", {
      onDone: startListening,
    });
  };

  const startListening = () => {
    handleCancelCountdown(); // Ensure any previous countdown is cleared
    setCountdown(10);
    Voice.start("en-US");
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          stopListening();
        }
        return prev! - 1 > 0 ? prev! - 1 : 0;
      });
    }, 1000);
  };

  const stopListening = () => {
    Voice.stop();
    setListening(false);
    handleCancelCountdown();
  };

  return {
    capturedImage,
    showCamera,
    countdown,
    cameraRef,
    opacity,
    cameraOpacity,
    animatedStyle,
    cameraAnimatedStyle,
    handleShowCamera,
    handleCapture,
    handleCancelCountdown,
    handleManualCapture,
    handleVoiceCommandStart,
    setShowCamera,
    setCapturedImage,
    clickCount,
    setClickCount,
    listening,
    setListening,
    isLoadingFromGemini,
    feedbackText,
  };
};
