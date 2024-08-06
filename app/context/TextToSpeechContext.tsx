import React, { createContext, useContext, useCallback } from 'react';
import useStore from "@/app/store";
import * as Speech from "expo-speech";

interface TextToSpeechContextType {
  speak: (text: string, options?: Speech.SpeechOptions) => void;
  stop: () => void;
}

const TextToSpeechContext = createContext<TextToSpeechContextType | undefined>(undefined);

export const TextToSpeechProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { currentLanguage } = useStore();

  const speak = useCallback((text: string, options?: Speech.SpeechOptions) => {
    Speech.speak(text, {
      language: currentLanguage || "en",
      ...options,
    });
  }, [currentLanguage]);

  const stop = useCallback(() => Speech.stop(), []);

  return (
    <TextToSpeechContext.Provider value={{ speak, stop }}>
      {children}
    </TextToSpeechContext.Provider>
  );
};

export const useTextToSpeech = () => {
  const context = useContext(TextToSpeechContext);
  if (context === undefined) {
    throw new Error('useTextToSpeech must be used within a TextToSpeechProvider');
  }
  return context;
};