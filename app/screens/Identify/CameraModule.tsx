import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CameraView } from "expo-camera"; // Updated import to use Expo Camera
import styles from "./styles";
import { PinchGestureHandler } from "react-native-gesture-handler";
import useZoom from "@/hooks/useZoom";

interface CameraModuleProps {
  facing: "front" | "back";
  switchCamera: () => void;
  cameraRef: React.RefObject<any>;
  style: any; // Added style prop to dynamically change height
}

const CameraModule: React.FC<CameraModuleProps> = ({
  facing,
  switchCamera,
  cameraRef,
  style,
}) => {
  const { zoom, handlePinchGesture } = useZoom();
  return (
    <PinchGestureHandler onGestureEvent={handlePinchGesture}>
      <View style={style}>
        <CameraView
          style={[styles.camera, {...style}]}
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
      </View>
    </PinchGestureHandler>
  );
};

export default CameraModule;
