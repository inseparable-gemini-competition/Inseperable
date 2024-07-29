import { useMemo, useCallback, useEffect } from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useVoiceActivation } from "@/hooks/ui/useVoiceActivation";

export type CommandType =
  | "read"
  | "identify"
  | "price"
  | "donate"
  | "taboo"
  | "say"
  | "plan"
  | "shop"
  | "impact"
  | "tips"
  | "takephoto"
  | "goback";

interface CommandHandlerDependencies {
  imageCapture: {
    handleShowCamera: (options: { autoCapture: boolean }) => void;
    showCamera: boolean;
    capturedImage: string | null;
  };
  donation: {
    handleDonate: () => Promise<void>;
  };
  modalHandlers: {
    handleTabooSubmit: () => void;
  };
  modals: {
    setWhatToSayModalVisible: (visible: boolean) => void;
    setTipsModalVisible: (visible: boolean) => void;
    setUserMoodModalVisible: (visible: boolean) => void;
  };
  textFeedBack: {
    setCurrentPromptType: (type: string) => void;
  };
}

export const useCommandHandler = (deps: CommandHandlerDependencies) => {
  const navigation = useNavigation<NavigationProp<any>>();

  const commandMap = useMemo(
    () => ({
      read: () => deps.imageCapture.handleShowCamera({ autoCapture: true }),
      identify: () => deps.imageCapture.handleShowCamera({ autoCapture: true }),
      price: () => deps.imageCapture.handleShowCamera({ autoCapture: true }),
      donate: deps.donation.handleDonate,
      taboo: deps.modalHandlers.handleTabooSubmit,
      mood: () => deps.modals.setUserMoodModalVisible(true),
      say: () => deps.modals.setWhatToSayModalVisible(true),
      plan: () => navigation.navigate("Plan"),
      shop: () => navigation.navigate("Shopping"),
      impact: () => navigation.navigate("EnvImpact"),
      tips: () => deps.modals.setTipsModalVisible(true),
      takephoto: () =>
        deps.imageCapture.handleShowCamera({ autoCapture: false }),
      goback: () => navigation.goBack(),
    }),
    [deps, navigation]
  );

  const handleCommand = useCallback(
    async (command: string): Promise<void> => {
      try {
        const lowerCommand = command
          .toLowerCase()
          .replace(/\s/g, "") as CommandType;
        const handler = commandMap[lowerCommand];
        if (handler) {
          deps.textFeedBack.setCurrentPromptType(lowerCommand);
          await handler();
          console.log(`Command '${lowerCommand}' executed successfully`);
        } else {
          console.warn(`Unknown command: ${lowerCommand}`);
        }
      } catch (error) {
        console.error(`Error executing command '${command}':`, error);
      }
    },
    [commandMap, deps.textFeedBack]
  );

  const voiceActivation = useVoiceActivation(
    deps.imageCapture.showCamera,
    deps.imageCapture.capturedImage
  );

  useEffect(() => {
    if (voiceActivation.command) {
      handleCommand(voiceActivation.command);
    }
  }, [voiceActivation.command]);

  return { handleCommand, voiceActivation };
};
