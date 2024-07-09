import Voice, { SpeechResultsEvent } from "@react-native-voice/voice";
import { useEffect } from "react";

// Custom Hook for Voice Commands
const useVoiceHandler = (executeCommand: (command: string) => void) => {
  useEffect(() => {
    const handleRestart = async () => {
      await Voice.stop();
      await Voice.start("en");
    };
    Voice.onSpeechResults = (event: SpeechResultsEvent) => {
      const spokenCommand = event.value?.[0].toLowerCase().trim() || "";
      executeCommand(spokenCommand);
      handleRestart();
    };

    Voice.onSpeechError = (error) => {
      console.log("Voice error:", error);
      handleRestart();
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [executeCommand]);

  const startListening = async () => {
    try {
      await Voice.start("en-US");
    } catch (error) {
      console.log("Error starting voice recognition:", error);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.log("Error stopping voice recognition:", error);
    }
  };

  return { startListening, stopListening };
};

export default useVoiceHandler;
