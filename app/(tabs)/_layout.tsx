import React from "react";

import { QueryClient, QueryClientProvider } from "react-query";
import Questionnaire from "../screens/Questionnaire";
import useStore, { userDataType } from "../store";
import "react-native-polyfill-globals/auto";
import useGoogleImageSearch from "@/hooks/useGoogleImageSearch";
import Main from "@/app/screens/Main";

export default function TabLayout() {
  const { userData, setUserData } = useStore();

  const queryClient = new QueryClient();

  const { fetchPhotos, setLoading, loading } = useGoogleImageSearch();

  const onFinish = async ({
    userData,
    setLocalLoading,
  }: {
    userData: userDataType;
    setLocalLoading: (loading: boolean) => void;
  }) => {
    if (userData?.country) {
      setLocalLoading(loading);
      const landmarkUri = await fetchPhotos(userData.mostFamousLandmark);
      setUserData({
        ...userData,
        mostFamousLandmark: landmarkUri || "",
      });
      setLoading(false);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      {userData?.country ? <Main /> : <Questionnaire onFinish={onFinish} />}
    </QueryClientProvider>
  );
}

export { userDataType };
