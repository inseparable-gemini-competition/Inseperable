// hooks/useFeedback.ts
import { useState } from "react";
import { useGenerateTextMutation } from "@/hooks/gemini/useGenerateText";
import { useTextToSpeech } from "@/hooks/ui/useTextToSpeech";
import { useTranslations } from "@/hooks/ui/useTranslations";

export const useTextFeedback = ({noModalVisible} : {noModalVisible: boolean}) => {
  const [currentPromptType, setCurrentPromptType] = useState<string>("");
  const { speak, stop } = useTextToSpeech();
  const {currentLanguage} = useTranslations();

  const {
    mutateAsync,
    isLoading: isLoadingFromGemini,
    data: feedbackText,
    reset,
  } = useGenerateTextMutation({
    onSuccess: (data) => {
      if (data && typeof data === "string" && !noModalVisible) {
        speak(data,{
          language: currentLanguage || "en",
        });
      }
    },
  });

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