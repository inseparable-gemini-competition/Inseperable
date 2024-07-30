import { useJsonControlledGeneration } from "@/hooks/gemini/useJsonControlledGeneration";
import { useNavigationAndUser } from "@/hooks/authentication/useNavigationAndUser";
import { useTextToSpeech } from "@/hooks/ui/useTextToSpeech";
import { useTranslations } from "@/hooks/ui/useTranslations";

export const useDonation = (
  setDonationModalVisible: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { userData } = useNavigationAndUser();

  const { speak, stop } = useTextToSpeech();
  const {currentLanguage} = useTranslations();

  const {
    generate,
    isLoading: isDonationLoading,
    result: donationResult,
    reset
  } = useJsonControlledGeneration({
    promptType: "donate",
    onSuccess: (data) => {
      setDonationModalVisible((visible) => {
        if (visible) {
          speak(data?.description, {
            language: currentLanguage || "en",
          });
        }
        return visible
      });
   
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
