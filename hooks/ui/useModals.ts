import { useState } from "react";

export const useModals = () => {
  const [tabooModalVisible, setTabooModalVisible] = useState(false);
  const [whatToSayModalVisible, setWhatToSayModalVisible] = useState(false);
  const [tipsModalVisible, setTipsModalVisible] = useState(false);
  const [donationModalVisible, setDonationModalVisible] = useState(false);
  const [userMoodModalVisible, setUserMoodModalVisible] = useState(false);


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
    setUserMoodModalVisible
  };
};
