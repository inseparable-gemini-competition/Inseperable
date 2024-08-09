import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Button, ButtonSize } from "react-native-ui-lib";
import { styles as globalStyles, modalStyles } from "@/app/screens/MainStyles";
import GenericBottomSheet, {
  GenericBottomSheetTextInput,
} from "./GenericBottomSheet"; // Adjust the import path as needed
import { useTranslations } from "@/hooks/ui/useTranslations";
import { colors } from "@/app/theme";

interface WhatToSayModalProps {
  visible: boolean;
  isLoading: boolean;
  result: string | null;
  onClose: () => void;
  onSubmit: () => void;
  userSituation: string;
  setUserSituation: (situation: string) => void;
}

const WhatToSayModal: React.FC<WhatToSayModalProps> = ({
  visible,
  isLoading,
  result,
  onClose,
  onSubmit,
  userSituation,
  setUserSituation,
}) => {
  const { translate } = useTranslations();
  return (
    <GenericBottomSheet
      visible={visible}
      onClose={()=>{
        onClose();
        setUserSituation("");
      }}
      enableScroll={true}
      textToSpeak={result || ""}
    >
      <Text style={styles.title}>{translate("whatToSay")}</Text>
      <Text
        style={{
          marginBottom: 20,
          fontFamily: "marcellus",
          textAlign: "center",
        }}
      >
        {translate("whateverSituationYouAreInWeWillHelp")}
      </Text>
      {isLoading ? (
        <View style={[globalStyles.loadingContainer, { height: 100 }]}>
          <ActivityIndicator />
          <Text style={[modalStyles.modalText, styles.loadingText]}>
            {translate("fetchingResponse")}
          </Text>
        </View>
      ) : (
        <>
          {!result ? (
            <>
              <GenericBottomSheetTextInput
                placeholder={translate("enterSituation")}
                value={userSituation}
                onChangeText={setUserSituation}
                multiline
                keyboardType="default"
                style={modalStyles.textInput}
              />
              <Button
                onPress={onSubmit}
                label={translate("submit")}
                backgroundColor={colors.black}
                size={ButtonSize.large}
                borderRadius={10}
                style={{ width: "94%", alignSelf: "center" }}
                labelStyle={{ fontFamily: "marcellus" }}
              />
            </>
          ) : (
            <View style={styles.resultContainer}>
              <Text style={[modalStyles.modalText, styles.resultText]}>
                {result}
              </Text>
            </View>
          )}
        </>
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
    marginTop: 10,
    fontFamily: "marcellus",
  },
  submitButton: {
    marginVertical: 8,
    maxWidth: "80%",
    alignSelf: "center",
  },
  resultContainer: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 10,
    marginTop: 10,
  },
  resultText: {
    textAlign: "center",
    fontFamily: "marcellus",
  },
});

export default WhatToSayModal;
