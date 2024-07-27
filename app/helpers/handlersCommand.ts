// src/utils/commandHandler.ts

import { NavigationProp } from '@react-navigation/native'; // Adjust import as needed

export type CommandType = 'read' | 'identify' | 'price' | 'donate' | 'taboo' | 'whatToSay' | 'plan' | 'shop' | 'impact' | 'tips';

type CommandHandlers = {
  imageCapture: { handleShowCamera: (options: { autoCapture: boolean }) => void };
  donation: { handleDonate: () => Promise<void> };
  situationAndTaboo: { handleTabooSubmit: () => void };
  modals: { 
    setWhatToSayModalVisible: (visible: boolean) => void;
    setTipsModalVisible: (visible: boolean) => void;
  };
  navigation: NavigationProp<any>;
};

export const createCommandMap = (handlers: CommandHandlers) => {
  const { imageCapture, donation, situationAndTaboo, modals, navigation } = handlers;
  
  return {
    read: async () => imageCapture.handleShowCamera({ autoCapture: true }),
    identify: async () => imageCapture.handleShowCamera({ autoCapture: true }),
    price: async () => imageCapture.handleShowCamera({ autoCapture: true }),
    donate: donation.handleDonate,
    taboo: situationAndTaboo.handleTabooSubmit,
    whatToSay: async () => modals.setWhatToSayModalVisible(true),
    plan: async () => navigation.navigate("Plan"),
    shop: async () => navigation.navigate("Shopping"),
    impact: async () => navigation.navigate("EnvImpact"),
    tips: async () => modals.setTipsModalVisible(true),
  };
};

export const createHandleCommand = (
  commandMap: ReturnType<typeof createCommandMap>,
  onVoiceRecognitionClosed: () => void,
  setCurrentPromptType: (type: string) => void
) => {
  return async (command: string) => {
    try {
      onVoiceRecognitionClosed();
      setCurrentPromptType(command);

      const commandFunction = commandMap[command as CommandType];
      if (commandFunction) {
        await commandFunction();
        console.log(`Command '${command}' executed successfully`);
      } else {
        console.warn(`Unknown command: ${command}`);
      }
    } catch (error) {
      console.error(`Error executing command '${command}':`, error);
    }
  };
};