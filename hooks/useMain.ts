import { useState, useRef, useCallback } from "react";
import { CameraView } from "expo-camera";
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useGenerateTextMutation } from "@/hooks/useGenerateText";

export const useMain = ({ currentPrompt }: { currentPrompt: string }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const opacity = useSharedValue(1);
  const cameraOpacity = useSharedValue(0);
  const { speak, stop } = useTextToSpeech();
  
  
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

  const stopSpeech = ()=>{
    stop();
  }


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
    handleCancelCountdown(); // Ensure any previous countdown is cleared
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

  return {
    showCamera,
    setShowCamera,
    capturedImage,
    setCapturedImage,
    countdown,
    cameraRef,
    handleManualCapture,
    cameraOpacity,
    opacity,
    animatedStyle,
    cameraAnimatedStyle,
    handleShowCamera,
    handleCancelCountdown,
    isLoadingFromGemini,
    feedbackText,
    handleCleanup,
    speak,
    stopSpeech,
  };
};