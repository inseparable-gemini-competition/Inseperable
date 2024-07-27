// hooks/useSituationAndTaboo.ts
import { useState } from "react";

interface UserData {
  country: string;
}

export const useSituationAndTaboo = (
  mutateAsync: any,
  userData: UserData,
  setTabooModalVisible: (visible: boolean) => void
) => {
  const [userSituation, setUserSituation] = useState<string>("");

  const handleSituationSubmit = async () => {
    await mutateAsync({
      promptType: "situation",
      inputData: {
        userSituation,
        country: userData.country,
      },
    });
  };

  const handleTabooSubmit = async () => {
    setTabooModalVisible(true);
    await mutateAsync({
      promptType: "taboo",
      inputData: { country: userData?.country },
    });
  };

  return {
    userSituation,
    setUserSituation,
    handleSituationSubmit,
    handleTabooSubmit,
  };
};