import React, { useEffect } from "react";
import { View, Text, Modal, ActivityIndicator } from "react-native";
import { Button } from "react-native-ui-lib";
import { modalStyles, styles } from "@/app/screens/MainStyles";
import { translate } from "@/app/helpers/i18n";

interface TabooModalProps {
  visible: boolean;
  isLoading: boolean;
  result: string;
  onClose: () => void;
}

const TabooModal: React.FC<TabooModalProps> = ({
  visible,
  isLoading,
  result,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalContainer}>
        <View style={modalStyles.modalContent}>
          {isLoading ? (
            <View style={[styles.loadingContainer, { height: 100 }]}>
              <ActivityIndicator />
              <Text>Fetching Taboos</Text>
            </View>
          ) : (
            <>
              <Text style={modalStyles.modalTitle}>
                {translate("tabooInfo")}
              </Text>
              <Text style={modalStyles.modalText}>
                {result}
              </Text>
              <Button
                style={modalStyles.modalCloseButton}
                onPress={onClose}
                label={translate("close")}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default TabooModal;
