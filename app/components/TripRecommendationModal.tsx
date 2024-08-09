import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import { Carousel } from "react-native-ui-lib";
import { colors } from "@/app/theme";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { useNavigation } from "@react-navigation/native";
import GenericBottomSheet, { GenericBottomSheetTextInput } from "./GenericBottomSheet";

const { width: screenWidth } = Dimensions.get("window");

interface TripRecommendationModalProps {
  visible: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  userMoodAndDesires: string;
  setUserMoodAndDesires: (input: string) => void;
  recommendedTrips: Array<{
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    imageUrl: string;
  }> | null;
  onViewMap: (latitude: number, longitude: number, name: string) => void;
  onOpenUber: (latitude: number, longitude: number) => void;
}

interface ChatMessage {
  text: string;
  isUser: boolean;
}

const TripRecommendationModal: React.FC<TripRecommendationModalProps> = ({
  visible,
  isLoading,
  onClose,
  onSubmit,
  userMoodAndDesires,
  setUserMoodAndDesires,
  recommendedTrips,
  onViewMap,
  onOpenUber,
}) => {
  const { translate } = useTranslations();
  const [activeIndex, setActiveIndex] = useState(0);
  const navigation = useNavigation<any>();

  const handleChatOpen = () => {
    if (recommendedTrips?.[activeIndex]) {
      navigation.navigate("ChatScreenModal", {
        placeName: recommendedTrips[activeIndex]?.name,
      });
    }
  };

  const renderCarouselItem = (
    trip: typeof recommendedTrips[0],
    index: number
  ) => (
    <View key={index} style={styles.carouselItem}>
      <Image
        style={styles.carouselImage}
        source={{ uri: trip?.imageUrl }}
        resizeMode="cover"
      />
    </View>
  );

  return (
    <GenericBottomSheet
      visible={visible}
      onClose={() => {
        onClose();
        setUserMoodAndDesires("");
      }}
      enableScroll={true}
      textToSpeak={recommendedTrips?.[activeIndex]?.description}
    >
      {!recommendedTrips ? (
        <>
          <Text style={styles.modalTitle}>{translate("tellUsYourMood")}</Text>
          <Text style={styles.descriptionText}>
            {translate(
              "basedOnYourMoodAndDesiresWeWillRecommendBestDestination"
            )}
          </Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>
                {translate("findingPerfectPlaces")}
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
                style={styles.textInput}
              />
              <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
                <Text style={styles.submitButtonText}>
                  {translate("findPlaces")}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </>
      ) : (
        <View style={styles.recommendationContainer}>
          <Text style={styles.recommendationTitle}>
            {translate("weRecommend")}
          </Text>

          <Carousel
            onChangePage={setActiveIndex}
            pageWidth={screenWidth * 0.8}
            containerStyle={styles.carouselContainer}
            pageControlPosition={Carousel.pageControlPositions.UNDER}
            pageControlProps={{ onPagePress: setActiveIndex }}
          >
            {recommendedTrips.map((trip, index) =>
              renderCarouselItem(trip, index)
            )}
          </Carousel>

          <Text style={styles.placeName}>
            {recommendedTrips[activeIndex]?.name}
          </Text>
          <Text style={styles.placeDescription}>
            {recommendedTrips[activeIndex]?.description}
          </Text>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                onViewMap(
                  recommendedTrips[activeIndex]?.latitude,
                  recommendedTrips[activeIndex]?.longitude,
                  recommendedTrips[activeIndex]?.name
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
                  recommendedTrips[activeIndex]?.latitude,
                  recommendedTrips[activeIndex]?.longitude
                )
              }
            >
              <Text style={styles.actionButtonText}>
                {translate("openInUber")}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleChatOpen}>
            <Text style={styles.askQuestionText}>{translate("askQuestion")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{translate("back")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </GenericBottomSheet>
  );
};

const styles = StyleSheet.create({
  modalTitle: {
    fontSize: 22,
    fontFamily: "marcellus",
    color: colors.primary,
    textAlign: "center",
    marginVertical: 20,
  },
  descriptionText: {
    marginVertical: 5,
    fontFamily: "marcellus",
    textAlign: "center",
    marginBottom: 10,
  },
  loadingContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    textAlign: "center",
    fontFamily: "marcellus",
    color: colors.primary,
    marginTop: 10,
  },
  textInput: {
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    fontFamily: "marcellus",
    color: colors.dark,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  submitButtonText: {
    fontFamily: "marcellus",
    color: colors.white,
    fontSize: 18,
  },
  recommendationContainer: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 20,
  },
  recommendationTitle: {
    fontSize: 22,
    fontFamily: "marcellus",
    color: colors.primary,
    marginBottom: 20,
  },
  carouselContainer: {
    height: 200,
    marginBottom: 20,
  },
  carouselItem: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    overflow: "hidden",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
  },
  placeName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.secondary,
    marginBottom: 10,
    fontFamily: "marcellus",
  },
  placeDescription: {
    fontSize: 16,
    color: colors.dark,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "marcellus",
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
    fontFamily: "marcellus",
  },
  askQuestionText: {
    color: colors.primary,
    textAlign: "center",
    fontFamily: "marcellus",
    marginVertical: 10,
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    color: colors.secondary,
    textAlign: "center",
    fontFamily: "marcellus",
  },
});

export default TripRecommendationModal;
