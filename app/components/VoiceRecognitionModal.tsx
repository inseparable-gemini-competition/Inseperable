import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
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
            {translate('recognizing')}
          </Text>
          <Text style={modalStyles.modalCommandText}>{command}</Text>
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