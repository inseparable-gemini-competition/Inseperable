import * as Speech from "expo-speech";

export const useTextToSpeech = () => {
  const speak = (text: string, options?: Speech.SpeechOptions) => {
    Speech.speak(text, { language: "en-US", ...options });
  };

  const stop = () => Speech.stop();

  return { speak, stop };
};
