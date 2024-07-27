import { useState, useRef, useEffect } from "react";
import Voice from "@react-native-voice/voice";
import * as Speech from "expo-speech";
import { useTranslations } from "@/hooks/ui/useTranslations";

export const useVoiceCommands = (handleCommand: (command: string) => void) => {
  const [listening, setListening] = useState<boolean>(false);
  const [voiceCountdown, setVoiceCountdown] = useState<number | null>(null);
  const voiceCountdownRef = useRef<NodeJS.Timeout | null>(null);
  const [command, setCommand] = useState<string>("");
  const { translate } = useTranslations();

  const startVoiceCountdown = () => {
    clearVoiceCountdown();
    setVoiceCountdown(10);
    voiceCountdownRef.current = setInterval(() => {
      setVoiceCountdown((prev) => {
        if (prev && prev <= 1) {
          clearVoiceCountdown();
          setListening(false);
          Voice.stop();
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const clearVoiceCountdown = () => {
    if (voiceCountdownRef.current) {
      clearInterval(voiceCountdownRef.current);
      voiceCountdownRef.current = null;
    }
  };

  const onVoiceRecognitionClosed = () => {
    setListening(false);
    clearVoiceCountdown();
    setVoiceCountdown(null);
    Voice.stop();
  };
  const onSpeechStart = (e: any) => {
    console.log("onSpeechStart:", e);
  };

  const onSpeechEnd = (e: any) => {
    console.log("onSpeechEnd:", e);
  };

  const onSpeechError = (e: any) => {
    console.log("onSpeechError:", e);
  };

  const onSpeechResults = (result: any) => {
    console.log("onSpeechResults:", result);
    const commands = result.value[0].toLowerCase().split(" ");
    const command = commands[commands.length - 1];
    handleCommand(command);
  };

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechPartialResults = (e) => {
      setCommand(e?.value?.[e?.value?.length - 1]?.split(" ")?.pop() || "");
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const activateVoiceCommand = () => {
    setListening(true);
    Speech.speak(translate("youHave10Seconds"), {
      onDone: () => {
        startVoiceCountdown();
        Voice.start("en-US");
      },
    });
  };

  return {
    listening,
    voiceCountdown,
    activateVoiceCommand,
    onVoiceRecognitionClosed,
    command,
  };
};
