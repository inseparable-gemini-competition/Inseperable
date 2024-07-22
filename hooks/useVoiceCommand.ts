import { useState } from "react";
import Voice from "@react-native-voice/voice";

export const useVoiceCommand = () => {
  const [listening, setListening] = useState(false);

  const startListening = () => {
    setListening(true);
    Voice.start("en-US");
  };

  const stopListening = () => {
    Voice.stop();
    setListening(false);
  };

  return { listening, startListening, stopListening };
};