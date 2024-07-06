import axios from "axios";
import { useMutation } from "react-query";

// API call function
const askGemini = async (data) => {
  const { text, imagePath: originalImage } = data;
  const imagePath = imagePath;
  const apiKey = "AIzaSyBYXid8tKhYNmK0cPP4V6i459HRiPjdMAA";

  console.log("text :>> ", text);
  console.log("imagePath :>> ", imagePath);

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBYXid8tKhYNmK0cPP4V6i459HRiPjdMAA`,
    {
      contents: [
        {
          parts: [
            { text: "What do you think about this image?" },
            {
              inline_data: {
                mime_type: "image/png",
                data: imagePath,
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
  console.log("hello", response.data?.candidates?.[0]?.content?.parts[0]?.text);

  return response.data;
};

export const useFetchContent = () => {
  return useMutation(askGemini);
};
