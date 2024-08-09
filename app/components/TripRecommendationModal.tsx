import React, { useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { colors } from "@/app/theme";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { useNavigation } from "@react-navigation/native";
import GenericBottomSheet, {
  GenericBottomSheetTextInput,
} from "./GenericBottomSheet";
import { CustomText } from "@/app/components/CustomText";
import Pagination from "@/app/components/Pagination"; // Import the Pagination component
import FastImage from "react-native-fast-image";

const { width: screenWidth } = Dimensions.get("window");

interface RecommendedTrip {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
}

interface TripRecommendationModalProps {
  visible: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (mood?: string) => void;
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

  const renderCarouselItem = (trip: RecommendedTrip, index: number) => (
    <View key={index} style={styles.carouselItem}>
      <FastImage
        style={styles.carouselImage}
        source={{ uri: trip?.imageUrl }}
        resizeMode="cover"
      />
    </View>
  );

  return (
    <GenericBottomSheet
      snapPoints={["75%", "75%"]}
      visible={visible}
      onClose={() => {
        onClose();
        setUserMoodAndDesires("");
      }}
      enableScroll={true}
      onSubmit={(data) => {
        onSubmit(data);
      }}
      textToSpeak={recommendedTrips?.[activeIndex]?.description}
    >
      {!recommendedTrips ? (
        <>
          <CustomText style={styles.modalTitle}>
            {translate("tellUsYourMood")}
          </CustomText>
          <CustomText style={styles.descriptionText}>
            {translate(
              "basedOnYourMoodAndDesiresWeWillRecommendBestDestination"
            )}
          </CustomText>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
              <CustomText style={styles.loadingText}>
                {translate("findingPerfectPlaces")}
              </CustomText>
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
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => onSubmit()}
              >
                <CustomText style={styles.submitButtonText}>
                  {translate("findPlaces")}
                </CustomText>
              </TouchableOpacity>
            </>
          )}
        </>
      ) : (
        <View style={styles.recommendationContainer}>
          <CustomText style={styles.recommendationTitle}>
            {translate("weRecommend")}
          </CustomText>

          <Carousel
            data={recommendedTrips}
            width={screenWidth * 0.8}
            height={200}
            renderItem={({ item, index }) => renderCarouselItem(item, index)}
            onSnapToItem={setActiveIndex}
            loop={false}
          />

          {/* <Pagination
            dotsLength={recommendedTrips.length}
            activeDotIndex={activeIndex}
          /> */}

          <CustomText style={styles.placeName}>
            {recommendedTrips[activeIndex]?.name}
          </CustomText>
          <CustomText style={styles.placeDescription}>
            {recommendedTrips[activeIndex]?.description}
          </CustomText>

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
              <CustomText style={styles.actionButtonText}>
                {translate("viewOnMap")}
              </CustomText>
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
              <CustomText style={styles.actionButtonText}>
                {translate("openInUber")}
              </CustomText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleChatOpen}>
            <CustomText style={styles.askQuestionText}>
              {translate("askQuestion")}
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <CustomText style={styles.closeButtonText}>
              {translate("back")}
            </CustomText>
          </TouchableOpacity>
        </View>
      )}
    </GenericBottomSheet>
  );
};

const styles = StyleSheet.create({
  modalTitle: {
    fontSize: 22,
    color: colors.primary,
    textAlign: "center",
    marginVertical: 20,
  },
  descriptionText: {
    marginVertical: 5,
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
    height: 60,
    color: colors.dark,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  submitButtonText: {
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
    color: colors.primary,
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
  askQuestionText: {
    color: colors.primary,
    textAlign: "center",
    marginVertical: 10,
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
