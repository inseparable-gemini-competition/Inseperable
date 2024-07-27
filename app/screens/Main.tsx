import React from "react";
import {
  useModals,
  useTipSelection,
  useImageCapture,
  useNavigationAndUser,
  useSituationAndTaboo,
  useDonation,
  useTextFeedback,
} from "@/hooks";
import MainPresentation from "@/app/components/MainPresentation";
import { useCommandHandler } from "@/hooks/ui/useCommandHandler";



const MainContainer: React.FC = () => {
  const modals = useModals();
  const textFeedBack = useTextFeedback();
  const imageCapture = useImageCapture(
    textFeedBack.mutateAsync,
    textFeedBack.currentPromptType
  );
  const navigationAndUser = useNavigationAndUser();
  const situationAndTaboo = useSituationAndTaboo(
    textFeedBack.mutateAsync,
    modals.setTabooModalVisible
  );
  const tipSelection = useTipSelection(textFeedBack.mutateAsync);
  const donation = useDonation(
    modals.setDonationModalVisible
  );

  const { handleCommand, voiceActivation } = useCommandHandler({
    imageCapture,
    donation,
    situationAndTaboo,
    modals,
    textFeedBack: textFeedBack,
  });

  return (
    <MainPresentation
      modals={modals}
      tipSelection={tipSelection}
      textFeedBack={textFeedBack}
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
