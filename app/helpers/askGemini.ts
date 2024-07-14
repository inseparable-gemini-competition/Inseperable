import axios from "axios";
import { useMutation } from "react-query";
import * as ImageManipulator from "expo-image-manipulator";

// Constants
const API_KEY = "AIzaSyDTiF7YjBUWM0l0nKpzicv9R6kReU3dn8Q";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;
const IMAGE_RESIZE_WIDTH = 512;

// Helper function to manipulate image
const manipulateImage = async (imageUri: string) => {
  const imageData = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: IMAGE_RESIZE_WIDTH } }],
    { base64: true }
  );

  if (!imageData.base64) {
    throw new Error("Failed to convert image to Base64.");
  }

  return imageData.base64;
};

// Main function to ask Gemini
const askGemini = async (data: { text: any; imageUri?: string; }) => {
  const { text, imageUri } = data;

  let contents = [
    {
      parts: [
        {
          text,
        },
      ],
    },
  ];

  if (imageUri) {
    const base64Image = await manipulateImage(imageUri);
    contents[0].parts.push({
      inline_data: {
        mime_type: "image/png",
        data: base64Image,
      },
    });
  }

  try {
    const response = await axios.post(
      API_URL,
      { contents },
      {
        headers: {
          "Content-Type": "application/json",
        }
      }
    );
    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error) {
    console.error("Error processing request:", JSON.stringify(error));
    throw error;
  }
};

// Custom hook to use the askGemini function
export const useFetchContent = () => {
  return useMutation(askGemini);
};
