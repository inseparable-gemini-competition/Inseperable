import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { modalStyles, styles } from "@/app/screens/MainStyles";
import { translate } from "@/app/helpers/i18n";
import GenericBottomSheet from "./GenericBottomSheet"; // Adjust the import path as needed

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