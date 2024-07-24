import { useState, useCallback } from "react";
import { useMutation } from "react-query";
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
const generateStreamContent = httpsCallable(functions, "generateStreamContent");

interface CloudFunctionResponse {
  result: string;
}

const fetchContent = async (
  data: UseGenerateContentOptions
): Promise<string> => {
  try {
    const result = await generateStreamContent(data);
    return (result.data as CloudFunctionResponse).result;
  } catch (error) {
    console.error("Error calling Cloud Function:", error);
    throw error;
  }
};

interface UseGenerateContentResult {
  sendMessage: (userText: string) => void;
  isLoading: boolean;
  error: unknown;
  aiResponse: string;
}

interface UseGenerateContentOptions {
  promptType: string;
  onSuccess?: (data: string) => void;
  inputData?: object;
  message?: string;
}

export const useGenerateContent = (
  options: UseGenerateContentOptions
): UseGenerateContentResult => {
  const { promptType, onSuccess, inputData } = options;
  const [aiResponse, setAiResponse] = useState<string>("");

  const mutation = useMutation(
    (message: string) => fetchContent({ promptType, inputData, message }),
    {
      onSuccess: (data) => {
        setAiResponse(data);
        onSuccess?.(data);
      },
      onError: (error) => {
        console.error("Error fetching content:", error);
      },
    }
  );

  const sendMessage = useCallback(
    (userText: string) => {
      mutation.mutate(userText);
    },
    [mutation]
  );

  return {
    sendMessage,
    isLoading: mutation.isLoading,
    error: mutation.error,
    aiResponse,
  };
};
