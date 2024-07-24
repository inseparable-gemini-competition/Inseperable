import React, { useState } from "react";
import { View, Text, Modal, ActivityIndicator } from "react-native";
import { Button, Picker } from "react-native-ui-lib";
import { modalStyles, styles } from "@/app/screens/MainStyles";
import { translate } from "@/app/helpers/i18n";

interface TipsModalProps {
  visible: boolean;
  isLoading: boolean;
  result: string;
  onClose: () => void;
  onSelectTipType: (tipType: string) => void;
}

const tipTypes = [
  { label: "Eco-Friendly", value: "ecoFriendly" },
  { label: "Cultural", value: "cultural" },
  { label: "Cuisine", value: "cuisine" },
  { label: "Safety", value: "safety" },
];

const TipsModal: React.FC<TipsModalProps> = ({
  visible,
  isLoading,
  result,
  onClose,
  onSelectTipType,
}) => {
  const [selectedTipType, setSelectedTipType] = useState("");

  const handleTipTypeChange = (value: string) => {
    setSelectedTipType(value);
    onSelectTipType(value);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalContainer}>
        <View style={modalStyles.modalContent}>
          <Text style={modalStyles.modalTitle}>
            {translate("selectTipType")}
          </Text>
          <Picker
            style={{
              height: 50,
              width: "100%",
              backgroundColor: "#f5f5f5",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#ddd",
              paddingHorizontal: 10,
              color: "#333",
            }}
            placeholder={translate("selectTipType")}
            value={selectedTipType}
            onChange={handleTipTypeChange}
          >
            {tipTypes.map((item) => (
              <Picker.Item
                key={item.value}
                value={item.value}
                label={translate(item.label)}
              />
            ))}
          </Picker>
          {isLoading ? (
            <View style={[styles.loadingContainer, { height: 100 }]}>
              <ActivityIndicator />
              <Text>{translate("fetchingTips")}</Text>
            </View>
          ) : (
            <>
              <Text style={modalStyles.modalText}>{result}</Text>
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

export default TipsModal;
