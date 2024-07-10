import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import * as Speech from "expo-speech";
import { Image } from "react-native-ui-lib";
import CameraModule from "../screens/Identify/CameraModule";
import styles from "../screens/Identify/styles";
import VoiceCommandModule from "../screens/Identify/VoiceCommandModule";
import useAppPermissions from "../../hooks/useAppPermissions";
import useIdentity from "../../hooks/useIdentity";
import useTouch from "../../hooks/useTouch"; // Import the custom hook

const { height: windowHeight } = Dimensions.get("window");

const IdentifyApp: React.FC = () => {
  const { cameraPermission, requestCameraPermission } = useAppPermissions();
  const {
    facing,
    switchCamera,
    isProcessing,
    feedbackText,
    isListening,
    startListening,
    stopListening,
    imageUri,
    setImageUri,
    capturing,
    executeCommand,
    isLoading,
    setFeedbackText,
    cameraRef,
  } = useIdentity();

  const initialHeight = windowHeight / 2;
  const minHeight = 100;
  const maxHeight = windowHeight;
  const { height, panResponder } = useTouch(initialHeight, minHeight, maxHeight);

  if (!cameraPermission || !cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          onPress={requestCameraPermission}
          style={styles.permissionButton}
        >
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
          <Text style={styles.capturingText}>
            Please hold the device steady..We are capturing photo
          </Text>
        </View>
      )}
      <View style={{ width: "100%" }}>
        {imageUri ? (
          <View style={{ height: height }}>
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: "100%" }}
            />
            <View style={customStyles.handle} {...panResponder.panHandlers}>
              <Text style={customStyles.handleText}>Drag</Text>
            </View>
            <TouchableOpacity
              style={styles.goBackButton}
              onPress={() => {
                if (isLoading || capturing) {
                  setFeedbackText("Please wait until loading ends");
                  return;
                }
                setImageUri(null);
                Speech.stop();
                setFeedbackText("");
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
            style={{ height: height }} // Pass dynamic height to CameraModule
          />
        )}
        <View style={customStyles.handle} {...panResponder.panHandlers}>
          <Text style={customStyles.handleText}>Drag</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {isProcessing && <ActivityIndicator size="large" color="#0000ff" />}
        <Text style={styles.feedbackText}>{feedbackText}</Text>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => executeCommand("identify")}
        >
          <Text style={styles.optionText}>Identify</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => executeCommand("price")}
        >
          <Text style={styles.optionText}>Find Fair Price</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => executeCommand("read")}
        >
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

const customStyles = StyleSheet.create({
  handle: {
    height: 30,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  handleText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default IdentifyApp;