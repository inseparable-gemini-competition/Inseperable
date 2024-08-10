import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Button, ButtonSize } from "react-native-ui-lib";
import { styles as globalStyles, modalStyles } from "@/app/screens/MainStyles";
import GenericBottomSheet, {
  GenericBottomSheetTextInput,
} from "./GenericBottomSheet";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { colors } from "@/app/theme";
import { CustomText } from "@/app/components/CustomText";

interface WhatToSayModalProps {
  visible: boolean;
  isLoading: boolean;
  result: string | null;
  onClose: () => void;
  onSubmit: (situation?: string) => void;
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
      snapPoints={["75%", "75%"]}
      onClose={() => {
        onClose();
        setUserSituation("");
      }}
      enableScroll={true}
      onSubmit={(data) => {
        onSubmit(data);
      }}
      textToSpeak={result || ""}
    >
      <CustomText style={styles.title}>{translate("whatToSay")}</CustomText>
      <CustomText
        style={{
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        {translate("whateverSituationYouAreInWeWillHelp")}
      </CustomText>
      {isLoading ? (
        <View style={[globalStyles.loadingContainer, { height: 100 }]}>
          <ActivityIndicator />
          <CustomText style={[modalStyles.modalText, styles.loadingText]}>
            {translate("fetchingResponse")}
          </CustomText>
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
                style={{ width: "94%", alignSelf: "center", height: 50 }}
                labelStyle={{
                  color: "white",
                  fontSize: 18,
                  fontWeight: "normal",
                  fontFamily: "marcellus",
                  textShadowOffset: { width: 0, height: 0.1 },
                  textShadowRadius: 0.1,
                  textShadowColor: "rgba(0, 0, 0, 0.3)",
                }}
              />
            </>
          ) : (
            <View style={styles.resultContainer}>
              <CustomText style={[modalStyles.modalText, styles.resultText]}>
                {result}
              </CustomText>
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
    textAlign: "center",
    marginBottom: 20,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 10,
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
  },
});

export default WhatToSayModal;
