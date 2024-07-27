import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { modalStyles, styles } from "@/app/screens/MainStyles";
import GenericBottomSheet from "./GenericBottomSheet"; // Adjust the import path as needed
import { useTranslations } from "@/hooks/ui/useTranslations";

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
    <GenericBottomSheet visible={visible} onClose={onClose} enableScroll={true}>
        {isLoading ? (
          <View style={[styles.loadingContainer, { height: 100 }]}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>{translate("fetchingTaboos")}</Text>
          </View>
        ) : (
          <>
            <Text style={modalStyles.modalTitle}>
              {translate("tabooInfo")}
            </Text>
            <Text style={{textAlign: 'center'}}>
              {result}
            </Text>
          </>
        )}
    </GenericBottomSheet>
  );
};

export default TabooModal;