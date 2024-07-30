import { useJsonControlledGeneration } from "@/hooks/gemini/useJsonControlledGeneration";
import { useNavigationAndUser } from "@/hooks/authentication/useNavigationAndUser";
import { useTextToSpeech } from "@/hooks/ui/useTextToSpeech";

export const useDonation = (
  setDonationModalVisible: (visible: boolean) => void
) => {
  const { userData } = useNavigationAndUser();

  const { speak, stop } = useTextToSpeech();

  const {
    generate,
    isLoading: isDonationLoading,
    result: donationResult,
    reset
  } = useJsonControlledGeneration({
    promptType: "donate",
    onSuccess: (data) => {
      speak(data?.description);
    },
  });

  const handleDonate = async () => {
    try {
      await generate({
        country: userData?.country,
      });
      setDonationModalVisible(true);
    } catch (error) {
      console.error("Error fetching donation information:", error);
    }
  };

  return {
    isDonationLoading,
    donationResult,
    handleDonate,
    stop,
    reset,
  };
};
