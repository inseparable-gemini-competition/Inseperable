// hooks/useVoiceActivation.ts
import { useVoiceCommands } from "@/hooks/ui/useVoiceCommand";
import { State } from "react-native-gesture-handler";

export const useVoiceActivation = (
  showCamera: boolean,
  capturedImage: string | null,
) => {
  const {
    listening,
    voiceCountdown,
    activateVoiceCommand,
    onVoiceRecognitionClosed,
    command,
  } = useVoiceCommands();

  const handleLongPress = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      if (!showCamera || !capturedImage) {
        activateVoiceCommand();
      }
    }
  };

  return {
    listening,
    voiceCountdown,
    activateVoiceCommand,
    onVoiceRecognitionClosed,
    command,
    handleLongPress,
  };
};
