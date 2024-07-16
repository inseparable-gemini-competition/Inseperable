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

export const useMain = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [listening, setListening] = useState(false);
  const [recognizedCommand, setRecognizedCommand] = useState<string | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const opacity = useSharedValue(1);
  const cameraOpacity = useSharedValue(0);

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

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = (event: any) => {
    const command = event.value[0].toLowerCase();
    if (["read", "identify", "fair price"].includes(command)) {
      setRecognizedCommand(command);
      handleCancelCountdown();
      console.log("Valid command:", command);
    }
  };

  const handleShowCamera = () => {
    opacity.value = withTiming(
      0,
      {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      },
      () => {
        runOnJS(setShowCamera)(true);
        runOnJS(startCountdown)();
        cameraOpacity.value = withTiming(1, {
          duration: 1000,
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
        return (prev! - 1) > 0 ? (prev! - 1) : 0;
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
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      });
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
        return (prev! - 1) > 0 ? (prev! - 1) : 0;
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
    recognizedCommand,
    setShowCamera,
    setCapturedImage,
    clickCount,
    setClickCount,
    listening,
    setListening,
  };
};
