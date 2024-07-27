import React from "react";
import {
  useModals,
  useTipSelection,
  useFeedback,
  useImageCapture,
  useNavigationAndUser,
  useSituationAndTaboo,
  useDonation,
} from "@/hooks";
import MainPresentation from "@/app/components/MainPresentation";
import { useCommandHandler } from "@/hooks/ui/useCommandHandler";

const MainContainer: React.FC = () => {
  const modals = useModals();
  const tipSelection = useTipSelection();
  const feedback = useFeedback();
  const imageCapture = useImageCapture(
    feedback.mutateAsync,
    feedback.currentPromptType
  );
  const navigationAndUser = useNavigationAndUser();
  const situationAndTaboo = useSituationAndTaboo(
    feedback.mutateAsync,
    navigationAndUser.userData,
    modals.setTabooModalVisible
  );
  const donation = useDonation();

  const { handleCommand, voiceActivation } = useCommandHandler({
    imageCapture,
    donation,
    situationAndTaboo,
    modals,
    navigation: navigationAndUser.navigation,
    feedback,
  });

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
