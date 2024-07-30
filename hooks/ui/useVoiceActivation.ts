// hooks/useVoiceActivation.ts
import { useVoiceCommands } from "@/hooks/ui/useVoiceCommand";
import { State } from "react-native-gesture-handler";

export const useVoiceActivation = (
  showCamera: boolean,
  capturedImage: string | null
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
    const isActiveState = event.nativeEvent.state === State.ACTIVE;
    const canToggleVoiceCommand = !showCamera && !capturedImage;

    if (isActiveState && canToggleVoiceCommand) {
      !isListening ? activateVoiceCommand() : cancelVoiceCommand();
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
