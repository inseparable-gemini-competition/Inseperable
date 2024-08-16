import React from "react";
import {
  useModals,
  useTipSelection,
  useDonation,
  useTextFeedback,
  useCamera,
  useModalHandlers,
} from "@/hooks";
import MainPresentation from "@/app/components/MainPresentation";
import { useCommandHandler } from "@/hooks/ui/useCommandHandler";
import useExitHandler from "@/hooks/ui/useExitHandler";

const MainContainer: React.FC = () => {
  const modals = useModals();
  const textFeedBack = useTextFeedback();
  const imageCapture = useCamera(
    textFeedBack.mutateAsync,
    textFeedBack.setCurrentPromptType
  );
  const modalHandlers = useModalHandlers(
    textFeedBack.mutateAsync,
    modals.setTabooModalVisible,
    modals.setFontSettingsVisible
  );
  const tipSelection = useTipSelection(textFeedBack.mutateAsync);
  const donation = useDonation(modals.setDonationModalVisible);

  const { handleCommand, voiceActivation } = useCommandHandler({
    imageCapture,
    donation,
    modalHandlers,
    modals,
    textFeedBack,
  });

  useExitHandler(modals.noModalVisible);

  return (
    <MainPresentation
      modals={modals}
      tipSelection={tipSelection}
      textFeedBack={textFeedBack}
      imageCapture={imageCapture}
      modalHandlers={modalHandlers}
      donation={donation}
      voiceActivation={voiceActivation}
      handleCommand={handleCommand}
    />
  );
};

export default MainContainer;
