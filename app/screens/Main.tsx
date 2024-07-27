import React from 'react';
import { useModals, useTipSelection, useFeedback, useImageCapture, useNavigationAndUser, useSituationAndTaboo, useDonation, useVoiceActivation } from '@/hooks';
import MainPresentation from '@/app/components/MainPresentation';

const MainContainer: React.FC = () => {
  const modals = useModals();
  const tipSelection = useTipSelection();
  const feedback = useFeedback();
  const imageCapture = useImageCapture(feedback.mutateAsync, feedback.currentPromptType);
  const navigationAndUser = useNavigationAndUser();
  const situationAndTaboo = useSituationAndTaboo(feedback.mutateAsync, navigationAndUser.userData, modals.setTabooModalVisible);
  const donation = useDonation();
  
  const handleCommand = async (command: string) => {
    voiceActivation.onVoiceRecognitionClosed();
    feedback.setCurrentPromptType(command);
    switch (command) {
      case "read":
      case "identify":
      case "price":
        imageCapture.handleShowCamera({ autoCapture: true });
        break;
      case "donate":
        await donation.handleDonate();
        break;
      case "taboo":
        situationAndTaboo.handleTabooSubmit();
        break;
      case "whatToSay":
        modals.setWhatToSayModalVisible(true);
        break;
      case "plan":
        navigationAndUser.navigation.navigate("Plan");
        break;
      case "shop":
        navigationAndUser.navigation.navigate("Shopping");
        break;
      case "impact":
        navigationAndUser.navigation.navigate("EnvImpact");
        break;
      case "tips":
        modals.setTipsModalVisible(true);
        break;
      default:
        console.log("Unknown command:", command);
    }
  };

  const voiceActivation = useVoiceActivation(handleCommand, imageCapture.showCamera, imageCapture.capturedImage);

  return (
    <MainPresentation
      modals={modals}
      tipSelection={tipSelection}
      feedback={feedback}
      imageCapture={imageCapture}
      navigationAndUser={navigationAndUser}
      situationAndTaboo={situationAndTaboo}
      donation={donation}
      voiceActivation={voiceActivation}
      handleCommand={handleCommand}
    />
  );
};

export default MainContainer;