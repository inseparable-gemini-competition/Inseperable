import { useState } from "react";
import { useJsonControlledGeneration } from "@/hooks/useJsonControlledGeneration";
import { generateSchema } from "@/hooks/utils/generateSchema";

export const useDonation = () => {
  const [donationModalVisible, setDonationModalVisible] = useState(false);

  const schema = generateSchema("recommendation donation entity name", {
    name: ["string", "donation entity name"],
    websiteLink: ["string", "donation entity website link"],
    description: ["string", "donation entity 6 lines description"],
  });

  const { generate, isLoading: isDonationLoading, result: donationResult } = useJsonControlledGeneration(schema);

  const handleDonate = async (prompt: string) => {
    try {
      await generate(prompt);
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
  };
};
