import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Button } from "react-native-ui-lib";
import { styles as globalStyles, modalStyles } from "@/app/screens/MainStyles";
import GenericBottomSheet, {
  GenericBottomSheetTextInput,
} from "./GenericBottomSheet"; // Adjust the import path as needed
import { useTranslations } from "@/hooks/ui/useTranslations";

interface WhatToSayModalProps {
  visible: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  userUberRequest: string;
  setUserUberRequest: (request: string) => void;
}

const UberModal: React.FC<WhatToSayModalProps> = ({
  visible,
  isLoading,
  onClose,
  onSubmit,
  userUberRequest,
  setUserUberRequest,
}) => {
  const { translate } = useTranslations();
  
  return (
    <GenericBottomSheet visible={visible} onClose={onClose} enableScroll={true}>
      <Text style={modalStyles.modalTitle}>{translate("whatToSay")}</Text>
      {isLoading ? (
        <View style={[globalStyles.loadingContainer, { height: 100 }]}>
          <ActivityIndicator />
          <Text style={{ textAlign: "center", fontFamily: "marcellus" }}>
            {translate("fetchingResponse")}
          </Text>
        </View>
      ) : (
        <>
          <GenericBottomSheetTextInput
            placeholder={translate("enterSituation")}
            value={userUberRequest}
            onChangeText={setUserUberRequest}
            multiline
            keyboardType="default"
            style={modalStyles.textInput}
          />
          <Button
            style={{ marginVertical: 8, maxWidth: "80%", alignSelf: "center" }}
            onPress={onSubmit}
            label={isLoading ?  translate('loading'): translate("submit")}
          />
        </>
      )}
    </GenericBottomSheet>
  );
};

export default UberModal;
