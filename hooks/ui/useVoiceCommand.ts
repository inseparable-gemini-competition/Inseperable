import { useState, useRef, useCallback, useEffect } from "react";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { useGenerateContent } from "@/hooks/gemini";
import * as FileSystem from "expo-file-system";

export const useVoiceCommands = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const { translate } = useTranslations();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const { sendMessage, aiResponse, isLoading } = useGenerateContent({
    promptType: "audioCommand",
    inputData: { fromLanguage: "arabic", toLanguage: "english" },
    onSuccess: (data) => {
      setRecording(null);
      setIsListening(false);
    },
  });

  useEffect(() => {
    console.log("Recording state changed:", recording);
    recordingRef.current = recording;
  }, [recording]);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        console.log("Cleaning up recording");
        recordingRef.current.stopAndUnloadAsync().catch(console.error);
      }
    };
  }, []);

  const sendAudioToGemini = async (uri: string) => {
    try {
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log("Sending audio to Gemini");
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
      console.log("Requesting audio permissions");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Creating new recording");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      recordingRef.current = recording;
      setIsListening(true);
      console.log("Recording started:", recording);
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
        console.log("Recording stopped, URI:", uri);
        if (uri) {
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
    console.log("Activating voice command");
    Speech.speak(translate("pleaseStartSpeaking"), {
      onDone: () => {
        startRecording();
      },
    });
  }, [translate]);

  const cancelVoiceCommand = useCallback(() => {
    if (recordingRef.current) {
      stopListening();
    }
    setIsListening(false);
    console.log("Voice command cancelled");
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