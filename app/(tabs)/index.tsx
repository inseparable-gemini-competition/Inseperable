import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Platform,
  PermissionsAndroid,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Speech from "expo-speech";
import Voice, { SpeechResultsEvent } from "@react-native-voice/voice";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "react-native-ui-lib";
import { useFetchContent } from "../helpers/askGemini";

const { height } = Dimensions.get("window");

const usePermissions = (cameraPermission: any, requestCameraPermission: any) => {
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === "android") {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Microphone permission denied");
          }
        } catch (err) {
          console.log("Permission request error: ", err);
        }
      }

      if (cameraPermission && !cameraPermission.granted) {
        requestCameraPermission();
      }
    };

    requestPermissions();
  }, [cameraPermission, requestCameraPermission]);
};

const useVoiceCommands = (
  onSpeechResults: any,
  onSpeechError: any,
  startVoiceRecognition: any
) => {
  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    startVoiceRecognition();

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);
};

const Identify: React.FC = () => {
  const [facing, setFacing] = useState<"back" | "front">("front");
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [photoUri, setPhotoUri] = useState<string | null | undefined>(null);
  const hasProcessedResultsRef = useRef(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const { mutateAsync, isLoading } = useFetchContent();

  usePermissions(cameraPermission, requestCameraPermission);

  const isValidCommand = (command: string): boolean => {
    return /identify|price|read|flip/i.test(command);
  };

  const handleVoiceCommand = useCallback(
    (command: string) => {
      if (isSpeaking) return;

      const commandActions: { [key: string]: () => void } = {
        identify: () => simulateIdentification("identify"),
        price: () => simulateIdentification("price"),
        read: () => simulateIdentification("read"),
        flip: toggleCameraFacing,
      };

      const action = Object.keys(commandActions).find((key) =>
        new RegExp(key, "i").test(command)
      );

      action ? commandActions[action]() : showError("Unknown command.");
    },
    [isSpeaking]
  );

  const startVoiceRecognition = async () => {
    if (isListening) return;

    setResultText(null);
    hasProcessedResultsRef.current = false;
    setRetryCount(0);

    try {
      await Voice.start("en-US");
      setIsListening(true);
      setResultText("Listening...");

      timeoutRef.current = setTimeout(async () => {
        if (isListening) {
          await stopVoiceRecognition();
          showError("No valid command detected.");
        }
      }, 6000);
    } catch {
      showError("An error occurred while starting voice recognition.");
    }
  };

  const stopVoiceRecognition = async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    try {
      await Voice.stop();
      setIsListening(false);
    } catch {
      showError("An error occurred while stopping voice recognition.");
    }
  };

  const retryVoiceRecognition = async () => {
    if (retryCount < 300) {
      setRetryCount(retryCount + 1);
      await startVoiceRecognition();
    } else {
      showError("Could not understand the command. Please try again.");
    }
  };

  const onSpeechResults = useCallback(
    async (event: SpeechResultsEvent) => {
      if (hasProcessedResultsRef.current) return;

      hasProcessedResultsRef.current = true;
      let spokenText = event.value?.[0].toLowerCase().trim() || "";

      if (spokenText === "id") spokenText = "identify";

      if (isValidCommand(spokenText)) {
        await stopVoiceRecognition();
        handleVoiceCommand(spokenText);
      } else {
        await retryVoiceRecognition();
      }

      Voice.destroy().then(Voice.removeAllListeners);
    },
    [stopVoiceRecognition, handleVoiceCommand, retryVoiceRecognition]
  );

  const onSpeechError = useCallback(
    async () => {
      await stopVoiceRecognition();
      setIsListening(false);

      Voice.destroy().then(Voice.removeAllListeners);
      setTimeout(async () => {
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;
        startVoiceRecognition();
      }, 1000);
    },
    [stopVoiceRecognition]
  );

  useVoiceCommands(onSpeechResults, onSpeechError, startVoiceRecognition);

  const simulateIdentification = async (type: string) => {
    const uri = await takePicture();
    setLoading(true);
    setResultText("Processing...");
    setIsSpeaking(true);

    try {
      const tasks: { [key: string]: () => Promise<any> } = {
        identify: () => mutateAsync({ text: "Identify this image", imageUri: uri }),
        price: () => mutateAsync({ text: "Identify this, then using the web determine its price range in egypt, if you don't know for sure assume", imageUri: uri }),
        read: () => mutateAsync({ text: "read what's written here", imageUri: uri }),
      };

      const result = await tasks[type]();
      setResultText(result);
      Speech.speak(result, { onStart, onDone });
    } catch {
      showError("An error occurred during the simulation.");
    } finally {
      setLoading(false);
    }
  };

  const onStart = () => {
    console.log("Speech started");
    setIsSpeaking(true);
    setLoading(false);
  };

  const onDone = () => {
    console.log("Speech done");
    setIsSpeaking(false);
    stopVoiceRecognition();
    setIsListening(false);
    setTimeout(() => {
      startVoiceRecognition();
    }, 1000);
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
    setResultText("Camera flipped.");
    startVoiceRecognition();
  };

  const showError = (message: string) => {
    setResultText(message);
    Speech.speak(message);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo?.uri);
      return photo?.uri;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {photoUri ? (
        <View style={{ width: "100%", height: height / 2 }}>
          <Image source={{ uri: photoUri }} style={{ width: "100%", height: "100%" }} />
          <TouchableOpacity
            style={{ ...styles.flipButton, position: "absolute", bottom: 20, left: "50%", transform: [{ translateX: -50 }] }}
            onPress={() => { setPhotoUri(null); Speech.stop(); }}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <CameraView style={styles.camera} type={facing} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <Text style={styles.buttonText}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {(loading || isLoading) && <ActivityIndicator size="large" color="#0000ff" />}

        <TouchableOpacity style={styles.optionButton} onPress={() => simulateIdentification("identify")}>
          <Text style={styles.optionText}>Identify</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => simulateIdentification("price")}>
          <Text style={styles.optionText}>Find Fair Price</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => simulateIdentification("read")}>
          <Text style={styles.optionText}>Read</Text>
        </TouchableOpacity>
        {resultText && <Text style={styles.resultText}>{resultText}</Text>}
        <View style={styles.voiceCommandContainer}>
          <TouchableOpacity onPress={isListening ? stopVoiceRecognition : startVoiceRecognition} style={styles.microphoneButton}>
            <Ionicons name={isListening ? "mic-off" : "mic"} size={32} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  camera: { height: height / 2, backgroundColor: "#000", justifyContent: "flex-end" },
  buttonContainer: { flexDirection: "row", justifyContent: "center", padding: 10 },
  flipButton: { backgroundColor: "#007aff", borderRadius: 50, padding: 15, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 14, fontWeight: "bold", color: "#fff" },
  scrollContainer: { flexGrow: 1, paddingVertical: 20, alignItems: "center", justifyContent: "center" },
  optionButton: { backgroundColor: "#007aff", borderRadius: 10, padding: 15, marginBottom: 10, width: "80%", alignItems: "center" },
  optionText: { fontSize: 18, color: "#fff" },
  resultText: { marginTop: 20, fontSize: 16, color: "#333", textAlign: "center", paddingHorizontal: 20 },
  voiceCommandContainer: { marginTop: 20, alignItems: "center" },
  microphoneButton: { backgroundColor: "#007aff", borderRadius: 50, padding: 15 },
  errorText: { color: "red", marginTop: 10, textAlign: "center" },
});

export default Identify;
