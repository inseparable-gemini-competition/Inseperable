import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { Dialog, PanningProvider } from "react-native-ui-lib";
import { CameraScreenProps } from "../types";
import { styles } from "@/app/screens/MainStyles";
import CameraView from "@/app/components/CameraView";
import { useTranslations } from "@/hooks/ui/useTranslations";

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
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress}>
          <Ionicons
            name={isRTL ? "arrow-forward" : "arrow-back"}
            size={24}
            color="black"
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
        <View style={{ flex: 1 }}>
          <Image source={{ uri: capturedImage }} style={{ flex: 1 }} />
          {isLoadingFromGemini && (
            <TouchableOpacity
              style={styles.bottomOverlay}
              onPress={onDismissFeedback}
            >
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.loadingText}>{translate("analyzing")}</Text>
              </View>
            </TouchableOpacity>
          )}
          <Dialog
            visible={!!feedbackText}
            bottom
            onDismiss={onCloseFeedback}
            panDirection={PanningProvider.Directions.DOWN}
          >
            <Text style={styles.feedbackText}>{feedbackText}</Text>
          </Dialog>
        </View>
      ) : null}
    </View>
  );
};

export default CameraScreen;
