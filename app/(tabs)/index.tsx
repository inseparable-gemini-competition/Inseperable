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

// Custom Hook for Permissions
const useAppPermissions = () => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

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

  return { cameraPermission, requestCameraPermission };
};

// Custom Hook for Voice Commands
const useVoiceHandler = (executeCommand: (command: string) => void) => {
  useEffect(() => {
    const handleRestart = async()=>{
      await Voice.stop();
      await Voice.start('en');
    }
    Voice.onSpeechResults = (event: SpeechResultsEvent) => {
      const spokenCommand = event.value?.[0].toLowerCase().trim() || "";
      executeCommand(spokenCommand);
      handleRestart();
    };

    Voice.onSpeechError = (error) => {
      console.log("Voice error:", error);
      handleRestart();
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [executeCommand]);

  const startListening = async () => {
    try {
      await Voice.start("en-US");
    } catch (error) {
      console.log("Error starting voice recognition:", error);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.log("Error stopping voice recognition:", error);
    }
  };

  return { startListening, stopListening };
};

// Camera Component
interface CameraModuleProps {
  facing: "front" | "back";
  switchCamera: () => void;
  cameraRef: React.RefObject<any>;
}

const CameraModule: React.FC<CameraModuleProps> = ({ facing, switchCamera, cameraRef }) => {
  return (
    <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
      <View style={styles.cameraControls}>
        <TouchableOpacity style={styles.flipButton} onPress={switchCamera}>
          <Text style={styles.buttonText}>Flip Camera</Text>
        </TouchableOpacity>
      </View>
    </CameraView>
  );
};

// Voice Command Component
interface VoiceCommandModuleProps {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
}

const VoiceCommandModule: React.FC<VoiceCommandModuleProps> = ({ isListening, startListening, stopListening }) => {
  return (
    <View style={styles.voiceCommandContainer}>
      <TouchableOpacity onPress={isListening ? stopListening : startListening} style={styles.microphoneButton}>
        <Ionicons name={"mic-off"} size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};

// Main Component
const IdentifyApp: React.FC = () => {
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isListening, setIsListening] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
  const { mutateAsync } = useFetchContent();
  const cameraRef = useRef<any>();
  const { cameraPermission, requestCameraPermission } = useAppPermissions();

  const switchCamera = () => {
    setFacing(facing === "back" ? "front" : "back");
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      setCapturing(true);
      const options = { quality: 0.8, skipProcessing: true }; // Adjust the quality as needed
      const photo = await cameraRef.current.takePictureAsync(options);
      setCapturing(false);
      setImageUri(photo.uri);
      return photo.uri;
    }
    return null;
  };

  const executeCommand = useCallback(
    async (command: string) => {
      setPendingCommand(command);
      setImageUri(null);
      setFeedbackText('');
    },
    []
  );

  const { startListening, stopListening } = useVoiceHandler(executeCommand);

  const processCommand = async (commandType: string, uri: string) => {
    if (!uri) {
      setFeedbackText("No image captured. Please capture an image first.");
      return;
    }

    setIsProcessing(true);
    setFeedbackText("Processing...");

    try {
      const tasks = {
        identify: () => mutateAsync({ text: "Identify this image", imageUri: uri }),
        price: () => mutateAsync({ text: "Please analyze this photo to identify the item. If identification is not possible, do an assumption. If identified, provide its fair market price range even if based on assumption in Egypt. identify then say the price range directly and don't include the word price or identify or read, just say first what's this ", imageUri: uri }),
        read: () => mutateAsync({ text: "Read the text in this image", imageUri: uri }),
      };

      const result = await tasks[commandType]();
      setFeedbackText(result);
      Speech.speak(result);
    } catch (error) {
      setFeedbackText("Error processing the command.");
      console.log("Processing error:", error);
    } finally {
      setIsProcessing(false);
      setPendingCommand(null);
    }
  };

  useEffect(() => {
    if (pendingCommand && (pendingCommand.includes('price') || pendingCommand.includes('identify') || pendingCommand?.includes('read'))) {
      const captureAndProcess = async () => {
        Speech.stop();
        if(imageUri){
          const uri = await capturePhoto();
          setTimeout(async() => {
            await processCommand(pendingCommand, uri);
          }, 300);
        }
        const uri = await capturePhoto();
        await processCommand(pendingCommand, uri);
      };
      captureAndProcess();
    }
  }, [pendingCommand]);

  useEffect(() => {
    startListening();
    return () => {
      stopListening();
    };
  }, [startListening, stopListening]);

  if (!cameraPermission || !cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestCameraPermission} style={styles.permissionButton}>
          <Text style={styles.permissionText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {capturing && (
        <View style={styles.capturingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.capturingText}>Please hold the device steady..We are capturing photo</Text>
        </View>
      )}
      {imageUri ? (
        <View style={{ width: "100%", height: height / 2 }}>
          <Image source={{ uri: imageUri }} style={{ width: "100%", height: "100%" }} />
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => {
              setImageUri(null);
              Speech.stop();
              setFeedbackText('');
              
            }}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <CameraModule
          facing={facing}
          switchCamera={switchCamera}
          cameraRef={cameraRef}
        />
      )}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {isProcessing && <ActivityIndicator size="large" color="#0000ff" />}
        <Text style={styles.feedbackText}>{feedbackText}</Text>
        <TouchableOpacity style={styles.optionButton} onPress={() => executeCommand('identify')}>
          <Text style={styles.optionText}>Identify</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => executeCommand('price')}>
          <Text style={styles.optionText}>Find Fair Price</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => executeCommand('read')}>
          <Text style={styles.optionText}>Read</Text>
        </TouchableOpacity>
        <VoiceCommandModule
          isListening={isListening}
          startListening={startListening}
          stopListening={stopListening}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: "#f8f9fa" },
  camera: { height: height / 2, justifyContent: "flex-end" },
  cameraControls: { flexDirection: "row", justifyContent: "space-between", padding: 10 },
  flipButton: { backgroundColor: "#007aff", borderRadius: 50, padding: 10 },
  captureButton: { backgroundColor: "#007aff", borderRadius: 50, padding: 15 },
  buttonText: { fontSize: 14, fontWeight: "bold", color: "#fff" },
  scrollContainer: { flexGrow: 1, alignItems: "center", justifyContent: "center" },
  feedbackText: { marginVertical: 20, fontSize: 16, color: "#333", textAlign: "center" },
  voiceCommandContainer: { marginTop: 20, alignItems: "center" },
  microphoneButton: { backgroundColor: "#007aff", borderRadius: 50, padding: 15 },
  goBackButton: { backgroundColor: "#007aff", borderRadius: 50, padding: 10, position: "absolute", bottom: 20, paddingHorizontal: 30, left: "17%", transform: [{ translateX: -50 }] },
  permissionButton: { backgroundColor: "#007aff", borderRadius: 50, padding: 15, marginTop: 20, margin: 40 },
  permissionText: { fontSize: 16, color: "#fff", textAlign: "center" },
  optionButton: { backgroundColor: "#007aff", borderRadius: 10, padding: 15, marginBottom: 10, width: "80%", alignItems: "center" },
  optionText: { fontSize: 18, color: "#fff" },
  capturingOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", zIndex: 10 },
  capturingText: { color: "#ffffff", marginTop: 10, fontSize: 18, textAlign: 'center' }
});

export default IdentifyApp;
