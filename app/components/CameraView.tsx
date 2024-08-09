import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CameraView as ExpoCameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import {styles} from '@/app/screens/MainStyles';
import { useTranslations } from '@/hooks/ui/useTranslations';
import { CustomText } from '@/app/components/CustomText';

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
  const { translate } = useTranslations();
  return (
    <View style={{ flex: 1, }}>
      {countdown !== 0 && (
        <View style={styles.countdownContainer}>
          <CustomText style={styles.countdownText}>{countdown}</CustomText>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancelCountdown}
          >
            <CustomText style={styles.cancelText}>
              {translate('cancelAutoCapture')}
            </CustomText>
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