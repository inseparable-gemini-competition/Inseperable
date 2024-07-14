import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../screens/Identify/styles";

interface PermissionViewProps {
  requestCameraPermission: () => void;
  translations: { [key: string]: string };
}

const PermissionView: React.FC<PermissionViewProps> = ({
  requestCameraPermission,
  translations
}) => {
  return (
    <View style={styles.container}>
      <Text style={{ textAlign: "center" }}>
        {translations.permissionMessage || "We need your permission to show the camera"}
      </Text>
      <TouchableOpacity onPress={requestCameraPermission} style={styles.permissionButton}>
        <Text style={styles.permissionText}>{translations.grantPermission || "Grant Permission"}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PermissionView;
