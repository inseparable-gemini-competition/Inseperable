import axios from "axios";
import { useMutation } from "react-query";
import * as ImageManipulator from "expo-image-manipulator";

const askGemini = async (data: any) => {
  const { text, imageUri } = data;
  const apiKey = "AIzaSyBYXid8tKhYNmK0cPP4V6i459HRiPjdMAA";

  try {
    const imageData = await ImageManipulator.manipulateAsync(
      `${imageUri}`,
      [{ resize: { width: 512 } }],
      { base64: true }
    );

    const base64Image = imageData.base64;

    if (base64Image) {

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                { text },
                {
                  inline_data: {
                    mime_type: "image/png",
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log('text ', text, response.data?.candidates?.[0]?.content?.parts?.[0]?.text)
      return response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    } else {
      throw new Error("Failed to convert image to Base64.");
    }
  } catch (error) {
    console.error("Error processing image:", JSON.stringify(error));
    throw error; // Rethrow the error to be handled by react-query
  }
};

export const useFetchContent = () => {
  return useMutation(askGemini);
};
