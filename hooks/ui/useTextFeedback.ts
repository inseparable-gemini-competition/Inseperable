// hooks/useFeedback.ts
import { useState } from "react";
import { useGenerateTextMutation } from "@/hooks/gemini/useGenerateText";
import { useTextToSpeech } from "@/hooks/ui/useTextToSpeech";

export const useTextFeedback = () => {
  const [currentPromptType, setCurrentPromptType] = useState<string>("");
  const { speak, stop } = useTextToSpeech();

  const {
    mutateAsync,
    isLoading: isLoadingFromGemini,
    data: feedbackText,
    reset,
  } = useGenerateTextMutation({
    onSuccess: (data) => {
      if (data && typeof data === "string") {
        speak(data);
      }
    },
  });

  const dismissFeedback = () => {
    stop();
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