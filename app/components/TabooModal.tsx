import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useTranslations } from "@/hooks/ui/useTranslations";
import GenericBottomSheet from "./GenericBottomSheet";
import { colors } from "@/app/theme";
import { CustomText } from "@/app/components/CustomText";

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
  const { translate } = useTranslations();

  return (
    <GenericBottomSheet
      visible={visible}
      onClose={onClose}
      enableScroll
      textToSpeak={result}
    >
      <View style={styles.container}>
      <CustomText style={styles.modalTitle}>{translate("taboo")}</CustomText>
        <CustomText
          style={{
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          {translate("KnowAllTheTaboosYouNeedToAvoid")}
        </CustomText>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <CustomText style={styles.loadingText}>
              {translate("fetchingTaboos")}
            </CustomText>
          </View>
        ) : (
          <>
            <View style={styles.resultContainer}>
              <CustomText style={styles.resultText}>{result}</CustomText>
            </View>
          </>
        )}
      </View>
    </GenericBottomSheet>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: colors.secondary,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 24,
    color: colors.primary,
    textAlign: "center",
    marginBottom: 20,
  },
  resultContainer: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultText: {
    fontSize: 18,
    color: colors.dark,
    lineHeight: 24,
    textAlign: "center",
  },
});

export default TabooModal;
