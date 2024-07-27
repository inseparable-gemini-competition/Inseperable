// src/hooks/useCommandHandler.ts

import React from "react";
import {
  createCommandMap,
  createHandleCommand,
} from "@/app/helpers/handlersCommand";
import { useVoiceActivation } from "@/hooks/ui/useVoiceActivation";
import { useNavigation } from "expo-router";

type CommandHandlerDependencies = {
  imageCapture: {
    handleShowCamera: (options: { autoCapture: boolean }) => void;
    showCamera: boolean;
    capturedImage: string | null;
  };
  donation: { handleDonate: () => Promise<void> };
  situationAndTaboo: { handleTabooSubmit: () => void };
  modals: {
    setWhatToSayModalVisible: (visible: boolean) => void;
    setTipsModalVisible: (visible: boolean) => void;
  };
  feedback: {
    setCurrentPromptType: (type: string) => void;
  };
};

export const useCommandHandler = (deps: CommandHandlerDependencies) => {
  const { imageCapture, donation, situationAndTaboo, modals, feedback } = deps;
  const navigation = useNavigation();

  const commandMap = React.useMemo(
    () =>
      createCommandMap({
        imageCapture,
        donation,
        situationAndTaboo,
        modals,
        navigation,
      }),
    [imageCapture, donation, situationAndTaboo, modals, navigation]
  );

  const [handleCommand, setHandleCommand] = React.useState<
    (command: string) => Promise<void>
  >(() => async () => {});

  const voiceActivation = useVoiceActivation(
    handleCommand,
    imageCapture.showCamera,
    imageCapture.capturedImage
  );

  React.useEffect(() => {
    setHandleCommand(() =>
      createHandleCommand(
        commandMap,
        voiceActivation.onVoiceRecognitionClosed,
        feedback.setCurrentPromptType
      )
    );
  }, [commandMap, voiceActivation, feedback]);

  return { handleCommand, voiceActivation };
};
