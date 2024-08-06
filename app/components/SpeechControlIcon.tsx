import React from "react";
import { ViewStyle, TouchableOpacity, StyleSheet } from "react-native";

import { FontAwesome } from "@expo/vector-icons";

const SpeechControlIcon: React.FC<{
  isSpeaking: boolean;
  onToggle: () => void;
  style?: ViewStyle;
}> = ({ isSpeaking, onToggle, style }) => (
  <TouchableOpacity onPress={onToggle} style={[styles.iconContainer, style]}>
    <FontAwesome name={isSpeaking ? "pause" : "play"} size={24} color="#333" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  iconContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
  },
});

export default SpeechControlIcon;
