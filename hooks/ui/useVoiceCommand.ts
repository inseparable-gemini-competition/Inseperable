import { useState, useRef, useCallback, useEffect } from "react";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { useGenerateContent } from "@/hooks/gemini";
import * as FileSystem from "expo-file-system";
import useStore from "@/app/store";

export const useVoiceCommands = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const { translate } = useTranslations();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const { currentLanguage } = useStore();

  const { sendMessage, aiResponse, isLoading } = useGenerateContent({
    promptType: "audioCommand",
    onSuccess: (data) => {
      setRecording(null);
      if (data === "none") {
        Speech.speak(translate("identifiedCategory"), {
          language: currentLanguage || "en",
        });
      } else {
        Speech.speak(translate("unidentifedCategory"), {
          language: currentLanguage || "en",
        });
      }
      setIsListening(false);
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
      sendMessage("extract the command out of this audio file", {
        data: base64Audio,
        mimeType: "audio/mp4",
      });
    } catch (error) {
      console.error("Error sending audio to Gemini:", error);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      recordingRef.current = recording;
      setIsListening(true);
    } catch (err) {
      console.error("Failed to start recording", err);
      setIsListening(false);
      setRecording(null);
      recordingRef.current = null;
    }
  };

  const stopListening = useCallback(async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        if (uri) {
          Speech.speak(translate("processing"), {
            language: currentLanguage || "en",
          });
          await sendAudioToGemini(uri);
        } else {
          console.error("No URI obtained from recording");
        }
      } catch (error) {
        console.error("Error stopping recording:", error);
      } finally {
        setRecording(null);
        recordingRef.current = null;
      }
    } else {
      console.warn("No active recording to stop");
    }
    setIsListening(false);
  }, []);

  const activateVoiceCommand = useCallback(() => {
    Speech.speak(translate("pleaseStartSpeakingAndLongPresToStop"), {
      onDone: () => {
        startRecording();
      },
      language: currentLanguage || "en",
    });
  }, [translate]);

  const cancelVoiceCommand = useCallback(() => {
    if (recordingRef.current) {
      stopListening();
    }
    setIsListening(false);
  }, [stopListening]);

  return {
    isListening,
    activateVoiceCommand,
    stopListening,
    cancelVoiceCommand,
    command: aiResponse,
    isProcessing: isLoading,
  };
};
