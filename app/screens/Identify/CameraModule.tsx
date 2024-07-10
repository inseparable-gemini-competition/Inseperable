import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { CameraView } from "expo-camera";
import styles from "./styles";
import { PinchGestureHandler } from "react-native-gesture-handler";
import useZoom from "@/hooks/useZoom";

interface CameraModuleProps {
  facing: "front" | "back";
  switchCamera: () => void;
  cameraRef: React.RefObject<any>;
}

const CameraModule: React.FC<CameraModuleProps> = ({
  facing,
  switchCamera,
  cameraRef,
}) => {
  const {zoom, handlePinchGesture} = useZoom();
  return (
    <PinchGestureHandler onGestureEvent={handlePinchGesture}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        zoom={zoom}
      >
        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.flipButton} onPress={switchCamera}>
            <Text style={styles.buttonText}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </PinchGestureHandler>
  );
};

export default CameraModule;
