import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CameraView } from "expo-camera";
import { Slider } from "react-native-ui-lib";
import styles from "./styles";

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
  const [zoom, setZoom] = useState(0);

  return (
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
      <Slider
        style={{ width: 200, height: 40 }}
        minimumValue={0}
        maximumValue={1}
        value={zoom}
        onValueChange={(value) => setZoom(value)}
      />
    </CameraView>
  );
};

export default CameraModule;
