import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const VoiceActivationButton = ({ onPress, isListening }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      position: "absolute",
      bottom: 20,
      right: 20,
      backgroundColor: isListening ? "red" : "blue",
      borderRadius: 30,
      padding: 15,
    }}
  >
    <Ionicons
      name={isListening ? "mic" : "mic-outline"}
      size={30}
      color="white"
    />
  </TouchableOpacity>
);

export default VoiceActivationButton;
