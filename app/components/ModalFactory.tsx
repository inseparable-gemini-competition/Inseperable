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
  useModalHandlers,
  useTipSelection,
  useVoiceActivation,
} from "@/hooks";
import TripRecommendationModal from "@/app/components/TripRecommendationModal";

interface ModalFactoryProps {
  modals: ReturnType<typeof useModals>;
  donation: ReturnType<typeof useDonation>;
  feedback: ReturnType<typeof useTextFeedback>;
  modalHandlers: ReturnType<typeof useModalHandlers>;
  tipSelection: ReturnType<typeof useTipSelection>;
  voiceActivation: ReturnType<typeof useVoiceActivation>;
  userData: any;
}

export const ModalFactory: React.FC<ModalFactoryProps> = ({
  modals,
  donation,
  feedback,
  modalHandlers,
  tipSelection,
  voiceActivation,
  userData,
}) => (
  <>
    <VoiceRecognitionModal
      visible={
        !!voiceActivation.isListening ||
        !!voiceActivation.isProcessing
      }
      isListening={!!voiceActivation.isListening}
      isProcessing={!!voiceActivation.isProcessing}
      command={voiceActivation.command}
      onCancel={voiceActivation.cancelVoiceCommand}
      onDone={voiceActivation.stopListening}
    />
    <DonationModal
      visible={modals.donationModalVisible}
      isLoading={donation.isDonationLoading}
      result={donation.donationResult}
      onClose={() => {
        modals.setDonationModalVisible(false);
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
      onSubmit={modalHandlers.handleSituationSubmit}
      userSituation={modalHandlers.userSituation}
      setUserSituation={modalHandlers.setUserSituation}
    />
    <TripRecommendationModal
      visible={modals.userMoodModalVisible}
      isLoading={modalHandlers.userMoodModalLoading}
      onClose={() => {
        modals.setUserMoodModalVisible(false);
      }}
      onSubmit={modalHandlers.handleTripRecommendationSubmit}
      userMoodAndDesires={modalHandlers.userMoodAndDesires}
      setUserMoodAndDesires={modalHandlers.setUserMoodAndDesires}
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
