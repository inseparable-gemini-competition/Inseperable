import axios from "axios";
import { useMutation } from "react-query";
import * as ImageManipulator from "expo-image-manipulator";

// Constants
const API_KEY = "AIzaSyDTiF7YjBUWM0l0nKpzicv9R6kReU3dn8Q";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;
const IMAGE_RESIZE_WIDTH = 512;

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

// Function to construct content parts
const constructContentParts = async (text: string, imageUri?: string) => {
  const parts = [{ text }];
  if (imageUri) {
    const base64Image = await manipulateImage(imageUri);
    parts.push({
      inline_data: {
        mime_type: "image/png",
        data: base64Image,
      },
    });
  }
  return parts;
};

// Main function to ask Gemini
const askGemini = async (data: { text: string; imageUri?: string }): Promise<string> => {
  const { text, imageUri } = data;

  try {
    const parts = await constructContentParts(text, imageUri);
    const response = await axios.post(
      API_URL,
      { contents: [{ parts }] },
      { headers: { "Content-Type": "application/json" } }
    );

    const resultText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      throw new Error("No content returned from API.");
    }
    return resultText;
  } catch (error) {
    console.error("Error processing request:", error);
    throw new Error("API request failed.");
  }
};

// Custom hook to use the askGemini function
export const useFetchContent = () => {
  return useMutation(askGemini);
};
