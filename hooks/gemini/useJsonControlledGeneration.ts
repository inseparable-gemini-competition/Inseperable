import { useMutation } from "react-query";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/app/helpers/firebaseConfig";
import { useTranslations } from "@/hooks/ui/useTranslations";

export const useJsonControlledGeneration = ({
  promptType,
  onSuccess,
}: {
  promptType: string;
  onSuccess?: (input: any) => void;
}) => {
  const generateJsonContent = httpsCallable(functions, "generateJsonContent");
  const { currentLanguage } = useTranslations();

  const fetchJsonControlledGeneration = async (inputData?: object) => {
    const result = (await generateJsonContent({
      promptType,
      inputData: {
        ...inputData,
        currentLanguage 
      },
    })) as any;
    return result.data?.result?.[0]
      ? result.data?.result?.[0]
      : result.data?.result;
  };

  const mutation = useMutation(fetchJsonControlledGeneration, {
    onSuccess,
  });

  const generate = async (inputData?: object) => {
    return new Promise((resolve, reject) => {
      mutation.mutate(inputData, {
        onSuccess: (data) => resolve(data),
        onError: (error) => reject(error),
      });
    });
  };

  return {
    generate,
    result: mutation.data,
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    reset: mutation.reset,
  };
};