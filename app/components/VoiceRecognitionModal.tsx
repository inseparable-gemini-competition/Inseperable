import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { modalStyles } from "@/app/screens/MainStyles";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { Button } from "react-native-ui-lib";
import GenericBottomSheet from './GenericBottomSheet'; // Adjust the import path as needed

interface VoiceRecognitionModalProps {
  visible: boolean;
  isListening: boolean;
  isProcessing: boolean;
  command: string | null;
  onCancel: () => void;
  onDone: () => void;
}

const VoiceRecognitionModal: React.FC<VoiceRecognitionModalProps> = ({
  visible,
  isListening,
  isProcessing,
  onCancel,
  onDone,
}) => {
  const { translate } = useTranslations();

  return (
    <GenericBottomSheet visible={visible} onClose={onDone} enableScroll={false}>
      <View style={modalStyles.modalContent}>
        {isListening && (
          <>
            <Text style={modalStyles.modalRecognizing}>
              {translate("listening" + "...")}
            </Text>
          </>
        )}

        {isProcessing && (
          <>
            <Text style={modalStyles.modalRecognizing}>
              {translate("processing")}
            </Text>
            <ActivityIndicator size="large" color="#0000ff" />
          </>
        )}
        <Button onPress={onCancel} label={translate("dismiss")}/>
      </View>
    </GenericBottomSheet>
  );
};

export default VoiceRecognitionModal;