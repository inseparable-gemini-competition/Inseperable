import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CameraView as ExpoCameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import {styles} from '@/app/screens/MainStyles';
import { translate } from '@/app/helpers/i18n';

interface CameraViewProps {
  facing: 'front' | 'back';
  countdown: number | null;
  cameraRef: React.RefObject<ExpoCameraView>;
  onManualCapture: () => void;
  onCancelCountdown: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({
  facing,
  countdown,
  cameraRef,
  onManualCapture,
  onCancelCountdown,
}) => {
  return (
    <View style={{ flex: 1 }}>
      {countdown !== null && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>{countdown}</Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancelCountdown}
          >
            <Text style={styles.cancelText}>
              {translate('cancelAutoCapture')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <ExpoCameraView ref={cameraRef} facing={facing} style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={onManualCapture}
        >
          <Ionicons name="camera" size={40} color="black" />
        </TouchableOpacity>
      </ExpoCameraView>
    </View>
  );
};

export default CameraView;