import { useMutation } from "react-query";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/app/helpers/firebaseConfig"; 

export const useJsonControlledGeneration = ({
  promptType,
  inputData,
}: {
  promptType: string;
  inputData?: object;
}) => {
  const generateJsonContent = httpsCallable(functions, "generateJsonContent");

  const fetchJsonControlledGeneration = async () => {
    const result = await generateJsonContent({ promptType, inputData });
    if (__DEV__) console.log("jsonResult ", result.data);
    return result.data;
  };

  const { mutate, data, isLoading, isError } = useMutation(
    fetchJsonControlledGeneration
  );

  return {
    generate: mutate,
    result: data as any,
    isLoading,
    isError,
  };
};
