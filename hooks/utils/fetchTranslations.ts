import { GenerateTextInput } from "../gemini/useGenerateText";

export const fetchTranslations = async (
  text: { [key: string]: any },
  targetLanguage: string,
  mutateAsync: (variables: GenerateTextInput) => Promise<string>
) => {
  try {
    const translatedText = await mutateAsync({
      promptType: "translate",
      inputData: {
        targetLanguage,
        text,
      },
    });
    return translatedText;
  } catch (error) {
    console.error("Translation failed:", error);
    return text; // Fallback to original text
  }
};
