import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CameraView } from "expo-camera"; // Updated import to use Expo Camera
import styles from "./styles";
import { PinchGestureHandler } from "react-native-gesture-handler";
import useZoom from "@/hooks/useZoom";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

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

  const { setItem } = useAsyncStorage("userData");

  const onInitialApp = () => {
    setItem(JSON.stringify({}));
  };

  return (
    <PinchGestureHandler onGestureEvent={handlePinchGesture}>
      <View style={style}>
        <CameraView
          style={[styles.camera, { ...style }]}
          facing={facing}
          ref={cameraRef}
          zoom={zoom}
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.flipButton} onPress={switchCamera}>
              <Text style={styles.buttonText}>Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.flipButton} onPress={onInitialApp}>
              <Text style={styles.buttonText}>Initial App</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    </PinchGestureHandler>
  );
};

export default CameraModule;
