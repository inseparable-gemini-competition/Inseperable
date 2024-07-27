import React from "react";
import VoiceRecognitionModal from "@/app/components/VoiceRecognitionModal";
import DonationModal from "@/app/components/DonationModal";
import TabooModal from "@/app/components/TabooModal";
import WhatToSayModal from "@/app/components/WhatToSayModal";
import TipsModal from "@/app/components/tipModal";
import {
  useModals,
  useDonation,
  useTextFeedback,
  useSituationAndTaboo,
  useTipSelection,
  useVoiceActivation,
} from "@/hooks";

interface ModalFactoryProps {
  modals: ReturnType<typeof useModals>;
  donation: ReturnType<typeof useDonation>;
  feedback: ReturnType<typeof useTextFeedback>;
  situationAndTaboo: ReturnType<typeof useSituationAndTaboo>;
  tipSelection: ReturnType<typeof useTipSelection>;
  voiceActivation: ReturnType<typeof useVoiceActivation>;
  userData: any;
}

export const ModalFactory: React.FC<ModalFactoryProps> = ({
  modals,
  donation,
  feedback,
  situationAndTaboo,
  tipSelection,
  voiceActivation,
  userData,
}) => (
  <>
    <VoiceRecognitionModal
      visible={
        voiceActivation.listening && voiceActivation.voiceCountdown !== null
      }
      countdown={voiceActivation.voiceCountdown || 0}
      command={voiceActivation.command}
      onCancel={voiceActivation.onVoiceRecognitionClosed}
    />
    <DonationModal
      visible={donation.donationModalVisible}
      isLoading={donation.isDonationLoading}
      result={donation.donationResult}
      onClose={() => {
        donation.setDonationModalVisible(false);
        donation.stop();
      }}
      userLanguage={userData?.baseLanguage || ""}
    />
    <TabooModal
      visible={modals.tabooModalVisible}
      isLoading={feedback.isLoadingFromGemini}
      result={feedback.feedbackText || ""}
      onClose={() => {
        modals.setTabooModalVisible(false);
        feedback.stop();
        feedback.reset();
      }}
    />
    <WhatToSayModal
      visible={modals.whatToSayModalVisible}
      isLoading={feedback.isLoadingFromGemini}
      result={feedback.feedbackText || ""}
      onClose={() => {
        modals.setWhatToSayModalVisible(false);
        feedback.stop();
        feedback.reset();
      }}
      onSubmit={situationAndTaboo.handleSituationSubmit}
      userSituation={situationAndTaboo.userSituation}
      setUserSituation={situationAndTaboo.setUserSituation}
    />
    <TipsModal
      visible={modals.tipsModalVisible}
      isLoading={feedback.isLoadingFromGemini}
      result={feedback.feedbackText || ""}
      onClose={() => {
        modals.setTipsModalVisible(false);
        feedback.stop();
        feedback.reset();
      }}
      onSelectTipType={tipSelection.handleSelectTipType}
    />
  </>
);
