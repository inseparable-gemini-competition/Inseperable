import { useState } from "react";

export const useModals = () => {
  const [tabooModalVisible, setTabooModalVisible] = useState(false);
  const [whatToSayModalVisible, setWhatToSayModalVisible] = useState(false);
  const [tipsModalVisible, setTipsModalVisible] = useState(false);
  const [donationModalVisible, setDonationModalVisible] = useState(false);
  const [userMoodModalVisible, setUserMoodModalVisible] = useState(false);
  const [fontSettingsVisible, setFontSettingsVisible] = useState(false);
  const [
    youtubeCulturalInsightsModalVisible,
    setYoutubeCulturalInsightsModalVisible,
  ] = useState(false);

  const noModalVisible =
    !tabooModalVisible &&
    !whatToSayModalVisible &&
    !tipsModalVisible &&
    !donationModalVisible &&
    !userMoodModalVisible &&
    !youtubeCulturalInsightsModalVisible;

  return {
    tabooModalVisible,
    setTabooModalVisible,
    whatToSayModalVisible,
    setWhatToSayModalVisible,
    tipsModalVisible,
    setTipsModalVisible,
    donationModalVisible,
    setDonationModalVisible,
    userMoodModalVisible,
    setUserMoodModalVisible,
    noModalVisible,
    youtubeCulturalInsightsModalVisible,
    setYoutubeCulturalInsightsModalVisible,
    fontSettingsVisible,
    setFontSettingsVisible
  };
};
