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
  TextInput,
  Modal,
} from "react-native";
import * as Speech from "expo-speech";
import * as MediaLibrary from "expo-media-library";
import { Image } from "react-native-ui-lib";
import { MaterialIcons } from "@expo/vector-icons";
import CameraModule from "../screens/Identify/CameraModule";
import styles from "../screens/Identify/styles";
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
    setCurrentLanguage,
    translations,
    updateTranslations,
  } = useIdentity();

  

  const initialHeight = windowHeight / 2;
  const minHeight = 100;
  const maxHeight = windowHeight;
  const [currentHeight, setCurrentHeight] = useState(initialHeight);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("ar");

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
          message: translations.shareMessage || "Check out this image I identified!",
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
        setFeedbackText(translations.permissionRequired || "Permission to access gallery is required");
        Speech.speak(translations.permissionRequired || "Permission to access gallery is required.");
      }
    }
  };

  const handleTranslateText = async (language: string) => {
    try {
      updateTranslations(language)
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
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          {translations.permissionMessage || "We need your permission to show the camera"}
        </Text>
        <TouchableOpacity
          onPress={requestCameraPermission}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionText}>
            {translations.grantPermission || "Grant Permission"}
          </Text>
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
            {translations.capturingMessage || "Please hold the device steady... We are capturing photo"}
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
                  setFeedbackText(translations.waitMessage || "Please wait until loading ends");
                  return;
                }
                setImageUri(null);
                Speech.stop();
                setFeedbackText("");
              }}
            >
              <Text style={styles.buttonText}>{translations.back || "Back"}</Text>
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
          <Text style={customStyles.handleText}>{translations.drag || "Drag"}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {isProcessing && <ActivityIndicator size="large" color="#007aff" />}
        {imageUri && (
          <View style={customStyles.actionButtonsContainer}>
            <TouchableOpacity
              style={customStyles.iconButton}
              onPress={handleShareImage}
            >
              <MaterialIcons name="share" size={30} color="#007aff" />
              <Text style={customStyles.iconButtonText}>{translations.share || "Share"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={customStyles.iconButton}
              onPress={handleSaveToGallery}
            >
              <MaterialIcons name="save-alt" size={30} color="#007aff" />
              <Text style={customStyles.iconButtonText}>{translations.save || "Save"}</Text>
            </TouchableOpacity>
          </View>
        )}
        {feedbackText && imageUri && <Text style={styles.feedbackText}>{feedbackText}</Text>}
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => executeCommand("identify")}
        >
          <Text style={styles.optionText}>{translations.identify || "Identify"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => executeCommand("price")}
        >
          <Text style={styles.optionText}>{translations.price || "Find Fair Price"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => executeCommand("read")}
        >
          <Text style={styles.optionText}>{translations.read || "Read"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={customStyles.iconButton}
          onPress={openLanguageSelectionModal}
        >
          <MaterialIcons name="translate" size={30} color="#007aff" />
          <Text style={customStyles.iconButtonText}>{translations.translate || "Translate"}</Text>
        </TouchableOpacity>
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeLanguageSelectionModal}
        >
          <View style={customStyles.modalContainer}>
            <View style={customStyles.modalContent}>
              <Text style={customStyles.modalTitle}>{translations.selectLanguage || "Select Language"}</Text>
              <TextInput
                style={customStyles.languageInput}
                placeholder={translations.enterLanguage || "Enter language"}
                value={selectedLanguage}
                onChangeText={setSelectedLanguage}
              />
              <TouchableOpacity
                style={customStyles.confirmButton}
                onPress={() => handleLanguageChange(selectedLanguage)}
              >
                <Text style={customStyles.confirmButtonText}>{translations.confirm || "Confirm"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  },
  iconButtonText: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  languageInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  confirmButton: {
    backgroundColor: "#007aff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default IdentifyApp;
