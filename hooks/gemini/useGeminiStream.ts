import { translate } from '@/app/helpers/i18n';
import { useTranslations } from "./../ui/useTranslations";
import { useState, useCallback } from "react";
import { useMutation } from "react-query";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Alert } from "react-native";

const functions = getFunctions();
const generateStreamContent = httpsCallable(functions, "generateStreamContent");

interface CloudFunctionResponse {
  result: string;
}

interface UseGenerateContentOptions {
  promptType: string;
  onSuccess?: (data: string) => void;
  inputData?: object;
  message?: string;
  audioData?: {
    data: string;
    mimeType: string;
  };
}

const fetchContent = async (
  data: UseGenerateContentOptions
): Promise<string> => {
  try {
    const { audioData, ...restData } = data;
    const result = await generateStreamContent({
      ...restData,
      ...(audioData && {
        audioBase64: audioData.data,
        audioMimeType: audioData.mimeType,
      }),
    });
    return (result.data as CloudFunctionResponse).result;
  } catch (error) {
    console.error("Error calling Cloud Function:", error);
    throw error;
  }
};

interface UseGenerateContentResult {
  sendMessage: (
    userText: string,
    audioData?: {
      data: string;
      mimeType: string;
    }
  ) => void;
  isLoading: boolean;
  error: unknown;
  aiResponse: string;
}

export const useGenerateContent = (
  options: UseGenerateContentOptions
): UseGenerateContentResult => {
  const { promptType, onSuccess, inputData } = options;
  const [aiResponse, setAiResponse] = useState<string>("");
  const {translate} = useTranslations();

  const { currentLanguage } = useTranslations();
  const mutation = useMutation(
    async ({
      message,
      audioData,
    }: {
      message: string;
      audioData?: {
        data: string;
        mimeType: string;
      };
    }) =>
      fetchContent({
        promptType,
        inputData: { ...inputData, currentLanguage },
        message,
        audioData,
      }),
    {
      onSuccess: (data) => {
        setAiResponse(data);
        onSuccess?.(data);
      },
      onError: (error) => {
        Alert.alert(
          translate("unexpectedError"),
          error instanceof Error ? error.message : translate("unexpectedError")
        );
      },
    }
  );
  

  const sendMessage = useCallback(
    (
      userText: string,
      audioData?: {
        data: string;
        mimeType: string;
      }
    ) => {
      mutation.mutate({ message: userText, audioData });
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
