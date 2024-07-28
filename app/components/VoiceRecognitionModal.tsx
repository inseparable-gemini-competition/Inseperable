import React from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import {modalStyles} from '@/app/screens/MainStyles';
import { useTranslations } from '@/hooks/ui/useTranslations';

interface VoiceRecognitionModalProps {
  visible: boolean;
  countdown: number | null;
  command: string;
  onCancel: () => void;
}

const VoiceRecognitionModal: React.FC<VoiceRecognitionModalProps> = ({
  visible,
  countdown,
  command,
  onCancel,
}) => {
  const { translate } = useTranslations();
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={modalStyles.modalContainer}>
        <View style={modalStyles.modalContent}>
          <Text style={modalStyles.modalCountdownText}>
            {countdown} seconds
          </Text>
          <Text style={modalStyles.modalRecognizing}>
            {translate('recognizing') + '...'}
          </Text>
          <ActivityIndicator size="large" color="#0000ff" />
          <TouchableOpacity
            style={modalStyles.modalCancelButton}
            onPress={onCancel}
          >
            <Text style={modalStyles.modalCancelText}>
              {translate('cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default VoiceRecognitionModal;