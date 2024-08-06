import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Button } from "react-native-ui-lib";
import { styles as globalStyles, modalStyles } from "@/app/screens/MainStyles";
import GenericBottomSheet, {
  GenericBottomSheetTextInput,
} from "./GenericBottomSheet";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { colors } from "@/app/theme";

interface TripRecommendationModalProps {
  visible: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  userMoodAndDesires: string;
  setUserMoodAndDesires: (input: string) => void;
  recommendedTrip: {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
  } | null;
  onViewMap: Function;
  onOpenUber: Function;
}

const TripRecommendationModal: React.FC<TripRecommendationModalProps> = ({
  visible,
  isLoading,
  onClose,
  onSubmit,
  userMoodAndDesires,
  setUserMoodAndDesires,
  recommendedTrip,
  onViewMap,
  onOpenUber,
}) => {
  const { translate } = useTranslations();

  return (
    <GenericBottomSheet
      visible={visible}
      onClose={onClose}
      enableScroll={true}
      textToSpeak={recommendedTrip?.description}
    >
      {!recommendedTrip ? (
        <>
          <Text style={modalStyles.modalTitle}>
            {translate("tellUsYourMood")}
          </Text>
          {isLoading ? (
            <View style={[globalStyles.loadingContainer, { height: 100 }]}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>
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
                style={styles.submitButton}
                onPress={onSubmit}
                label={translate("findPlace")}
                backgroundColor={colors.primary}
              />
            </>
          )}
        </>
      ) : (
        <View style={styles.recommendationContainer}>
          <Text style={styles.recommendationTitle}>
            {translate("weRecommend")}
          </Text>
          <Text style={styles.placeName}>{recommendedTrip.name}</Text>
          <Text style={styles.placeDescription}>
            {recommendedTrip.description}
          </Text>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                onViewMap(
                  recommendedTrip?.latitude,
                  recommendedTrip?.longitude,
                  name
                )
              }
            >
              <Text style={styles.actionButtonText}>
                {translate("viewOnMap")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                onOpenUber(
                  recommendedTrip?.latitude,
                  recommendedTrip?.longitude
                )
              }
            >
              <Text style={styles.actionButtonText}>
                {translate("openInUber")}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{translate("back")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </GenericBottomSheet>
  );
};

const styles = StyleSheet.create({
  loadingText: {
    textAlign: "center",
    fontFamily: "marcellus",
    color: colors.primary,
    marginTop: 10,
  },
  submitButton: {
    marginVertical: 8,
    maxWidth: "80%",
    alignSelf: "center",
  },
  recommendationContainer: {
    padding: 20,
    alignItems: "center",
  },
  recommendationTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
  },
  placeName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.secondary,
    marginBottom: 10,
  },
  placeDescription: {
    fontSize: 16,
    color: colors.dark,
    textAlign: "center",
    marginBottom: 20,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: colors.white,
    textAlign: "center",
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    color: colors.secondary,
    textAlign: "center",
  },
});

export default TripRecommendationModal;
