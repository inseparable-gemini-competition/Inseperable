import React, { useState, useRef } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { colors } from "@/app/theme";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { useNavigation } from "@react-navigation/native";
import GenericBottomSheet, {
  GenericBottomSheetTextInput,
} from "./GenericBottomSheet";
import { CustomText } from "@/app/components/CustomText";
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
  recommendedTrips: Array<RecommendedTrip> | null;
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
  const { translate, translations } = useTranslations();
  const [activeIndex, setActiveIndex] = useState(0);
  const navigation = useNavigation<any>();
  const progress = useSharedValue<number>(0);
  const ref = useRef<ICarouselInstance>(null);

  const handleChatOpen = () => {
    if (recommendedTrips?.[activeIndex]) {
      navigation.navigate("ChatScreenModal", {
        subject: recommendedTrips[activeIndex]?.name,
        promptType: "aiQuestion"
      });
    }
  };

  const renderCarouselItem: any = ({ item: trip, index }: { item: RecommendedTrip; index: number }) => (
    <View key={index} style={styles.carouselItem}>
      <FastImage
        style={styles.carouselImage}
        source={{ uri: trip?.imageUrl }}
        resizeMode="cover"
      />
    </View>
  );

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

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
      {!recommendedTrips?.[0]?.name ? (
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
                onPress={onSubmit as any}
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
            ref={ref}
            data={recommendedTrips}
            style={styles.carousel}
            width={screenWidth * 0.8}
            height={200}
            renderItem={renderCarouselItem}
            onProgressChange={progress as any}
            onSnapToItem={setActiveIndex}
            loop={false}
          />

          <Pagination.Basic
            progress={progress}
            data={recommendedTrips}
            dotStyle={styles.paginationDot}
            activeDotStyle={styles.paginationDotActive}
            containerStyle={[
              styles.paginationContainer,
              translations?.isRTL ? { transform: [{ scaleX: -1 }] } : {}
          ]}
            onPress={onPressPagination}
          />

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
  carousel: {
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,

  
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.2)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
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