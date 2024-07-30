import useStore from "@/app/store";
import * as Speech from "expo-speech";

export const useTextToSpeech = () => {
  const { currentLanguage } = useStore();
  const speak = (text: string, options?: Speech.SpeechOptions) => {
    Speech.speak(text, {
      language: currentLanguage || "en",
      ...options,
    });
  };

  const stop = () => Speech.stop();

  return { speak, stop };
};
