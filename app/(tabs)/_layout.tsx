import React from "react";

import { useColorScheme } from "@/hooks/useColorScheme";
import { QueryClient, QueryClientProvider } from "react-query";
import Questionnaire from "../screens/Questionnaire";
import Tabs from "../screens/Tabs";

export default function TabLayout() {
  const [isQuestionnaireAnswered, setIsQuestionnaireAnswered] =
    React.useState(false);
  const colorScheme = useColorScheme();
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {isQuestionnaireAnswered ? (
        <Tabs />
      ) : (
        <Questionnaire onFinish={() => setIsQuestionnaireAnswered(true)} />
      )}
    </QueryClientProvider>
  );
}
