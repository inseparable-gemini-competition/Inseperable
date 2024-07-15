import { useState, useEffect, useRef, useCallback } from "react";
import { BackHandler } from "react-native";
import * as Speech from "expo-speech";
import useVoiceHandler from "./useVoiceHandler";
import { useTranslations } from "@/hooks/useTranslations";
import { useGenerateTextMutation } from "@/hooks/useGenerateText";

const useIdentity = () => {
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isListening, setIsListening] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
  const { mutateAsync, isLoading } = useGenerateTextMutation();
  const cameraRef = useRef<any>();

  const { translations, updateTranslations } = useTranslations({
    setIsProcessing,
  });
  const [currentLanguage, setCurrentLanguage] = useState("ar");

  const switchCamera = () => {
    setFacing(facing === "back" ? "front" : "back");
  };

  useEffect(() => {
    const backAction = () => {
      if (isLoading || capturing) {
        setFeedbackText(
          translations.waitMessage || "Please wait until loading ends"
        );
        return true;
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
  }, [isLoading, capturing, translations]);

  const capturePhoto = async () => {
    if (cameraRef.current) {
      setCapturing(true);
      const options = { quality: 0.8, skipProcessing: true };
      const photo = await cameraRef.current.takePictureAsync(options);
      setCapturing(false);
      setImageUri(photo.uri);
      return photo.uri;
    }
    return null;
  };

  const executeCommand = useCallback(
    async (command: string, extraParam?: string) => {
      setPendingCommand(command);
      setImageUri(null);
      setFeedbackText("");

      if (command === "translate" && extraParam) {
        try {
          setIsProcessing(true);
          const result = await mutateAsync({
            text: feedbackText,
            // language: extraParam,
          });
          setFeedbackText(result);
          Speech.speak(result);
        } catch (error) {
          setFeedbackText(
            translations.translateError || "Error translating text."
          );
          Speech.speak(
            translations.translateError || "Error translating text."
          );
        } finally {
          setIsProcessing(false);
        }
      }
    },
    [feedbackText, imageUri, translations]
  );

  const { startListening, stopListening } = useVoiceHandler(executeCommand);

  const processCommand = async (commandType: string, uri: string) => {
    if (!uri) {
      setFeedbackText(
        translations.noImage ||
          "No image captured. Please capture an image first."
      );
      return;
    }

    setIsProcessing(true);
    setFeedbackText(translations.processing || "Processing...");

    try {
      const tasks = {
        identify: () =>
          mutateAsync({
            text:
              translations.identifyTask ||
              "Identify the image, give a concise and professional description within three lines. If it's a historical landmark, provide brief information about it.",
            imageUri: uri,
          }),
        price: () =>
          mutateAsync({
            text:
              translations.priceTask ||
              "Analyze the photo to identify the item. If uncertain, provide a reasonable assumption based on visual cues. Determine the fair market price range for the item (or assumed equivalent) in Egypt as of July 2024, considering its condition if possible. Respond with the item name (or assumption) followed by the estimated price range in Egyptian Pounds (EGP), omitting any introductory phrases.",
            imageUri: uri,
          }),
        read: () =>
          mutateAsync({
            text: translations.readTask || "Read the text in this image",
            imageUri: uri,
          }),
      };

      const result = await tasks[commandType]();
      setFeedbackText(result);
      Speech.speak(result);
    } catch (error) {
      setFeedbackText(
        translations.processingError || "Error processing the command."
      );
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
        pendingCommand.includes("read"))
    ) {
      const captureAndProcess = async () => {
        Speech.stop();
        if (imageUri) {
          const uri = await capturePhoto();
          setTimeout(async () => {
            await processCommand(pendingCommand, uri);
          }, 300);
        } else {
          const uri = await capturePhoto();
          await processCommand(pendingCommand, uri);
        }
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
    currentLanguage,
    setCurrentLanguage,
    translations,
    updateTranslations,
  };
};

export default useIdentity;
