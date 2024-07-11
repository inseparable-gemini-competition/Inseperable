import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  StyleSheet,
  PanResponder,
  Animated,
} from "react-native";
import * as Speech from "expo-speech";
import { Image } from "react-native-ui-lib";
import CameraModule from "../screens/Identify/CameraModule";
import styles from "../screens/Identify/styles";
import VoiceCommandModule from "../screens/Identify/VoiceCommandModule";
import useAppPermissions from "../../hooks/useAppPermissions";
import useIdentity from "../../hooks/useIdentity";

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
  const [currentHeight, setCurrentHeight] = useState(initialHeight);
  const heightAnim = useRef(new Animated.Value(initialHeight)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        let newHeight = currentHeight + gestureState.dy;
        if (newHeight < minHeight) newHeight = minHeight;
        if (newHeight > maxHeight) newHeight = maxHeight;
        heightAnim.setValue(newHeight);
      },
      onPanResponderRelease: (e, gestureState) => {
        let newHeight = currentHeight + gestureState.dy;
        if (newHeight < minHeight) newHeight = minHeight;
        if (newHeight > maxHeight) newHeight = maxHeight;

        Animated.timing(heightAnim, {
          toValue: newHeight,
          duration: 50,
          useNativeDriver: false,
        }).start(() => {
          setCurrentHeight(newHeight);
        });
      },
    })
  ).current;

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
      <Animated.View style={{ width: "100%", height: heightAnim }}>
        {imageUri ? (
          <View style={{ flex: 1 }}>
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
            style={{ flex: 1 }}
          />
        )}
        <View style={customStyles.handle} {...panResponder.panHandlers}>
          <Text style={customStyles.handleText}>Drag</Text>
        </View>
      </Animated.View>
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
