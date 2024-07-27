import { useMutation } from "react-query";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/app/helpers/firebaseConfig";
import { speak } from "expo-speech";
import { useTextToSpeech } from "@/hooks/ui";

export const useJsonControlledGeneration = ({
  promptType,
  inputData,
  onSuccess,
}: {
  promptType: string;
  inputData?: object;
  onSuccess?: () => void;
}) => {
  const generateJsonContent = httpsCallable(functions, "generateJsonContent");

  const fetchJsonControlledGeneration = async () => {
    const result = (await generateJsonContent({
      promptType,
      inputData,
    })) as any;
    if (__DEV__) console.log("jsonResult ", result.data);
    return result.data?.result?.[0]
      ? result.data?.result?.[0]
      : result.data?.result;
  };

  const { mutate, data, isLoading, isError } = useMutation(
    fetchJsonControlledGeneration,
    {
      onSuccess,
    }
  );

  return {
    generate: mutate,
    result: data,
    isLoading,
    isError,
  };
};
