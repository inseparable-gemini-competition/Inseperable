import React, { useEffect, useState } from "react";

import { QueryClient, QueryClientProvider } from "react-query";
import Questionnaire from "../screens/Questionnaire";
import Tabs from "../screens/Tabs";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import useStore, { userDataType } from "../store";
import "react-native-polyfill-globals/auto";
import Main from "@/app/screens/Main";

export default function TabLayout() {
  const { userData, setUserData } = useStore();

  const queryClient = new QueryClient();

  const { setItem } = useAsyncStorage("userData");

  const onFinish = ({ userData }: { userData: userDataType }) => {
    if (userData?.country) {
      const data = {
        country: userData?.country,
        flag: userData?.flag,
        plan: userData?.plan,
        description: userData?.description,
      };
      setItem(JSON.stringify(data));
      setUserData(data);
    }
  };

  useEffect(() => {}, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* {userData?.country ? <Tabs /> : <Questionnaire onFinish={onFinish} />} */}
      <Main />
    </QueryClientProvider>
  );
}

export { userDataType };
