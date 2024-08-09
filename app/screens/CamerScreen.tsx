import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { Dialog } from "react-native-ui-lib";
import { CameraScreenProps } from "../types";
import { styles as globalStyles } from "@/app/screens/MainStyles";
import CameraView from "@/app/components/CameraView";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { useTextToSpeech } from "@/app/context/TextToSpeechContext";
import { CustomText } from "@/app/components/CustomText";

const CameraScreen: React.FC<CameraScreenProps> = ({
  showCamera,
  capturedImage,
  cameraRef,
  onManualCapture,
  onCancelCountdown,
  onBackPress,
  cameraAnimatedStyle,
  facing,
  countdown,
  isLoadingFromGemini,
  feedbackText,
  onDismissFeedback,
  onCloseFeedback,
}) => {
  const { translate, isRTL } = useTranslations();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { speak, stop } = useTextToSpeech();

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stop();
      setIsSpeaking(false);
    } else if (feedbackText) {
      speak(feedbackText);
      setIsSpeaking(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress}>
          <Ionicons
            name={isRTL ? "arrow-forward" : "arrow-back"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>
      {showCamera ? (
        <Animated.View style={[{ flex: 1 }, cameraAnimatedStyle]}>
          <CameraView
            facing={facing}
            countdown={countdown}
            cameraRef={cameraRef}
            onManualCapture={onManualCapture}
            onCancelCountdown={onCancelCountdown}
          />
        </Animated.View>
      ) : capturedImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          {isLoadingFromGemini && (
            <TouchableOpacity
              style={styles.bottomOverlay}
              onPress={onDismissFeedback}
            >
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
                <CustomText style={styles.loadingText}>{translate("analyzing")}</CustomText>
              </View>
            </TouchableOpacity>
          )}
          <Dialog
            visible={!!feedbackText}
            bottom
            overlayBackgroundColor="rgba(0, 0, 0, 0.5)"
            onDismiss={onCloseFeedback}
            ignoreBackgroundPress
            // panDirection={PanningProvider.Directions.DOWN}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onCloseFeedback}
            >
              <Ionicons name="close-circle" size={32} color="white" />
            </TouchableOpacity>
            <ScrollView style={styles.dialogContent}>
              <CustomText style={styles.feedbackText}>{feedbackText}</CustomText>
              <TouchableOpacity
                style={styles.speechButton}
                onPress={handleToggleSpeech}
              >
                <Ionicons
                  name={isSpeaking ? "pause" : "volume-high"}
                  size={24}
                  color="white"
                />
                <CustomText style={styles.speechButtonText}>
                  {isSpeaking ? "Pause" : "Click to hear text"}
                </CustomText>
              </TouchableOpacity>
            </ScrollView>
          </Dialog>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  header: {
    ...globalStyles.header,
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  capturedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bottomOverlay: {
    ...globalStyles.bottomOverlay,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  loadingContainer: {
    ...globalStyles.loadingContainer,
  },
  loadingText: {
    ...globalStyles.loadingText,
  },
  dialogContent: {
    padding: 16,
  },
  feedbackText: {
    ...globalStyles.feedbackText,
    marginBottom: 16,
  },
  speechButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4c669f",
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    marginBottom: 50,
  },
  speechButtonText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
  },
});

export default CameraScreen;
