import { useGenerateTextMutation } from "@/hooks/gemini/useGenerateText";
import * as Speech from "expo-speech";

export const useGenerateText = () => {
  const { mutateAsync, isLoading, data: feedbackText } = useGenerateTextMutation({
    onSuccess: () => {
      Speech.speak(feedbackText || "", { language: "en-US" });
    },
  });

  return { mutateAsync, isLoading, feedbackText };
};