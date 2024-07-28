import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Button } from "react-native-ui-lib";
import { styles as globalStyles, modalStyles } from "@/app/screens/MainStyles";
import GenericBottomSheet, {
  GenericBottomSheetTextInput,
} from "./GenericBottomSheet"; // Adjust the import path as needed
import { useTranslations } from "@/hooks/ui/useTranslations";

interface TripRecommendationModalProps {
  visible: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  userMoodAndDesires: string;
  setUserMoodAndDesires: (input: string) => void;
}

const TripRecommendationModal: React.FC<TripRecommendationModalProps> = ({
  visible,
  isLoading,
  onClose,
  onSubmit,
  userMoodAndDesires,
  setUserMoodAndDesires,
}) => {
  const { translate } = useTranslations();
  
  return (
    <GenericBottomSheet visible={visible} onClose={onClose} enableScroll={true}>
      <Text style={modalStyles.modalTitle}>{translate("tellUsYourMood")}</Text>
      {isLoading ? (
        <View style={[globalStyles.loadingContainer, { height: 100 }]}>
          <ActivityIndicator />
          <Text style={{ textAlign: "center", fontFamily: "marcellus" }}>
            {translate("findingPerfectPlace")}
          </Text>
        </View>
      ) : (
        <>
          <GenericBottomSheetTextInput
            placeholder={translate("enterMoodAndDesires")}
            value={userMoodAndDesires}
            onChangeText={setUserMoodAndDesires}
            multiline
            keyboardType="default"
            style={modalStyles.textInput}
          />
          <Button
            style={{ marginVertical: 8, maxWidth: "80%", alignSelf: "center" }}
            onPress={onSubmit}
            label={isLoading ? translate('finding') : translate("findPlace")}
          />
        </>
      )}
    </GenericBottomSheet>
  );
};

export default TripRecommendationModal;