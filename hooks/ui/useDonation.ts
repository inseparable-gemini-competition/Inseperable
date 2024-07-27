import { useState } from "react";
import { useJsonControlledGeneration } from "@/hooks/gemini/useJsonControlledGeneration";
import { useNavigationAndUser } from "@/hooks/authentication/useNavigationAndUser";
import { useTextToSpeech } from "@/hooks/ui/useTextToSpeech";

export const useDonation = () => {
  const [donationModalVisible, setDonationModalVisible] = useState(false);

  const { userData } = useNavigationAndUser();

  const { speak, stop } = useTextToSpeech();
  
  const {
    generate,
    isLoading: isDonationLoading,
    result: donationResult,
  } = useJsonControlledGeneration({
    promptType: "donate",
    inputData: {
      country: userData?.country,
    },
    onSuccess: ()=>{
       speak(donationResult?.description)
    }
  });

  const handleDonate = async () => {
    try {
      await generate();
      setDonationModalVisible(true);
    } catch (error) {
      console.error("Error fetching donation information:", error);
    }
  };

  return {
    donationModalVisible,
    setDonationModalVisible,
    isDonationLoading,
    donationResult,
    handleDonate,
    stop,
  };
};
