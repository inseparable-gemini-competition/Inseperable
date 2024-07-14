import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import styles from "../screens/Identify/styles";

interface ImageActionsProps {
  handleShareImage: () => void;
  handleSaveToGallery: () => void;
  translations: { [key: string]: string };
}

const ImageActions: React.FC<ImageActionsProps> = ({
  handleShareImage,
  handleSaveToGallery,
  translations
}) => {
  return (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity style={styles.iconButton} onPress={handleShareImage}>
        <MaterialIcons name="share" size={30} color="#007aff" />
        <Text style={styles.iconButtonText}>{translations.share || "Share"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton} onPress={handleSaveToGallery}>
        <MaterialIcons name="save-alt" size={30} color="#007aff" />
        <Text style={styles.iconButtonText}>{translations.save || "Save"}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ImageActions;
