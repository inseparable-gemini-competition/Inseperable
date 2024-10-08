import React from "react";
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
} from "@/hooks";
import TripRecommendationModal from "@/app/components/TripRecommendationModal";
import YouTubeCulturalInsightsModal from "@/app/components/YouTubeCulturalInsightsModal";
import FontSettingsContent from "@/app/components/FontSettings";

interface ModalFactoryProps {
  modals: ReturnType<typeof useModals>;
  donation: ReturnType<typeof useDonation>;
  feedback: ReturnType<typeof useTextFeedback>;
  modalHandlers: ReturnType<typeof useModalHandlers>;
  tipSelection: ReturnType<typeof useTipSelection>;
  userData: any;
}

export const ModalFactory: React.FC<ModalFactoryProps> = ({
  modals,
  donation,
  feedback,
  modalHandlers,
  tipSelection,
  userData,
}) => (
  <>
    {modals.donationModalVisible && (
      <DonationModal
        visible={modals.donationModalVisible}
        isLoading={donation.isDonationLoading}
        result={donation.donationResult}
        onClose={() => {
          modals.setDonationModalVisible(false);
          donation.stop();
          donation.reset();
        }}
        userLanguage={userData?.baseLanguage || ""}
      />
    )}
    {modals.tabooModalVisible && (
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
    )}
    {modals.whatToSayModalVisible && (
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
    )}
    {modals.userMoodModalVisible && (
      <TripRecommendationModal
        visible={modals.userMoodModalVisible}
        onClose={() => {
          modals.setUserMoodModalVisible(false);
          modalHandlers.setRecommendedTrips(null);
        }}
        userMoodAndDesires={modalHandlers.userMoodAndDesires}
        setUserMoodAndDesires={modalHandlers.setUserMoodAndDesires}
        onSubmit={modalHandlers.handleTripRecommendationSubmit}
        isLoading={modalHandlers.userMoodModalLoading}
        recommendedTrips={modalHandlers.recommendedTrips as any}
        onViewMap={modalHandlers.openMapWithLocation}
        onOpenUber={modalHandlers.openUber}
      />
    )}
    {modals.tipsModalVisible && (
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
    )}
    {modals.youtubeCulturalInsightsModalVisible && (
      <YouTubeCulturalInsightsModal
        visible={modals.youtubeCulturalInsightsModalVisible}
        onClose={() => {
          modals.setYoutubeCulturalInsightsModalVisible(false);
        }}
      />
    )}
    {modals.fontSettingsVisible && (
      <FontSettingsContent
        isVisible={modals.fontSettingsVisible}
        onClose={() => {
          modals.setFontSettingsVisible(false);
        }}
      />
    )}
  </>
);
