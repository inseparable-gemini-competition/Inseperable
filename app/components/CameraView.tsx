import React from "react";
import { View, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "react-native-ui-lib";
import CameraModule from "../screens/Identify/CameraModule";
import styles from "../screens/Identify/styles";
import * as Speech from "expo-speech";

interface CameraViewProps {
  imageUri: string | null;
  setImageUri: (uri: string | null) => void;
  capturing: boolean;
  isLoading: boolean;
  cameraRef: React.RefObject<any>;
  facing: string;
  switchCamera: () => void;
  feedbackText: string;
  setFeedbackText: (text: string) => void;
  translations: { [key: string]: string };
}

const CameraView: React.FC<CameraViewProps> = ({
  imageUri,
  setImageUri,
  capturing,
  isLoading,
  cameraRef,
  facing,
  switchCamera,
  feedbackText,
  setFeedbackText,
  translations
}) => {
  return (
    <View style={{ flex: 1 }}>
      {imageUri ? (
        <View style={{ flex: 1 }}>
          <Image source={{ uri: imageUri }} style={{ width: "100%", height: "100%" }} />
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
            <MaterialIcons name="arrow-back" size={30} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ) : (
        <CameraModule facing={facing} switchCamera={switchCamera} cameraRef={cameraRef} style={{ flex: 1 }} />
      )}
    </View>
  );
};

export default CameraView;
