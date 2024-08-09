import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Picker } from "react-native-ui-lib";
import { modalStyles, styles as globalStyles } from "@/app/screens/MainStyles";
import GenericBottomSheet from "./GenericBottomSheet"; // Adjust the import path as needed
import { useTranslations } from "@/hooks/ui/useTranslations";
import { colors } from "@/app/theme";

interface TipsModalProps {
  visible: boolean;
  isLoading: boolean;
  result: string;
  onClose: () => void;
  onSelectTipType: (tipType: string) => void;
}

const TipsModal: React.FC<TipsModalProps> = ({
  visible,
  isLoading,
  result,
  onClose,
  onSelectTipType,
}) => {
  const [selectedTipType, setSelectedTipType] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const { translate } = useTranslations();

  const tipTypes = [
    { label: translate("ecofriendly"), value: "ecoFriendly" },
    { label: translate("cultural"), value: "cultural" },
    { label: translate("cuisine"), value: "cuisine" },
    { label: translate("safety"), value: "safety" },
  ];

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
    <GenericBottomSheet
      visible={isVisible}
      onClose={handleClose}
      enableScroll={true}
      textToSpeak={result}
    >
      <Text style={styles.title}>{translate("selectTipType")}</Text>
      <Text style={{
        marginVertical: 5,
        fontFamily: "marcellus",
        textAlign: "center",

      }}>{translate("pickAnyCategoryYouWantTipsAbout")}</Text>
      <Picker
        style={globalStyles.picker}
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
      {isLoading && (
        <View style={[globalStyles.loadingContainer, { height: 100 }]}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>{translate("fetchingTips")}</Text>
        </View>
      )}

      {!!result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
    </GenericBottomSheet>
  );
};

const styles = StyleSheet.create({
  title: {
    ...modalStyles.modalTitle,
    fontFamily: "marcellus",
    textAlign: "center",
    marginBottom: 20,
  },
  loadingText: {
    textAlign: "center",
    fontFamily: "marcellus",
    color: colors.primary,
    marginTop: 10,
  },
  resultContainer: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 10,
    marginTop: 10,
  },
  resultText: {
    ...modalStyles.modalText,
    textAlign: "center",
    fontFamily: "marcellus",
  },
});

export default TipsModal;
