import  { useState, useEffect, useRef, useCallback } from "react";
import {
  BackHandler,
} from "react-native";
import * as Speech from "expo-speech";
import useVoiceHandler from "./useVoiceHandler";
import { useFetchContent } from "@/app/helpers/askGemini";

const useIdentity = () => {
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isListening, setIsListening] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
  const { mutateAsync, isLoading } = useFetchContent();
  const cameraRef = useRef<any>();

  const switchCamera = () => {
    setFacing(facing === "back" ? "front" : "back");
  };

  useEffect(() => {
    const backAction = () => {
      if (isLoading || capturing) {
        setFeedbackText("Please wait until loading ends");
        return;
      }
      setImageUri(null);
      Speech.stop();
      setFeedbackText("");
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const capturePhoto = async () => {
    if (cameraRef.current) {
      setCapturing(true);
      const options = { quality: 0.8, skipProcessing: true }; // Adjust the quality as needed
      const photo = await cameraRef.current.takePictureAsync(options);
      setCapturing(false);
      setImageUri(photo.uri);
      return photo.uri;
    }
    return null;
  };

  const executeCommand = useCallback(async (command: string) => {
    setPendingCommand(command);
    setImageUri(null);
    setFeedbackText("");
  }, []);

  const { startListening, stopListening } = useVoiceHandler(executeCommand);

  const processCommand = async (commandType: string, uri: string) => {
    if (!uri) {
      setFeedbackText("No image captured. Please capture an image first.");
      return;
    }

    setIsProcessing(true);
    setFeedbackText("Processing...");

    try {
      const tasks = {
        identify: () =>
          mutateAsync({ text: "Identify this image", imageUri: uri }),
        price: () =>
          mutateAsync({
            text: "Please analyze this photo to identify the item. If identification is not possible, do an assumption. If identified, provide its fair market price range even if based on assumption in Egypt. identify then say the price range directly and don't include the word price or identify or read, just say first what's this ",
            imageUri: uri,
          }),
        read: () =>
          mutateAsync({ text: "Read the text in this image", imageUri: uri }),
      };

      const result = await tasks[commandType]();
      setFeedbackText(result);
      Speech.speak(result);
    } catch (error) {
      setFeedbackText("Error processing the command.");
      console.log("Processing error:", error);
    } finally {
      setIsProcessing(false);
      setPendingCommand(null);
    }
  };

  useEffect(() => {
    if (
      pendingCommand &&
      (pendingCommand.includes("price") ||
        pendingCommand.includes("identify") ||
        pendingCommand?.includes("read"))
    ) {
      const captureAndProcess = async () => {
        Speech.stop();
        if (imageUri) {
          const uri = await capturePhoto();
          setTimeout(async () => {
            await processCommand(pendingCommand, uri);
          }, 300);
        }
        const uri = await capturePhoto();
        await processCommand(pendingCommand, uri);
      };
      captureAndProcess();
    }
  }, [pendingCommand]);

  useEffect(() => {
    startListening();
    return () => {
      stopListening();
    };
  }, [startListening, stopListening]);

  return {
    facing,
    switchCamera,
    isProcessing,
    feedbackText,
    isListening,
    startListening,
    stopListening,
    imageUri,
    setImageUri,
    capturing,
    executeCommand,
    isLoading,
    setFeedbackText,
    cameraRef,
  };
};

export default useIdentity;
