import { useState, useRef, useCallback, useEffect } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useCountdown } from "@/hooks/useCountDown";

export const useCamera = (mutateAsync: any, currentPrompt: string) => {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const opacity = useSharedValue(1);
  const cameraOpacity = useSharedValue(0);
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const { countdown, startCountdown, handleCancelCountdown } = useCountdown();
  const countdownRef = useRef(countdown);

  useEffect(() => {
    countdownRef.current = countdown;
  }, [countdown]);

  const handleCapture = useCallback(async () => {
    if (cameraRef.current) {
      const photo = (await cameraRef.current.takePictureAsync()) as any;
      setCapturedImage(photo.uri);
      setShowCamera(false);
      cameraOpacity.value = 0;
      opacity.value = withTiming(1, {
        duration: 700,
        easing: Easing.inOut(Easing.ease),
      });
      await mutateAsync({ imageUri: photo.uri, text: currentPrompt });
    }
  }, [currentPrompt, mutateAsync]);

  const handleAutoCapture = useCallback(() => {
    const captureInterval = setInterval(() => {
      if (countdownRef.current === 0) {
        clearInterval(captureInterval);
        handleCapture();
      }
    }, 100);
  }, [handleCapture]);

  const handleManualCapture = useCallback(() => {
    handleCancelCountdown();
    handleCapture();
  }, [handleCancelCountdown, handleCapture]);

  const handleShowCamera = useCallback(
    (
      {
        autoCapture = false,
      }: {
        autoCapture?: boolean;
      } = {} as any
    ) => {
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
    },
    [handleAutoCapture, startCountdown]
  );

  const handleCleanup = (callback: Function) => {
    setShowCamera(false);
    setCapturedImage(null);
    cameraOpacity.value = 0;
    callback?.();
    opacity.value = withTiming(1, {
      duration: 700,
      easing: Easing.inOut(Easing.ease),
    });
  };

  useEffect(() => {
    if (showCamera && !permission?.granted) {
      requestPermission();
    }
  }, [showCamera, permission, requestPermission]);

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

  return {
    showCamera,
    capturedImage,
    cameraRef,
    handleCapture,
    handleShowCamera,
    handleCleanup,
    animatedStyle,
    cameraAnimatedStyle,
    permission,
    requestPermission,
    setCapturedImage,
    facing,
    setFacing,
    handleManualCapture,
    handleCancelCountdown,
    countdown,
  };
};
