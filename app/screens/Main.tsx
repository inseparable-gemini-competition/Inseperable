import React from "react";
import {
  useModals,
  useTipSelection,
  useNavigationAndUser,
  useDonation,
  useTextFeedback,
  useCamera,
  useModalHandlers,
} from "@/hooks";
import MainPresentation from "@/app/components/MainPresentation";
import { useCommandHandler } from "@/hooks/ui/useCommandHandler";



const MainContainer: React.FC = () => {
  const modals = useModals();
  const textFeedBack = useTextFeedback();
  const imageCapture = useCamera(
    textFeedBack.mutateAsync,
    textFeedBack.setCurrentPromptType
  );
  const navigationAndUser = useNavigationAndUser();
  const modalHandlers = useModalHandlers(
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
    modalHandlers,
    modals,
    textFeedBack,
  });

  return (
    <MainPresentation
      modals={modals}
      tipSelection={tipSelection}
      textFeedBack={textFeedBack}
      imageCapture={imageCapture}
      navigationAndUser={navigationAndUser}
      modalHandlers={modalHandlers}
      donation={donation}
      voiceActivation={voiceActivation}
      handleCommand={handleCommand}
    />
  );
};

export default MainContainer;
