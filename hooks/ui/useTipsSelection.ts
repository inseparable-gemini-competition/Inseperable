import useStore from "@/app/store";
import { useState } from "react";

export const useTipSelection = (
 mutateAsync: Function
) => {
  const [selectedTipType, setSelectedTipType] = useState("");
  const {userData} = useStore();


  const handleSelectTipType = async (selectedType: string) => {
    setSelectedTipType(selectedType);
    await mutateAsync({ promptType: "tibs", inputData: { selectedType, country: userData.country } });
  };

  return {
    selectedTipType,
    handleSelectTipType,
  };
};
