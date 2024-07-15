import { useState } from 'react';
import { fetchTranslations } from './utils/fetchTranslations';
import { convertStringToObject } from './utils/convertStringToObject';
import { useGenerateTextMutation } from '@/hooks/useGenerateText';

export const useTranslations = ({setIsProcessing}: 
    {setIsProcessing: (value: boolean) => void}
) => {
  const [translations, setTranslations] = useState<{ [key: string]: any }>({});
  const { mutateAsync } = useGenerateTextMutation();


  const updateTranslations = async (language: string) => {
    const textToTranslate = {
      welcome: "Welcome",
      capture: "Capture",
      identify: "Identify",
      price: "Find Fair Price",
      read: "Read",
      translate: "Translate Screen",
      shareMessage: "Check out this image I identified!",
      shareSuccess: "Image shared successfully.",
      shareError: "Error sharing image",
      saveSuccess: "Image saved to gallery",
      saveError: "Error saving image",
      permissionRequired: "Permission to access gallery is required",
      capturingMessage: "Please hold the device steady... We are capturing photo",
      waitMessage: "Please wait until loading ends",
      back: "Back",
      drag: "Drag",
      permissionMessage: "We need your permission to show the camera",
      grantPermission: "Grant Permission",
      selectLanguage: "Select Language",
      enterLanguage: "Enter language",
      confirm: "Confirm",
      translateError: "Error translating text",
    };

    setIsProcessing(true);
    const translatedTexts = await fetchTranslations(textToTranslate, language, mutateAsync);
    setTranslations(convertStringToObject(translatedTexts as any));
    setIsProcessing(false);
  };

  return {
    translations,
    updateTranslations,
  };
};
