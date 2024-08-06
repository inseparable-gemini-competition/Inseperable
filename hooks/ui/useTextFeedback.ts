// hooks/useFeedback.ts
import { useState } from "react";
import { useGenerateTextMutation } from "@/hooks/gemini/useGenerateText";
import { useTextToSpeech } from "@/app/context/TextToSpeechContext";

export const useTextFeedback = () => {
  const [currentPromptType, setCurrentPromptType] = useState<string>("");
  const { speak, stop } = useTextToSpeech();

  const {
    mutateAsync,
    isLoading: isLoadingFromGemini,
    data: feedbackText,
    reset,
  } = useGenerateTextMutation();

  const dismissFeedback = () => {
    stop();
    reset();
  };

  return {
    currentPromptType,
    setCurrentPromptType,
    mutateAsync,
    isLoadingFromGemini,
    feedbackText,
    reset,
    speak,
    stop,
    dismissFeedback,
  };
};