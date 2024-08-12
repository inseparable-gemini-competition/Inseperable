import React, { useEffect, useState } from "react";
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
import { BackHandler } from "react-native";
import { Dialog } from "react-native-ui-lib";
import { CameraScreenProps } from "../types";
import { styles as globalStyles } from "@/app/screens/MainStyles";
import CameraView from "@/app/components/CameraView";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { useTextToSpeech } from "@/app/context/TextToSpeechContext";
import { CustomText } from "@/app/components/CustomText";
import { useNavigation } from "@react-navigation/native";
import { colors } from "@/app/theme";

const CameraScreen: React.FC<CameraScreenProps> = ({
  showCamera,
  capturedImage,
  cameraRef,
  onManualCapture,
  onCancelCountdown,
  onBackPress,
  cameraAnimatedStyle,
  countdown,
  isLoadingFromGemini,
  feedbackText,
  onDismissFeedback,
  onCloseFeedback,
}) => {
  const { translate, isRTL } = useTranslations();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { speak, stop } = useTextToSpeech();
  const navigation = useNavigation<any>();
  useEffect(() => {
    const onBackPress = () => {
      // Call the onCloseFeedback function
      onCloseFeedback();

      // Return true to prevent default back button behavior (exiting the screen)
      return true;
    };
    // Add the event listener for hardware back button
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    // Clean up the event listener when the component unmounts
    return () => backHandler.remove();
  }, [onCloseFeedback]);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stop();
      setIsSpeaking(false);
    } else if (feedbackText) {
      speak(feedbackText);
      setIsSpeaking(true);
    }
  };

  const handleNavigateToChatScreenModal = () => {
    navigation.navigate("ChatScreenModal", {
      subject: feedbackText,
      promptType: "aiQuestion",
      fromCamera: true,
    });
    onCloseFeedback();
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
                <CustomText style={styles.loadingText}>
                  {translate("analyzing")}
                </CustomText>
              </View>
            </TouchableOpacity>
          )}
          <Dialog
            visible={!!feedbackText}
            bottom
            overlayBackgroundColor="rgba(0, 0, 0, 0.5)"
            onDismiss={onCloseFeedback}
            ignoreBackgroundPress
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onCloseFeedback}
            >
              <Ionicons name="close-circle" size={32} color="white" />
            </TouchableOpacity>
            <ScrollView style={styles.dialogContent}>
              <CustomText style={styles.feedbackText}>
                {feedbackText}
              </CustomText>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.speechButton}
                  onPress={handleToggleSpeech}
                >
                  <Ionicons
                    name={isSpeaking ? "pause" : "volume-high"}
                    size={24}
                    color={colors.white}
                  />
                  <CustomText style={styles.speechButtonText}>
                    {isSpeaking ? translate("pause") : translate("hear")}
                  </CustomText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.speechButton} // Using the same style for consistency
                  onPress={handleNavigateToChatScreenModal}
                >
                  <Ionicons
                    name="arrow-forward"
                    size={24}
                    color={colors.white}
                  />
                  <CustomText style={styles.speechButtonText}>
                    {translate("askMore")}
                  </CustomText>
                </TouchableOpacity>
              </View>
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
    position: "absolute",
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
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  speechButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4c669f",
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  speechButtonText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
  },
});

export default CameraScreen;
