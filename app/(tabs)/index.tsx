import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  StyleSheet,
  GestureResponderEvent,
  Share,
} from "react-native";
import * as Speech from "expo-speech";
import * as MediaLibrary from "expo-media-library";
import { Image } from "react-native-ui-lib";
import { MaterialIcons } from "@expo/vector-icons";
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

  const touchStartY = useRef(0);
  const startHeight = useRef(currentHeight);

  const handleTouchStart = (event: GestureResponderEvent) => {
    if (event.nativeEvent.touches.length === 1) {
      touchStartY.current = event.nativeEvent.pageY;
      startHeight.current = currentHeight;
    }
  };

  const handleTouchMove = (event: GestureResponderEvent) => {
    if (event.nativeEvent.touches.length === 1) {
      const touchY = event.nativeEvent.pageY;
      const newHeight = startHeight.current + (touchY - touchStartY.current);
      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setCurrentHeight(newHeight);
      }
    }
  };

  const handleShareImage = async () => {
    if (imageUri) {
      try {
        await Share.share({
          url: imageUri,
          message: "Check out this image I identified!",
        });
      } catch (error) {
        setFeedbackText("Error sharing image");
      }
    }
  };

  const handleSaveToGallery = async () => {
    if (imageUri) {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        try {
          await MediaLibrary.createAssetAsync(imageUri);
          setFeedbackText("Image saved to gallery");
        } catch (error) {
          setFeedbackText("Error saving image");
        }
      } else {
        setFeedbackText("Permission to access gallery is required");
      }
    }
  };

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
            Please hold the device steady... We are capturing photo
          </Text>
        </View>
      )}
      <View
        style={{ width: "100%", height: currentHeight }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
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
        <View style={customStyles.handle}>
          <Text style={customStyles.handleText}>Drag</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {isProcessing && imageUri && <ActivityIndicator size="large" color="#007aff" />}
        {imageUri && <View style={customStyles.actionButtonsContainer}>
          <TouchableOpacity
            style={customStyles.iconButton}
            onPress={handleShareImage}
          >
            <MaterialIcons name="share" size={30} color="#007aff" />
            <Text style={customStyles.iconButtonText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={customStyles.iconButton}
            onPress={handleSaveToGallery}
          >
            <MaterialIcons name="save-alt" size={30} color="#007aff" />
            <Text style={customStyles.iconButtonText}>Save</Text>
          </TouchableOpacity>
        </View>}
        {feedbackText && imageUri && <Text style={styles.feedbackText}>{feedbackText}</Text>}
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
      </ScrollView>
    </View>
  );
};

const customStyles = StyleSheet.create({
  handle: {
    height: 30,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  handleText: {
    color: "#000",
    fontWeight: "bold",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
  },
  iconButton: {
    alignItems: "center",
    paddingHorizontal: 20,
    color: "#0000ff"
  },
  iconButtonText: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
});

export default IdentifyApp;
