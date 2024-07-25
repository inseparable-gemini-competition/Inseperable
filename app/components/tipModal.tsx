import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Button, Picker } from "react-native-ui-lib";
import { modalStyles, styles } from "@/app/screens/MainStyles";
import { translate } from "@/app/helpers/i18n";
import GenericBottomSheet from "./GenericBottomSheet"; // Adjust the import path as needed

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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  const handleTipTypeChange = (value: string) => {
    setSelectedTipType(value);
    onSelectTipType(value);
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  return (
    <GenericBottomSheet visible={isVisible} onClose={handleClose} enableScroll={true}>
        <Text style={modalStyles.modalTitle}>
          {translate("selectTipType")}
        </Text>
        <Picker
          style={styles.picker}
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
            <Text style={styles.loadingText}>{translate("fetchingTips")}</Text>
          </View>
        ) : (
          <Text style={modalStyles.modalText}>{result}</Text>
        )}
    </GenericBottomSheet>
  );
};

export default TipsModal;