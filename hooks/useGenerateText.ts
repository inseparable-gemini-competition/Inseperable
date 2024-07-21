import { GoogleGenerativeAI } from "@google/generative-ai";
import * as ImageManipulator from "expo-image-manipulator";
import { useMutation } from "react-query";

const IMAGE_RESIZE_WIDTH = 512;

interface GenerateTextData {
  text: string;
  imageUri?: string;
  modelType?: string;
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

// Function to generate text using Google Generative AI
const generateText = async ({
  text,
  imageUri,
  modelType,
}: GenerateTextData): Promise<string> => {
  const genAI = new GoogleGenerativeAI(
    "AIzaSyDTiF7YjBUWM0l0nKpzicv9R6kReU3dn8Q"
  );

  const model = genAI.getGenerativeModel({
    model: modelType ?? "gemini-1.5-pro",
  });

  let result: any;
  if (imageUri) {
    const image = {
      inlineData: {
        data: await manipulateImage(imageUri),
        mimeType: "image/png",
      },
    };
    result = await model.generateContent([text, image]);
  } else {
    result = await model.generateContent([text]);
  }

  return result?.response.candidates[0].content.parts[0].text || "";
};

// React hook to use the generateText function with useMutation
export const useGenerateTextMutation = ({ onSuccess }: any) => {
  return useMutation(generateText, {
    onSuccess,
  });
};
