export const fetchTranslations = async (
    text: { [key: string]: any },
    targetLanguage: string,
    mutateAsync: any,
  ) => {
    try {
      const translatedText = await mutateAsync({
        text: `translate this object values to ${targetLanguage} without any extra words return an object with same keys but translated values: ${JSON.stringify(text)}`,
      });
      return translatedText;
    } catch (error) {
      console.error("Translation failed:", error);
      return text; // Fallback to original text
    }
  };
  