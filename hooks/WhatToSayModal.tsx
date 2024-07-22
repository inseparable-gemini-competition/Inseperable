import React, { useRef } from "react";
import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  TextInput,
  ScrollView,
  Dimensions,
} from "react-native";
import { Button } from "react-native-ui-lib";
import { modalStyles, styles } from "@/app/screens/MainStyles";
import { translate } from "@/app/helpers/i18n";

interface WhatToSayModalProps {
  visible: boolean;
  isLoading: boolean;
  result: string | null;
  onClose: () => void;
  onSubmit: () => void;
  userSituation: string;
  setUserSituation: (situation: string) => void;
}

const { height: screenHeight } = Dimensions.get("window");
const modalMaxHeight = (2 / 3) * screenHeight;

const WhatToSayModal: React.FC<WhatToSayModalProps> = ({
  visible,
  isLoading,
  result,
  onClose,
  onSubmit,
  userSituation,
  setUserSituation,
}) => {
  const textRef = useRef<TextInput>(null);
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={()=>{
        onClose();
        setUserSituation("");
        textRef.current?.clear();
      }}
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={modalStyles.modalContainer}
      >
        <View style={[modalStyles.modalContent, { maxHeight: modalMaxHeight }]}>
          {isLoading ? (
            <View style={[styles.loadingContainer, { height: 100 }]}>
              <ActivityIndicator />
              <Text>{translate("fetchingResponse")}</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={modalStyles.scrollViewContent}>
              <Text style={modalStyles.modalTitle}>
                {translate("whatToSay")}
              </Text>
              <TextInput
                style={modalStyles.textInput}
                placeholder={translate("enterSituation")}
                value={userSituation}
                onChangeText={setUserSituation}
                ref={textRef}
                multiline
              />
              <Button
                style={modalStyles.modalButton}
                onPress={onSubmit}
                label={translate("submit")}
              />
              {result && <Text style={modalStyles.modalText}>{result}</Text>}
              <Button
                style={modalStyles.modalCloseButton}
                onPress={onClose}
                label={translate("close")}
              />
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default WhatToSayModal;
