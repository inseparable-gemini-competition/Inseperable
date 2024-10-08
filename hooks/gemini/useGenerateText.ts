import * as ImageManipulator from "expo-image-manipulator";
import { useMutation, UseMutationResult } from "react-query";
import {
  getFunctions,
  httpsCallable,
  Functions,
  HttpsCallable,
} from "firebase/functions";
import { convertMarkdownToPlainText } from "../../app/helpers/markdown";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { Alert } from "react-native";

const IMAGE_RESIZE_WIDTH = 512;

export interface GenerateTextInput {
  image?: string | null;
  modelType?: string;
  promptType: string;
  inputData?: object;
}

interface GenerateTextOutput {
  result: string;
}

interface UseGenerateTextOptions {
  onSuccess?: (data: string) => void;
}

// Helper function to manipulate image
const manipulateImage = async (imageUri: string): Promise<string> => {
  try {
    const imageData = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: IMAGE_RESIZE_WIDTH } }],
      { base64: true }
    );

    if (!imageData.base64) {
      throw new Error("Failed to convert image to Base64.");
    }

    return imageData.base64;
  } catch (error) {
    console.error("Error manipulating image:", error);
    throw new Error("Image manipulation failed.");
  }
};

// React hook to use the generateText function with useMutation
export const useGenerateTextMutation = (
  options: UseGenerateTextOptions = {}
): UseMutationResult<string, Error, GenerateTextInput, unknown> => {
  const { currentLanguage, translate } = useTranslations();

  // Function to generate text using Firebase function
  const generateText = async (input: GenerateTextInput): Promise<string> => {
    const functions: Functions = getFunctions();
    const generateTextFunction: HttpsCallable<
      GenerateTextInput,
      GenerateTextOutput
    > = httpsCallable(functions, "generateText");

    try {
      const result = await generateTextFunction({
        ...input,
        inputData: {
          ...input.inputData,
          currentLanguage,
        },
        ...(input.image && { base64Image: await manipulateImage(input.image) }),
      });
      return convertMarkdownToPlainText(result.data.result);
    } catch (error) {
      console.error("Error generating text:", error);
      throw error;
    }
  };

  return useMutation<string, Error, GenerateTextInput, unknown>(generateText, {
    onSuccess: options.onSuccess,
    onError: (error) => {

      Alert.alert(
        translate("unexpectedError"),
        error instanceof Error ? error.message : translate("unexpectedError")
      );
    },
  });
};
