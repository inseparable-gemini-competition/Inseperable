import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import styles from "../screens/Identify/styles";

interface LanguageModalProps {
  isModalVisible: boolean;
  closeLanguageSelectionModal: () => void;
  handleLanguageChange: (language: string) => void;
  translations: { [key: string]: string };
}

const LanguageModal: React.FC<LanguageModalProps> = ({
  isModalVisible,
  closeLanguageSelectionModal,
  handleLanguageChange,
  translations
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState("ar");

  return (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeLanguageSelectionModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{translations.selectLanguage || "Select Language"}</Text>
          <TextInput
            style={styles.languageInput}
            placeholder={translations.enterLanguage || "Enter language"}
            value={selectedLanguage}
            onChangeText={setSelectedLanguage}
          />
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => handleLanguageChange(selectedLanguage)}
          >
            <Text style={styles.confirmButtonText}>{translations.confirm || "Confirm"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LanguageModal;
