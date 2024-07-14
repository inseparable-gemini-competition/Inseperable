import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  GestureResponderEvent,
  Share,
} from "react-native";
import * as Speech from "expo-speech";
import * as MediaLibrary from "expo-media-library";
import ImageActions from "@/app/components/ImageActions";
import LanguageModal from "@/app/components/LanguageModal";
import PermissionView from "@/app/components/PermissionView";
import useAppPermissions from "../../hooks/useAppPermissions";
import useIdentity from "../../hooks/useIdentity";
import CameraView from "@/app/components/CameraView";
import styles from "@/app/screens/Identify/styles";
import ActionButtons from "@/app/components/ActionButtons";
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
    setCurrentLanguage,
    translations,
    updateTranslations,
  } = useIdentity();

  const initialHeight = windowHeight / 2;
  const minHeight = 100;
  const maxHeight = windowHeight;
  const [currentHeight, setCurrentHeight] = useState(initialHeight);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
          message:
            translations.shareMessage || "Check out this image I identified!",
        });
        Speech.speak(translations.shareSuccess || "Image shared successfully.");
      } catch (error) {
        setFeedbackText(translations.shareError || "Error sharing image");
        Speech.speak(translations.shareError || "Error sharing image.");
      }
    }
  };

  const handleSaveToGallery = async () => {
    if (imageUri) {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        try {
          await MediaLibrary.createAssetAsync(imageUri);
          setFeedbackText(translations.saveSuccess || "Image saved to gallery");
          Speech.speak(translations.saveSuccess || "Image saved to gallery.");
        } catch (error) {
          setFeedbackText(translations.saveError || "Error saving image");
          Speech.speak(translations.saveError || "Error saving image.");
        }
      } else {
        setFeedbackText(
          translations.permissionRequired ||
            "Permission to access gallery is required"
        );
        Speech.speak(
          translations.permissionRequired ||
            "Permission to access gallery is required."
        );
      }
    }
  };

  const handleTranslateText = async (language: string) => {
    try {
      updateTranslations(language);
    } catch (error) {
      setFeedbackText(translations.translateError || "Error translating text");
      Speech.speak(translations.translateError || "Error translating text.");
    }
  };

  const openLanguageSelectionModal = () => {
    setIsModalVisible(true);
  };

  const closeLanguageSelectionModal = () => {
    setIsModalVisible(false);
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    handleTranslateText(language);
    closeLanguageSelectionModal();
  };

  if (!cameraPermission || !cameraPermission.granted) {
    return (
      <PermissionView
        requestCameraPermission={requestCameraPermission}
        translations={translations}
      />
    );
  }

  return (
    <View style={styles.container}>
      {capturing && (
        <View style={styles.capturingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.capturingText}>
            {translations.capturingMessage ||
              "Please hold the device steady... We are capturing photo"}
          </Text>
        </View>
      )}
      <View
        style={{ width: "100%", height: currentHeight }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <CameraView
          imageUri={imageUri}
          setImageUri={setImageUri}
          capturing={capturing}
          isLoading={isLoading}
          cameraRef={cameraRef}
          facing={facing}
          switchCamera={switchCamera}
          feedbackText={feedbackText}
          setFeedbackText={setFeedbackText}
          translations={translations}
        />
        <View style={styles.handle}>
          <Text style={styles.handleText}>{translations.drag || "Drag"}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {isProcessing && <ActivityIndicator size="large" color="#007aff" />}
        <ActionButtons
          translations={translations}
          executeCommand={executeCommand}
          openLanguageSelectionModal={openLanguageSelectionModal}
        />
        {feedbackText && imageUri && (
          <Text style={styles.feedbackText}>{feedbackText}</Text>
        )}
        {imageUri && (
          <ImageActions
            handleShareImage={handleShareImage}
            handleSaveToGallery={handleSaveToGallery}
            translations={translations}
          />
        )}
        <LanguageModal
          isModalVisible={isModalVisible}
          closeLanguageSelectionModal={closeLanguageSelectionModal}
          handleLanguageChange={handleLanguageChange}
          translations={translations}
        />
      </ScrollView>
    </View>
  );
};

export default IdentifyApp;
