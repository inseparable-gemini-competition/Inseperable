import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Button } from "react-native-ui-lib";
import { styles as globalStyles, modalStyles } from "@/app/screens/MainStyles";
import { translate } from "@/app/helpers/i18n";
import GenericBottomSheet, {
  GenericBottomSheetTextInput,
} from "./GenericBottomSheet"; // Adjust the import path as needed

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
  return (
    <GenericBottomSheet visible={visible} onClose={onClose} enableScroll={true}>
      <Text
        style={{
          fontSize: 20,
          fontFamily: "marcellus",
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        {translate("whatToSay")}
      </Text>
      {isLoading ? (
        <View style={[globalStyles.loadingContainer, { height: 100 }]}>
          <ActivityIndicator />
          <Text style={{textAlign: 'center', fontFamily: 'marcellus'}}>{translate("fetchingResponse")}</Text>
        </View>
      ) : (
        <>
          <GenericBottomSheetTextInput
            placeholder={translate("enterSituation")}
            value={userSituation}
            onChangeText={setUserSituation}
            multiline
            style={modalStyles.textInput}
          />
          <Button
            style={{ marginVertical: 8, maxWidth: '80%', alignSelf: 'center' }}
            onPress={onSubmit}
            label={translate("submit")}
          />
          {result && (
            <Text style={{ textAlign: "center", fontFamily: "marcellus" }}>
              {result}
            </Text>
          )}    
        </>
      )}
    </GenericBottomSheet>
  );
};

export default WhatToSayModal;
