import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Picker } from "react-native-ui-lib";
import { modalStyles, styles as globalStyles } from "@/app/screens/MainStyles";
import GenericBottomSheet from "./GenericBottomSheet"; // Adjust the import path as needed
import { useTranslations } from "@/hooks/ui/useTranslations";
import { colors } from "@/app/theme";
import { CustomText } from "@/app/components/CustomText";

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
      <CustomText style={styles.title}>{translate("selectTipType")}</CustomText>
      <CustomText style={{
        marginVertical: 5,
        fontFamily: "marcellus",
        textAlign: "center",

      }}>{translate("pickAnyCategoryYouWantTipsAbout")}</CustomText>
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
          <CustomText style={styles.loadingText}>{translate("fetchingTips")}</CustomText>
        </View>
      )}

      {!!result && (
        <View style={styles.resultContainer}>
          <CustomText style={styles.resultText}>{result}</CustomText>
        </View>
      )}
    </GenericBottomSheet>
  );
};

const styles = StyleSheet.create({
  title: {
    ...modalStyles.modalTitle,
    textAlign: "center",
    marginBottom: 20,
  },
  loadingText: {
    textAlign: "center",
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
  },
});

export default TipsModal;
