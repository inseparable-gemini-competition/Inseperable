import { useState, useRef, useCallback, useEffect } from "react";
import { Audio } from "expo-av";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { useGenerateContent } from "@/hooks/gemini";
import * as FileSystem from "expo-file-system";
import useStore from "@/app/store";
import { useTextToSpeech } from "@/app/context/TextToSpeechContext";

interface UseVoiceToTextResult {
  isListening: boolean;
  transcript: string;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  error: string | null;
  isSendingMessage: boolean;
}

export const useVoiceToText = (
  onSubmit: (text: string) => void
): UseVoiceToTextResult => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const { translate } = useTranslations();
  const { currentLanguage } = useStore();
  const { speak } = useTextToSpeech();

  const { sendMessage, isLoading: isSendingMessage } = useGenerateContent({
    promptType: "voiceToText",
    onSuccess: (data) => {
      setTranscript(data);
      onSubmit(data);
    },
  });

  useEffect(() => {
    recordingRef.current = recording;
  }, [recording]);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(console.error);
      }
    };
  }, []);

  const sendAudioToGemini = async (uri: string) => {
    try {
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      sendMessage("transcribe this audio file (without times) just write the content of the audio", {
        data: base64Audio,
        mimeType: "audio/mp4",
      });
    } catch (error) {
      console.error("Error sending audio to Gemini:", error);
      setError("Failed to process audio");
    }
  };

  const startListening = useCallback(async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      speak(translate("listeningStarted"), {
        language: currentLanguage || "en",
      });
      setTimeout(() => {
        setRecording(recording);
        recordingRef.current = recording;
        setIsListening(true);
        setError(null);
        setTranscript("");
      }, 300);
    } catch (err) {
      console.error("Failed to start recording", err);
      setIsListening(false);
      setRecording(null);
      recordingRef.current = null;
      setError("Failed to start voice recognition");
    }
  }, [speak, translate, currentLanguage]);

  const stopListening = useCallback(async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        if (uri) {
          speak(translate("processing"), {
            language: currentLanguage || "en",
          });
          await sendAudioToGemini(uri);
        } else {
          console.error("No URI obtained from recording");
          setError("Failed to process recording");
        }
      } catch (error) {
        console.error("Error stopping recording:", error);
        setError("Failed to stop voice recognition");
      } finally {
        setRecording(null);
        recordingRef.current = null;
        setIsListening(false);
      }
    } else {
      console.warn("No active recording to stop");
      setError("No active recording to stop");
    }
  }, [speak, translate, currentLanguage, sendAudioToGemini]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
    isSendingMessage,
  };
};
