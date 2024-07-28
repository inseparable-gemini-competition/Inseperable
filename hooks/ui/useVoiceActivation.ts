// hooks/useVoiceActivation.ts
import { useVoiceCommands } from "@/hooks/ui/useVoiceCommand";
import { State } from "react-native-gesture-handler";

export const useVoiceActivation = (
  showCamera: boolean,
  capturedImage: string | null,
) => {
  const {
    isListening,
    activateVoiceCommand,
    stopListening,
    cancelVoiceCommand,
    command: aiResponse,
    isProcessing: isLoading,
  } = useVoiceCommands();

  const handleLongPress = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      if (!showCamera || !capturedImage) {
        activateVoiceCommand();
      }
    }
  };

  return {
    isListening,
    activateVoiceCommand,
    stopListening,
    cancelVoiceCommand,
    command: aiResponse,
    isProcessing: isLoading,
    handleLongPress,
  };
};
