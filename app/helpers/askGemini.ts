import axios from "axios";
import { useMutation } from "react-query";
import * as ImageManipulator from "expo-image-manipulator";

const askGemini = async (data: any) => {
  const { text, imageUri, target_language } = data; // Changed to target_language
  const apiKey = "AIzaSyDTiF7YjBUWM0l0nKpzicv9R6kReU3dn8Q";

  try {
    let contents = [
      {
        parts: [
          {
            text: target_language
              ? `translate this object values to ${target_language} without any extra words return an object with same keys but translated values: ${JSON.stringify(
                  text
                )}`
              : text,
          },
        ],
      },
    ];

    if (imageUri) {
      const imageData = await ImageManipulator.manipulateAsync(
        `${imageUri}`,
        [{ resize: { width: 512 } }],
        { base64: true }
      );

      const base64Image = imageData.base64;

      if (base64Image) {
        contents[0].parts.push({
          inline_data: {
            mime_type: "image/png",
            data: base64Image,
          },
        });
      } else {
        throw new Error("Failed to convert image to Base64.");
      }
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      { contents }, // Included target_language in the request body
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error) {
    console.error("Error processing request:", JSON.stringify(error));
    throw error; // Rethrow the error to be handled by react-query
  }
};

export const useFetchContent = () => {
  return useMutation(askGemini);
};
