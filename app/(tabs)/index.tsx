import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  BackHandler,
} from "react-native";
import * as Speech from "expo-speech";
import { Image } from "react-native-ui-lib";
import CameraModule from "../screens/Identify/CameraModule";
import styles from "../screens/Identify/styles";
import VoiceCommandModule from "../screens/Identify/VoiceCommandModule";
import useAppPermissions from "../screens/Identify/useAppPermissions";
import useIdentity from "../screens/Identify/useIdentity";

const { cameraPermission, requestCameraPermission } = useAppPermissions();

const { height } = Dimensions.get("window");

const IdentifyApp: React.FC = () => {
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
      {imageUri ? (
        <View style={{ width: "100%", height: height / 2 }}>
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", height: "100%" }}
          />
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
        />
      )}
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

export default IdentifyApp;
