import { useState } from "react";

export const useTipSelection = (
 mutateAsync: Function
) => {
  const [selectedTipType, setSelectedTipType] = useState("");


  const handleSelectTipType = async (selectedType: string) => {
    setSelectedTipType(selectedType);
    await mutateAsync({ promptType: "tibs", inputData: { selectedType } });
  };

  return {
    selectedTipType,
    handleSelectTipType,
  };
};
