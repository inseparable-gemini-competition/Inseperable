import { useState, useRef, useCallback, useEffect } from "react";
import Voice from "@react-native-voice/voice";
import * as Speech from "expo-speech";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { useGenerateContent } from "@/hooks/gemini";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";

export const useVoiceCommands = () => {
  const [listening, setListening] = useState<boolean>(false);
  const [voiceCountdown, setVoiceCountdown] = useState<number | null>(null);
  const voiceCountdownRef = useRef<NodeJS.Timeout | null>(null);
  const { translate } = useTranslations();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const { sendMessage, aiResponse, isLoading } = useGenerateContent({
    promptType: "audioCommand",
    inputData: { fromLanguage: "arabic", toLanguage: "english" },
    onSuccess: (data) => {
      setRecording(null);
      console.log("AI response received:", data);
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
      console.log("Recording started:", recording);
    } catch (err) {
      console.error("Failed to start recording", err);
      setListening(false);
      setRecording(null);
      recordingRef.current = null;
    }
  };

  const stopRecording = useCallback(async () => {
    console.log("Attempting to stop recording. Current recording state:", recordingRef.current);
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
    setListening(false);
  }, []);

  const startVoiceCountdown = useCallback(() => {
    console.log("Starting voice countdown");
    voiceCountdownRef.current = setInterval(() => {
      setVoiceCountdown((prev) => {
        const next = prev !== null ? prev - 1 : null;
        console.log("Countdown:", next);
        if (next !== null && next <= 0) {
          clearInterval(voiceCountdownRef.current!);
          voiceCountdownRef.current = null;
          console.log("Countdown finished, stopping recording");
          stopRecording();
          return null;
        }
        return next;
      });
    }, 1000);
  }, [stopRecording]);

  const clearVoiceCountdown = useCallback(() => {
    if (voiceCountdownRef.current) {
      clearInterval(voiceCountdownRef.current);
      voiceCountdownRef.current = null;
      setVoiceCountdown(null);
      console.log("Voice countdown cleared");
    }
  }, []);

  const onVoiceRecognitionClosed = useCallback(() => {
    setListening(false);
    clearVoiceCountdown();
    if (recordingRef.current) {
      stopRecording();
    }
    Voice.stop();
    console.log("Voice recognition closed");
  }, [clearVoiceCountdown, stopRecording]);

  const activateVoiceCommand = useCallback(() => {
    console.log("Activating voice command");
    setListening(true);
    setVoiceCountdown(10);
    Speech.speak(translate("youHave10Seconds"), {
      onDone: () => {
        console.log("Speech completed, starting countdown and recording");
        startVoiceCountdown();
        startRecording();
      },
    });
  }, [translate, startVoiceCountdown]);

  console.log("Current state:", { listening, isLoading, aiResponse, voiceCountdown });

  return {
    listening,
    voiceCountdown,
    activateVoiceCommand,
    onVoiceRecognitionClosed,
    command: aiResponse,
  };
};