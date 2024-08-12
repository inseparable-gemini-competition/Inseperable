import React from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/app/theme";

const VoiceActivationButton = ({
  onPress,
  isListening,
  isLoading,
}: {
  onPress: () => void;
  isListening: boolean;
  isLoading: boolean;
}) => (
  <>
    {!isLoading || isListening ? (
      <TouchableOpacity
        onPress={onPress}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: isListening ? colors.danger : colors.black,
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
    ) : (
      <ActivityIndicator
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor:  colors.black,
          borderRadius: 30,
          padding: 15,
        }}
        size="small"
      />
    )}
  </>
);

export default VoiceActivationButton;
