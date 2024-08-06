import { useJsonControlledGeneration } from "@/hooks/gemini/useJsonControlledGeneration";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { useUpdateUserScore } from "@/hooks/logic/useUserScore";
import useStore from "@/app/store";
import { useTextToSpeech } from "@/app/context/TextToSpeechContext";


export const useDonation = (
  setDonationModalVisible: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { userData } = useStore();

  const { speak, stop } = useTextToSpeech();
  const { currentLanguage } = useTranslations();
  const { mutateAsync: updateUserScore } = useUpdateUserScore();

  const {
    generate,
    isLoading: isDonationLoading,
    result: donationResult,
    reset,
  } = useJsonControlledGeneration({
    promptType: "donate",
    onSuccess: (data) => {
      // setDonationModalVisible((visible) => {
      //   if (visible) {
      //     speak(data?.description, {
      //       language: currentLanguage || "en",
      //     });
      //   }
      //   return visible;
      // });
    },
  });

  const handleDonate = async () => {
    try {
      await generate({
        country: userData?.country,
      });
      updateUserScore({
        social: 10,
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
