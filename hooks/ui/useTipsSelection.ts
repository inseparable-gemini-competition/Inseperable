import { useState } from "react";
import { useGenerateTextMutation } from "@/hooks/gemini/useGenerateText";

export const useTipSelection = () => {
  const [selectedTipType, setSelectedTipType] = useState("");

  const { mutateAsync } = useGenerateTextMutation();

  const handleSelectTipType = async (selectedType: string) => {
    setSelectedTipType(selectedType);
    await mutateAsync({ promptType: "tibs", inputData: { selectedType } });
  };

  return {
    selectedTipType,
    handleSelectTipType,
  };
};
