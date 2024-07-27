// hooks/useSituationAndTaboo.ts
import { useNavigationAndUser } from "@/hooks/authentication";
import { useState } from "react";

export const useSituationAndTaboo = (
  mutateAsync: any,
  setTabooModalVisible: (visible: boolean) => void
) => {
  const [userSituation, setUserSituation] = useState<string>("");
  const { userData } = useNavigationAndUser();

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
