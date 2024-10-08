import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Linking,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import FastImage from "react-native-fast-image";
import { MaterialIcons } from "@expo/vector-icons";
import { Button } from "react-native-ui-lib";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../helpers/firebaseConfig";
import { colors } from "@/app/theme";
import { useNavigation } from "expo-router";
import { useTranslations } from "@/hooks/ui/useTranslations";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useStore from "@/app/store";
import { CustomText } from "@/app/components/CustomText";
import { useFont } from "@/app/context/fontContext";

const { width, height } = Dimensions.get("window");

interface MenuButtonProps {
  iconName: string;
  selected?: boolean;
  onPress: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = React.memo(
  ({ iconName, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.button, selected && styles.selected]}
      onPress={onPress}
    >
      <MaterialIcons name={iconName as any} size={20} color="white" />
    </TouchableOpacity>
  )
);

interface ICard {
  name: string;
  photoUrl: string;
  time: string;
  description: string;
  latitude: number;
  longitude: number;
}

interface CustomImageProps {
  source: { uri: string };
  style: ICard;
}

const CustomImage: React.FC<CustomImageProps> = React.memo(
  ({ source, style }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
      <View style={[style as any, styles.imageContainer]}>
        <FastImage
          source={{
            uri: "https://via.placeholder.com/400x600?text=Loading...",
          }}
          style={[StyleSheet.absoluteFill, { opacity: imageLoaded ? 0 : 1 }]}
          resizeMode={FastImage.resizeMode.cover}
        />
        <FastImage
          source={source}
          style={[StyleSheet.absoluteFill, { opacity: imageLoaded ? 1 : 0 }]}
          resizeMode={FastImage.resizeMode.cover}
          onLoad={() => setImageLoaded(true)}
        />
      </View>
    );
  }
);

interface VisitingIndicatorProps {
  visible: boolean;
  text: string;
  style: any;
}

const shuffleArray = (array: ICard[]) => {
  return array.sort(() => Math.random() - 0.5);
};

const VisitingIndicator: React.FC<VisitingIndicatorProps> = React.memo(
  ({ visible, text, style }) => {
    if (!visible) return null;
    return (
      <Animated.View style={[styles.visitingIndicator, style]}>
        <CustomText style={styles.visitingIndicatorText}>{text}</CustomText>
      </Animated.View>
    );
  }
);

interface CategoryCardProps {
  item: any;
  onPressMap: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = React.memo(
  ({ item, onPressMap }) => {
    const { translate } = useTranslations();
    const { selectedFont } = useFont();
    const cardStyle = [styles.cardContainer];

    return (
      <Animated.View style={cardStyle}>
        <CustomImage
          source={{
            uri:
              item?.photoUrl ||
              "https://via.placeholder.com/400x600?text=No+Image",
          }}
          style={styles.card as any}
        />
        <View style={styles.infoContainer}>
          <CustomText style={styles.currentLocation}>{item?.time}</CustomText>
          <CustomText style={styles.museumName}>{item?.name}</CustomText>
          <CustomText
            style={styles.description}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {item?.description}
          </CustomText>
          <Button
            label={translate("openInGoogleMaps")}
            backgroundColor={colors.warning}
            color="white"
            onPress={onPressMap}
            style={styles.mapsButton}
            labelStyle={{ fontFamily: selectedFont }}
          />
        </View>
      </Animated.View>
    );
  }
);

const openGoogleMaps = (latitude: number, longitude: number) => {
  const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
  Linking.openURL(url).catch((err) => console.error("An error occurred", err));
};

const Plan: React.FC = () => {
  const [categoryData, setCategoryData] = useState<ICard[]>([]);
  const { reset } = useNavigation<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const { userData } = useStore();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showVisitingIndicator, setShowVisitingIndicator] = useState(false);
  const [showNotVisitingIndicator, setShowNotVisitingIndicator] =
    useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const visitingOpacity = useRef(new Animated.Value(0)).current;
  const notVisitingOpacity = useRef(new Animated.Value(0)).current;
  const [cardIndex, setCardIndex] = useState(0);

  const { translate, isRTL } = useTranslations();
  const insets = useSafeAreaInsets();

  const categories = [
    { name: translate("adventure"), action: "Adventure", icon: "hiking" },
    { name: translate("romance"), action: "Romance", icon: "favorite" },
    {
      name: translate("culturalExploration"),
      action: "Cultural Exploration",
      icon: "museum",
    },
    { name: translate("relaxation"), action: "Relaxation", icon: "spa" },
    {
      name: translate("FamilyFun"),
      action: "Family Fun",
      icon: "family-restroom",
    },
    {
      name: translate("foodDining"),
      action: "Food & Dining",
      icon: "restaurant",
    },
    { name: translate("shopping"), action: "Shopping", icon: "shopping-cart" },
  ];
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0].action
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      if (!userData?.id) {
        console.error("User ID is not defined");
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", userData?.id));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const travelPlan = userData?.travelPlan || {};
          const data: ICard[] = travelPlan[selectedCategory] || [];

          // Shuffle the data array
          const shuffledData = shuffleArray(data);
          setCategoryData(shuffledData);
          setCardIndex(0); // Reset the card index on category change
        } else {
          setCategoryData([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setCategoryData([]);
      }

      setLoading(false);
    };

    fetchData();
  }, [selectedCategory]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleSwiping = useCallback((x: number) => {
    rotateAnim.setValue(x);
    if (x > 50) {
      setShowVisitingIndicator(true);
      setShowNotVisitingIndicator(false);
      Animated.spring(visitingOpacity, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }).start();
    } else if (x < -50) {
      setShowVisitingIndicator(false);
      setShowNotVisitingIndicator(true);
      Animated.spring(notVisitingOpacity, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }).start();
    } else {
      resetIndicators();
    }
  }, []);

  const resetIndicators = useCallback(() => {
    setShowVisitingIndicator(false);
    setShowNotVisitingIndicator(false);
    visitingOpacity.setValue(0);
    notVisitingOpacity.setValue(0);
  }, []);

  const resetCardAnimation = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: 0,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    resetIndicators();
  }, [resetIndicators]);

  const handleSwipeRelease = useCallback(() => {
    resetCardAnimation();
    resetIndicators();
  }, [resetCardAnimation]);

  const handleSwipedLeft = useCallback(() => {
    resetIndicators();
  }, [resetIndicators]);

  const handleSwipedRight = useCallback(() => {
    resetIndicators();
  }, [resetIndicators]);

  const renderCard = useCallback(
    (card: ICard, index: number) => {
      return (
        <CategoryCard
          item={card}
          key={`${card.name}-${index}`}
          onPressMap={() => openGoogleMaps(card?.latitude, card?.longitude)}
        />
      );
    },
    [scaleAnim, rotateAnim]
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => reset({ index: 0, routes: [{ name: "Main" }] })}
        >
          <MaterialIcons
            name={isRTL ? "arrow-forward" : "arrow-back"}
            size={28}
            color="white"
          />
        </TouchableOpacity>
      </Animated.View>
      <View style={styles.menu}>
        <View style={styles.menu}>
          {categories.map((category, index) => (
            <MenuButton
              key={`${category.name}-${index}`} // Ensuring a unique key by combining name and index
              iconName={category.icon}
              selected={selectedCategory === category.action}
              onPress={() => setSelectedCategory(category.action)}
            />
          ))}
        </View>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.warning} />
          <CustomText style={styles.loadingText}>
            {translate("loading")}
          </CustomText>
        </View>
      ) : categoryData.length > 0 ? (
        <View style={styles.swiperContainer}>
          <Swiper
            cards={categoryData}
            cardVerticalMargin={0}
            cardHorizontalMargin={0}
            renderCard={renderCard}
            onSwiped={() => {
              resetCardAnimation();
            }}
            onSwipedAll={() => console.log("onSwipedAll")}
            onSwiping={handleSwiping}
            onSwipedLeft={handleSwipedLeft}
            onSwipedRight={handleSwipedRight}
            onTapCard={handleSwipeRelease}
            onTapCardDeadZone={5}
            cardIndex={cardIndex}
            backgroundColor={"transparent"}
            stackSize={3}
            infinite
            animateCardOpacity
            containerStyle={styles.swiperContainer}
            cardStyle={styles.card}
            swipeAnimationDuration={250}
            verticalSwipe={false}
          />
          <VisitingIndicator
            visible={showVisitingIndicator}
            text={translate("visiting")}
            style={{ opacity: visitingOpacity, right: 20 }}
          />
          <VisitingIndicator
            visible={showNotVisitingIndicator}
            text={translate("notVisiting")}
            style={{ opacity: notVisitingOpacity, left: 20 }}
          />
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <CustomText style={styles.noDataText}>
            {translate("noDataAvailable")}
          </CustomText>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    position: "absolute",
    top: 10,
    width: "100%",
    zIndex: 10,
  },
  backButton: {
    marginStart: 5,
    width: 37,
    height: 37,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 25,
    top: 17,
  },
  menu: {
    position: "absolute",
    start: 10,
    top: 40,
    zIndex: 1,
  },
  button: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 25,
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.info,
  },
  cardContainer: {
    width: width,
    height: Platform.OS === "ios" ? height - 100 : height,
    overflow: "hidden",
  },
  imageContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  card: {
    width: width,
    height: "100%",
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  swiperContainer: {
    flex: 1,
  },
  infoContainer: {
    position: "absolute",
    bottom: 0,
    start: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  currentLocation: {
    color: colors.white,
    fontSize: 14,
  },
  museumName: {
    color: colors.white,
    fontSize: 32,
  },
  description: {
    color: colors.white,
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
  },
  mapsButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: "center",
    marginVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.warning,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 18,
    color: colors.primary,
    textAlign: "center",
    maxWidth: "70%",
  },
  visitingIndicator: {
    position: "absolute",
    top: 50,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 5,
  },
  visitingIndicatorText: {
    color: colors.white,
    fontSize: 24,
  },
});

export default Plan;
